"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "홈" },
  { href: "/posts", label: "글" },
];

export function MobileHeader() {
  const pathname = usePathname();

  return (
    <header className="md:hidden border-b border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-black">
      <div className="flex h-14 items-center justify-between px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          코알라 오딧세이
        </Link>
        <nav className="flex items-center gap-1">
          {NAV.map(({ href, label }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-zinc-100 text-zinc-900 dark:bg-white/10 dark:text-white"
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
