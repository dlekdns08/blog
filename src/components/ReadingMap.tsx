"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "koala_read_history";

function getReadSlugs(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

/**
 * 사이드바 위젯 — 사용자가 읽은 글 비율 표시.
 * /posts/* 방문 시 자동으로 read_history에 누적.
 * 100% privacy-friendly: localStorage only.
 */
export function ReadingMap({ totalPosts }: { totalPosts: number }) {
  const [count, setCount] = useState<number | null>(null);

  function refresh() {
    setCount(getReadSlugs().size);
  }

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener("read-history-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("read-history-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  if (count === null || totalPosts === 0) return null;

  const pct = Math.min(100, Math.round((count / totalPosts) * 100));

  return (
    <Link
      href="/posts"
      className="block rounded-xl border border-line bg-surface px-3 py-2.5 text-xs hover:border-accent transition-colors"
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-medium text-body">읽기 진행</span>
        <span className="tabular-nums text-subtle">
          {count}/{totalPosts}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-line overflow-hidden">
        <div
          className="h-full bg-violet-500 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-[10px] text-subtle text-right tabular-nums">{pct}%</div>
    </Link>
  );
}
