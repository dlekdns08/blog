"use client";

import Link from "next/link";
import { useState } from "react";
import type { PostMeta } from "@/lib/posts";

function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
      {tag}
    </span>
  );
}

export function PostList({ posts }: { posts: PostMeta[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.tags ?? []))
  ).sort();

  const filtered = posts.filter((p) => {
    const matchesTag = activeTag ? p.tags?.includes(activeTag) : true;
    const q = query.trim().toLowerCase();
    const matchesQuery = q
      ? p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
      : true;
    return matchesTag && matchesQuery;
  });

  return (
    <div>
      <div className="relative mb-6">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-black/40 dark:text-white/40 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 15.803a7.5 7.5 0 0 0 10.607 0Z" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제목, 설명, 태그 검색..."
          className="w-full rounded-lg border border-black/10 bg-white py-2 pl-9 pr-4 text-sm outline-none placeholder:text-black/40 focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-white/40 dark:focus:border-white/30 dark:focus:ring-white/10"
        />
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTag(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeTag === null
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:hover:bg-white/20"
            }`}
          >
            전체
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeTag === tag
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:hover:bg-white/20"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-black/50 dark:text-white/50">
          검색 결과가 없습니다.
        </p>
      ) : (
        <ul className="space-y-4">
          {filtered.map((p) => (
            <li
              key={p.slug}
              className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-baseline justify-between gap-4">
                <Link
                  href={`/posts/${p.slug}`}
                  className="font-medium hover:underline"
                >
                  {p.title}
                </Link>
                <time className="shrink-0 text-xs text-black/60 dark:text-white/60">
                  {p.date}
                </time>
              </div>
              {p.description && (
                <p className="mt-2 text-sm text-black/70 dark:text-white/70">
                  {p.description}
                </p>
              )}
              {p.tags && p.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.tags.map((tag) => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
