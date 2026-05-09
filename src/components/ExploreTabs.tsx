"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { WordCloud } from "@/components/WordCloud";
import { ArxivForceGraph } from "@/components/ArxivForceGraph";
import { PostKnowledgeGraph } from "@/components/PostKnowledgeGraph";
import { Container } from "@/components/Container";
import { WordCloudIcon, ArxivIcon, GraphIcon } from "@/components/Icons";

// ── 타입 ───────────────────────────────────────────────────
type CategoryInfo = {
  key: string;
  label: string;
  icon: string | null;
  count: number;
  pct: number;
};

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

type GraphNode = {
  arxiv_id: string;
  title: string;
  primary_category: string;
  importance_score: number;
};

type Relation = {
  source_id: string;
  target_id: string;
  relation_type: string;
  weight: number;
};

type Stats = {
  paperCount: number;
  relationCount: number;
  authorCount: number;
  categories: { primary_category: string; cnt: number }[];
};

// ── 상수 ───────────────────────────────────────────────────
const TABS = [
  { id: "wordcloud", label: "워드클라우드", icon: WordCloudIcon },
  { id: "arxiv", label: "논문 그래프", icon: ArxivIcon },
  { id: "knowledge", label: "지식 그래프", icon: GraphIcon },
] as const;

type TabId = (typeof TABS)[number]["id"];

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

// ── 유틸 ───────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-zinc-100 dark:bg-white/8 ${className ?? ""}`} />;
}

