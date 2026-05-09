#!/usr/bin/env node
/**
 * 주간(또는 N일치) 다이제스트 발송 스크립트.
 * 사용:  NOTIFY_API_KEY=... node scripts/send-digest.mjs [days=7]
 *
 * - content/posts 스캔
 * - 최근 N일 이내 frontmatter date 글 수집
 * - .tldr-cache.json에서 TLDR 동봉
 * - API의 /subscribe/digest 호출
 */
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const TLDR_PATH = path.join(process.cwd(), "content", ".tldr-cache.json");
const API_URL = process.env.API_URL ?? "https://api.koala.ai.kr";
const BLOG_URL = process.env.BLOG_URL ?? "https://koala.ai.kr";
const NOTIFY_API_KEY = process.env.NOTIFY_API_KEY;
const DAYS = parseInt(process.argv[2] || "7", 10);

if (!NOTIFY_API_KEY) {
  console.error("NOTIFY_API_KEY 환경변수가 필요합니다.");
  process.exit(1);
}

async function* walk(dir, segments = [], depth = 0) {
  if (depth > 3) return;
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isFile() && (e.name.endsWith(".md") || e.name.endsWith(".mdx"))) {
      const slug = [...segments, e.name.replace(/\.(md|mdx)$/, "")].join("/");
      yield { slug, fullPath: path.join(dir, e.name) };
    } else if (e.isDirectory()) {
      yield* walk(path.join(dir, e.name), [...segments, e.name], depth + 1);
    }
  }
}

const cutoff = Date.now() - DAYS * 24 * 60 * 60 * 1000;
let tldrs = {};
try {
  tldrs = JSON.parse(await fs.readFile(TLDR_PATH, "utf8"));
} catch {
  console.warn("TLDR 캐시 없음 — TLDR 없이 발송됩니다.");
}

const posts = [];
for await (const { slug, fullPath } of walk(POSTS_DIR)) {
  const raw = await fs.readFile(fullPath, "utf8");
  const { data } = matter(raw);
  if (!data.title || !data.date) continue;
  const d = Date.parse(String(data.date));
  if (Number.isNaN(d) || d < cutoff || d > Date.now()) continue;
  posts.push({
    title: String(data.title),
    url: `${BLOG_URL}/posts/${slug}`,
    tldr: tldrs[slug]?.tldr ?? null,
    date: String(data.date),
    category: slug.split("/")[0] ?? "",
  });
}

if (posts.length === 0) {
  console.log(`최근 ${DAYS}일 이내 새 글 없음. 다이제스트 미발송.`);
  process.exit(0);
}

posts.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

const now = new Date();
const week = Math.ceil(now.getDate() / 7);
const week_label = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${week}주차`;

console.log(`다이제스트 발송: ${posts.length}개 글, "${week_label}"`);
console.log("글 목록:");
posts.forEach((p) => console.log(`  · ${p.title} (${p.date})`));

const res = await fetch(`${API_URL}/subscribe/digest`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ api_key: NOTIFY_API_KEY, week_label, posts }),
});

if (!res.ok) {
  console.error(`발송 실패 (${res.status}):`, await res.text());
  process.exit(1);
}

const data = await res.json();
console.log("\n결과:", data);
