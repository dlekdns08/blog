"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// ── Types ─────────────────────────────────────────────────
type RawNode = {
  id: string;
  title: string;
  category: string;
  subcategory: string | null;
  tags: string[];
  date: string;
};

type SimNode = RawNode & {
  x: number; y: number; vx: number; vy: number; r: number;
};

type Edge = { source: string; target: string; weight: number };

// ── Colors ────────────────────────────────────────────────
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

// ── SpatialGrid — O(N·k) repulsion ────────────────────────
class SpatialGrid {
  private cells = new Map<string, SimNode[]>();
  private cellSize: number;
  constructor(cellSize: number) { this.cellSize = cellSize; }
  clear() { this.cells.clear(); }
  insert(node: SimNode) {
    const key = this.key(node.x, node.y);
    let cell = this.cells.get(key);
    if (!cell) { cell = []; this.cells.set(key, cell); }
    cell.push(node);
  }
  private key(x: number, y: number) {
    return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`;
  }
  getNeighbors(node: SimNode): SimNode[] {
    const cx = Math.floor(node.x / this.cellSize);
    const cy = Math.floor(node.y / this.cellSize);
    const result: SimNode[] = [];
    for (let dx = -2; dx <= 2; dx++)
      for (let dy = -2; dy <= 2; dy++) {
        const cell = this.cells.get(`${cx + dx},${cy + dy}`);
        if (cell) for (const n of cell) if (n !== node) result.push(n);
      }
    return result;
  }
}

// ── Icons ─────────────────────────────────────────────────
function Icon2D() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  );
}
function Icon3D() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
}
function Spinner() {
  return (
    <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────
export function PostKnowledgeGraph() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const wrapRef    = useRef<HTMLDivElement>(null);
  const rafRef     = useRef<number>(0);
  const nodesRef   = useRef<SimNode[]>([]);
  const transformRef = useRef({ tx: 0, ty: 0, scale: 1 });
  const interactRef  = useRef({
    dragging: null as SimNode | null,
    panning: false,
    startX: 0, startY: 0,
    lastX: 0, lastY: 0,
    moved: false,
  });
  const is3DRef          = useRef(false);
  const lastTouchDistRef = useRef(0);

  const [hovered,    setHovered]    = useState<SimNode | null>(null);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [is3D,       setIs3D]       = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [FG3D, setFG3D] = useState<React.ComponentType<any> | null>(null);
  const [containerW, setContainerW] = useState(0);
  const [graphH,     setGraphH]     = useState(640);
  const [isDark,     setIsDark]     = useState(false);
  const [graphData, setGraphData] = useState<{ nodes: RawNode[]; edges: Edge[] } | null>(null);

  is3DRef.current = is3D;
  const router = useRouter();

  // ── 1. Preload ForceGraph3D on mount so it's ready instantly ──
  useEffect(() => {
    import("react-force-graph").then((mod) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setFG3D(() => (mod as any).ForceGraph3D as React.ComponentType<any>);
    });
  }, []);

  // ── 2. Dark-mode tracking ──────────────────────────────────────
  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains("dark"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // ── 3. Responsive sizing — ResizeObserver (debounced 150 ms) ──
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let timer: ReturnType<typeof setTimeout>;
    const update = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setContainerW(wrap.clientWidth);
        setGraphH(Math.max(640, Math.floor(window.innerHeight * 0.82)));
      }, 150);
    };
    // Immediate sync
    setContainerW(wrap.clientWidth);
    setGraphH(Math.max(640, Math.floor(window.innerHeight * 0.82)));
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    return () => { ro.disconnect(); clearTimeout(timer); };
  }, []);

  // ── 4. Fetch graph data ────────────────────────────────────────
  useEffect(() => {
    fetch("/api/posts/graph")
      .then((r) => r.ok ? r.json() : { nodes: [], edges: [] })
      .then(({ nodes, edges }) => { setGraphData({ nodes, edges }); setLoading(false); })
      .catch(() => setLoading(false));
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ── 5. Start / restart simulation ─────────────────────────────
  useEffect(() => {
    if (loading || !graphData || containerW === 0) return;
    const W = containerW, H = graphH;
    transformRef.current = { tx: 0, ty: 0, scale: 1 };

    const nodes: SimNode[] = graphData.nodes.map((n) => ({
      ...n,
      x: W / 2 + (Math.random() - 0.5) * W * 0.85,
      y: H / 2 + (Math.random() - 0.5) * H * 0.85,
      vx: 0, vy: 0,
      r: 5 + Math.min((n.tags?.length ?? 0) * 1.5, 10),
    }));
    nodesRef.current = nodes;
    return startSim(nodes, graphData.edges, W, H);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, graphData, containerW, graphH]);

  // ── Canvas simulation ──────────────────────────────────────────
  function startSim(nodes: SimNode[], edges: Edge[], W: number, H: number): () => void {
    const canvas = canvasRef.current;
    if (!canvas) return () => {};

    cancelAnimationFrame(rafRef.current);

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = `${W}px`;
    canvas.style.height = `${H}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    // Precompute category groups
    const catGroups = new Map<string, SimNode[]>();
    for (const n of nodes) {
      let arr = catGroups.get(n.category);
      if (!arr) { arr = []; catGroups.set(n.category, arr); }
      arr.push(n);
    }

    const grid = new SpatialGrid(80);
    let frame = 0;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const tr = transformRef.current;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (canvas.width / (dpr * rect.width));
      const my = (e.clientY - rect.top)  * (canvas.height / (dpr * rect.height));
      const factor   = e.deltaY < 0 ? 1.1 : 0.9;
      const newScale = Math.max(0.08, Math.min(10, tr.scale * factor));
      tr.tx = mx - (mx - tr.tx) * (newScale / tr.scale);
      tr.ty = my - (my - tr.ty) * (newScale / tr.scale);
      tr.scale = newScale;
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });

    function tick() {
      // Pause physics & drawing while 3D is active (RAF still runs, costs ~0 CPU)
      if (is3DRef.current) { rafRef.current = requestAnimationFrame(tick); return; }

      const curIsDark = document.documentElement.classList.contains("dark");
      const tr      = transformRef.current;
      const interact = interactRef.current;

      // Center gravity
      for (const n of nodes) {
        if (interact.dragging === n) continue;
        n.vx += (W / 2 - n.x) * 0.0015;
        n.vy += (H / 2 - n.y) * 0.0015;
      }

      // Category cohesion — recomputed every 5 frames
      if (frame % 5 === 0) {
        for (const [, group] of catGroups) {
          if (group.length < 2) continue;
          const cx = group.reduce((s, m) => s + m.x, 0) / group.length;
          const cy = group.reduce((s, m) => s + m.y, 0) / group.length;
          for (const n of group) {
            if (interact.dragging === n) continue;
            n.vx += (cx - n.x) * 0.0012;
            n.vy += (cy - n.y) * 0.0012;
          }
        }
      }

      // Repulsion via spatial grid — O(N·k)
      grid.clear();
      for (const n of nodes) grid.insert(n);
      for (const n of nodes) {
        if (interact.dragging === n) continue;
        for (const m of grid.getNeighbors(n)) {
          const dx = n.x - m.x, dy = n.y - m.y;
          const d2 = dx * dx + dy * dy + 1;
          const minDist = (n.r + m.r + 18) ** 2;
          const f = d2 < minDist ? 6000 / d2 : 2800 / d2;
          n.vx += dx * f * 0.001;
          n.vy += dy * f * 0.001;
        }
      }

      // Edge springs
      for (const e of edges) {
        const s = nodeMap.get(e.source), tgt = nodeMap.get(e.target);
        if (!s || !tgt) continue;
        const dx = tgt.x - s.x, dy = tgt.y - s.y;
        const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
        const f = ((d - 120) / d) * 0.025 * e.weight;
        if (interact.dragging !== s)   { s.vx += dx * f; s.vy += dy * f; }
        if (interact.dragging !== tgt) { tgt.vx -= dx * f; tgt.vy -= dy * f; }
      }

      // Integrate
      for (const n of nodes) {
        if (interact.dragging === n) continue;
        n.vx *= 0.82; n.vy *= 0.82;
        n.x += n.vx;  n.y += n.vy;
      }

      // ── Draw ──────────────────────────────────────────────────
      ctx.fillStyle = curIsDark ? "#0f0f13" : "#f8f8fc";
      ctx.fillRect(0, 0, W, H);

      // Dot grid
      ctx.fillStyle = curIsDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.035)";
      for (let gx = 24; gx < W; gx += 24)
        for (let gy = 24; gy < H; gy += 24) {
          ctx.beginPath(); ctx.arc(gx, gy, 0.8, 0, Math.PI * 2); ctx.fill();
        }

      ctx.save();
      ctx.translate(tr.tx, tr.ty);
      ctx.scale(tr.scale, tr.scale);

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
        const dimmed = hovId !== "" && !neighborIds.has(e.source) && !neighborIds.has(e.target);
        const alpha  = dimmed ? 0.04 : Math.min(0.08 + e.weight * 0.14, 0.35);
        const col = catColor(s.category);
        const mx2 = (s.x + tgt.x) / 2 + (tgt.y - s.y) * 0.1;
        const my2 = (s.y + tgt.y) / 2 - (tgt.x - s.x) * 0.1;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.quadraticCurveTo(mx2, my2, tgt.x, tgt.y);
        ctx.strokeStyle = col + Math.round(alpha * 255).toString(16).padStart(2, "0");
        ctx.lineWidth   = (dimmed ? 0.5 : Math.min(0.8 + e.weight * 0.5, 2)) / tr.scale;
        ctx.stroke();
      }

      // Nodes
      const sorted = [...nodes].sort((a, b) => a.r - b.r);
      for (const n of sorted) {
        const isHov  = n.id === hovId;
        const dimmed = hovId !== "" && !neighborIds.has(n.id);
        const col    = catColor(n.category);

        if (isHov) {
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 6, 0, Math.PI * 2);
          ctx.fillStyle = col + "22"; ctx.fill();
        }
        ctx.shadowColor = col;
        ctx.shadowBlur  = isHov ? 18 : dimmed ? 0 : 8;

        const grad = ctx.createRadialGradient(n.x - n.r * 0.3, n.y - n.r * 0.3, n.r * 0.1, n.x, n.y, n.r);
        grad.addColorStop(0, col + (dimmed ? "18" : isHov ? "cc" : "66"));
        grad.addColorStop(1, col + (dimmed ? "08" : isHov ? "55" : "22"));
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle   = grad; ctx.fill();
        ctx.strokeStyle = col + (dimmed ? "30" : isHov ? "ff" : "99");
        ctx.lineWidth   = (isHov ? 2 : 1) / tr.scale;
        ctx.stroke();
        ctx.shadowBlur = 0;

        if ((isHov || n.r > 10) && !dimmed) {
          const label = n.title.length > 22 ? n.title.slice(0, 21) + "…" : n.title;
          const fs = (isHov ? 11 : 9) / tr.scale;
          ctx.font      = `${isHov ? 600 : 400} ${fs}px system-ui`;
          ctx.textAlign = "center";
          ctx.fillStyle = curIsDark
            ? `rgba(255,255,255,${dimmed ? 0.2 : 0.85})`
            : `rgba(15,15,20,${dimmed ? 0.2 : 0.78})`;
          ctx.shadowColor = curIsDark ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.95)";
          ctx.shadowBlur  = 4;
          ctx.fillText(label, n.x, n.y + n.r + 12 / tr.scale);
          ctx.shadowBlur  = 0;
          ctx.textAlign   = "left";
        }
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
  }

  // ── Shared coordinate helpers ──────────────────────────────────
  function canvasXY(clientX: number, clientY: number) {
    const canvas = canvasRef.current!;
    const rect   = canvas.getBoundingClientRect();
    const dpr    = window.devicePixelRatio || 1;
    return {
      mx: (clientX - rect.left) * (canvas.width  / (dpr * rect.width)),
      my: (clientY - rect.top)  * (canvas.height / (dpr * rect.height)),
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

  // ── Shared interaction logic ───────────────────────────────────
  function startInteract(mx: number, my: number) {
    const node = findNode(mx, my);
    interactRef.current = { dragging: node, panning: !node, startX: mx, startY: my, lastX: mx, lastY: my, moved: false };
    setIsGrabbing(true);
  }

  function applyMove(mx: number, my: number) {
    const interact = interactRef.current;
    if (Math.abs(mx - interact.startX) > 3 || Math.abs(my - interact.startY) > 3) interact.moved = true;

    if (interact.dragging) {
      const { tx, ty, scale } = transformRef.current;
      interact.dragging.x  = (mx - tx) / scale;
      interact.dragging.y  = (my - ty) / scale;
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

  function endInteract(canNavigate: boolean) {
    const interact = interactRef.current;
    const wasNode  = !!interact.dragging;
    const moved    = interact.moved;
    interact.dragging = null;
    interact.panning  = false;
    setIsGrabbing(false);
    if (canNavigate && !wasNode && !moved && hovered) router.push(`/posts/${hovered.id}`);
  }

  // ── Mouse handlers ─────────────────────────────────────────────
  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const { mx, my } = canvasXY(e.clientX, e.clientY);
    startInteract(mx, my);
  }
  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const { mx, my } = canvasXY(e.clientX, e.clientY);
    applyMove(mx, my);
  }
  function handleMouseUp()    { endInteract(true); }
  function handleMouseLeave() {
    endInteract(false);
    setHovered(null);
    if (canvasRef.current) canvasRef.current.dataset.hoveredId = "";
  }

  // ── Touch handlers (single-finger pan/drag + pinch zoom) ───────
  function handleTouchStart(e: React.TouchEvent<HTMLCanvasElement>) {
    if (e.touches.length === 1) {
      const { mx, my } = canvasXY(e.touches[0].clientX, e.touches[0].clientY);
      startInteract(mx, my);
    } else if (e.touches.length === 2) {
      interactRef.current.dragging = null;
      interactRef.current.panning  = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistRef.current = Math.sqrt(dx * dx + dy * dy);
    }
  }

  function handleTouchMove(e: React.TouchEvent<HTMLCanvasElement>) {
    if (e.touches.length === 1) {
      const { mx, my } = canvasXY(e.touches[0].clientX, e.touches[0].clientY);
      applyMove(mx, my);
    } else if (e.touches.length === 2) {
      const dx   = e.touches[0].clientX - e.touches[1].clientX;
      const dy   = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const prev = lastTouchDistRef.current;
      if (prev > 0) {
        const factor   = dist / prev;
        const midCX    = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midCY    = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const { mx, my } = canvasXY(midCX, midCY);
        const tr       = transformRef.current;
        const newScale = Math.max(0.08, Math.min(10, tr.scale * factor));
        tr.tx = mx - (mx - tr.tx) * (newScale / tr.scale);
        tr.ty = my - (my - tr.ty) * (newScale / tr.scale);
        tr.scale = newScale;
      }
      lastTouchDistRef.current = dist;
    }
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLCanvasElement>) {
    if (e.touches.length === 0) endInteract(true);
  }

  // ── Derived data ───────────────────────────────────────────────
  const usedCats = [...new Set(nodesRef.current.map((n) => n.category))];

  const g3DData = graphData ? {
    nodes: graphData.nodes.map((n) => ({
      id:       n.id,
      name:     n.title,
      color:    catColor(n.category),
      val:      2 + Math.min((n.tags?.length ?? 0) * 1.2, 8),
      category: n.category,
    })),
    links: graphData.edges.map((e) => ({
      source: e.source,
      target: e.target,
      value:  e.weight,
    })),
  } : { nodes: [], links: [] };

  // ── Loading skeleton ───────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="rounded-2xl border border-line bg-surface animate-pulse"
        style={{ height: graphH }}
      />
    );
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div
      ref={wrapRef}
      className="relative rounded-2xl border border-line overflow-hidden"
      style={{ height: graphH }}
    >
      {/* ── 2D Canvas ────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        style={{
          display:     is3D ? "none" : "block",
          cursor:      isGrabbing ? "grabbing" : hovered ? "pointer" : "grab",
          touchAction: "none",   /* prevent browser scroll interference */
          userSelect:  "none",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* ── 3D Graph ─────────────────────────────────────────── */}
      {is3D && (
        <div className="absolute inset-0" style={{ background: isDark ? "#0f0f13" : "#f0f0f6" }}>
          {FG3D ? (
            <FG3D
              graphData={g3DData}
              nodeId="id"
              nodeColor="color"
              nodeVal="val"
              nodeLabel="name"
              linkColor={() => "rgba(148,163,184,0.3)"}
              linkWidth={(link: { value: number }) => Math.max(0.5, link.value * 1.5)}
              width={containerW}
              height={graphH}
              backgroundColor={isDark ? "#0f0f13" : "#f0f0f6"}
              onNodeClick={(node: { id: string }) => router.push(`/posts/${node.id}`)}
              warmupTicks={60}
              cooldownTicks={400}
              d3AlphaDecay={0.018}
              d3VelocityDecay={0.38}
              nodeResolution={10}
            />
          ) : (
            <div className="flex items-center justify-center h-full gap-2 text-zinc-400 text-sm">
              <Spinner /> 3D 초기화 중...
            </div>
          )}
        </div>
      )}

      {/* ── 2D/3D Toggle ─────────────────────────────────────── */}
      <button
        onClick={() => setIs3D((v) => !v)}
        className="absolute top-3 right-3 z-20 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold bg-zinc-900/75 backdrop-blur-sm text-white hover:bg-zinc-800/85 transition-colors border border-white/10 select-none"
      >
        {is3D ? <><Icon2D />2D</> : <><Icon3D />3D</>}
      </button>

      {/* ── Legend ───────────────────────────────────────────── */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-x-3 gap-y-1.5 bg-zinc-900/75 backdrop-blur-sm rounded-xl px-3 py-2">
        {Object.entries(CAT_COLORS)
          .filter(([c]) => usedCats.includes(c))
          .map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}` }} />
              <span className="text-[10px] font-medium text-white/70">{cat}</span>
            </div>
          ))}
      </div>

      {/* ── 2D Tooltip ───────────────────────────────────────── */}
      {!is3D && hovered && (
        <div className="absolute bottom-3 left-3 right-3 z-20 rounded-xl border border-white/10 bg-zinc-900/85 backdrop-blur-md px-4 py-3 pointer-events-none">
          <p className="text-xs font-semibold text-white line-clamp-1">{hovered.title}</p>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-white/50">
            <span style={{ color: catColor(hovered.category) }}>{hovered.category}</span>
            {hovered.subcategory && <><span>·</span><span>{hovered.subcategory}</span></>}
            {hovered.tags.length > 0 && <><span>·</span><span>{hovered.tags.slice(0, 3).join(", ")}</span></>}
            <span className="ml-auto">클릭하면 이동 →</span>
          </div>
        </div>
      )}

      {/* ── 3D hint ──────────────────────────────────────────── */}
      {is3D && (
        <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center pointer-events-none">
          <span className="rounded-lg px-3 py-1.5 text-[10px] text-white/80 bg-zinc-900/75 backdrop-blur-sm">
            드래그 = 회전 · 스크롤 = 줌 · 우클릭 드래그 = 이동
          </span>
        </div>
      )}
    </div>
  );
}
