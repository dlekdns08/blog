"use client";

import { useEffect, useRef, useState } from "react";

type Paper = {
  arxiv_id: string;
  title: string;
  pdf_url: string;
  primary_category: string;
  importance_score: number;
  published_at: string;
};

const CAT_COLOR: Record<string, string> = {
  "cs.CL": "#a78bfa",
  "cs.LG": "#60a5fa",
  "cs.AI": "#34d399",
};

export function ArxivLiveFeed() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/arxiv/papers?limit=20")
      .then((r) => r.ok ? r.json() : [])
      .then((data: Paper[]) => {
        setPapers(data);
        if (data.length > 0) setVisible(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (papers.length < 2) return;
    timerRef.current = setInterval(() => {
      setIdx((i) => (i + 1) % papers.length);
    }, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [papers]);

  if (!visible || papers.length === 0) return null;

  const p = papers[idx];
  const color = CAT_COLOR[p.primary_category] ?? "#94a3b8";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          최신 논문
        </p>
        <div className="flex gap-0.5">
          {papers.slice(0, Math.min(papers.length, 8)).map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: i === idx ? "16px" : "4px",
                backgroundColor: i === idx ? color : "currentColor",
                opacity: i === idx ? 1 : 0.25,
              }}
            />
          ))}
        </div>
      </div>

      <a
        key={p.arxiv_id}
        href={p.pdf_url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block rounded-xl border border-black/8 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2.5 hover:border-violet-200 dark:hover:border-violet-500/30 transition-all"
      >
        <div className="flex items-start gap-2">
          <span
            className="mt-0.5 size-1.5 rounded-full shrink-0"
            style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
          />
          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors line-clamp-2 leading-snug">
              {p.title}
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500">
              <span style={{ color }}>{p.primary_category}</span>
              <span>·</span>
              <span className="font-mono">{p.importance_score.toFixed(3)}</span>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}
