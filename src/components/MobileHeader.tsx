"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCommandPalette } from "@/components/CommandPaletteProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SubscribeForm } from "@/components/SubscribeForm";
import { GitHubIcon } from "@/components/Icons";
import { NAV } from "@/lib/nav";

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
