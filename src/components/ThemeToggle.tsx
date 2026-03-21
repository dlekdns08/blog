"use client";

import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const ctx = useTheme();
  if (!ctx) return null;

  const { resolvedTheme, toggle } = ctx;
  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      title={isDark ? "라이트 모드" : "다크 모드"}
      className={
        compact
          ? "flex items-center justify-center rounded-lg p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-white/10 transition-all duration-200"
          : "flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors"
      }
    >
      <span
        className="relative size-4 shrink-0 transition-transform duration-300"
        style={{ transform: isDark ? "rotate(0deg)" : "rotate(180deg)" }}
      >
        {/* Sun */}
        <svg
          className={`absolute inset-0 size-4 transition-opacity duration-200 ${isDark ? "opacity-0" : "opacity-100"}`}
          fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M17.66 6.34l-1.41 1.41M6.34 17.66l-1.41 1.41" />
        </svg>
        {/* Moon */}
        <svg
          className={`absolute inset-0 size-4 transition-opacity duration-200 ${isDark ? "opacity-100" : "opacity-0"}`}
          fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
        </svg>
      </span>
      {!compact && <span>{isDark ? "라이트 모드" : "다크 모드"}</span>}
    </button>
  );
}
