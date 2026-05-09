"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";

type DailyPaper = {
  arxiv_id: string;
  title: string;
  pdf_url: string;
  primary_category: string;
  importance_score: number;
  published_at: string;
  summary: string;
};

const CAT_COLOR: Record<string, string> = {
  "cs.CL": "#a78bfa",
  "cs.LG": "#60a5fa",
  "cs.AI": "#34d399",
};

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-line bg-surface p-4 space-y-2 animate-pulse">
          <div className="h-3 bg-zinc-100 dark:bg-white/8 rounded w-3/4" />
          <div className="h-3 bg-zinc-100 dark:bg-white/8 rounded w-full" />
          <div className="h-3 bg-zinc-100 dark:bg-white/8 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function DailyPaperWidget() {
  const [papers, setPapers] = useState<DailyPaper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/arxiv/daily")
      .then((r) => r.ok ? r.json() : [])
      .then(setPapers)
      .catch(() => setPapers([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;
  if (papers.length === 0) return null;

  return (
    <section className="space-y-3">
      <SectionHeader
        action={
          <Link href="/explore?tab=arxiv" className="text-xs text-accent hover:underline">
            더 보기 →
          </Link>
        }
      >
        오늘의 논문
      </SectionHeader>

      <div className="space-y-2.5">
        {papers.map((p, i) => {
          const color = CAT_COLOR[p.primary_category] ?? "#94a3b8";
          return (
            <a
              key={p.arxiv_id}
              href={p.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-xl border border-line bg-surface px-4 py-3.5 hover:border-violet-200 dark:hover:border-violet-500/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-2.5">
                <span
                  className="mt-0.5 shrink-0 text-xs font-bold tabular-nums w-4"
                  style={{ color }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 space-y-1.5">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors line-clamp-2 leading-snug">
                    {p.title}
                  </p>
                  {p.summary && (
                    <p className="text-xs text-muted leading-relaxed line-clamp-2">
                      {p.summary}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-[10px]">
                    <span
                      className="rounded-full px-1.5 py-0.5 font-medium"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`,
                        color,
                      }}
                    >
                      {p.primary_category}
                    </span>
                    <span className="text-subtle tabular-nums">
                      중요도 {p.importance_score.toFixed(3)}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
