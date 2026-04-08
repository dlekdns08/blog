"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCommandPalette } from "@/components/CommandPaletteProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SubscribeForm } from "@/components/SubscribeForm";

// ── 아이콘 ──────────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 9.75 9-7.5 9 7.5V21a.75.75 0 0 1-.75.75H15v-6H9v6H3.75A.75.75 0 0 1 3 21V9.75Z" />
    </svg>
  );
}
function PostsIcon() {
  return (
    <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}
function WordCloudIcon() {
  return (
    <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
    </svg>
  );
}
function ArxivIcon() {
  return (
    <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}
function GraphIcon() {
  return (
    <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.2 5.4-4.8 7.8-9 9 4.2 1.2 7.8 3.6 9 9 1.2-5.4 4.8-7.8 9-9-4.2-1.2-7.8-3.6-9-9Z" />
    </svg>
  );
}
function AboutIcon() {
  return (
    <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}
function GameIcon() {
  return (
    <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
    </svg>
  );
}
function StatsIcon() {
  return (
    <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );
}
function ChangelogIcon() {
  return (
    <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}
function GitHubIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  );
}

// ── 네비게이션 ─────────────────────────────────────────────

const NAV = [
  { href: "/",               label: "홈",          icon: <HomeIcon /> },
  { href: "/posts",          label: "글",          icon: <PostsIcon /> },
  { href: "/explore",        label: "탐색",          icon: <GraphIcon /> },
  { href: "/about",          label: "소개",         icon: <AboutIcon /> },
  { href: "/game",           label: "게임",         icon: <GameIcon /> },
  { href: "/stats",          label: "통계",         icon: <StatsIcon /> },
  { href: "/changelog",      label: "업데이트 기록",  icon: <ChangelogIcon /> },
];

// ── 컴포넌트 ───────────────────────────────────────────────

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const cmdPalette = useCommandPalette();

  // 페이지 이동 시 드로어 닫기
  useEffect(() => { setOpen(false); }, [pathname]);

  // 드로어 열릴 때 body 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ── 상단 바 ──────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-40 border-b border-black/10 dark:border-white/10 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-4">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2 min-w-0 shrink-0">
            <span className="text-lg leading-none shrink-0">🐨</span>
            <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white whitespace-nowrap">코알라 오딧세이</span>
          </Link>

          {/* 우측 아이콘 영역 */}
          <div className="flex items-center gap-0.5">
            <ThemeToggle compact />

            {/* 검색 버튼 */}
            <button
              onClick={() => cmdPalette?.open()}
              aria-label="검색"
              className="rounded-lg p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
            >
              <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 15.803a7.5 7.5 0 0 0 10.607 0Z" />
              </svg>
            </button>

            {/* 햄버거 버튼 */}
            <button
              onClick={() => setOpen(true)}
              aria-label="메뉴 열기"
              className="rounded-lg p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
            >
              <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── 오버레이 (배경 딤) ─────────────────────── */}
      <div
        className={`md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* ── 사이드 드로어 ─────────────────────────── */}
      <div
        className={`md:hidden fixed top-0 right-0 z-50 h-full w-72 max-w-[85vw] flex flex-col bg-white dark:bg-zinc-950 shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* 드로어 헤더 */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-black/8 dark:border-white/8 shrink-0">
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <div className="size-8 rounded-xl bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-500/25 dark:to-violet-600/15 flex items-center justify-center text-base shadow-sm shrink-0">
              🐨
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">이다운</div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-tight">코알라 오딧세이</div>
            </div>
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="메뉴 닫기"
            className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
          >
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 네비게이션 스크롤 영역 */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV.map(({ href, label, icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                  active
                    ? "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 shadow-sm"
                    : "text-zinc-500 hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/8 dark:hover:text-white"
                }`}
              >
                <span className={active ? "text-violet-600 dark:text-violet-400" : "text-zinc-400 dark:text-zinc-500"}>
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* 드로어 하단 고정 영역 */}
        <div className="shrink-0 border-t border-black/8 dark:border-white/8 px-4 pt-4 pb-6 space-y-4">
          {/* 구독 폼 */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-500/10 dark:to-violet-600/5 p-4 border border-violet-100 dark:border-violet-500/15">
            <SubscribeForm />
          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-between px-1">
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
          <p className="text-[11px] text-zinc-300 dark:text-white/20 px-1">
            © {new Date().getFullYear()} 이다운
          </p>
        </div>
      </div>
    </>
  );
}
