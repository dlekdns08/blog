import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeExternalLinks from "rehype-external-links";
import rehypeStringify from "rehype-stringify";

export type Attachment = {
  name: string;   // 표시 이름  e.g. "원본 논문 PDF"
  file: string;   // public/ 기준 경로  e.g. "attachments/ai/transformerXL/paper.pdf"
};

export type PostMeta = {
  slug: string;            // e.g. "ai/bert" or "ai/llm/bert"
  category: string;        // e.g. "ai" (1st dir segment, "" if root)
  subcategory?: string;    // e.g. "llm" (2nd dir segment, if any)
  subSubcategory?: string; // e.g. "papers" (3rd dir segment, if any)
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  attachments?: Attachment[];
  image?: string;          // OG 이미지 경로 (e.g. "/images/posts/my-post.png")
  readingTime?: number;    // 읽기 예상 시간 (분)
  series?: { name: string; order: number };  // 시리즈/연재 정보 (frontmatter: series + seriesOrder)
};

function parseSeries(raw: unknown, orderRaw: unknown): { name: string; order: number } | undefined {
  if (!raw) return undefined;
  const name = String(raw).trim();
  if (!name) return undefined;
  const order = typeof orderRaw === "number" ? orderRaw : Number(orderRaw);
  return { name, order: Number.isFinite(order) ? order : 0 };
}

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

function isMarkdownFile(name: string) {
  return name.endsWith(".md") || name.endsWith(".mdx");
}

/** content/posts 아래 최대 3단계 하위 폴더까지 재귀 스캔 */
async function collectSlugs(): Promise<{
  slug: string;
  category: string;
  subcategory?: string;
  subSubcategory?: string;
}[]> {
  const results: {
    slug: string;
    category: string;
    subcategory?: string;
    subSubcategory?: string;
  }[] = [];

  async function scan(dir: string, segments: string[], depth: number) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && isMarkdownFile(entry.name)) {
        const name = entry.name.replace(/\.(md|mdx)$/, "");
        const slug = [...segments, name].join("/");
        results.push({
          slug,
          category:       segments[0] ?? "",
          subcategory:    segments[1],
          subSubcategory: segments[2],
        });
      } else if (entry.isDirectory() && depth < 3) {
        await scan(
          path.join(dir, entry.name),
          [...segments, entry.name],
          depth + 1
        );
      }
    }
  }

  await scan(POSTS_DIR, [], 0);
  return results;
}

function resolveFilePath(slug: string): string {
  // slug = "ai/bert" → content/posts/ai/bert.md
  const base = path.join(POSTS_DIR, slug);
  return base.endsWith(".md") || base.endsWith(".mdx") ? base : `${base}.md`;
}

let postsCache: PostMeta[] | null = null;

export async function getAllPosts(): Promise<PostMeta[]> {
  if (postsCache) return postsCache;

  const slugInfos = await collectSlugs();

  const metas = await Promise.all(
    slugInfos.map(({ slug, category, subcategory, subSubcategory }) =>
      getPostMeta(slug, category, subcategory, subSubcategory)
    )
  );

  postsCache = metas.sort((a, b) => {
    const ad = Date.parse(a.date);
    const bd = Date.parse(b.date);
    if (Number.isNaN(ad) || Number.isNaN(bd)) return a.slug.localeCompare(b.slug);
    return bd - ad;
  });
  return postsCache;
}

async function getPostMeta(
  slug: string,
  category: string,
  subcategory?: string,
  subSubcategory?: string
): Promise<PostMeta> {
  const raw = await fs.readFile(resolveFilePath(slug), "utf8");
  const { data, content } = matter(raw);

  if (!data.title || !data.date) {
    throw new Error(`Post frontmatter must include title and date: ${slug}`);
  }

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  return {
    slug,
    category,
    subcategory,
    subSubcategory,
    title: String(data.title),
    date: String(data.date),
    description: data.description ? String(data.description) : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
    attachments: parseAttachments(data.attachments),
    image: data.image ? String(data.image) : undefined,
    readingTime,
    series: parseSeries(data.series, data.seriesOrder),
  };
}

function parseAttachments(raw: unknown): Attachment[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const result = raw
    .filter((item) => item && typeof item.name === "string" && typeof item.file === "string")
    .map((item) => ({ name: String(item.name), file: String(item.file) }));
  return result.length > 0 ? result : undefined;
}

export async function getPostBySlug(slug: string): Promise<{
  meta: PostMeta;
  html: string;
}> {
  const filePath = resolveFilePath(slug);
  const raw = await fs.readFile(filePath, "utf8");
  const { data, content } = matter(raw);

  if (!data.title || !data.date) {
    throw new Error(`Post frontmatter must include title and date: ${slug}`);
  }

  const processed = await remark()
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeKatex)
    .use(rehypeHighlight)
    .use(rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);

  // 디렉토리 세그먼트 추출 (마지막 세그먼트는 파일명)
  const parts = slug.split("/");
  const dirParts = parts.slice(0, -1);
  const category       = dirParts[0] ?? "";
  const subcategory    = dirParts[1];
  const subSubcategory = dirParts[2];

  return {
    meta: {
      slug,
      category,
      subcategory,
      subSubcategory,
      title: String(data.title),
      date: String(data.date),
      description: data.description ? String(data.description) : undefined,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
      attachments: parseAttachments(data.attachments),
      image: data.image ? String(data.image) : undefined,
      series: parseSeries(data.series, data.seriesOrder),
    },
    html: String(processed),
  };
}
