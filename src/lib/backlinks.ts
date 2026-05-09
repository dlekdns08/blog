import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { getAllPosts, type PostMeta } from "./posts";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

let backlinkCache: Map<string, string[]> | null = null;

/**
 * 모든 글을 스캔해서 internal link map을 만든다.
 * key = 인용된 글 slug, value = 그 글을 인용한 글 slug 목록.
 */
async function buildBacklinkMap(): Promise<Map<string, string[]>> {
  if (backlinkCache) return backlinkCache;

  const posts = await getAllPosts();
  const map = new Map<string, string[]>();

  await Promise.all(
    posts.map(async (post) => {
      const filePath = path.join(POSTS_DIR, `${post.slug}.md`);
      try {
        const raw = await fs.readFile(filePath, "utf8");
        const { content } = matter(raw);
        // /posts/<slug> 형태의 링크 추출
        const re = /\/posts\/([\w/-]+)/g;
        const seen = new Set<string>();
        let m: RegExpExecArray | null;
        while ((m = re.exec(content)) !== null) {
          const target = m[1].replace(/[).,;:!?]+$/, "");
          if (target === post.slug) continue;
          if (seen.has(target)) continue;
          seen.add(target);
          const list = map.get(target) ?? [];
          list.push(post.slug);
          map.set(target, list);
        }
      } catch {
        // ignore missing files
      }
    })
  );

  backlinkCache = map;
  return map;
}

export async function getBacklinks(slug: string): Promise<PostMeta[]> {
  const map = await buildBacklinkMap();
  const refSlugs = map.get(slug) ?? [];
  if (refSlugs.length === 0) return [];
  const posts = await getAllPosts();
  const bySlug = new Map(posts.map((p) => [p.slug, p]));
  return refSlugs
    .map((s) => bySlug.get(s))
    .filter((p): p is PostMeta => Boolean(p));
}
