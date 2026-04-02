"use client";

import { useEffect, useRef, useState } from "react";

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

type SimNode = GraphNode & {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

const CATEGORY_COLOR: Record<string, string> = {
  "cs.CL": "#8b5cf6",
  "cs.LG": "#3b82f6",
  "cs.AI": "#10b981",
};

const CATEGORY_LABEL: Record<string, string> = {
  "cs.CL": "NLP",
  "cs.LG": "ML",
  "cs.AI": "AI",
};

function getColor(cat: string): string {
  return CATEGORY_COLOR[cat] ?? "#94a3b8";
}

export function ArxivForceGraph({
  papers,
  relations,
}: {
  papers: GraphNode[];
  relations: Relation[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<GraphNode | null>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || papers.length === 0) return;

    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;
    const isDark = document.documentElement.classList.contains("dark");

    const maxScore = Math.max(...papers.map((p) => p.importance_score), 0.01);

    const nodes: SimNode[] = papers.map((p) => ({
      ...p,
      x: W / 2 + (Math.random() - 0.5) * 300,
      y: H / 2 + (Math.random() - 0.5) * 200,
      vx: 0,
      vy: 0,
      r: 5 + (p.importance_score / maxScore) * 14,
    }));
    nodesRef.current = nodes;

    const nodeMap = new Map(nodes.map((n) => [n.arxiv_id, n]));

    let frame = 0;

    function tick() {
      ctx.clearRect(0, 0, W, H);

      // Forces
      for (const n of nodes) {
        // Center gravity
        n.vx += (W / 2 - n.x) * 0.0015;
        n.vy += (H / 2 - n.y) * 0.0015;

        // Repulsion between nodes
        for (const m of nodes) {
          if (n === m) continue;
          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const d2 = dx * dx + dy * dy + 1;
          const f = 3000 / d2;
          n.vx += dx * f;
          n.vy += dy * f;
        }
      }

      // Spring attraction for edges
      for (const e of relations) {
        const s = nodeMap.get(e.source_id);
        const t = nodeMap.get(e.target_id);
        if (!s || !t) continue;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
        const ideal = 120;
        const f = ((d - ideal) / d) * 0.04;
        s.vx += dx * f;
        s.vy += dy * f;
        t.vx -= dx * f;
        t.vy -= dy * f;
      }

      // Integrate + damp + clamp
      for (const n of nodes) {
        n.vx *= 0.82;
        n.vy *= 0.82;
        n.x = Math.max(n.r + 4, Math.min(W - n.r - 4, n.x + n.vx));
        n.y = Math.max(n.r + 4, Math.min(H - n.r - 4, n.y + n.vy));
      }

      // Draw edges
      for (const e of relations) {
        const s = nodeMap.get(e.source_id);
        const t = nodeMap.get(e.target_id);
        if (!s || !t) continue;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle =
          e.relation_type === "semantic"
            ? isDark
              ? "rgba(139,92,246,0.18)"
              : "rgba(139,92,246,0.12)"
            : isDark
              ? "rgba(16,185,129,0.2)"
              : "rgba(16,185,129,0.15)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw nodes
      for (const n of nodes) {
        const color = getColor(n.primary_category);
        // Glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = color + (isDark ? "55" : "33");
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      frame++;
      const settled =
        frame > 80 && nodes.every((n) => Math.abs(n.vx) + Math.abs(n.vy) < 0.15);
      if (!settled) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [papers, relations]);

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    let found: SimNode | null = null;
    for (const n of nodesRef.current) {
      const dx = n.x - mx;
      const dy = n.y - my;
      if (dx * dx + dy * dy <= (n.r + 4) * (n.r + 4)) {
        found = n;
        break;
      }
    }
    setHovered(found);
  }

  if (papers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 rounded-2xl border border-black/8 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-zinc-400 dark:text-zinc-500">
        아직 수집된 논문이 없어요. <code className="ml-1 text-xs bg-zinc-100 dark:bg-white/8 px-1.5 py-0.5 rounded">arxiv-graph crawl</code>을 먼저 실행해 주세요.
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl border border-black/8 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={720}
        height={420}
        className="w-full h-auto cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(null)}
      />

      {/* Legend */}
      <div className="absolute top-3 left-3 flex flex-col gap-1">
        {Object.entries(CATEGORY_COLOR).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
              {cat} · {CATEGORY_LABEL[cat]}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="inline-block w-5 h-px bg-violet-400 opacity-60" />
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">시맨틱</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-5 h-px bg-emerald-400 opacity-60" />
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">공저자</span>
        </div>
      </div>

      {/* Tooltip */}
      {hovered && (
        <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-black/8 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur px-4 py-3 shadow-lg pointer-events-none">
          <div className="flex items-start gap-2">
            <span
              className="mt-0.5 inline-block size-2 rounded-full shrink-0"
              style={{ backgroundColor: getColor(hovered.primary_category) }}
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 line-clamp-2 leading-snug">
                {hovered.title}
              </p>
              <p className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500">
                {hovered.primary_category} · 중요도{" "}
                <span className="font-mono">{hovered.importance_score.toFixed(3)}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
