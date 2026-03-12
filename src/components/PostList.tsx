"use client";

import Link from "next/link";
import { useState } from "react";
import type { PostMeta } from "@/lib/posts";

const PAGE_SIZE = 10;

const CATEGORY_LABEL: Record<string, string> = {
  ai: "AI",
  dev: "개발",
  life: "일상",
};

function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500 dark:bg-white/10 dark:text-zinc-400">
      {tag}
    </span>
  );
}

export function PostList({ posts }: { posts: PostMeta[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  // 실제 존재하는 카테고리만 추출 (중복 제거)
  const categories = Array.from(new Set(posts.map((p) => p.category))).filter(Boolean);

  const filtered = posts.filter((p) => {
    const matchesCategory = activeCategory ? p.category === activeCategory : true;
    const q = query.trim().toLowerCase();
    const matchesQuery = q
      ? p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      : true;
    return matchesCategory && matchesQuery;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleCategoryChange(cat: string | null) {
    setActiveCategory(cat);
    setPage(1);
  }

  function handleQueryChange(q: string) {
    setQuery(q);
    setPage(1);
  }

  function changePage(next: number) {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      {/* 검색창 */}
      <div className="relative mb-5">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none"
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
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="제목, 설명 검색..."
          className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-9 pr-4 text-sm shadow-sm outline-none placeholder:text-zinc-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-zinc-500 dark:focus:border-violet-500/40 dark:focus:ring-violet-500/10 transition-shadow"
        />
      </div>

      {/* 카테고리 탭 */}
      {categories.length > 0 && (
        <div className="flex items-center gap-1 mb-7 border-b border-black/8 dark:border-white/8">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeCategory === null
                ? "border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400"
                : "border-transparent text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
            }`}
          >
            전체
            <span className={`ml-1.5 text-xs ${activeCategory === null ? "text-violet-500" : "text-zinc-400 dark:text-zinc-600"}`}>
              {posts.length}
            </span>
          </button>
          {categories.map((cat) => {
            const label = CATEGORY_LABEL[cat] ?? cat;
            const count = posts.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeCategory === cat
                    ? "border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400"
                    : "border-transparent text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
                }`}
              >
                {label}
                <span className={`ml-1.5 text-xs ${activeCategory === cat ? "text-violet-500" : "text-zinc-400 dark:text-zinc-600"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 포스트 목록 */}
      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-400 dark:text-zinc-500 py-8 text-center">
          검색 결과가 없습니다.
        </p>
      ) : (
        <>
          <ul className="space-y-3">
            {paginated.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/posts/${p.slug}`}
                  className="group block rounded-xl border border-black/8 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/8"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-semibold text-zinc-900 group-hover:text-violet-700 dark:text-zinc-100 dark:group-hover:text-violet-300 transition-colors">
                      {p.title}
                    </span>
                    <time className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">
                      {p.date}
                    </time>
                  </div>
                  {p.description && (
                    <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
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
                </Link>
              </li>
            ))}
          </ul>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-1">
              <button
                onClick={() => changePage(page - 1)}
                disabled={page === 1}
                className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed dark:text-zinc-500 dark:hover:text-white transition-colors"
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => changePage(p)}
                  className={`min-w-[2rem] rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    p === page
                      ? "bg-violet-600 text-white dark:bg-violet-500"
                      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => changePage(page + 1)}
                disabled={page === totalPages}
                className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed dark:text-zinc-500 dark:hover:text-white transition-colors"
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
