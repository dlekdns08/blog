import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { getAllPosts } from "@/lib/posts";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

type Result = {
  slug: string;
  title: string;
  category: string;
  description: string | null;
  snippet: string;
  score: number;
};

let bodyCache: Map<string, string> | null = null;

async function loadBodies(): Promise<Map<string, string>> {
  if (bodyCache) return bodyCache;
  const posts = await getAllPosts();
  const map = new Map<string, string>();
  await Promise.all(
    posts.map(async (p) => {
      try {
        const raw = await fs.readFile(path.join(POSTS_DIR, `${p.slug}.md`), "utf8");
        const { content } = matter(raw);
        map.set(p.slug, content);
      } catch {
        map.set(p.slug, "");
      }
    })
  );
  bodyCache = map;
  return map;
}

function makeSnippet(body: string, query: string): string {
  const lower = body.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return body.slice(0, 120).replace(/\n+/g, " ").trim();
  const start = Math.max(0, idx - 60);
  const end = Math.min(body.length, idx + query.length + 80);
  return (
    (start > 0 ? "…" : "") +
    body.slice(start, end).replace(/\n+/g, " ").trim() +
    (end < body.length ? "…" : "")
  );
}

export async function GET(req: NextRequest) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }
  const lower = q.toLowerCase();

  const posts = await getAllPosts();
  const bodies = await loadBodies();
  const results: Result[] = [];

  for (const p of posts) {
    let score = 0;
    if (p.title.toLowerCase().includes(lower)) score += 10;
    if (p.description?.toLowerCase().includes(lower)) score += 5;
    if (p.tags?.some((t) => t.toLowerCase().includes(lower))) score += 3;
    const body = bodies.get(p.slug) ?? "";
    if (body.toLowerCase().includes(lower)) score += 1;
    if (score === 0) continue;
    results.push({
      slug: p.slug,
      title: p.title,
      category: p.category,
      description: p.description ?? null,
      snippet: makeSnippet(body, q),
      score,
    });
  }

  results.sort((a, b) => b.score - a.score);
  return NextResponse.json({ results: results.slice(0, 30) });
}
