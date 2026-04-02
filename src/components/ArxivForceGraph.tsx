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

const CAT: Record<string, { hex: string; rgb: string; label: string }> = {
  "cs.CL": { hex: "#a78bfa", rgb: "167,139,250", label: "NLP" },
  "cs.LG": { hex: "#60a5fa", rgb: "96,165,250", label: "ML" },
  "cs.AI": { hex: "#34d399", rgb: "52,211,153", label: "AI" },
};
const DEFAULT_CAT = { hex: "#94a3b8", rgb: "148,163,184", label: "?" };

function getCat(cat: string) {
  return CAT[cat] ?? DEFAULT_CAT;
}

/* ── Particle along an edge ───────────────────────────── */
type Particle = {
  edgeIdx: number;
  t: number;       // 0→1 along edge
  speed: number;
};

export function ArxivForceGraph({
  papers,
  relations,
}: {
  papers: GraphNode[];
  relations: Relation[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<SimNode | null>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || papers.length === 0) return;

    /* ── Hi-DPI setup ────────────────────────────────── */
    const dpr = window.devicePixelRatio || 1;
    const W = wrap.clientWidth;
    const H = Math.round(W * 0.56);        // 16:9 ish
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const isDark = document.documentElement.classList.contains("dark");

    /* ── Nodes ───────────────────────────────────────── */
    const maxScore = Math.max(...papers.map((p) => p.importance_score), 0.01);
    const minR = 5, maxR = 20;

    const nodes: SimNode[] = papers.map((p) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 80 + Math.random() * 140;
      return {
        ...p,
        x: W / 2 + Math.cos(angle) * dist,
        y: H / 2 + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        r: minR + (p.importance_score / maxScore) * (maxR - minR),
      };
    });
    nodesRef.current = nodes;

    const nodeMap = new Map(nodes.map((n) => [n.arxiv_id, n]));

    /* ── Particles (semantic edges only) ─────────────── */
    const semanticEdges = relations.filter((e) => e.relation_type === "semantic");
    particlesRef.current = semanticEdges.flatMap((_, i) =>
      Array.from({ length: 2 }, () => ({
        edgeIdx: i,
        t: Math.random(),
        speed: 0.0015 + Math.random() * 0.001,
      }))
    );

    /* ── Draw helpers ────────────────────────────────── */
    function drawBackground() {
      // Solid bg
      ctx.fillStyle = isDark ? "#0f0f13" : "#f8f8fc";
      ctx.fillRect(0, 0, W, H);

      // Subtle dot grid
      const gridSize = 28;
      ctx.fillStyle = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)";
      for (let gx = gridSize; gx < W; gx += gridSize) {
        for (let gy = gridSize; gy < H; gy += gridSize) {
          ctx.beginPath();
          ctx.arc(gx, gy, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function drawEdge(
      s: SimNode,
      t: SimNode,
      type: string,
      weight: number,
      dimmed: boolean
    ) {
      const cat = getCat(s.primary_category);
      const alpha = dimmed ? 0.04 : type === "semantic" ? 0.22 : 0.28;

      // Control point for subtle curve
      const mx = (s.x + t.x) / 2 + (t.y - s.y) * 0.12;
      const my = (s.y + t.y) / 2 - (t.x - s.x) * 0.12;

      const grad = ctx.createLinearGradient(s.x, s.y, t.x, t.y);
      if (type === "semantic") {
        grad.addColorStop(0, `rgba(${getCat(s.primary_category).rgb},${alpha})`);
        grad.addColorStop(1, `rgba(${getCat(t.primary_category).rgb},${alpha})`);
      } else {
        grad.addColorStop(0, `rgba(${cat.rgb},${alpha})`);
        grad.addColorStop(1, `rgba(${cat.rgb},${alpha * 0.5})`);
      }

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.quadraticCurveTo(mx, my, t.x, t.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = dimmed ? 0.5 : Math.min(1 + weight, 2.5);
      ctx.stroke();
    }

    function drawParticle(p: Particle) {
      const e = semanticEdges[p.edgeIdx];
      const s = nodeMap.get(e.source_id);
      const t = nodeMap.get(e.target_id);
      if (!s || !t) return;

      // Quadratic bezier position
      const mx = (s.x + t.x) / 2 + (t.y - s.y) * 0.12;
      const my = (s.y + t.y) / 2 - (t.x - s.x) * 0.12;
      const u = 1 - p.t;
      const px = u * u * s.x + 2 * u * p.t * mx + p.t * p.t * t.x;
      const py = u * u * s.y + 2 * u * p.t * my + p.t * p.t * t.y;

      ctx.beginPath();
      ctx.arc(px, py, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${getCat(s.primary_category).rgb},0.7)`;
      ctx.shadowColor = getCat(s.primary_category).hex;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    function drawNode(n: SimNode, isHovered: boolean, dimmed: boolean) {
      const c = getCat(n.primary_category);

      // Outer glow ring (only for hovered / top nodes)
      if (isHovered || n.importance_score / maxScore > 0.7) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c.rgb},${isHovered ? 0.15 : 0.06})`;
        ctx.fill();
      }

      // Shadow glow
      ctx.shadowColor = c.hex;
      ctx.shadowBlur = isHovered ? 20 : dimmed ? 0 : 10;

      // Radial gradient fill
      const grad = ctx.createRadialGradient(
        n.x - n.r * 0.3, n.y - n.r * 0.3, n.r * 0.1,
        n.x, n.y, n.r
      );
      grad.addColorStop(0, `rgba(${c.rgb},${dimmed ? 0.12 : isHovered ? 0.9 : 0.55})`);
      grad.addColorStop(1, `rgba(${c.rgb},${dimmed ? 0.04 : isHovered ? 0.5 : 0.18})`);

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Border ring
      ctx.strokeStyle = `rgba(${c.rgb},${dimmed ? 0.15 : isHovered ? 1 : 0.7})`;
      ctx.lineWidth = isHovered ? 2 : 1.2;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Label for hovered or large nodes
      const showLabel = isHovered || (n.r > 13 && !dimmed);
      if (showLabel) {
        const label = n.title.length > 28 ? n.title.slice(0, 27) + "…" : n.title;
        const fontSize = isHovered ? 10 : 8.5;
        ctx.font = `${isHovered ? 600 : 400} ${fontSize}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = isDark
          ? `rgba(255,255,255,${dimmed ? 0.2 : 0.85})`
          : `rgba(15,15,20,${dimmed ? 0.2 : 0.8})`;
        // Text shadow for readability
        ctx.shadowColor = isDark ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.9)";
        ctx.shadowBlur = 4;
        ctx.fillText(label, n.x, n.y + n.r + fontSize + 2);
        ctx.shadowBlur = 0;
        ctx.textAlign = "left";
      }
    }

    /* ── Simulation ──────────────────────────────────── */
    let frame = 0;
    let hoveredId: string | null = null;

    function tick() {
      // Forces
      for (const n of nodes) {
        // Gravity to center
        n.vx += (W / 2 - n.x) * 0.001;
        n.vy += (H / 2 - n.y) * 0.001;

        // Category clustering: soft pull toward category centroid
        const samecat = nodes.filter(
          (m) => m !== n && m.primary_category === n.primary_category
        );
        if (samecat.length > 0) {
          const cx = samecat.reduce((s, m) => s + m.x, 0) / samecat.length;
          const cy = samecat.reduce((s, m) => s + m.y, 0) / samecat.length;
          n.vx += (cx - n.x) * 0.0008;
          n.vy += (cy - n.y) * 0.0008;
        }

        // Repulsion
        for (const m of nodes) {
          if (n === m) continue;
          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const d2 = dx * dx + dy * dy + 1;
          const minDist = (n.r + m.r + 12) ** 2;
          const f = d2 < minDist ? 4000 / d2 : 1800 / d2;
          n.vx += dx * f * 0.001;
          n.vy += dy * f * 0.001;
        }
      }

      // Spring edges
      for (const e of relations) {
        const s = nodeMap.get(e.source_id);
        const t = nodeMap.get(e.target_id);
        if (!s || !t) continue;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
        const ideal = e.relation_type === "author" ? 90 : 140;
        const f = ((d - ideal) / d) * 0.03;
        s.vx += dx * f;
        s.vy += dy * f;
        t.vx -= dx * f;
        t.vy -= dy * f;
      }

      // Integrate
      for (const n of nodes) {
        n.vx *= 0.78;
        n.vy *= 0.78;
        n.x = Math.max(n.r + 10, Math.min(W - n.r - 10, n.x + n.vx));
        n.y = Math.max(n.r + 10, Math.min(H - n.r - 10, n.y + n.vy));
      }

      // Advance particles
      for (const p of particlesRef.current) {
        p.t += p.speed;
        if (p.t > 1) p.t = 0;
      }

      /* ── Render ──────────────────────────────────────── */
      drawBackground();

      // Determine neighbor set for dimming
      const neighborIds = new Set<string>();
      if (hoveredId) {
        neighborIds.add(hoveredId);
        for (const e of relations) {
          if (e.source_id === hoveredId) neighborIds.add(e.target_id);
          if (e.target_id === hoveredId) neighborIds.add(e.source_id);
        }
      }

      // Edges
      ctx.save();
      for (const e of relations) {
        const s = nodeMap.get(e.source_id);
        const t = nodeMap.get(e.target_id);
        if (!s || !t) continue;
        const dimmed =
          hoveredId !== null &&
          !neighborIds.has(e.source_id) &&
          !neighborIds.has(e.target_id);
        drawEdge(s, t, e.relation_type, e.weight, dimmed);
      }
      ctx.restore();

      // Particles (only on non-dimmed edges)
      if (!hoveredId) {
        for (const p of particlesRef.current) {
          drawParticle(p);
        }
      }

      // Nodes (back to front by radius)
      const sorted = [...nodes].sort((a, b) => a.r - b.r);
      for (const n of sorted) {
        const isHov = n.arxiv_id === hoveredId;
        const dimmed =
          hoveredId !== null && !neighborIds.has(n.arxiv_id);
        drawNode(n, isHov, dimmed);
      }

      frame++;
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [papers, relations]);

  /* ── Mouse ───────────────────────────────────────────── */
  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const mx = (e.clientX - rect.left) * (canvas.width / dpr / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / dpr / rect.height);

    let found: SimNode | null = null;
    for (const n of [...nodesRef.current].reverse()) {
      const dx = n.x - mx;
      const dy = n.y - my;
      if (dx * dx + dy * dy <= (n.r + 6) * (n.r + 6)) {
        found = n;
        break;
      }
    }
    setHovered(found);
    // Sync id into closure without re-running effect
    const el = canvas as HTMLCanvasElement & { _hoveredId?: string | null };
    el._hoveredId = found?.arxiv_id ?? null;

    // Patch hoveredId used inside tick via canvas attribute
    canvas.dataset.hoveredId = found?.arxiv_id ?? "";
  }

  // Sync hoveredId into tick closure via a ref trick
  const hoveredIdRef = useRef<string | null>(null);
  hoveredIdRef.current = hovered?.arxiv_id ?? null;

  /* ── We need hoveredId accessible inside the tick closure.
        Use a module-level mutable ref via canvas dataset.        */

  if (papers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 rounded-2xl border border-black/8 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-zinc-400 dark:text-zinc-500">
        아직 수집된 논문이 없어요.{" "}
        <code className="ml-1 text-xs bg-zinc-100 dark:bg-white/8 px-1.5 py-0.5 rounded">
          arxiv-graph crawl
        </code>
        을 먼저 실행해 주세요.
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className="relative rounded-2xl border border-black/8 dark:border-white/10 overflow-hidden"
      style={{ background: "transparent" }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-auto cursor-crosshair block"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(null)}
      />

      {/* Legend — top-left overlay */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5 bg-black/20 dark:bg-black/30 backdrop-blur-sm rounded-xl px-3 py-2.5">
        {Object.entries(CAT).map(([cat, { hex, label }]) => (
          <div key={cat} className="flex items-center gap-2">
            <span
              className="inline-block size-2 rounded-full"
              style={{ backgroundColor: hex, boxShadow: `0 0 6px ${hex}` }}
            />
            <span className="text-[10px] font-medium text-white/70">
              {cat} · {label}
            </span>
          </div>
        ))}
        <div className="mt-1 h-px bg-white/10" />
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-px bg-violet-400/60" />
          <span className="text-[10px] text-white/50">시맨틱</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-px bg-emerald-400/60" />
          <span className="text-[10px] text-white/50">공저자</span>
        </div>
      </div>

      {/* Tooltip */}
      {hovered && (
        <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/10 bg-black/60 backdrop-blur-md px-4 py-3 shadow-xl pointer-events-none">
          <div className="flex items-start gap-2.5">
            <span
              className="mt-0.5 size-2 rounded-full shrink-0 ring-2 ring-white/20"
              style={{
                backgroundColor: getCat(hovered.primary_category).hex,
                boxShadow: `0 0 8px ${getCat(hovered.primary_category).hex}`,
              }}
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white line-clamp-2 leading-snug">
                {hovered.title}
              </p>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-white/50">
                <span>{hovered.primary_category}</span>
                <span>·</span>
                <span>
                  중요도{" "}
                  <span className="font-mono text-white/70">
                    {hovered.importance_score.toFixed(3)}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
