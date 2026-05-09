"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import { CATEGORY_CONFIG } from "@/lib/categories";
import { formatRelativeDate } from "@/lib/date";
import { EmptyState } from "@/components/ui/EmptyState";

const KEY = "koala_bookmarks";

export function BookmarksList({ posts }: { posts: PostMeta[] }) {
  const [bookmarks, setBookmarks] = useState<PostMeta[] | null>(null);

  function refresh() {
    try {
      const slugs = JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[];
      const matched = slugs
        .map((s) => posts.find((p) => p.slug === s))
        .filter(Boolean) as PostMeta[];
      setBookmarks(matched);
    } catch {
      setBookmarks([]);
    }
  }

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener("bookmarks-changed", onChange);
    return () => window.removeEventListener("bookmarks-changed", onChange);
  }, [posts]);

  function removeOne(slug: string) {
    try {
      const slugs = JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[];
      const next = slugs.filter((s) => s !== slug);
      localStorage.setItem(KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("bookmarks-changed"));
    } catch {}
  }

  if (bookmarks === null) {
    return <p className="text-sm text-zinc-400">로딩 중...</p>;
  }
  if (bookmarks.length === 0) {
    return (
      <EmptyState
        title="아직 저장한 글이 없어요."
        description="글 페이지에서 북마크 버튼을 눌러 저장해 보세요."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {bookmarks.map((p) => {
        const catLabel = CATEGORY_CONFIG[p.category]?.label ?? p.category;
        return (
          <li key={p.slug}>
            <div className="group flex items-start gap-3 rounded-xl border border-black/8 bg-white p-4 shadow-sm hover:shadow-md transition-all dark:border-white/10 dark:bg-white/5">
              <Link href={`/posts/${p.slug}`} className="flex-1 min-w-0">
                {catLabel && (
                  <p className="text-[11px] font-medium text-subtle mb-0.5">
                    {catLabel}
                  </p>
                )}
                <p className="text-sm font-semibold text-zinc-900 group-hover:text-violet-700 dark:text-zinc-100 dark:group-hover:text-violet-300 transition-colors truncate">
                  {p.title}
                </p>
                {p.description && (
                  <p className="text-xs text-muted mt-0.5 line-clamp-1">
                    {p.description}
                  </p>
                )}
              </Link>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <time className="text-xs text-subtle tabular-nums">
                  {formatRelativeDate(p.date)}
                </time>
                <button
                  onClick={() => removeOne(p.slug)}
                  aria-label="북마크 삭제"
                  className="text-[11px] text-zinc-400 hover:text-red-500 transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
