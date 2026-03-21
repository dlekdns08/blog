"use client";

import { useEffect, useRef, useState } from "react";
import type { Heading } from "@/lib/headings";

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>("");
  const [readProgress, setReadProgress] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-10% 0px -80% 0px", threshold: 0 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [headings]);

  // Track overall reading progress
  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setReadProgress(total > 0 ? Math.min(100, Math.round((scrolled / total) * 100)) : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (headings.length < 2) return null;

  // Index of the active heading
  const activeIdx = headings.findIndex((h) => h.id === activeId);

  return (
    <nav aria-label="목차" className="select-none">
      {/* Reading progress bar */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          목차
        </p>
        <div className="flex-1 h-1 bg-zinc-100 dark:bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all duration-300"
            style={{ width: `${readProgress}%` }}
          />
        </div>
        <span className="text-[9px] tabular-nums text-zinc-400 dark:text-zinc-500">
          {readProgress}%
        </span>
      </div>

      <ul className="space-y-0.5">
        {headings.map(({ id, text, level }, i) => {
          const isActive = activeId === id;
          const isPast = activeIdx >= 0 && i < activeIdx;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById(id)
                    ?.scrollIntoView({ behavior: "smooth" });
                  setActiveId(id);
                }}
                className={`flex items-start gap-1.5 rounded-lg px-2 py-1 text-xs leading-snug transition-all duration-150 ${
                  level === 3 ? "pl-4" : ""
                } ${
                  isActive
                    ? "text-violet-600 dark:text-violet-400 font-medium bg-violet-50 dark:bg-violet-500/10"
                    : isPast
                    ? "text-zinc-400/70 dark:text-zinc-500/70 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5"
                    : "text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5"
                }`}
              >
                {level === 2 && (
                  <span
                    className={`mt-1.5 size-1 rounded-full shrink-0 transition-colors duration-200 ${
                      isActive
                        ? "bg-violet-500"
                        : isPast
                        ? "bg-violet-300 dark:bg-violet-700"
                        : "bg-zinc-300 dark:bg-zinc-600"
                    }`}
                  />
                )}
                <span className="line-clamp-2">{text}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
