"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import type { PostMeta } from "@/lib/posts";
import { CATEGORY_CONFIG } from "@/lib/categories";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.koala.ai.kr";

const PAGE_SIZE = 10;

function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500 dark:bg-white/10 dark:text-zinc-400">
      {tag}
    </span>
  );
}

function FilterPill({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
      {label}
      <button onClick={onRemove} className="hover:text-violet-900 dark:hover:text-white transition-colors">
        <svg className="size-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}

type Props = {
  posts: PostMeta[];
};

export function PostList({ posts }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category");
  const activeSub      = searchParams.get("sub");
  const activeSubSub   = searchParams.get("subsub");

  const [query, setQuery] = useState("");
  const [page,  setPage]  = useState(1);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (posts.length === 0) return;
    const slugs = posts.map((p) => p.slug).join(",");
    fetch(`${API_URL}/posts/likes/bulk?slugs=${encodeURIComponent(slugs)}`)
      .then((r) => r.ok ? r.json() : {})
      .then((data) => setLikeCounts(data))
      .catch(() => {});
  }, [posts]);

  // URL 파라미터 변경 시 페이지 초기화
  useEffect(() => { setPage(1); }, [activeCategory, activeSub, activeSubSub]);

  // 카테고리 탭에 표시할 목록
  const categories = Array.from(new Set(posts.map((p) => p.category))).filter(Boolean);

  function buildUrl(cat: string | null, sub: string | null, subsub: string | null) {
    const p = new URLSearchParams();
    if (cat)    p.set("category", cat);
    if (sub)    p.set("sub",      sub);
    if (subsub) p.set("subsub",   subsub);
    const qs = p.toString();
    return `/posts${qs ? `?${qs}` : ""}`;
  }

  function handleCategoryChange(cat: string | null) {
    router.push(buildUrl(cat, null, null), { scroll: false });
  }

  function clearSub() {
    router.push(buildUrl(activeCategory, null, null), { scroll: false });
  }

  function clearSubSub() {
    router.push(buildUrl(activeCategory, activeSub, null), { scroll: false });
  }

  function handleQueryChange(q: string) {
    setQuery(q);
    setPage(1);
  }

  function changePage(next: number) {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const filtered = posts.filter((p) => {
    const matchCat    = activeCategory ? p.category        === activeCategory : true;
    const matchSub    = activeSub      ? p.subcategory     === activeSub      : true;
    const matchSubSub = activeSubSub   ? p.subSubcategory  === activeSubSub   : true;
    const q = query.trim().toLowerCase();
    const matchQuery  = q ? p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) : true;
    return matchCat && matchSub && matchSubSub && matchQuery;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
        <div className="flex items-center gap-1 mb-4 border-b border-black/8 dark:border-white/8 overflow-x-auto">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
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
            const label = CATEGORY_CONFIG[cat]?.label ?? cat;
            const count = posts.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
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

      {/* 활성 서브필터 표시 */}
      {(activeSub || activeSubSub) && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-zinc-400 dark:text-zinc-500">필터:</span>
          {activeSub && !activeSubSub && (
            <FilterPill label={activeSub} onRemove={clearSub} />
          )}
          {activeSub && activeSubSub && (
            <>
              <FilterPill label={activeSub} onRemove={clearSub} />
              <FilterPill label={activeSubSub} onRemove={clearSubSub} />
            </>
          )}
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
                  {/* 카테고리 경로 */}
                  {(p.category || p.subcategory) && (
                    <div className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                      {p.category && (
                        <span>{CATEGORY_CONFIG[p.category]?.label ?? p.category}</span>
                      )}
                      {p.subcategory && (
                        <>
                          <span>/</span>
                          <span>{p.subcategory}</span>
                        </>
                      )}
                      {p.subSubcategory && (
                        <>
                          <span>/</span>
                          <span>{p.subSubcategory}</span>
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-semibold text-zinc-900 group-hover:text-violet-700 dark:text-zinc-100 dark:group-hover:text-violet-300 transition-colors">
                      {p.title}
                    </span>
                    <div className="shrink-0 flex items-center gap-2">
                      {(likeCounts[p.slug] ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-rose-400 dark:text-rose-400">
                          <svg className="size-3" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                          </svg>
                          {likeCounts[p.slug]}
                        </span>
                      )}
                      <time className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">
                        {p.date}
                      </time>
                    </div>
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => changePage(n)}
                  className={`min-w-[2rem] rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    n === page
                      ? "bg-violet-600 text-white dark:bg-violet-500"
                      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
                >
                  {n}
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
