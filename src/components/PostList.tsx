"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import type { PostMeta } from "@/lib/posts";
import { CATEGORY_CONFIG } from "@/lib/categories";
import { formatRelativeDate } from "@/lib/date";

const PAGE_SIZE = 10;

function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500 dark:bg-white/10 dark:text-zinc-400">
      {tag}
    </span>
  );
}

type Props = { posts: PostMeta[] };

export function PostList({ posts }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category");
  const activeSub      = searchParams.get("sub");
  const activeSubSub   = searchParams.get("subsub");

  const [query, setQuery] = useState(searchParams.get("search") ?? "");
  const [page,  setPage]  = useState(1);

  // URL의 search 파라미터가 바뀌면 검색어도 동기화 (워드 클라우드 등에서 링크로 진입 시)
  useEffect(() => {
    setQuery(searchParams.get("search") ?? "");
    setPage(1);
  }, [searchParams]);
  const [reactionCounts, setReactionCounts] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    if (posts.length === 0) return;
    const slugs = posts.map((p) => p.slug).join(",");
    fetch(`/api/reactions/bulk?slugs=${encodeURIComponent(slugs)}`)
      .then((r) => r.ok ? r.json() : {})
      .then((data) => setReactionCounts(data))
      .catch(() => {});
  }, [posts]);

  useEffect(() => { setPage(1); }, [activeCategory, activeSub, activeSubSub]);

  // 카테고리 목록 (글이 있는 것만)
  const categories = Array.from(new Set(posts.map((p) => p.category))).filter(Boolean);

  // 선택된 카테고리의 소분류 목록
  const subCategories = activeCategory
    ? Array.from(new Set(
        posts
          .filter((p) => p.category === activeCategory && p.subcategory)
          .map((p) => p.subcategory!)
      ))
    : [];

  // 선택된 소분류의 세분류 목록
  const subSubCategories = activeSub
    ? Array.from(new Set(
        posts
          .filter((p) => p.category === activeCategory && p.subcategory === activeSub && p.subSubcategory)
          .map((p) => p.subSubcategory!)
      ))
    : [];

  function buildUrl(cat: string | null, sub: string | null, subsub: string | null) {
    const p = new URLSearchParams();
    if (cat)    p.set("category", cat);
    if (sub)    p.set("sub",      sub);
    if (subsub) p.set("subsub",   subsub);
    const qs = p.toString();
    return `/posts${qs ? `?${qs}` : ""}`;
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
    const matchCat    = activeCategory ? p.category       === activeCategory : true;
    const matchSub    = activeSub      ? p.subcategory    === activeSub      : true;
    const matchSubSub = activeSubSub   ? p.subSubcategory === activeSubSub   : true;
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
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
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

      {/* 카테고리 필터 */}
      {categories.length > 0 && (
        <div className="mb-5 space-y-2">

          {/* 대분류 pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => router.push("/posts", { scroll: false })}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                !activeCategory
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-white/8 dark:text-zinc-400 dark:hover:bg-white/12"
              }`}
            >
              <span className="text-xs">📋</span>
              <span>전체</span>
              <span className={`text-xs tabular-nums ${!activeCategory ? "text-violet-200" : "text-zinc-400 dark:text-zinc-500"}`}>
                {posts.length}
              </span>
            </button>

            {categories.map((cat) => {
              const cfg   = CATEGORY_CONFIG[cat];
              const label = cfg?.label ?? cat;
              const icon  = cfg?.icon  ?? "📁";
              const count = posts.filter((p) => p.category === cat).length;
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => router.push(buildUrl(cat, null, null), { scroll: false })}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-violet-600 text-white shadow-sm"
                      : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-white/8 dark:text-zinc-400 dark:hover:bg-white/12"
                  }`}
                >
                  <span className="text-xs">{icon}</span>
                  <span>{label}</span>
                  <span className={`text-xs tabular-nums ${active ? "text-violet-200" : "text-zinc-400 dark:text-zinc-500"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 소분류 pills */}
          {subCategories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pl-1">
              {subCategories.map((sub) => {
                const count  = posts.filter((p) => p.category === activeCategory && p.subcategory === sub).length;
                const active = activeSub === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => router.push(buildUrl(activeCategory, active ? null : sub, null), { scroll: false })}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                      active
                        ? "bg-violet-100 text-violet-700 dark:bg-violet-500/25 dark:text-violet-300"
                        : "bg-zinc-100/70 text-zinc-400 hover:bg-zinc-200 dark:bg-white/5 dark:text-zinc-500 dark:hover:bg-white/10"
                    }`}
                  >
                    <span className="size-1.5 rounded-full bg-current opacity-60 shrink-0" />
                    {sub}
                    <span className="tabular-nums opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 세분류 pills */}
          {subSubCategories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pl-2">
              {subSubCategories.map((ss) => {
                const count  = posts.filter((p) => p.subcategory === activeSub && p.subSubcategory === ss).length;
                const active = activeSubSub === ss;
                return (
                  <button
                    key={ss}
                    onClick={() => router.push(buildUrl(activeCategory, activeSub, active ? null : ss), { scroll: false })}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-all ${
                      active
                        ? "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400"
                        : "bg-zinc-100/50 text-zinc-400 hover:bg-zinc-200 dark:bg-white/4 dark:text-zinc-500 dark:hover:bg-white/8"
                    }`}
                  >
                    <span className="size-1 rounded-full bg-current opacity-50 shrink-0" />
                    {ss}
                    <span className="tabular-nums opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 포스트 목록 */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-4xl select-none">🔍</span>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">검색 결과가 없습니다</p>
          {query && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500">&ldquo;{query}&rdquo;에 맞는 글이 없어요</p>
          )}
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {paginated.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/posts/${p.slug}`}
                  className="group block rounded-xl border border-black/8 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/8"
                  style={{ perspective: "600px" }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
                    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
                    e.currentTarget.style.transform = `perspective(600px) rotateX(${y * -5}deg) rotateY(${x * 5}deg) translateY(-2px)`;
                  }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
                >
                  {(p.category || p.subcategory) && (
                    <div className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                      {p.category && <span>{CATEGORY_CONFIG[p.category]?.label ?? p.category}</span>}
                      {p.subcategory && <><span>/</span><span>{p.subcategory}</span></>}
                      {p.subSubcategory && <><span>/</span><span>{p.subSubcategory}</span></>}
                    </div>
                  )}
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-semibold text-zinc-900 group-hover:text-violet-700 dark:text-zinc-100 dark:group-hover:text-violet-300 transition-colors">
                      {p.title}
                    </span>
                    <div className="shrink-0 flex items-center gap-2">
                      {(() => {
                        const reactions = reactionCounts[p.slug] ?? {};
                        const top = Object.entries(reactions).filter(([, cnt]) => cnt > 0).sort(([, a], [, b]) => b - a)[0];
                        if (!top) return null;
                        return (
                          <span className="inline-flex items-center gap-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                            <span>{top[0]}</span>
                            <span className="tabular-nums">{top[1]}</span>
                          </span>
                        );
                      })()}
                      <time className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums" title={p.date}>
                        {formatRelativeDate(p.date)}
                      </time>
                    </div>
                  </div>
                  {p.description && (
                    <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{p.description}</p>
                  )}
                  {p.tags && p.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
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
              >←</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => changePage(n)}
                  className={`min-w-[2rem] rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    n === page
                      ? "bg-violet-600 text-white dark:bg-violet-500"
                      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
                >{n}</button>
              ))}
              <button
                onClick={() => changePage(page + 1)}
                disabled={page === totalPages}
                className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed dark:text-zinc-500 dark:hover:text-white transition-colors"
              >→</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
