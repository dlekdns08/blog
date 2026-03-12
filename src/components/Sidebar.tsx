"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "홈" },
  { href: "/posts", label: "글" },
  { href: "/about", label: "소개" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-black/10 dark:border-white/10">
      <div className="sticky top-0 flex h-dvh flex-col px-6 py-8">
        {/* 블로그 타이틀 */}
        <Link href="/" className="group block">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-lg">🐨</span>
            <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
              이다운
            </span>
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
            코알라 오딧세이
          </span>
        </Link>

        {/* 구분선 */}
        <div className="mt-6 mb-4 h-px bg-black/8 dark:bg-white/8" />

        {/* 네비게이션 */}
        <nav className="flex flex-col gap-0.5">
          {NAV.map(({ href, label }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/8 dark:hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* 하단 소셜 & 저작권 */}
        <div className="mt-auto space-y-3">
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/idaun"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              aria-label="GitHub"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
              </svg>
              GitHub
            </a>
          </div>
          <div className="text-xs text-black/25 dark:text-white/25">
            © {new Date().getFullYear()} 이다운
          </div>
        </div>
      </div>
    </aside>
  );
}
