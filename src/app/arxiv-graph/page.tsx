"use client";

import { useEffect, useState } from "react";
import { ArxivForceGraph } from "@/components/ArxivForceGraph";

type Paper = {
  arxiv_id: string;
  title: string;
  abstract: string;
  pdf_url: string;
  published_at: string;
  primary_category: string;
  importance_score: number;
  citation_count: number;
};

type Relation = {
  source_id: string;
  target_id: string;
  relation_type: string;
  weight: number;
};

type GraphNode = {
  arxiv_id: string;
  title: string;
  primary_category: string;
  importance_score: number;
};

type Stats = {
  paperCount: number;
  relationCount: number;
  authorCount: number;
  categories: { primary_category: string; cnt: number }[];
};

const CATEGORY_LABEL: Record<string, string> = {
  "cs.CL": "NLP / cs.CL",
  "cs.LG": "Machine Learning / cs.LG",
  "cs.AI": "AI / cs.AI",
};

const SCORE_WEIGHTS = [
  { label: "최신성", pct: 30, color: "bg-violet-500" },
  { label: "인용수", pct: 40, color: "bg-blue-500" },
  { label: "PageRank", pct: 30, color: "bg-emerald-500" },
];

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-zinc-100 dark:bg-white/8 ${className ?? ""}`}
    />
  );
}

function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  return (
    <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-white/8 rounded-full overflow-hidden">
      <div
        className="h-full bg-violet-500 rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function ArxivGraphPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [graphData, setGraphData] = useState<{
    papers: GraphNode[];
    relations: Relation[];
  }>({ papers: [], relations: [] });
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"graph" | "list">("graph");

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, papersRes, graphRes] = await Promise.all([
          fetch("/api/arxiv/stats"),
          fetch("/api/arxiv/papers?limit=50"),
          fetch("/api/arxiv/graph?limit=1000"),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (papersRes.ok) setPapers(await papersRes.json());
        if (graphRes.ok) setGraphData(await graphRes.json());
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const maxScore = Math.max(...papers.map((p) => p.importance_score), 0.01);

  return (
    <main className="px-8 py-10 max-w-3xl space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight mb-1">arXiv 논문 그래프</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          cs.CL · cs.LG · cs.AI 최신 논문을 매일 수집하고 시맨틱 유사도·공저자 관계로 지식 그래프를 구축합니다.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-black/8 dark:border-white/10 bg-white dark:bg-white/5 p-4"
              >
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))
          : [
              { label: "수집 논문", value: stats?.paperCount ?? 0, unit: "편" },
              { label: "관계 엣지", value: stats?.relationCount ?? 0, unit: "개" },
              { label: "저자", value: stats?.authorCount ?? 0, unit: "명" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-black/8 dark:border-white/10 bg-white dark:bg-white/5 p-4"
              >
                <div className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">
                  {s.label}
                </div>
                <div className="text-xl font-bold tabular-nums">
                  {s.value.toLocaleString()}
                  <span className="text-xs font-normal text-zinc-400 ml-1">
                    {s.unit}
                  </span>
                </div>
              </div>
            ))}
      </div>

      {/* Category breakdown */}
      {!loading && stats && stats.categories.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            카테고리 분포
          </h2>
          <div className="space-y-2">
            {stats.categories.map(({ primary_category, cnt }) => {
              const pct = Math.round(
                (cnt / (stats.paperCount || 1)) * 100
              );
              return (
                <div key={primary_category} className="flex items-center gap-3">
                  <span className="w-36 shrink-0 text-xs text-zinc-600 dark:text-zinc-400 truncate">
                    {CATEGORY_LABEL[primary_category] ?? primary_category}
                  </span>
                  <div className="flex-1 h-2 bg-zinc-100 dark:bg-white/8 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
                    {cnt}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Score weight explanation */}
      <section className="rounded-xl border border-black/8 dark:border-white/10 bg-white dark:bg-white/5 p-5 space-y-3">
        <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
          중요도 점수 구성
        </h2>
        <div className="flex gap-2 h-2 rounded-full overflow-hidden">
          {SCORE_WEIGHTS.map((w) => (
            <div
              key={w.label}
              className={`${w.color} rounded-full`}
              style={{ width: `${w.pct}%` }}
            />
          ))}
        </div>
        <div className="flex gap-4">
          {SCORE_WEIGHTS.map((w) => (
            <div key={w.label} className="flex items-center gap-1.5">
              <span className={`inline-block size-2 rounded-full ${w.color}`} />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {w.label} {w.pct}%
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-black/8 dark:bg-white/8" />

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-xl border border-black/8 dark:border-white/10 bg-white dark:bg-white/5 p-1 w-fit">
        {(["graph", "list"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all ${
              tab === t
                ? "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {t === "graph" ? "그래프" : "논문 목록"}
          </button>
        ))}
      </div>

      {/* Graph view */}
      {tab === "graph" && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            논문 관계 그래프 — 상위 {graphData.papers.length.toLocaleString()}편
          </h2>
          {loading ? (
            <Skeleton className="h-96 w-full rounded-2xl" />
          ) : (
            <ArxivForceGraph
              papers={graphData.papers}
              relations={graphData.relations}
            />
          )}
          <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
            노드 크기 = 중요도 점수 · 보라 선 = 시맨틱 유사도 · 초록 선 = 공저자
          </p>
        </section>
      )}

      {/* List view */}
      {tab === "list" && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            중요도 상위 논문
          </h2>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : papers.length === 0 ? (
            <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-12">
              아직 수집된 논문이 없어요.{" "}
              <code className="text-xs bg-zinc-100 dark:bg-white/8 px-1.5 py-0.5 rounded">
                arxiv-graph crawl
              </code>
              을 먼저 실행해 주세요.
            </p>
          ) : (
            <ol className="space-y-2">
              {papers.map((p, i) => (
                <li key={p.arxiv_id}>
                  <a
                    href={p.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 rounded-xl border border-black/8 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 hover:border-violet-200 dark:hover:border-violet-500/30 transition-all"
                  >
                    <span className="text-xs tabular-nums font-bold text-zinc-300 dark:text-zinc-600 w-5 shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors line-clamp-2 leading-snug">
                        {p.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <ScoreBar score={p.importance_score} max={maxScore} />
                        <span className="shrink-0 text-xs tabular-nums text-zinc-400 dark:text-zinc-500 font-mono">
                          {p.importance_score.toFixed(3)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 dark:text-zinc-500">
                        <span>{p.primary_category}</span>
                        <span>·</span>
                        <span>
                          {new Date(p.published_at).toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}
    </main>
  );
}
