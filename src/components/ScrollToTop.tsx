"use client";

import { useEffect, useState } from "react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="맨 위로"
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center size-10 rounded-full border border-black/10 bg-white shadow-md text-zinc-500 hover:border-violet-200 hover:text-violet-600 hover:shadow-lg dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-violet-500/30 dark:hover:text-violet-400 transition-all duration-150"
    >
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  );
}