function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  return (
    <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-white/8 rounded-full overflow-hidden">
      <div className="h-full bg-violet-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────
export function ExploreTabs({
  postCount,
  categoryCount,
  categories,
}: {
  postCount: number;
  categoryCount: number;
  categories: CategoryInfo[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = (searchParams.get("tab") as TabId) || "wordcloud";
  const [tab, setTab] = useState<TabId>(TABS.some((t) => t.id === initialTab) ? initialTab : "wordcloud");

  // Arxiv data (lazy loaded)
  const [arxivLoaded, setArxivLoaded] = useState(false);
  const [arxivLoading, setArxivLoading] = useState(false);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [graphData, setGraphData] = useState<{ papers: GraphNode[]; relations: Relation[] }>({ papers: [], relations: [] });
  const [stats, setStats] = useState<Stats | null>(null);
  const [arxivTab, setArxivTab] = useState<"graph" | "list">("graph");

  function switchTab(id: TabId) {
    setTab(id);
    router.replace(`/explore?tab=${id}`, { scroll: false });
  }

  // Lazy load arxiv data when tab is selected
  useEffect(() => {
    if (tab !== "arxiv" || arxivLoaded) return;
    setArxivLoading(true);
    Promise.all([
      fetch("/api/arxiv/stats"),
      fetch("/api/arxiv/papers?limit=50"),
      fetch("/api/arxiv/graph?limit=1000"),
    ])
      .then(async ([statsRes, papersRes, graphRes]) => {
        if (statsRes.ok) setStats(await statsRes.json());
        if (papersRes.ok) setPapers(await papersRes.json());
        if (graphRes.ok) setGraphData(await graphRes.json());
      })
      .catch(() => {})
      .finally(() => {
        setArxivLoading(false);
        setArxivLoaded(true);
      });
  }, [tab, arxivLoaded]);

  const maxScore = Math.max(...papers.map((p) => p.importance_score), 0.01);

  return (
    <main className="py-10">
      <Container>
        <div className="space-y-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-xl font-bold tracking-tight mb-1">탐색</h1>
        <p className="text-sm text-muted">
          블로그 데이터를 다양한 시각화로 살펴봅니다.
        </p>
      </div>

      {/* 탭 버튼 */}
      <div className="flex gap-1 rounded-xl border border-line bg-surface p-1 w-fit">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                tab === t.id
                  ? "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              <span className={tab === t.id ? "text-accent" : "text-subtle"}>
                <Icon />
              </span>
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="h-px bg-black/8 dark:bg-white/8" />

      {/* ── 워드클라우드 탭 ─────────────────────────── */}
      {tab === "wordcloud" && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-subtle uppercase tracking-widest">
              워드 클라우드
            </h2>
            <p className="text-sm text-muted">
              블로그 글의 제목·설명·태그에서 추출한 핵심 키워드입니다.
            </p>
          </div>
          <WordCloud />
        </div>
      )}

      {/* ── 논문 그래프 탭 ──────────────────────────── */}
      {tab === "arxiv" && (
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-subtle uppercase tracking-widest">
              arXiv 논문 그래프
            </h2>
            <p className="text-sm text-muted">
              cs.CL · cs.LG · cs.AI 최신 논문을 매일 수집하고 시맨틱 유사도·공저자 관계로 지식 그래프를 구축합니다.
            </p>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-3">
            {arxivLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-line bg-surface p-4">
                    <Skeleton className="h-3 w-16 mb-2" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))
              : [
                  { label: "수집 논문", value: stats?.paperCount ?? 0, unit: "편" },
                  { label: "관계 엣지", value: stats?.relationCount ?? 0, unit: "개" },
                  { label: "저자", value: stats?.authorCount ?? 0, unit: "명" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-line bg-surface p-4">
                    <div className="text-xs text-subtle mb-1">{s.label}</div>
                    <div className="text-xl font-bold tabular-nums">
                      {s.value.toLocaleString()}
                      <span className="text-xs font-normal text-zinc-400 ml-1">{s.unit}</span>
                    </div>
                  </div>
                ))}
          </div>

          {/* Category breakdown */}
          {!arxivLoading && stats && stats.categories.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold text-subtle uppercase tracking-widest">카테고리 분포</h2>
              <div className="space-y-2">
                {stats.categories.map(({ primary_category, cnt }) => {
                  const pct = Math.round((cnt / (stats.paperCount || 1)) * 100);
                  return (
                    <div key={primary_category} className="flex items-center gap-3">
                      <span className="w-36 shrink-0 text-xs text-zinc-600 dark:text-zinc-400 truncate">
                        {CATEGORY_LABEL[primary_category] ?? primary_category}
                      </span>
                      <div className="flex-1 h-2 bg-zinc-100 dark:bg-white/8 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-xs tabular-nums text-subtle">{cnt}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Score weight explanation */}
          <section className="rounded-xl border border-line bg-surface p-5 space-y-3">
            <h2 className="text-xs font-semibold text-subtle uppercase tracking-widest">중요도 점수 구성</h2>
            <div className="flex gap-2 h-2 rounded-full overflow-hidden">
              {SCORE_WEIGHTS.map((w) => (
                <div key={w.label} className={`${w.color} rounded-full`} style={{ width: `${w.pct}%` }} />
              ))}
            </div>
            <div className="flex gap-4">
              {SCORE_WEIGHTS.map((w) => (
                <div key={w.label} className="flex items-center gap-1.5">
                  <span className={`inline-block size-2 rounded-full ${w.color}`} />
                  <span className="text-xs text-muted">{w.label} {w.pct}%</span>
                </div>
              ))}
            </div>
          </section>

          <div className="h-px bg-black/8 dark:bg-white/8" />

          {/* Graph / List sub-tabs */}
          <div className="flex gap-1 rounded-xl border border-line bg-surface p-1 w-fit">
            {(["graph", "list"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setArxivTab(t)}
                className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all ${
                  arxivTab === t
                    ? "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {t === "graph" ? "그래프" : "논문 목록"}
              </button>
            ))}
          </div>

          {arxivTab === "graph" && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold text-subtle uppercase tracking-widest">
                논문 관계 그래프 — 상위 {graphData.papers.length.toLocaleString()}편
              </h2>
              {arxivLoading ? (
                <Skeleton className="h-96 w-full rounded-2xl" />
              ) : (
                <ArxivForceGraph papers={graphData.papers} relations={graphData.relations} />
              )}
              <p className="text-xs text-subtle text-center">
                노드 크기 = 중요도 점수 · 보라 선 = 시맨틱 유사도 · 초록 선 = 공저자
              </p>
            </section>
          )}

          {arxivTab === "list" && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold text-subtle uppercase tracking-widest">중요도 상위 논문</h2>
              {arxivLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                </div>
              ) : papers.length === 0 ? (
                <p className="text-sm text-subtle text-center py-12">
                  아직 수집된 논문이 없어요.{" "}
                  <code className="text-xs bg-zinc-100 dark:bg-white/8 px-1.5 py-0.5 rounded">arxiv-graph crawl</code>을 먼저 실행해 주세요.
                </p>
              ) : (
                <ol className="space-y-2">
                  {papers.map((p, i) => (
                    <li key={p.arxiv_id}>
                      <a
                        href={p.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3 hover:border-violet-200 dark:hover:border-violet-500/30 transition-all"
                      >
                        <span className="text-xs tabular-nums font-bold text-zinc-300 dark:text-zinc-600 w-5 shrink-0 mt-0.5">{i + 1}</span>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <p className="text-sm font-medium text-body group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors line-clamp-2 leading-snug">
                            {p.title}
                          </p>
                          <div className="flex items-center gap-2">
                            <ScoreBar score={p.importance_score} max={maxScore} />
                            <span className="shrink-0 text-xs tabular-nums text-subtle font-mono">{p.importance_score.toFixed(3)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-subtle">
                            <span>{p.primary_category}</span>
                            <span>·</span>
                            <span>{new Date(p.published_at).toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" })}</span>
                          </div>
                        </div>
                      </a>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          )}
        </div>
      )}

      {/* ── 지식 그래프 탭 ──────────────────────────── */}
      {tab === "knowledge" && (
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-subtle uppercase tracking-widest">
              포스트 지식 그래프
            </h2>
            <p className="text-sm text-muted">
              블로그 글들의 관계를 시각화합니다. 같은 카테고리·태그를 공유하는 글끼리 연결됩니다.
            </p>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "전체 글", value: postCount, unit: "편" },
              { label: "카테고리", value: categoryCount, unit: "개" },
              { label: "연결 기준", value: "카테고리·태그", unit: "" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-line bg-surface p-4">
                <div className="text-xs text-subtle mb-1">{s.label}</div>
                <div className="text-lg font-bold tabular-nums">
                  {s.value}
                  {s.unit && <span className="text-xs font-normal text-zinc-400 ml-1">{s.unit}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* 카테고리 분포 */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold text-subtle uppercase tracking-widest">카테고리</h2>
            <div className="space-y-1.5">
              {categories.map((cat) => (
                <div key={cat.key} className="flex items-center gap-3">
                  <div className="w-24 shrink-0 flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                    {cat.icon && <span>{cat.icon}</span>}
                    <span>{cat.label}</span>
                  </div>
                  <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-white/8 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${cat.pct}%` }} />
                  </div>
                  <span className="w-6 text-right text-xs tabular-nums text-zinc-400">{cat.count}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="h-px bg-black/8 dark:bg-white/8" />

          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-subtle uppercase tracking-widest">
              그래프 — 노드를 클릭하면 해당 글로 이동합니다
            </h2>
            <PostKnowledgeGraph />
            <p className="text-xs text-subtle text-center">
              노드 크기 = 태그 수 · 색상 = 카테고리 · 엣지 굵기 = 유사도
            </p>
          </section>
        </div>
      )}
        </div>
      </Container>
    </main>
  );
}
