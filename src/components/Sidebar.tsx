"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SubscribeForm } from "@/components/SubscribeForm";
import { useCommandPalette } from "@/components/CommandPaletteProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RandomPostButton } from "@/components/RandomPostButton";
import { BookmarksWidget } from "@/components/BookmarksWidget";
import { ArxivLiveFeed } from "@/components/ArxivLiveFeed";
import { ReadingMap } from "@/components/ReadingMap";
import { GitHubActivityWidget } from "@/components/GitHubActivityWidget";
import { GitHubIcon, SearchIcon } from "@/components/Icons";
import { NAV } from "@/lib/nav";
import type { PostMeta } from "@/lib/posts";

export function Sidebar({ categories: _categories, posts }: { categories: unknown[]; posts: PostMeta[] }) {
  const pathname = usePathname();
  const cmdPalette = useCommandPalette();

  return (
    <aside className="w-64 shrink-0 border-r border-line self-stretch">
      <div className="sticky top-0 h-dvh flex flex-col overflow-hidden px-4 py-7">

        {/* ── 헤더 ─────────────────────────────────────── */}
        <Link href="/" className="group flex items-center gap-3 mb-7 px-1 shrink-0">
          <div className="size-10 rounded-2xl bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-500/25 dark:to-violet-600/15 flex items-center justify-center text-xl shadow-sm shrink-0">
            🐨
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">
              이다운
            </div>
            <div className="text-xs text-subtle leading-tight mt-0.5 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
              코알라 오딧세이
            </div>
          </div>
        </Link>

        {/* ── 검색 버튼 (⌘K) ──────────────────────────── */}
        <button
          onClick={() => cmdPalette?.open()}
          className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2 mb-4 text-sm text-zinc-400 border border-dashed border-line hover:border-violet-300 dark:hover:border-violet-500/40 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-500/5 transition-all duration-150 shrink-0"
        >
          <SearchIcon />
          <span className="flex-1 text-left text-xs">검색</span>
          <kbd className="text-[10px] font-medium bg-zinc-100 dark:bg-white/8 rounded px-1.5 py-0.5 leading-5">
            ⌘K
          </kbd>
        </button>

        {/* ── 메인 네비게이션 ──────────────────────────── */}
        <nav className="space-y-0.5 mb-5 shrink-0">
          {NAV.map(({ href, label, icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 shadow-sm"
                    : "text-zinc-500 hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/8 dark:hover:text-white"
                }`}
              >
                <span className={active ? "text-accent" : "text-subtle"}>
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ── 중간 스크롤 영역 ─────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-0 scrollbar-none">
          {/* 랜덤 글 버튼 */}
          <div className="mb-4 shrink-0">
            <RandomPostButton posts={posts} />
          </div>

          {/* 읽기 진행 */}
          <div className="mb-3 shrink-0">
            <ReadingMap totalPosts={posts.length} />
          </div>

          {/* 구분선 */}
          <div className="h-px bg-black/6 dark:bg-white/6 mb-4 shrink-0" />

          {/* 논문 피드 */}
          <div className="shrink-0 max-h-64 overflow-y-auto scrollbar-none">
            <ArxivLiveFeed />
          </div>

          {/* GitHub 활동 */}
          <div className="mt-3 shrink-0">
            <GitHubActivityWidget />
          </div>

          {/* 구분선 */}
          <div className="h-px bg-black/6 dark:bg-white/6 my-3 shrink-0" />

          {/* 북마크 위젯 */}
          <div className="shrink-0 max-h-52 overflow-y-auto scrollbar-none">
            <BookmarksWidget posts={posts} />
          </div>
        </div>

        {/* ── 하단 고정 영역 (구독 + 푸터) ─────────────── */}
        <div className="shrink-0 pt-3 space-y-4">
          {/* 구독 폼 */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-500/10 dark:to-violet-600/5 p-4 border border-violet-100 dark:border-violet-500/15">
            <SubscribeForm />
          </div>

          {/* 푸터 */}
          <div className="space-y-2.5 px-1">
            <div className="flex items-center justify-between">
              <a
                href="https://github.com/dlekdns08"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors"
              >
                <GitHubIcon />
                <span>GitHub</span>
              </a>
              <ThemeToggle compact />
            </div>
            <p className="text-[11px] text-zinc-300 dark:text-white/20">
              <Link href="/admin/login" tabIndex={-1} className="hover:text-zinc-300 dark:hover:text-white/20">©</Link>{" "}
              {new Date().getFullYear()} 이다운
            </p>
          </div>
        </div>

      </div>
    </aside>
  );
}
