import fs from "node:fs/promises";
import path from "node:path";

type TldrEntry = { hash: string; tldr: string; generated_at: string };
type TldrCache = Record<string, TldrEntry>;

let cache: TldrCache | null = null;

async function loadCache(): Promise<TldrCache> {
  if (cache) return cache;
  const cachePath = path.join(process.cwd(), "content", ".tldr-cache.json");
  try {
    const raw = await fs.readFile(cachePath, "utf8");
    cache = JSON.parse(raw) as TldrCache;
  } catch {
    cache = {};
  }
  return cache;
}

export async function getTldr(slug: string): Promise<string | null> {
  const c = await loadCache();
  return c[slug]?.tldr ?? null;
}
