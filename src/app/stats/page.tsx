"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CATEGORY_CONFIG } from "@/lib/categories";

type PostStat = {
  slug: string;
  title: string;
  category: string;
  views: number;
  reactions: number;
};

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-zinc-100 dark:bg-white/8 ${className ?? ""}`} />
  );
}

export default function StatsPage() {
  const [stats, setStats] = useState<PostStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        // Fetch posts list from the existing posts API proxy
        const postsRes = await fetch("/api/admin/posts");
        // posts API might not be public — fall back to reactions/bulk approach
        // We use the reactions bulk endpoint to discover slugs, and views/top for views
        const [viewsRes, reactionsTopRes] = await Promise.all([
          fetch("/api/views/top?limit=100").then((r) => r.ok ? r.json() : []),
          fetch("/api/views/bulk?slugs=").catch(() => ({})),
        ]);

        // viewsRes: [{slug, views}]
        const viewMap: Record<string, number> = {};
        let maxViews = 0;
        for (const { slug, views } of viewsRes as { slug: string; views: number }[]) {
          viewMap[slug] = views;
          if (views > maxViews) maxViews = views;
        }

        // Get reaction counts for the slugs we know about
        const knownSlugs = (viewsRes as { slug: string }[]).map((r) => r.slug);
        let reactionMap: Record<string, number> = {};
        if (knownSlugs.length > 0) {
          const reacRes = await fetch(
            `/api/reactions/bulk?slugs=${encodeURIComponent(knownSlugs.join(","))}`
          );
          if (reacRes.ok) {
            const reacData: Record<string, Record<string, number>> = await reacRes.json();
            for (const [slug, emojis] of Object.entries(reacData)) {
              reactionMap[slug] = Object.values(emojis).reduce((a, b) => a + b, 0);
            }
          }
        }

        const combined: PostStat[] = (viewsRes as { slug: string; views: number }[]).map(
          ({ slug, views }) => {
            // Extract category from slug (first segment)
            const parts = slug.split("/");
            const category = parts.length > 1 ? parts[0] : "";
            // Use slug as title if we can't get the real title
            const title = slug.split("/").pop()?.replace(/-/g, " ") ?? slug;
            return {
              slug,
              title,
              category,
              views,
              reactions: reactionMap[slug] ?? 0,
            };
          }
        );

        setStats(combined);
        setTotalPosts(combined.length);
      } catch {
        // ignore errors
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalViews = stats.reduce((s, p) => s + p.views, 0);
  const totalReactions = stats.reduce((s, p) => s + p.reactions, 0);

  const byViews = [...stats].sort((a, b) => b.views - a.views);
  const byReactions = [...stats].sort((a, b) => b.reactions - a.reactions).filter((p) => p.reactions > 0);

  // Category breakdown
  const catViews: Record<string, number> = {};
  for (const p of stats) {
    const key = p.category || "기타";
    catViews[key] = (catViews[key] ?? 0) + p.views;
  }
  const sortedCats = Object.entries(catViews).sort((a, b) => b[1] - a[1]);
  const maxCatViews = sortedCats[0]?.[1] ?? 1;

  return (
    <main className="px-8 py-10 max-w-3xl space-y-10">
      <div>
        <h1 className="text-xl font-bold tracking-tight mb-1">방문 통계</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          포스트별 조회수 및 반응 현황
        </p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-black/8 dark:border-white/10 bg-white dark:bg-white/5 p-4">
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))
        ) : (
          [
            { label: "조회된 글", value: totalPosts, unit: "개" },
            { label: "누적 조회", value: totalViews.toLocaleString(), unit: "회" },
            { label: "누적 반응", value: totalReactions.toLocaleString(), unit: "개" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-black/8 dark:border-white/10 bg-white dark:bg-white/5 p-4"
            >
              <div className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">{s.label}</div>
              <div className="text-xl font-bold tabular-nums">
                {s.value}
                <span className="text-xs font-normal text-zinc-400 ml-1">{s.unit}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 카테고리별 조회 */}
      {!loading && sortedCats.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            카테고리별 조회
          </h2>
          <div className="space-y-2">
            {sortedCats.map(([cat, v]) => {
              const config = CATEGORY_CONFIG[cat];
              const pct = Math.round((v / maxCatViews) * 100);
              return (
                <div key={cat} className="flex items-center gap-3">
                  <div className="w-28 shrink-0 flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                    {config?.icon && <span>{config.icon}</span>}
                    <span className="truncate">{config?.label ?? cat}</span>
                  </div>
                  <div className="flex-1 h-2 bg-zinc-100 dark:bg-white/8 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
                    {v}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {(!loading && sortedCats.length > 0) && <div className="h-px bg-black/8 dark:bg-white/8" />}

      {/* 조회수 TOP */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
          조회수 TOP 10
        </h2>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : byViews.length === 0 ? (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-8">
            아직 조회 데이터가 없어요
          </p>
        ) : (
          <ol className="space-y-2">
            {byViews.slice(0, 10).map((p, i) => (
              <li key={p.slug}>
                <Link
                  href={`/posts/${p.slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-black/8 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 hover:border-violet-200 dark:hover:border-violet-500/30 transition-all"
                >
                  <span className="text-xs tabular-nums font-bold text-zinc-300 dark:text-zinc-600 w-5 shrink-0">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors truncate">
                    {p.slug}
                  </span>
                  <div className="flex items-center gap-3 shrink-0 text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">
                    <span className="flex items-center gap-1">
                      <svg className="size-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                      {p.views.toLocaleString()}
                    </span>
                    {p.reactions > 0 && <span>{p.reactions} 반응</span>}
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      {!loading && byReactions.length > 0 && (
        <>
          <div className="h-px bg-black/8 dark:bg-white/8" />
          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              반응 TOP 10
            </h2>
            <ol className="space-y-2">
              {byReactions.slice(0, 10).map((p, i) => (
                <li key={p.slug}>
                  <Link
                    href={`/posts/${p.slug}`}
                    className="group flex items-center gap-3 rounded-xl border border-black/8 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 hover:border-violet-200 dark:hover:border-violet-500/30 transition-all"
                  >
                    <span className="text-xs tabular-nums font-bold text-zinc-300 dark:text-zinc-600 w-5 shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors truncate">
                      {p.slug}
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
                      {p.reactions}개 반응
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </main>
  );
}
