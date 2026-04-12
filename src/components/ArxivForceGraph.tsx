"use client";

import { useEffect, useRef, useState } from "react";

// ── Types ─────────────────────────────────────────────────
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
  x: number; y: number; vx: number; vy: number; r: number;
};

type Particle = { edgeIdx: number; t: number; speed: number };

// ── Category palette ──────────────────────────────────────
const CAT: Record<string, { hex: string; rgb: string; label: string }> = {
  "cs.CL": { hex: "#a78bfa", rgb: "167,139,250", label: "NLP" },
  "cs.LG": { hex: "#60a5fa", rgb: "96,165,250",  label: "ML"  },
  "cs.AI": { hex: "#34d399", rgb: "52,211,153",  label: "AI"  },
};
const DEFAULT_CAT = { hex: "#94a3b8", rgb: "148,163,184", label: "?" };

function getCat(cat: string) { return CAT[cat] ?? DEFAULT_CAT; }

// ── Spatial Hash Grid — O(N·k) repulsion ──────────────────
class SpatialGrid {
  private cells    = new Map<string, SimNode[]>();
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
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++) {
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
export function ArxivForceGraph({
  papers,
  relations,
}: {
  papers: GraphNode[];
  relations: Relation[];
}) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const wrapRef      = useRef<HTMLDivElement>(null);
  const rafRef       = useRef<number>(0);
  const nodesRef     = useRef<SimNode[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const transformRef = useRef({ tx: 0, ty: 0, scale: 1 });
  const interactRef  = useRef({
    dragging: null as SimNode | null,
    panning:  false,
    startX: 0, startY: 0,
    lastX:  0, lastY:  0,
    moved:  false,
  });
  const is3DRef          = useRef(false);
  const lastTouchDistRef = useRef(0);

  const [hovered,    setHovered]    = useState<SimNode | null>(null);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [is3D,       setIs3D]       = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [FG3D, setFG3D] = useState<React.ComponentType<any> | null>(null);
  const [containerW, setContainerW] = useState(0);
  const [graphH,     setGraphH]     = useState(640);
  const [isDark,     setIsDark]     = useState(false);

  is3DRef.current = is3D;

  // ── 1. Preload ForceGraph3D immediately so it's ready on click ──
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

  // ── 3. Responsive sizing via ResizeObserver (debounced 150 ms) ─
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
    setContainerW(wrap.clientWidth);
    setGraphH(Math.max(640, Math.floor(window.innerHeight * 0.82)));
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    return () => { ro.disconnect(); clearTimeout(timer); };
  }, []);

  // ── 4. Simulation — restart when data or container size changes ─
  useEffect(() => {
    if (papers.length === 0 || containerW === 0) return;
    const W = containerW, H = graphH;
    const N = papers.length;
    const isLarge = N > 200;

    const maxScore   = Math.max(...papers.map((p) => p.importance_score), 0.01);
    const minR = isLarge ? 3 : 5;
    const maxR = isLarge ? 12 : 20;
    const spread = isLarge ? Math.sqrt(N) * 2.5 : 1;

    const initScale = isLarge ? Math.max(0.3, Math.min(1, 200 / Math.sqrt(N))) : 1;
    transformRef.current = {
      tx:    W * (1 - initScale) / 2,
      ty:    H * (1 - initScale) / 2,
      scale: initScale,
    };

    const nodes: SimNode[] = papers.map((p) => {
      const angle = Math.random() * Math.PI * 2;
      const dist  = (80 + Math.random() * 140) * (isLarge ? spread / 10 : 1);
      return {
        ...p,
        x:  W / 2 + Math.cos(angle) * dist,
        y:  H / 2 + Math.sin(angle) * dist,
        vx: 0, vy: 0,
        r:  minR + (p.importance_score / maxScore) * (maxR - minR),
      };
    });
    nodesRef.current = nodes;

    const semanticEdges = relations.filter((e) => e.relation_type === "semantic");
    const maxParticles  = isLarge ? Math.min(semanticEdges.length, 200) : semanticEdges.length * 2;
    particlesRef.current = Array.from({ length: maxParticles }, (_, i) => ({
      edgeIdx: i % Math.max(semanticEdges.length, 1),
      t:       Math.random(),
      speed:   0.0015 + Math.random() * 0.001,
    }));

    return startSim(nodes, relations, semanticEdges, W, H, isLarge, maxScore);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [papers, relations, containerW, graphH]);

  // ── Canvas simulation ──────────────────────────────────────────
  function startSim(
    nodes: SimNode[],
    rels: Relation[],
    semanticEdges: Relation[],
    W: number,
    H: number,
    isLarge: boolean,
    maxScore: number,
  ): () => void {
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

    const nodeMap = new Map(nodes.map((n) => [n.arxiv_id, n]));

    // Precompute category groups
    const catGroups = new Map<string, SimNode[]>();
    for (const n of nodes) {
      let arr = catGroups.get(n.primary_category);
      if (!arr) { arr = []; catGroups.set(n.primary_category, arr); }
      arr.push(n);
    }

    const grid = new SpatialGrid(isLarge ? 60 : 50);
    let frame = 0;

    // ── Wheel zoom ──────────────────────────────────────────────
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const tr   = transformRef.current;
      const rect = canvas.getBoundingClientRect();
      const mx   = (e.clientX - rect.left) * (canvas.width  / (dpr * rect.width));
      const my   = (e.clientY - rect.top)  * (canvas.height / (dpr * rect.height));
      const factor   = e.deltaY < 0 ? 1.1 : 0.9;
      const newScale = Math.max(0.06, Math.min(12, tr.scale * factor));
      tr.tx = mx - (mx - tr.tx) * (newScale / tr.scale);
      tr.ty = my - (my - tr.ty) * (newScale / tr.scale);
      tr.scale = newScale;
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });

    // ── Draw helpers ────────────────────────────────────────────
    function drawEdge(s: SimNode, t2: SimNode, type: string, weight: number, dimmed: boolean, scale: number) {
      const cat   = getCat(s.primary_category);
      const alpha = dimmed ? 0.04 : type === "semantic" ? 0.22 : 0.28;
      if (isLarge) {
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(t2.x, t2.y);
        ctx.strokeStyle = `rgba(${cat.rgb},${alpha * 0.6})`;
        ctx.lineWidth   = (dimmed ? 0.3 : Math.min(0.5 + weight * 0.3, 1.2)) / scale;
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
        ctx.beginPath(); ctx.moveTo(s.x, s.y);
        ctx.quadraticCurveTo(mx2, my2, t2.x, t2.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth   = (dimmed ? 0.5 : Math.min(1 + weight, 2.5)) / scale;
        ctx.stroke();
      }
    }

    function drawParticle(p: Particle) {
      const e  = semanticEdges[p.edgeIdx];
      const s  = nodeMap.get(e.source_id);
      const t2 = nodeMap.get(e.target_id);
      if (!s || !t2) return;
      if (isLarge) {
        const px = s.x + (t2.x - s.x) * p.t;
        const py = s.y + (t2.y - s.y) * p.t;
        ctx.beginPath(); ctx.arc(px, py, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${getCat(s.primary_category).rgb},0.5)`;
        ctx.fill();
      } else {
        const mx2 = (s.x + t2.x) / 2 + (t2.y - s.y) * 0.12;
        const my2 = (s.y + t2.y) / 2 - (t2.x - s.x) * 0.12;
        const u   = 1 - p.t;
        const px  = u*u*s.x + 2*u*p.t*mx2 + p.t*p.t*t2.x;
        const py  = u*u*s.y + 2*u*p.t*my2 + p.t*p.t*t2.y;
        ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle  = `rgba(${getCat(s.primary_category).rgb},0.7)`;
        ctx.shadowColor = getCat(s.primary_category).hex;
        ctx.shadowBlur  = 6; ctx.fill(); ctx.shadowBlur = 0;
      }
    }

    function drawNode(n: SimNode, isHov: boolean, dimmed: boolean, scale: number, curIsDark: boolean) {
      const c = getCat(n.primary_category);

      if (isHov || n.importance_score / maxScore > 0.7) {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c.rgb},${isHov ? 0.15 : 0.06})`; ctx.fill();
      }
      if (!isLarge) { ctx.shadowColor = c.hex; ctx.shadowBlur = isHov ? 20 : dimmed ? 0 : 10; }

      if (isLarge && !isHov) {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle   = `rgba(${c.rgb},${dimmed ? 0.08 : 0.42})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(${c.rgb},${dimmed ? 0.1 : 0.52})`;
        ctx.lineWidth   = 0.8 / scale; ctx.stroke();
      } else {
        const grad = ctx.createRadialGradient(n.x - n.r*0.3, n.y - n.r*0.3, n.r*0.1, n.x, n.y, n.r);
        grad.addColorStop(0, `rgba(${c.rgb},${dimmed ? 0.12 : isHov ? 0.9 : 0.58})`);
        grad.addColorStop(1, `rgba(${c.rgb},${dimmed ? 0.04 : isHov ? 0.5 : 0.2})`);
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle   = grad; ctx.fill();
        ctx.strokeStyle = `rgba(${c.rgb},${dimmed ? 0.15 : isHov ? 1 : 0.72})`;
        ctx.lineWidth   = (isHov ? 2 : 1.2) / scale;
        ctx.stroke(); ctx.shadowBlur = 0;
      }

      const labelThreshold = isLarge ? 0.85 : 0.5;
      if (isHov || (n.importance_score / maxScore > labelThreshold && !dimmed)) {
        const label    = n.title.length > 30 ? n.title.slice(0, 29) + "\u2026" : n.title;
        const fontSize = (isHov ? 11 : 9) / scale;
        ctx.font      = `${isHov ? 600 : 400} ${fontSize}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = curIsDark
          ? `rgba(255,255,255,${dimmed ? 0.2 : 0.88})`
          : `rgba(15,15,20,${dimmed ? 0.2 : 0.82})`;
        ctx.shadowColor = curIsDark ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.95)";
        ctx.shadowBlur  = 4;
        ctx.fillText(label, n.x, n.y + n.r + (fontSize + 2));
        ctx.shadowBlur  = 0; ctx.textAlign = "left";
      }
    }

    function isVisible(x: number, y: number, margin: number): boolean {
      const { tx, ty, scale } = transformRef.current;
      const sx = x * scale + tx, sy = y * scale + ty;
      return sx > -margin && sx < W + margin && sy > -margin && sy < H + margin;
    }

    // ── Main RAF tick ────────────────────────────────────────────
    function tick() {
      if (is3DRef.current) { rafRef.current = requestAnimationFrame(tick); return; }

      const curIsDark = document.documentElement.classList.contains("dark");
      const tr        = transformRef.current;
      const interact  = interactRef.current;

      // Center gravity
      for (const n of nodes) {
        if (interact.dragging === n) continue;
        n.vx += (W / 2 - n.x) * 0.001;
        n.vy += (H / 2 - n.y) * 0.001;
      }

      // Category cohesion (every 5 frames)
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
        for (const m of grid.getNeighbors(n)) {
          const dx = n.x - m.x, dy = n.y - m.y;
          const d2 = dx*dx + dy*dy + 1;
          const minDist = (n.r + m.r + (isLarge ? 8 : 12)) ** 2;
          const f  = d2 < minDist ? 4000 / d2 : 1800 / d2;
          n.vx += dx * f * 0.001;
          n.vy += dy * f * 0.001;
        }
      }

      // Edge springs
      for (const e of rels) {
        const s  = nodeMap.get(e.source_id), t2 = nodeMap.get(e.target_id);
        if (!s || !t2) continue;
        const dx = t2.x - s.x, dy = t2.y - s.y;
        const d  = Math.sqrt(dx*dx + dy*dy) + 0.001;
        const ideal = e.relation_type === "author"
          ? (isLarge ? 50 : 90)
          : (isLarge ? 80 : 140);
        const f = ((d - ideal) / d) * 0.03;
        if (interact.dragging !== s)  { s.vx  += dx * f; s.vy  += dy * f; }
        if (interact.dragging !== t2) { t2.vx -= dx * f; t2.vy -= dy * f; }
      }

      // Integrate
      const damping = isLarge ? 0.82 : 0.78;
      for (const n of nodes) {
        if (interact.dragging === n) continue;
        n.vx *= damping; n.vy *= damping;
        n.x  += n.vx;   n.y  += n.vy;
      }

      // Particles
      for (const p of particlesRef.current) { p.t += p.speed; if (p.t > 1) p.t = 0; }

      // ── Render ──────────────────────────────────────────────────
      ctx.fillStyle = curIsDark ? "#0f0f13" : "#f8f8fc";
      ctx.fillRect(0, 0, W, H);

      const gridSize = 28;
      ctx.fillStyle = curIsDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)";
      for (let gx = gridSize; gx < W; gx += gridSize)
        for (let gy = gridSize; gy < H; gy += gridSize) {
          ctx.beginPath(); ctx.arc(gx, gy, 1, 0, Math.PI * 2); ctx.fill();
        }

      const hovId = canvasRef.current?.dataset.hoveredId ?? "";
      const neighborIds = new Set<string>();
      if (hovId) {
        neighborIds.add(hovId);
        for (const e of rels) {
          if (e.source_id === hovId) neighborIds.add(e.target_id);
          if (e.target_id === hovId) neighborIds.add(e.source_id);
        }
      }

      ctx.save();
      ctx.translate(tr.tx, tr.ty);
      ctx.scale(tr.scale, tr.scale);

      const visMargin = 60 / tr.scale;

      // Edges
      ctx.save();
      for (const e of rels) {
        const s = nodeMap.get(e.source_id), t2 = nodeMap.get(e.target_id);
        if (!s || !t2) continue;
        if (!isVisible(s.x, s.y, visMargin) && !isVisible(t2.x, t2.y, visMargin)) continue;
        const dimmed = hovId !== "" && !neighborIds.has(e.source_id) && !neighborIds.has(e.target_id);
        drawEdge(s, t2, e.relation_type, e.weight, dimmed, tr.scale);
      }
      ctx.restore();

      if (!hovId) for (const p of particlesRef.current) drawParticle(p);

      const sorted = [...nodes].sort((a, b) => a.r - b.r);
      for (const n of sorted) {
        if (!isVisible(n.x, n.y, n.r * 3)) continue;
        const isHov  = n.arxiv_id === hovId;
        const dimmed = hovId !== "" && !neighborIds.has(n.arxiv_id);
        drawNode(n, isHov, dimmed, tr.scale, curIsDark);
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

  // ── Shared coordinate helper ───────────────────────────────────
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

  // ── Shared interaction helpers ─────────────────────────────────
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

  function endInteract() {
    interactRef.current.dragging = null;
    interactRef.current.panning  = false;
    setIsGrabbing(false);
  }

  // ── Mouse handlers ─────────────────────────────────────────────
  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const { mx, my } = canvasXY(e.clientX, e.clientY); startInteract(mx, my);
  }
  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const { mx, my } = canvasXY(e.clientX, e.clientY); applyMove(mx, my);
  }
  function handleMouseUp()    { endInteract(); }
  function handleMouseLeave() {
    endInteract();
    setHovered(null);
    if (canvasRef.current) canvasRef.current.dataset.hoveredId = "";
  }

  // ── Touch handlers ─────────────────────────────────────────────
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
        const newScale = Math.max(0.06, Math.min(12, tr.scale * factor));
        tr.tx = mx - (mx - tr.tx) * (newScale / tr.scale);
        tr.ty = my - (my - tr.ty) * (newScale / tr.scale);
        tr.scale = newScale;
      }
      lastTouchDistRef.current = dist;
    }
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLCanvasElement>) {
    if (e.touches.length === 0) endInteract();
  }

  // ── Empty state ────────────────────────────────────────────────
  if (papers.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border border-black/8 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-zinc-400 dark:text-zinc-500"
        style={{ height: graphH }}
      >
        아직 수집된 논문이 없어요.{" "}
        <code className="ml-1 text-xs bg-zinc-100 dark:bg-white/8 px-1.5 py-0.5 rounded">
          arxiv-graph crawl
        </code>
        을 먼저 실행해 주세요.
      </div>
    );
  }

  // ── 3D graph data ──────────────────────────────────────────────
  const maxScore = Math.max(...papers.map((p) => p.importance_score), 0.01);
  const g3DData  = {
    nodes: papers.map((p) => ({
      id:       p.arxiv_id,
      name:     p.title.length > 60 ? p.title.slice(0, 59) + "…" : p.title,
      color:    getCat(p.primary_category).hex,
      val:      1.5 + (p.importance_score / maxScore) * 9,
      category: p.primary_category,
    })),
    links: relations.map((r) => ({
      source: r.source_id,
      target: r.target_id,
      type:   r.relation_type,
      value:  r.weight,
    })),
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div
      ref={wrapRef}
      className="relative rounded-2xl border border-black/8 dark:border-white/10 overflow-hidden"
      style={{ height: graphH, background: "transparent" }}
    >
      {/* ── 2D Canvas ────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        style={{
          display:     is3D ? "none" : "block",
          cursor:      isGrabbing ? "grabbing" : hovered ? "pointer" : "grab",
          touchAction: "none",
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
        <div className="absolute inset-0" style={{ background: isDark ? "#0a0a10" : "#f0f0f6" }}>
          {FG3D ? (
            <FG3D
              graphData={g3DData}
              nodeId="id"
              nodeColor="color"
              nodeVal="val"
              nodeLabel="name"
              linkColor={(link: { type: string }) =>
                link.type === "semantic"
                  ? "rgba(167,139,250,0.4)"
                  : "rgba(52,211,153,0.4)"
              }
              linkWidth={(link: { value: number }) => Math.max(0.3, link.value * 0.8)}
              width={containerW}
              height={graphH}
              backgroundColor={isDark ? "#0a0a10" : "#f0f0f6"}
              warmupTicks={0}
              cooldownTicks={250}
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.4}
              nodeResolution={papers.length > 500 ? 5 : 8}
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
        className="absolute top-3 right-3 z-20 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold bg-black/25 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/40 transition-colors border border-white/10 select-none"
      >
        {is3D ? <><Icon2D />2D</> : <><Icon3D />3D</>}
      </button>

      {/* ── Category legend ───────────────────────────────────── */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 bg-black/20 dark:bg-black/30 backdrop-blur-sm rounded-xl px-3 py-2.5">
        {Object.entries(CAT).map(([cat, { hex, label }]) => (
          <div key={cat} className="flex items-center gap-2">
            <span className="inline-block size-2 rounded-full" style={{ backgroundColor: hex, boxShadow: `0 0 6px ${hex}` }} />
            <span className="text-[10px] font-medium text-white/70">{cat} · {label}</span>
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

      {/* ── Paper count badge ────────────────────────────────── */}
      <div className="absolute top-10 right-3 z-20 bg-black/20 dark:bg-black/30 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
        <span className="text-[10px] font-medium text-white/60 tabular-nums">
          {papers.length.toLocaleString()} papers
        </span>
      </div>

      {/* ── 2D Tooltip ───────────────────────────────────────── */}
      {!is3D && hovered && (
        <div className="absolute bottom-3 left-3 right-3 z-20 rounded-xl border border-white/10 bg-black/60 backdrop-blur-md px-4 py-3 shadow-xl pointer-events-none">
          <div className="flex items-start gap-2.5">
            <span
              className="mt-0.5 size-2 rounded-full shrink-0 ring-2 ring-white/20"
              style={{ backgroundColor: getCat(hovered.primary_category).hex, boxShadow: `0 0 8px ${getCat(hovered.primary_category).hex}` }}
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white line-clamp-2 leading-snug">{hovered.title}</p>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-white/50">
                <span>{hovered.primary_category}</span>
                <span>·</span>
                <span>중요도 <span className="font-mono text-white/70">{hovered.importance_score.toFixed(3)}</span></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3D hint ──────────────────────────────────────────── */}
      {is3D && (
        <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center pointer-events-none">
          <span className="rounded-lg px-3 py-1.5 text-[10px] text-white/40 bg-black/20 backdrop-blur-sm">
            드래그 = 회전 · 스크롤 = 줌 · 우클릭 드래그 = 이동
          </span>
        </div>
      )}
    </div>
  );
}
