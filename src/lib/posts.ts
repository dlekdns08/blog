import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";

export type Attachment = {
  name: string;   // 표시 이름  e.g. "원본 논문 PDF"
  file: string;   // public/ 기준 경로  e.g. "attachments/ai/transformerXL/paper.pdf"
};

export type PostMeta = {
  slug: string;       // e.g. "ai/bert"
  category: string;   // e.g. "ai"
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  attachments?: Attachment[];
};

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

function isMarkdownFile(name: string) {
  return name.endsWith(".md") || name.endsWith(".mdx");
}

/** content/posts 아래 1단계 하위 폴더만 카테고리로 인식 */
async function collectSlugs(): Promise<{ slug: string; category: string }[]> {
  const entries = await fs.readdir(POSTS_DIR, { withFileTypes: true });
  const results: { slug: string; category: string }[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const category = entry.name;
      const files = await fs.readdir(path.join(POSTS_DIR, category), {
        withFileTypes: true,
      });
      for (const file of files) {
        if (file.isFile() && isMarkdownFile(file.name)) {
          const name = file.name.replace(/\.(md|mdx)$/, "");
          results.push({ slug: `${category}/${name}`, category });
        }
      }
    } else if (entry.isFile() && isMarkdownFile(entry.name)) {
      // 루트에 있는 파일은 category = ""
      const name = entry.name.replace(/\.(md|mdx)$/, "");
      results.push({ slug: name, category: "" });
    }
  }

  return results;
}

function resolveFilePath(slug: string): string {
  // slug = "ai/bert" → content/posts/ai/bert.md
  const base = path.join(POSTS_DIR, slug);
  return base.endsWith(".md") || base.endsWith(".mdx") ? base : `${base}.md`;
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const slugInfos = await collectSlugs();

  const metas = await Promise.all(
    slugInfos.map(({ slug, category }) => getPostMeta(slug, category))
  );

  return metas.sort((a, b) => {
    const ad = Date.parse(a.date);
    const bd = Date.parse(b.date);
    if (Number.isNaN(ad) || Number.isNaN(bd)) return a.slug.localeCompare(b.slug);
    return bd - ad;
  });
}

async function getPostMeta(slug: string, category: string): Promise<PostMeta> {
  const raw = await fs.readFile(resolveFilePath(slug), "utf8");
  const { data } = matter(raw);

  if (!data.title || !data.date) {
    throw new Error(`Post frontmatter must include title and date: ${slug}`);
  }

  return {
    slug,
    category,
    title: String(data.title),
    date: String(data.date),
    description: data.description ? String(data.description) : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
    attachments: parseAttachments(data.attachments),
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
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);

  // category = slug의 첫 번째 세그먼트 (없으면 "")
  const category = slug.includes("/") ? slug.split("/")[0] : "";

  return {
    meta: {
      slug,
      category,
      title: String(data.title),
      date: String(data.date),
      description: data.description ? String(data.description) : undefined,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
      attachments: parseAttachments(data.attachments),
    },
    html: String(processed),
  };
}
