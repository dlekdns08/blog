import { PostKnowledgeGraph } from "@/components/PostKnowledgeGraph";
import { getAllPosts } from "@/lib/posts";
import { CATEGORY_CONFIG } from "@/lib/categories";

export default async function KnowledgeGraphPage() {
  const posts = await getAllPosts();
  const catCounts: Record<string, number> = {};
  for (const p of posts) catCounts[p.category] = (catCounts[p.category] ?? 0) + 1;

  return (
    <main className="px-8 py-10 max-w-3xl space-y-10">
      <div>
        <h1 className="text-xl font-bold tracking-tight mb-1">포스트 지식 그래프</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          블로그 글들의 관계를 시각화합니다. 같은 카테고리·태그를 공유하는 글끼리 연결됩니다.
        </p>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "전체 글", value: posts.length, unit: "편" },
          { label: "카테고리", value: Object.keys(catCounts).length, unit: "개" },
          { label: "연결 기준", value: "카테고리·태그", unit: "" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-black/8 dark:border-white/10 bg-white dark:bg-white/5 p-4">
            <div className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">{s.label}</div>
            <div className="text-lg font-bold tabular-nums">
              {s.value}
              {s.unit && <span className="text-xs font-normal text-zinc-400 ml-1">{s.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* 카테고리 분포 */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">카테고리</h2>
        <div className="space-y-1.5">
          {Object.entries(catCounts).sort((a, b) => b[1] - a[1]).map(([cat, cnt]) => {
            const cfg = CATEGORY_CONFIG[cat];
            const pct = Math.round((cnt / posts.length) * 100);
            return (
              <div key={cat} className="flex items-center gap-3">
                <div className="w-24 shrink-0 flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                  {cfg?.icon && <span>{cfg.icon}</span>}
                  <span>{cfg?.label ?? cat}</span>
                </div>
                <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 text-right text-xs tabular-nums text-zinc-400">{cnt}</span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="h-px bg-black/8 dark:bg-white/8" />

      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
          그래프 — 노드를 클릭하면 해당 글로 이동합니다
        </h2>
        <PostKnowledgeGraph />
        <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
          노드 크기 = 태그 수 · 색상 = 카테고리 · 엣지 굵기 = 유사도
        </p>
      </section>
    </main>
  );
}
