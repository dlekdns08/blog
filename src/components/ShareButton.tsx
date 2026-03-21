"use client";

import { useState } from "react";

export function ShareButton() {
  const [state, setState] = useState<"idle" | "copied">("idle");

  async function handleShare() {
    const url = window.location.href;

    // 모바일 네이티브 공유 (지원하는 경우)
    if (navigator.share) {
      try {
        await navigator.share({ url, title: document.title });
        return;
      } catch {
        // 사용자가 취소한 경우 — 클립보드로 fallback
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      // clipboard API 미지원
    }
  }

  return (
    <button
      onClick={handleShare}
      aria-label="링크 공유"
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
        state === "copied"
          ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "border-black/10 bg-white text-zinc-500 hover:border-violet-200 hover:text-violet-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 dark:hover:border-violet-500/30 dark:hover:text-violet-400"
      }`}
    >
      {state === "copied" ? (
        <>
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          복사됨
        </>
      ) : (
        <>
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
            <path d="M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.102-1.101" />
            <path d="M10.172 13.828a4 4 0 0 0 5.656 0l4-4a4 4 0 0 0-5.656-5.656l-1.102 1.101" />
          </svg>
          공유
        </>
      )}
    </button>
  );
}
