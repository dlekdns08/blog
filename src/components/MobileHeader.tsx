"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "홈" },
  { href: "/posts", label: "글" },
  { href: "/about", label: "소개" },
];

export function MobileHeader() {
  const pathname = usePathname();

  return (
    <header className="md:hidden sticky top-0 z-50 border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-base">🐨</span>
          <span className="text-sm font-bold tracking-tight">코알라 오딧세이</span>
        </Link>
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
    </header>
  );
}
