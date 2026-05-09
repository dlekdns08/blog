#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import matter from "gray-matter";
import Anthropic from "@anthropic-ai/sdk";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const CACHE_PATH = path.join(process.cwd(), "content", ".translation-cache.json");
const MODEL = process.env.TRANSLATION_MODEL ?? "claude-sonnet-4-6";
const TARGET_LANG = process.argv[2] ?? "en";

if (!process.env.CLAUDE_TOKEN) {
  console.error("CLAUDE_TOKEN 환경변수가 필요합니다.");
  process.exit(1);
}

const client = new Anthropic({ apiKey: process.env.CLAUDE_TOKEN });

const SYSTEM_PROMPT = `You are a professional Korean→English technical translator specializing in AI/ML/IT blog content.

Translate the given Korean blog post to fluent, idiomatic English while:
- PRESERVING all markdown formatting EXACTLY (headings, lists, blockquotes, code blocks, tables, links, math \\( \\) and \\[ \\])
- NOT translating content inside code blocks (\`\`\`...\`\`\` or inline \`code\`)
- NOT translating LaTeX math content
- Using standard English technical terminology (e.g. "트랜스포머" → "Transformer")
- Keeping proper nouns natural ("코알라" → "Koala", names of papers/models/companies preserved)
- Using neutral professional tone

Output ONLY valid minified JSON with this exact structure (no extra text, no markdown wrapper):
{"title":"...","description":"...","body":"..."}

If description is missing or empty in input, output empty string for description.`;

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

function safeParseJson(text) {
  // Claude가 ```json ... ``` 래퍼를 붙일 수 있어 제거
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  return JSON.parse(cleaned);
}

async function translatePost(title, description, body, targetLang) {
  const langName = targetLang === "en" ? "English" : targetLang;
  const userInput = JSON.stringify(
    { title, description: description ?? "", body },
    null,
    2
  );

  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    system: SYSTEM_PROMPT.replace("English", langName),
    messages: [
      {
        role: "user",
        content: `Translate this post to ${langName}. Input:\n\n${userInput}`,
      },
    ],
  });

  const text = msg.content
    .map((c) => (c.type === "text" ? c.text : ""))
    .join("")
    .trim();

  const parsed = safeParseJson(text);
  if (!parsed.title || typeof parsed.body !== "string") {
    throw new Error("Invalid translation response shape");
  }
  return {
    title: String(parsed.title),
    description: String(parsed.description ?? ""),
    body: String(parsed.body),
  };
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
    const existing = cache[slug]?.[TARGET_LANG];
    if (existing && existing.hash === hash) {
      skipped++;
      continue;
    }

    process.stdout.write(`[${updated + 1}] ${slug} (${TARGET_LANG}) ... `);
    try {
      const t = await translatePost(
        String(data.title),
        data.description ? String(data.description) : "",
        content,
        TARGET_LANG
      );
      cache[slug] = cache[slug] ?? {};
      cache[slug][TARGET_LANG] = {
        hash,
        title: t.title,
        description: t.description,
        body: t.body,
        generated_at: new Date().toISOString(),
      };
      console.log("OK");
      updated++;
      if (updated % 3 === 0) await saveCache(cache);
    } catch (err) {
      console.log("FAIL", err.message);
      failed++;
    }
  }

  await saveCache(cache);
  console.log(
    `\n번역 완료(${TARGET_LANG}): 갱신 ${updated}건, 스킵 ${skipped}건, 실패 ${failed}건. 캐시: ${CACHE_PATH}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
