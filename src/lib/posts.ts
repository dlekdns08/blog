import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";

export type PostMeta = {
  slug: string;
  title: string;
  date: string; // ISO string (YYYY-MM-DD)
  description?: string;
  tags?: string[];
};

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

function isMarkdownFile(fileName: string) {
  return fileName.endsWith(".md") || fileName.endsWith(".mdx");
}

async function resolvePostPath(slug: string) {
  const md = path.join(POSTS_DIR, `${slug}.md`);
  const mdx = path.join(POSTS_DIR, `${slug}.mdx`);
  try {
    await fs.access(md);
    return md;
  } catch {
    await fs.access(mdx);
    return mdx;
  }
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const entries = await fs.readdir(POSTS_DIR, { withFileTypes: true });

  const slugs = entries
    .filter((e) => e.isFile() && isMarkdownFile(e.name))
    .map((e) => e.name.replace(/\.(md|mdx)$/, ""));

  const metas = await Promise.all(slugs.map(getPostMetaBySlug));

  return metas.sort((a, b) => {
    const ad = Date.parse(a.date);
    const bd = Date.parse(b.date);
    if (Number.isNaN(ad) || Number.isNaN(bd)) return a.slug.localeCompare(b.slug);
    return bd - ad;
  });
}

export async function getPostMetaBySlug(slug: string): Promise<PostMeta> {
  const raw = await fs.readFile(await resolvePostPath(slug), "utf8");
  const parsed = matter(raw);
  const data = parsed.data as Partial<PostMeta>;

  if (!data.title || !data.date) {
    throw new Error(`Post frontmatter must include title and date: ${slug}`);
  }

  return {
    slug,
    title: String(data.title),
    date: String(data.date),
    description: data.description ? String(data.description) : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
  };
}

export async function getPostBySlug(slug: string): Promise<{
  meta: PostMeta;
  html: string;
}> {
  const raw = await fs.readFile(await resolvePostPath(slug), "utf8");
  const parsed = matter(raw);
  const data = parsed.data as Partial<PostMeta>;

  if (!data.title || !data.date) {
    throw new Error(`Post frontmatter must include title and date: ${slug}`);
  }

  const processed = await remark().use(remarkHtml).process(parsed.content);
  const html = String(processed);

  return {
    meta: {
      slug,
      title: String(data.title),
      date: String(data.date),
      description: data.description ? String(data.description) : undefined,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
    },
    html,
  };
}

