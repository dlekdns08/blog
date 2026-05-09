#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import matter from "gray-matter";
import Anthropic from "@anthropic-ai/sdk";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const CACHE_PATH = path.join(process.cwd(), "content", ".tldr-cache.json");
const MODEL = process.env.TLDR_MODEL ?? "claude-haiku-4-5-20251001";

if (!process.env.CLAUDE_TOKEN) {
  console.error("CLAUDE_TOKEN 환경변수가 필요합니다.");
  process.exit(1);
}

const client = new Anthropic({ apiKey: process.env.CLAUDE_TOKEN });

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

function hashContent(s) {
  return crypto.createHash("sha256").update(s).digest("hex").slice(0, 16);
}

async function loadCache() {
  try {
    const raw = await fs.readFile(CACHE_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveCache(cache) {
  await fs.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n", "utf8");
}

async function generateTldr(title, content) {
  const truncated = content.slice(0, 12000);
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 300,
    system:
      "당신은 블로그 글의 핵심을 정확히 3줄로 요약하는 전문가입니다. " +
      "한국어로, 정확히 3줄로, 글의 핵심 주장과 결론이 드러나도록 작성하세요. " +
      '"이 글에서는", "저자는" 같은 군더더기는 금지. 줄바꿈으로만 구분하고 번호/불릿은 붙이지 마세요.',
    messages: [
      {
        role: "user",
        content: `제목: ${title}\n\n본문:\n${truncated}\n\n위 글을 정확히 3줄로 요약해주세요.`,
      },
    ],
  });
  const text = msg.content
    .map((c) => (c.type === "text" ? c.text : ""))
    .join("")
    .trim();
  const lines = text
    .split("\n")
    .map((l) => l.trim().replace(/^[-•\d.\s]+/, ""))
    .filter(Boolean);
  return lines.slice(0, 3).join("\n");
}

async function main() {
  const cache = await loadCache();
  const items = [];
  for await (const item of walk(POSTS_DIR)) items.push(item);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const { slug, fullPath } of items) {
    const raw = await fs.readFile(fullPath, "utf8");
    const { data, content } = matter(raw);
    if (!data.title) continue;

    const hash = hashContent(content);
    const existing = cache[slug];
    if (existing && existing.hash === hash) {
      skipped++;
      continue;
    }

    process.stdout.write(`[${updated + 1}] ${slug} ... `);
    try {
      const tldr = await generateTldr(String(data.title), content);
      cache[slug] = {
        hash,
        tldr,
        generated_at: new Date().toISOString(),
      };
      console.log("OK");
      updated++;
      if (updated % 5 === 0) await saveCache(cache);
    } catch (err) {
      console.log("FAIL", err.message);
      failed++;
    }
  }

  await saveCache(cache);
  console.log(
    `\n완료: 갱신 ${updated}건, 스킵 ${skipped}건, 실패 ${failed}건. 캐시: ${CACHE_PATH}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
