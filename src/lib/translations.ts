import fs from "node:fs/promises";
import path from "node:path";
import { markdownToHtml } from "./markdown";

type TranslationEntry = {
  hash: string;
  title: string;
  description: string;
  body: string; // 번역된 markdown
  generated_at: string;
};

/** { slug: { lang: TranslationEntry } } */
type TranslationCache = Record<string, Record<string, TranslationEntry>>;

let cache: TranslationCache | null = null;

async function loadCache(): Promise<TranslationCache> {
  if (cache) return cache;
  const cachePath = path.join(process.cwd(), "content", ".translation-cache.json");
  try {
    const raw = await fs.readFile(cachePath, "utf8");
    cache = JSON.parse(raw) as TranslationCache;
  } catch {
    cache = {};
  }
  return cache;
}

export async function getAvailableLanguages(slug: string): Promise<string[]> {
  const c = await loadCache();
  return c[slug] ? Object.keys(c[slug]) : [];
}

export async function getTranslation(
  slug: string,
  lang: string
): Promise<{ title: string; description: string; html: string } | null> {
  const c = await loadCache();
  const entry = c[slug]?.[lang];
  if (!entry) return null;
  const html = await markdownToHtml(entry.body);
  return {
    title: entry.title,
    description: entry.description,
    html,
  };
}
