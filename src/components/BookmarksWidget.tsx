"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

const KEY = "koala_bookmarks";

function getSlugs(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function BookmarksWidget({ posts }: { posts: PostMeta[] }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  function refresh() {
    setSlugs(getSlugs());
  }

  useEffect(() => {
    refresh();
    window.addEventListener("bookmarks-changed", refresh);
    return () => window.removeEventListener("bookmarks-changed", refresh);
  }, []);

  const bookmarked = slugs
    .map((s) => posts.find((p) => p.slug === s))
    .filter(Boolean) as PostMeta[];

  if (bookmarked.length === 0) return null;

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full rounded-xl px-3 py-2 text-xs font-medium text-muted hover:bg-zinc-100/80 dark:hover:bg-white/8 transition-colors"
      >
        <svg
          className="size-3.5 text-amber-500 shrink-0"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
        </svg>
        <span>저장한 글</span>
        <span className="ml-auto text-[10px] tabular-nums bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 rounded-full px-1.5 py-0.5">
          {bookmarked.length}
        </span>
        <svg
          className={`size-3 text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <ul className="mt-1 space-y-0.5 pl-1">
          {bookmarked.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/posts/${p.slug}`}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-muted hover:bg-zinc-100/80 dark:hover:bg-white/8 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                <span className="size-1 rounded-full bg-amber-400 shrink-0" />
                <span className="truncate">{p.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
