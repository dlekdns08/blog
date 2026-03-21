"use client";

import { useEffect, useRef, useState } from "react";
import type { Heading } from "@/lib/headings";

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // 뷰포트 상단 근처에서 교차하는 헤딩 중 첫 번째를 활성으로 설정
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

  if (headings.length < 2) return null;

  return (
    <nav aria-label="목차" className="select-none">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3 px-1">
        목차
      </p>
      <ul className="space-y-0.5">
        {headings.map(({ id, text, level }) => {
          const isActive = activeId === id;
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
                    : "text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5"
                }`}
              >
                {level === 2 && (
                  <span
                    className={`mt-1.5 size-1 rounded-full shrink-0 ${
                      isActive
                        ? "bg-violet-500"
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
