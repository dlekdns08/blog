"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "홈" },
  { href: "/posts", label: "글" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-black/10 dark:border-white/10">
      <div className="sticky top-0 flex h-dvh flex-col px-6 py-8">
        <Link href="/" className="text-base font-semibold tracking-tight leading-snug">
          이다운의<br />코알라 오딧세이
        </Link>

        <nav className="mt-10 flex flex-col gap-1">
          {NAV.map(({ href, label }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-zinc-100 text-zinc-900 dark:bg-white/10 dark:text-white"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto text-xs text-black/30 dark:text-white/30">
          © {new Date().getFullYear()} 이다운
        </div>
      </div>
    </aside>
  );
}
