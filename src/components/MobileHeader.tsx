"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCommandPalette } from "@/components/CommandPaletteProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV = [
  { href: "/", label: "홈" },
  { href: "/posts", label: "글" },
  { href: "/about", label: "소개" },
  { href: "/game", label: "게임" },
  { href: "/stats", label: "통계" },
];

export function MobileHeader() {
  const pathname = usePathname();
  const cmdPalette = useCommandPalette();

  return (
    <header className="md:hidden sticky top-0 z-50 border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-base">🐨</span>
          <span className="text-sm font-bold tracking-tight">코알라 오딧세이</span>
        </Link>

        <div className="flex items-center gap-1">
          {/* 다크모드 토글 */}
          <ThemeToggle compact />

          {/* 검색 버튼 */}
          <button
            onClick={() => cmdPalette?.open()}
            aria-label="검색"
            className="rounded-lg p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
          >
            <svg
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 15.803a7.5 7.5 0 0 0 10.607 0Z"
              />
            </svg>
          </button>

          {/* 네비게이션 */}
          <nav className="flex items-center gap-0.5">
            {NAV.map(({ href, label }) => {
              const active =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
