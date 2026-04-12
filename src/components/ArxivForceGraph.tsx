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

// ── Spatial Hash Grid for O(N) approximate repulsion ────────
class SpatialGrid {
  private cells = new Map<string, SimNode[]>();
  private cellSize: number;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }

  clear() {
    this.cells.clear();
  }

  insert(node: SimNode) {
    const key = this.key(node.x, node.y);
    let cell = this.cells.get(key);
    if (!cell) {
      cell = [];
      this.cells.set(key, cell);
    }
    cell.push(node);
  }

  private key(x: number, y: number) {
    return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`;
  }

  getNeighbors(node: SimNode): SimNode[] {
    const cx = Math.floor(node.x / this.cellSize);
    const cy = Math.floor(node.y / this.cellSize);
    const result: SimNode[] = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const cell = this.cells.get(`${cx + dx},${cy + dy}`);
        if (cell) {
          for (const n of cell) {
            if (n !== node) result.push(n);
          }
        }
      }
    }
    return result;
  }
}

type Particle = {
  edgeIdx: number;
  t: number;
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
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [is3D, setIs3D] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [FG3D, setFG3D] = useState<React.ComponentType<any> | null>(null);
  const [fg3DLoading, setFg3DLoading] = useState(false);
  const [containerW, setContainerW] = useState(800);
  const [isDark, setIsDark] = useState(false);
  const is3DRef = useRef(false);
  is3DRef.current = is3D;

  const nodesRef = useRef<SimNode[]>([]);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const transformRef = useRef({ tx: 0, ty: 0, scale: 1 });
  const interactRef = useRef({
    dragging: null as SimNode | null,
    panning: false,
    startX: 0, startY: 0,
    lastX: 0, lastY: 0,
    moved: false,
  });

  // Track dark mode
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // Lazy load ForceGraph3D when 3D is first activated
  const toggle3D = () => {
    const next = !is3D;
    setIs3D(next);
    if (next && !FG3D && !fg3DLoading) {
      setFg3DLoading(true);
      import("react-force-graph").then((mod) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setFG3D(() => (mod as any).ForceGraph3D as React.ComponentType<any>);
        setFg3DLoading(false);
      });
    }
  };

  // Track container width for 3D sizing
  useEffect(() => {
    if (wrapRef.current) setContainerW(wrapRef.current.clientWidth);
  }, [papers]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || papers.length === 0) return;

    const N = papers.length;
    const isLarge = N > 200;

    const dpr = window.devicePixelRatio || 1;
    const W = wrap.clientWidth;
    const H = Math.round(W * 0.56);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    // For large graphs, zoom out initially
    const initScale = isLarge ? Math.max(0.3, Math.min(1, 200 / Math.sqrt(N))) : 1;
    transformRef.current = {
      tx: W * (1 - initScale) / 2,
      ty: H * (1 - initScale) / 2,
      scale: initScale,
    };

    const maxScore = Math.max(...papers.map((p) => p.importance_score), 0.01);
    const minR = isLarge ? 3 : 5;
    const maxR = isLarge ? 12 : 20;

    // Spread initial positions wider for large graphs
    const spreadFactor = isLarge ? Math.sqrt(N) * 2.5 : 1;

    const nodes: SimNode[] = papers.map((p) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = (80 + Math.random() * 140) * (isLarge ? spreadFactor / 10 : 1);
      return {
        ...p,
        x: W / 2 + Math.cos(angle) * dist,
        y: H / 2 + Math.sin(angle) * dist,
        vx: 0, vy: 0,
        r: minR + (p.importance_score / maxScore) * (maxR - minR),
      };
    });
    nodesRef.current = nodes;

    const nodeMap = new Map(nodes.map((n) => [n.arxiv_id, n]));

    // Limit particles for performance
    const semanticEdges = relations.filter((e) => e.relation_type === "semantic");
    const maxParticles = isLarge ? Math.min(semanticEdges.length, 200) : semanticEdges.length * 2;
    particlesRef.current = Array.from({ length: maxParticles }, (_, i) => ({
      edgeIdx: i % Math.max(semanticEdges.length, 1),
      t: Math.random(),
      speed: 0.0015 + Math.random() * 0.001,
    }));

    const grid = new SpatialGrid(isLarge ? 60 : 50);

    // Precompute category groups for attraction
    const catGroups = new Map<string, SimNode[]>();
    for (const n of nodes) {
      let arr = catGroups.get(n.primary_category);
      if (!arr) { arr = []; catGroups.set(n.primary_category, arr); }
      arr.push(n);
    }

    // Wheel zoom
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const t = transformRef.current;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (canvas.width / (dpr * rect.width));
      const my = (e.clientY - rect.top) * (canvas.height / (dpr * rect.height));
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      const newScale = Math.max(0.08, Math.min(8, t.scale * factor));
      t.tx = mx - (mx - t.tx) * (newScale / t.scale);
      t.ty = my - (my - t.ty) * (newScale / t.scale);
      t.scale = newScale;
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });

    function drawBackground() {
      const curIsDark = document.documentElement.classList.contains("dark");
      ctx.fillStyle = curIsDark ? "#0f0f13" : "#f8f8fc";
      ctx.fillRect(0, 0, W, H);
      const gridSize = 28;
      ctx.fillStyle = curIsDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)";
      for (let gx = gridSize; gx < W; gx += gridSize) {
        for (let gy = gridSize; gy < H; gy += gridSize) {
          ctx.beginPath();
          ctx.arc(gx, gy, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function drawEdge(s: SimNode, t2: SimNode, type: string, weight: number, dimmed: boolean, scale: number) {
      const cat = getCat(s.primary_category);
      const alpha = dimmed ? 0.04 : type === "semantic" ? 0.22 : 0.28;
      if (isLarge) {
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.strokeStyle = `rgba(${cat.rgb},${alpha * 0.6})`;
        ctx.lineWidth = (dimmed ? 0.3 : Math.min(0.5 + weight * 0.3, 1.2)) / scale;
        ctx.stroke();
      } else {
        const mx2 = (s.x + t2.x) / 2 + (t2.y - s.y) * 0.12;
        const my2 = (s.y + t2.y) / 2 - (t2.x - s.x) * 0.12;
        const grad = ctx.createLinearGradient(s.x, s.y, t2.x, t2.y);
        if (type === "semantic") {
          grad.addColorStop(0, `rgba(${getCat(s.primary_category).rgb},${alpha})`);
          grad.addColorStop(1, `rgba(${getCat(t2.primary_category).rgb},${alpha})`);
        } else {
          grad.addColorStop(0, `rgba(${cat.rgb},${alpha})`);
          grad.addColorStop(1, `rgba(${cat.rgb},${alpha * 0.5})`);
        }
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.quadraticCurveTo(mx2, my2, t2.x, t2.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = (dimmed ? 0.5 : Math.min(1 + weight, 2.5)) / scale;
        ctx.stroke();
      }
    }

    function drawParticle(p: Particle) {
      const e = semanticEdges[p.edgeIdx];
      const s = nodeMap.get(e.source_id);
      const t2 = nodeMap.get(e.target_id);
      if (!s || !t2) return;
      if (isLarge) {
        const px = s.x + (t2.x - s.x) * p.t;
        const py = s.y + (t2.y - s.y) * p.t;
        ctx.beginPath();
        ctx.arc(px, py, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${getCat(s.primary_category).rgb},0.5)`;
        ctx.fill();
      } else {
        const mx2 = (s.x + t2.x) / 2 + (t2.y - s.y) * 0.12;
        const my2 = (s.y + t2.y) / 2 - (t2.x - s.x) * 0.12;
        const u = 1 - p.t;
        const px = u * u * s.x + 2 * u * p.t * mx2 + p.t * p.t * t2.x;
        const py = u * u * s.y + 2 * u * p.t * my2 + p.t * p.t * t2.y;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${getCat(s.primary_category).rgb},0.7)`;
        ctx.shadowColor = getCat(s.primary_category).hex;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function drawNode(n: SimNode, isHovered: boolean, dimmed: boolean, scale: number) {
      const c = getCat(n.primary_category);
      const curIsDark = document.documentElement.classList.contains("dark");

      if (!isLarge || isHovered || n.importance_score / maxScore > 0.7) {
        if (isHovered || n.importance_score / maxScore > 0.7) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${c.rgb},${isHovered ? 0.15 : 0.06})`;
          ctx.fill();
        }
      }

      if (!isLarge) {
        ctx.shadowColor = c.hex;
        ctx.shadowBlur = isHovered ? 20 : dimmed ? 0 : 10;
      }

      if (isLarge && !isHovered) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c.rgb},${dimmed ? 0.08 : 0.4})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(${c.rgb},${dimmed ? 0.1 : 0.5})`;
        ctx.lineWidth = 0.8 / scale;
        ctx.stroke();
      } else {
        const grad = ctx.createRadialGradient(n.x - n.r * 0.3, n.y - n.r * 0.3, n.r * 0.1, n.x, n.y, n.r);
        grad.addColorStop(0, `rgba(${c.rgb},${dimmed ? 0.12 : isHovered ? 0.9 : 0.55})`);
        grad.addColorStop(1, `rgba(${c.rgb},${dimmed ? 0.04 : isHovered ? 0.5 : 0.18})`);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = `rgba(${c.rgb},${dimmed ? 0.15 : isHovered ? 1 : 0.7})`;
        ctx.lineWidth = (isHovered ? 2 : 1.2) / scale;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      const labelThreshold = isLarge ? 0.85 : 0.5;
      const showLabel = isHovered || (n.importance_score / maxScore > labelThreshold && !dimmed);
      if (showLabel) {
        const label = n.title.length > 28 ? n.title.slice(0, 27) + "\u2026" : n.title;
        const fontSize = (isHovered ? 10 : 8.5) / scale;
        ctx.font = `${isHovered ? 600 : 400} ${fontSize}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = curIsDark
          ? `rgba(255,255,255,${dimmed ? 0.2 : 0.85})`
          : `rgba(15,15,20,${dimmed ? 0.2 : 0.8})`;
        ctx.shadowColor = curIsDark ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.9)";
        ctx.shadowBlur = 4;
        ctx.fillText(label, n.x, n.y + n.r + (fontSize + 2));
        ctx.shadowBlur = 0;
        ctx.textAlign = "left";
      }
    }

    function isVisible(x: number, y: number, margin: number): boolean {
      const { tx, ty, scale } = transformRef.current;
      const sx = x * scale + tx;
      const sy = y * scale + ty;
      return sx > -margin && sx < W + margin && sy > -margin && sy < H + margin;
    }

    let frame = 0;

    function tick() {
      // Skip physics and drawing when in 3D mode
      if (is3DRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const tr = transformRef.current;
      const interact = interactRef.current;

      // Center gravity
      for (const n of nodes) {
        if (interact.dragging === n) continue;
        n.vx += (W / 2 - n.x) * 0.001;
        n.vy += (H / 2 - n.y) * 0.001;
      }

      // Category attraction (precomputed centroids, updated periodically)
      if (frame % 5 === 0) {
        for (const [, group] of catGroups) {
          if (group.length < 2) continue;
          const cx = group.reduce((s, m) => s + m.x, 0) / group.length;
          const cy = group.reduce((s, m) => s + m.y, 0) / group.length;
          for (const n of group) {
            if (interact.dragging === n) continue;
            n.vx += (cx - n.x) * 0.0008;
            n.vy += (cy - n.y) * 0.0008;
          }
        }
      }

      // Repulsion via spatial grid
      grid.clear();
      for (const n of nodes) grid.insert(n);

      for (const n of nodes) {
        if (interact.dragging === n) continue;
        const neighbors = grid.getNeighbors(n);
        for (const m of neighbors) {
          const dx = n.x - m.x, dy = n.y - m.y;
          const d2 = dx * dx + dy * dy + 1;
          const minDist = (n.r + m.r + (isLarge ? 8 : 12)) ** 2;
          const f = d2 < minDist ? 4000 / d2 : 1800 / d2;
          n.vx += dx * f * 0.001;
          n.vy += dy * f * 0.001;
        }
      }

      // Edge spring forces
      for (const e of relations) {
        const s = nodeMap.get(e.source_id), t2 = nodeMap.get(e.target_id);
        if (!s || !t2) continue;
        const dx = t2.x - s.x, dy = t2.y - s.y;
        const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
        const ideal = e.relation_type === "author" ? (isLarge ? 50 : 90) : (isLarge ? 80 : 140);
        const f = ((d - ideal) / d) * 0.03;
        if (interact.dragging !== s) { s.vx += dx * f; s.vy += dy * f; }
        if (interact.dragging !== t2) { t2.vx -= dx * f; t2.vy -= dy * f; }
      }

      // Velocity damping and integration
      const damping = isLarge ? 0.82 : 0.78;
      for (const n of nodes) {
        if (interact.dragging === n) continue;
        n.vx *= damping; n.vy *= damping;
        n.x += n.vx; n.y += n.vy;
      }

      // Particles
      for (const p of particlesRef.current) {
        p.t += p.speed;
        if (p.t > 1) p.t = 0;
      }

      // ── Render ──────────────────────────────────
      drawBackground();

      const hoveredId = canvasRef.current?.dataset.hoveredId ?? "";
      const neighborIds = new Set<string>();
      if (hoveredId) {
        neighborIds.add(hoveredId);
        for (const e of relations) {
          if (e.source_id === hoveredId) neighborIds.add(e.target_id);
          if (e.target_id === hoveredId) neighborIds.add(e.source_id);
        }
      }

      ctx.save();
      ctx.translate(tr.tx, tr.ty);
      ctx.scale(tr.scale, tr.scale);

      const visMargin = 50 / tr.scale;
      ctx.save();
      for (const e of relations) {
        const s = nodeMap.get(e.source_id), t2 = nodeMap.get(e.target_id);
        if (!s || !t2) continue;
        if (!isVisible(s.x, s.y, visMargin) && !isVisible(t2.x, t2.y, visMargin)) continue;
        const dimmed = hoveredId !== "" && !neighborIds.has(e.source_id) && !neighborIds.has(e.target_id);
        drawEdge(s, t2, e.relation_type, e.weight, dimmed, tr.scale);
      }
      ctx.restore();

      if (!hoveredId) {
        for (const p of particlesRef.current) drawParticle(p);
      }

      const sorted = [...nodes].sort((a, b) => a.r - b.r);
      for (const n of sorted) {
        if (!isVisible(n.x, n.y, n.r * 3)) continue;
        const isHov = n.arxiv_id === hoveredId;
        const dimmed = hoveredId !== "" && !neighborIds.has(n.arxiv_id);
        drawNode(n, isHov, dimmed, tr.scale);
      }

      ctx.restore();
      frame++;
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [papers, relations]);

  function getCanvasCoords(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    return {
      mx: (e.clientX - rect.left) * (canvas.width / (dpr * rect.width)),
      my: (e.clientY - rect.top) * (canvas.height / (dpr * rect.height)),
    };
  }

  function findNode(mx: number, my: number): SimNode | null {
    const { tx, ty, scale } = transformRef.current;
    const wx = (mx - tx) / scale, wy = (my - ty) / scale;
    for (const n of [...nodesRef.current].reverse()) {
      if ((n.x - wx) ** 2 + (n.y - wy) ** 2 <= (n.r + 6 / scale) ** 2) return n;
    }
    return null;
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const { mx, my } = getCanvasCoords(e);
    const node = findNode(mx, my);
    interactRef.current = { dragging: node, panning: !node, startX: mx, startY: my, lastX: mx, lastY: my, moved: false };
    setIsGrabbing(true);
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const { mx, my } = getCanvasCoords(e);
    const interact = interactRef.current;
    if (Math.abs(mx - interact.startX) > 3 || Math.abs(my - interact.startY) > 3) interact.moved = true;

    if (interact.dragging) {
      const { tx, ty, scale } = transformRef.current;
      interact.dragging.x = (mx - tx) / scale;
      interact.dragging.y = (my - ty) / scale;
      interact.dragging.vx = 0; interact.dragging.vy = 0;
      setHovered(interact.dragging);
      if (canvasRef.current) canvasRef.current.dataset.hoveredId = interact.dragging.arxiv_id ?? "";
    } else if (interact.panning) {
      transformRef.current.tx += mx - interact.lastX;
      transformRef.current.ty += my - interact.lastY;
      interact.lastX = mx; interact.lastY = my;
    } else {
      const found = findNode(mx, my);
      setHovered(found);
      if (canvasRef.current) canvasRef.current.dataset.hoveredId = found?.arxiv_id ?? "";
    }
  }

  function handleMouseUp() {
    interactRef.current.dragging = null;
    interactRef.current.panning = false;
    setIsGrabbing(false);
  }

  function handleMouseLeave() {
    interactRef.current.dragging = null;
    interactRef.current.panning = false;
    setIsGrabbing(false);
    setHovered(null);
    if (canvasRef.current) canvasRef.current.dataset.hoveredId = "";
  }

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

  const maxScore = Math.max(...papers.map((p) => p.importance_score), 0.01);
  const graphH = Math.round(containerW * 0.56);

  // 3D graph data
  const g3DData = {
    nodes: papers.map((p) => ({
      id: p.arxiv_id,
      name: p.title.length > 60 ? p.title.slice(0, 59) + "…" : p.title,
      color: getCat(p.primary_category).hex,
      val: 2 + (p.importance_score / maxScore) * 10,
      category: p.primary_category,
    })),
    links: relations.map((r) => ({
      source: r.source_id,
      target: r.target_id,
      type: r.relation_type,
      value: r.weight,
    })),
  };

  return (
    <div
      ref={wrapRef}
      className="relative rounded-2xl border border-black/8 dark:border-white/10 overflow-hidden"
      style={{ background: "transparent" }}
    >
      {/* 2D Canvas — always mounted, hidden in 3D mode */}
      <canvas
        ref={canvasRef}
        className="w-full h-auto block"
        style={{
          cursor: isGrabbing ? "grabbing" : hovered ? "pointer" : "grab",
          display: is3D ? "none" : "block",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />

      {/* 3D Graph */}
      {is3D && (
        <div style={{ width: containerW, height: graphH }} className="bg-[#0a0a10]">
          {FG3D ? (
            <FG3D
              graphData={g3DData}
              nodeId="id"
              nodeColor="color"
              nodeVal="val"
              nodeLabel="name"
              linkColor={(link: { type: string }) =>
                link.type === "semantic"
                  ? "rgba(167,139,250,0.35)"
                  : "rgba(52,211,153,0.35)"
              }
              linkWidth={(link: { value: number }) => Math.max(0.3, link.value * 0.8)}
              width={containerW}
              height={graphH}
              backgroundColor={isDark ? "#0a0a10" : "#f0f0f6"}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-400 text-sm gap-2">
              <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              3D 로딩 중...
            </div>
          )}
        </div>
      )}

      {/* 2D/3D Toggle button */}
      <button
        onClick={toggle3D}
        className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold bg-black/25 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/40 transition-colors border border-white/10 select-none"
      >
        {is3D ? (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
            </svg>
            2D
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            3D
          </>
        )}
      </button>

      {/* Legend */}
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
        {!is3D && (
          <>
            <div className="mt-1 h-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-px bg-violet-400/60" />
              <span className="text-[10px] text-white/50">시맨틱</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-px bg-emerald-400/60" />
              <span className="text-[10px] text-white/50">공저자</span>
            </div>
          </>
        )}
      </div>

      {/* Node count badge (2D mode — 3D toggle button takes that spot) */}
      {!is3D && (
        <div className="absolute top-10 right-3 bg-black/20 dark:bg-black/30 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
          <span className="text-[10px] font-medium text-white/60 tabular-nums">
            {papers.length.toLocaleString()} papers
          </span>
        </div>
      )}
      {is3D && (
        <div className="absolute top-10 right-3 bg-black/20 dark:bg-black/30 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
          <span className="text-[10px] font-medium text-white/60 tabular-nums">
            {papers.length.toLocaleString()} papers
          </span>
        </div>
      )}

      {/* Tooltip (2D only) */}
      {!is3D && hovered && (
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
