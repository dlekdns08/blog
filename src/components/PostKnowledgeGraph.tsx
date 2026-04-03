"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Node = {
  id: string;
  title: string;
  category: string;
  subcategory: string | null;
  tags: string[];
  date: string;
  x: number; y: number; vx: number; vy: number; r: number;
};

type Edge = { source: string; target: string; weight: number };

const CAT_COLORS: Record<string, string> = {
  ai:       "#a78bfa",
  projects: "#60a5fa",
  dev:      "#34d399",
  life:     "#f59e0b",
  class:    "#f472b6",
};

function catColor(cat: string) {
  return CAT_COLORS[cat] ?? "#94a3b8";
}

export function PostKnowledgeGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<Node | null>(null);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [loading, setLoading] = useState(true);
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const rafRef = useRef<number>(0);
  const transformRef = useRef({ tx: 0, ty: 0, scale: 1 });
  const interactRef = useRef({
    dragging: null as Node | null,
    panning: false,
    startX: 0, startY: 0,
    lastX: 0, lastY: 0,
    moved: false,
  });
  const [graphData, setGraphData] = useState<{
    nodes: Omit<Node, "x"|"y"|"vx"|"vy"|"r">[];
    edges: Edge[];
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/posts/graph")
      .then((r) => r.ok ? r.json() : { nodes: [], edges: [] })
      .then(({ nodes, edges }) => { setGraphData({ nodes, edges }); setLoading(false); })
      .catch(() => setLoading(false));
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    if (loading || !graphData) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const W = wrap.clientWidth;
    const H = Math.round(W * 0.6);
    transformRef.current = { tx: 0, ty: 0, scale: 1 };

    const nodes: Node[] = graphData.nodes.map((n) => ({
      ...n,
      x: W / 2 + (Math.random() - 0.5) * 260,
      y: H / 2 + (Math.random() - 0.5) * 180,
      vx: 0, vy: 0,
      r: 5 + Math.min((n.tags?.length ?? 0) * 1.5, 10),
    }));
    nodesRef.current = nodes;
    edgesRef.current = graphData.edges;
    return startSim(nodes, graphData.edges, W, H);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, graphData]);

  function startSim(nodes: Node[], edges: Edge[], W: number, H: number): () => void {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return () => {};

    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    const isDark = document.documentElement.classList.contains("dark");
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const t = transformRef.current;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (canvas.width / (dpr * rect.width));
      const my = (e.clientY - rect.top) * (canvas.height / (dpr * rect.height));
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      const newScale = Math.max(0.15, Math.min(6, t.scale * factor));
      t.tx = mx - (mx - t.tx) * (newScale / t.scale);
      t.ty = my - (my - t.ty) * (newScale / t.scale);
      t.scale = newScale;
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });

    function tick() {
      const t = transformRef.current;
      const interact = interactRef.current;

      for (const n of nodes) {
        if (interact.dragging === n) continue;
        n.vx += (W / 2 - n.x) * 0.0012;
        n.vy += (H / 2 - n.y) * 0.0012;
        const same = nodes.filter((m) => m !== n && m.category === n.category);
        if (same.length) {
          const cx = same.reduce((s, m) => s + m.x, 0) / same.length;
          const cy = same.reduce((s, m) => s + m.y, 0) / same.length;
          n.vx += (cx - n.x) * 0.001;
          n.vy += (cy - n.y) * 0.001;
        }
        for (const m of nodes) {
          if (n === m) continue;
          const dx = n.x - m.x, dy = n.y - m.y;
          const d2 = dx * dx + dy * dy + 1;
          n.vx += (dx / d2) * 2500 * 0.001;
          n.vy += (dy / d2) * 2500 * 0.001;
        }
      }
      for (const e of edges) {
        const s = nodeMap.get(e.source), tgt = nodeMap.get(e.target);
        if (!s || !tgt) continue;
        const dx = tgt.x - s.x, dy = tgt.y - s.y;
        const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
        const f = ((d - 110) / d) * 0.03 * e.weight;
        s.vx += dx * f; s.vy += dy * f;
        tgt.vx -= dx * f; tgt.vy -= dy * f;
      }
      for (const n of nodes) {
        if (interact.dragging === n) continue;
        n.vx *= 0.8; n.vy *= 0.8;
        n.x += n.vx; n.y += n.vy;
      }

      // Background (screen space)
      ctx.fillStyle = isDark ? "#0f0f13" : "#f8f8fc";
      ctx.fillRect(0, 0, W, H);

      // Dot grid (screen space — fixed)
      ctx.fillStyle = isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.035)";
      for (let gx = 24; gx < W; gx += 24)
        for (let gy = 24; gy < H; gy += 24) {
          ctx.beginPath(); ctx.arc(gx, gy, 0.8, 0, Math.PI * 2); ctx.fill();
        }

      // World space
      ctx.save();
      ctx.translate(t.tx, t.ty);
      ctx.scale(t.scale, t.scale);

      const hovId = canvasRef.current?.dataset.hoveredId ?? "";
      const neighborIds = new Set<string>();
      if (hovId) {
        neighborIds.add(hovId);
        for (const e of edges) {
          if (e.source === hovId) neighborIds.add(e.target);
          if (e.target === hovId) neighborIds.add(e.source);
        }
      }

      // Edges
      for (const e of edges) {
        const s = nodeMap.get(e.source), tgt = nodeMap.get(e.target);
        if (!s || !tgt) continue;
        const dimmed = hovId && !neighborIds.has(e.source) && !neighborIds.has(e.target);
        const alpha = dimmed ? 0.04 : Math.min(0.08 + e.weight * 0.12, 0.3);
        const col = catColor(s.category);
        const mx2 = (s.x + tgt.x) / 2 + (tgt.y - s.y) * 0.1;
        const my2 = (s.y + tgt.y) / 2 - (tgt.x - s.x) * 0.1;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.quadraticCurveTo(mx2, my2, tgt.x, tgt.y);
        ctx.strokeStyle = col + Math.round(alpha * 255).toString(16).padStart(2, "0");
        ctx.lineWidth = (dimmed ? 0.5 : Math.min(0.8 + e.weight * 0.5, 2)) / t.scale;
        ctx.stroke();
      }

      // Nodes
      const sorted = [...nodes].sort((a, b) => a.r - b.r);
      for (const n of sorted) {
        const isHov = n.id === hovId;
        const dimmed = hovId && !neighborIds.has(n.id);
        const col = catColor(n.category);
        if (isHov) {
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 6, 0, Math.PI * 2);
          ctx.fillStyle = col + "22"; ctx.fill();
        }
        ctx.shadowColor = col;
        ctx.shadowBlur = isHov ? 18 : dimmed ? 0 : 8;
        const grad = ctx.createRadialGradient(n.x - n.r * 0.3, n.y - n.r * 0.3, n.r * 0.1, n.x, n.y, n.r);
        grad.addColorStop(0, col + (dimmed ? "18" : isHov ? "cc" : "66"));
        grad.addColorStop(1, col + (dimmed ? "08" : isHov ? "55" : "22"));
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();
        ctx.strokeStyle = col + (dimmed ? "30" : isHov ? "ff" : "99");
        ctx.lineWidth = (isHov ? 2 : 1) / t.scale;
        ctx.stroke();
        ctx.shadowBlur = 0;

        if ((isHov || n.r > 10) && !dimmed) {
          const label = n.title.length > 20 ? n.title.slice(0, 19) + "…" : n.title;
          const fs = (isHov ? 10 : 8.5) / t.scale;
          ctx.font = `${isHov ? 600 : 400} ${fs}px system-ui`;
          ctx.textAlign = "center";
          ctx.fillStyle = isDark ? `rgba(255,255,255,${dimmed ? 0.2 : 0.8})` : `rgba(15,15,20,${dimmed ? 0.2 : 0.75})`;
          ctx.shadowColor = isDark ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.9)";
          ctx.shadowBlur = 3;
          ctx.fillText(label, n.x, n.y + n.r + 11 / t.scale);
          ctx.shadowBlur = 0;
          ctx.textAlign = "left";
        }
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("wheel", onWheel);
    };
  }

  function getCanvasCoords(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    return {
      mx: (e.clientX - rect.left) * (canvas.width / (dpr * rect.width)),
      my: (e.clientY - rect.top) * (canvas.height / (dpr * rect.height)),
    };
  }

  function findNode(mx: number, my: number): Node | null {
    const { tx, ty, scale } = transformRef.current;
    const wx = (mx - tx) / scale, wy = (my - ty) / scale;
    for (const n of [...nodesRef.current].reverse()) {
      if ((n.x - wx) ** 2 + (n.y - wy) ** 2 <= (n.r + 5 / scale) ** 2) return n;
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
      interact.dragging.vx = 0;
      interact.dragging.vy = 0;
      setHovered(interact.dragging);
      if (canvasRef.current) canvasRef.current.dataset.hoveredId = interact.dragging.id;
    } else if (interact.panning) {
      transformRef.current.tx += mx - interact.lastX;
      transformRef.current.ty += my - interact.lastY;
      interact.lastX = mx;
      interact.lastY = my;
    } else {
      const found = findNode(mx, my);
      setHovered(found);
      if (canvasRef.current) canvasRef.current.dataset.hoveredId = found?.id ?? "";
    }
  }

  function handleMouseUp() {
    const interact = interactRef.current;
    const wasNodeDrag = !!interact.dragging;
    const didMove = interact.moved;
    interact.dragging = null;
    interact.panning = false;
    setIsGrabbing(false);
    if (!wasNodeDrag && !didMove && hovered) router.push(`/posts/${hovered.id}`);
  }

  function handleMouseLeave() {
    interactRef.current.dragging = null;
    interactRef.current.panning = false;
    setIsGrabbing(false);
    setHovered(null);
    if (canvasRef.current) canvasRef.current.dataset.hoveredId = "";
  }

  const usedCats = [...new Set(nodesRef.current.map((n) => n.category))];

  if (loading) {
    return (
      <div className="rounded-2xl border border-black/8 dark:border-white/10 bg-white dark:bg-white/5 h-72 animate-pulse" />
    );
  }

  return (
    <div ref={wrapRef} className="relative rounded-2xl border border-black/8 dark:border-white/10 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-auto block"
        style={{ cursor: isGrabbing ? "grabbing" : hovered ? "pointer" : "grab" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
      {/* Legend */}
      <div className="absolute top-3 left-3 flex flex-wrap gap-x-3 gap-y-1.5 bg-black/20 dark:bg-black/30 backdrop-blur-sm rounded-xl px-3 py-2">
        {Object.entries(CAT_COLORS).filter(([c]) => usedCats.includes(c)).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}` }} />
            <span className="text-[10px] font-medium text-white/70">{cat}</span>
          </div>
        ))}
      </div>
      {/* Tooltip */}
      {hovered && (
        <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/10 bg-black/60 backdrop-blur-md px-4 py-3 pointer-events-none">
          <p className="text-xs font-semibold text-white line-clamp-1">{hovered.title}</p>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-white/50">
            <span style={{ color: catColor(hovered.category) }}>{hovered.category}</span>
            {hovered.subcategory && <><span>·</span><span>{hovered.subcategory}</span></>}
            {hovered.tags.length > 0 && <><span>·</span><span>{hovered.tags.slice(0, 3).join(", ")}</span></>}
            <span className="ml-auto">클릭하면 이동 →</span>
          </div>
        </div>
      )}
    </div>
  );
}
