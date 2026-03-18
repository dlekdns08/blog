"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const W = 700;
const H = 220;
const GROUND = H - 40;
const GRAVITY = 0.6;
const JUMP_V = -13;
const BASE_SPEED = 5;
const KOALA_W = 38;
const KOALA_H = 42;
const KOALA_X = 80;

type Obstacle = { x: number; w: number; h: number; type: "tree" | "rock" | "bush" };
type Cloud = { x: number; y: number; w: number };
type Star = { x: number; y: number; r: number; a: number };

function randomObs(x: number): Obstacle {
  const types: Obstacle["type"][] = ["tree", "rock", "bush"];
  const type = types[Math.floor(Math.random() * types.length)];
  const dims =
    type === "tree" ? { w: 22, h: 55 } :
    type === "rock" ? { w: 32, h: 26 } :
    { w: 44, h: 20 };
  return { x, ...dims, type };
}

function drawKoala(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, isDead: boolean) {
  ctx.save();
  ctx.translate(x + KOALA_W / 2, y + KOALA_H / 2);

  if (isDead) {
    ctx.rotate(Math.PI / 8);
  }

  // body
  ctx.fillStyle = "#9e9e9e";
  ctx.beginPath();
  ctx.ellipse(0, 6, 14, 17, 0, 0, Math.PI * 2);
  ctx.fill();

  // head
  ctx.fillStyle = "#b0b0b0";
  ctx.beginPath();
  ctx.ellipse(0, -12, 12, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // ears
  ctx.fillStyle = "#9e9e9e";
  ctx.beginPath();
  ctx.ellipse(-10, -22, 7, 7, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(10, -22, 7, 7, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // inner ears
  ctx.fillStyle = "#e8c8d0";
  ctx.beginPath();
  ctx.ellipse(-10, -22, 4, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(10, -22, 4, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // nose
  ctx.fillStyle = "#3d2b1f";
  ctx.beginPath();
  ctx.ellipse(0, -10, 5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // eyes
  if (isDead) {
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-5, -16); ctx.lineTo(-3, -14); ctx.moveTo(-3, -16); ctx.lineTo(-5, -14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(3, -16); ctx.lineTo(5, -14); ctx.moveTo(5, -16); ctx.lineTo(3, -14); ctx.stroke();
  } else {
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath(); ctx.arc(-4, -15, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(4, -15, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "white";
    ctx.beginPath(); ctx.arc(-3.3, -15.5, 0.7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(4.7, -15.5, 0.7, 0, Math.PI * 2); ctx.fill();
  }

  // legs (animated)
  const legSwing = Math.sin(frame * 0.25) * 8;
  ctx.strokeStyle = "#9e9e9e";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-5, 18); ctx.lineTo(-8, 28 + legSwing); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(5, 18); ctx.lineTo(8, 28 - legSwing); ctx.stroke();

  // arms
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-18, 8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(18, 8); ctx.stroke();

  ctx.restore();
}

function drawTree(ctx: CanvasRenderingContext2D, x: number, h: number) {
  const bottom = GROUND;
  ctx.fillStyle = "#7b5e3a";
  ctx.fillRect(x + 7, bottom - h, 8, h);
  ctx.fillStyle = "#4caf50";
  ctx.beginPath();
  ctx.moveTo(x + 11, bottom - h - 22);
  ctx.lineTo(x - 2, bottom - h + 8);
  ctx.lineTo(x + 24, bottom - h + 8);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 11, bottom - h - 36);
  ctx.lineTo(x + 1, bottom - h - 8);
  ctx.lineTo(x + 21, bottom - h - 8);
  ctx.closePath();
  ctx.fill();
}

function drawRock(ctx: CanvasRenderingContext2D, x: number, w: number, h: number) {
  const bottom = GROUND;
  ctx.fillStyle = "#78909c";
  ctx.beginPath();
  ctx.moveTo(x + 4, bottom);
  ctx.lineTo(x, bottom - h * 0.6);
  ctx.lineTo(x + w * 0.3, bottom - h);
  ctx.lineTo(x + w * 0.7, bottom - h);
  ctx.lineTo(x + w, bottom - h * 0.5);
  ctx.lineTo(x + w - 2, bottom);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#90a4ae";
  ctx.beginPath();
  ctx.ellipse(x + w * 0.45, bottom - h * 0.7, w * 0.2, h * 0.15, -0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawBush(ctx: CanvasRenderingContext2D, x: number, w: number) {
  const bottom = GROUND;
  ctx.fillStyle = "#388e3c";
  ctx.beginPath(); ctx.arc(x + 10, bottom - 12, 12, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 22, bottom - 16, 14, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 34, bottom - 12, 11, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#2e7d32";
  ctx.fillRect(x, bottom - 4, w, 8);
}

function drawCloud(ctx: CanvasRenderingContext2D, cloud: Cloud, dark: boolean) {
  ctx.fillStyle = dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.85)";
  ctx.beginPath(); ctx.arc(cloud.x, cloud.y, 14, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cloud.x + 20, cloud.y - 8, 18, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cloud.x + 40, cloud.y, 14, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(cloud.x, cloud.y - 8, cloud.w, 20);
}

export function KoalaGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    vy: 0,
    koalaY: GROUND - KOALA_H,
    onGround: true,
    obstacles: [] as Obstacle[],
    clouds: [
      { x: 150, y: 40, w: 54 },
      { x: 420, y: 28, w: 54 },
      { x: 600, y: 50, w: 54 },
    ] as Cloud[],
    stars: Array.from({ length: 30 }, () => ({
      x: Math.random() * W,
      y: Math.random() * (GROUND - 60),
      r: Math.random() * 1.5 + 0.5,
      a: Math.random(),
    })) as Star[],
    frame: 0,
    score: 0,
    speed: BASE_SPEED,
    gameOver: false,
    started: false,
    nextObsIn: 90,
    isDark: false,
    darkTimer: 0,
  });

  const [displayScore, setDisplayScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const rafRef = useRef<number>(0);

  const reset = useCallback(() => {
    const s = stateRef.current;
    s.vy = 0;
    s.koalaY = GROUND - KOALA_H;
    s.onGround = true;
    s.obstacles = [];
    s.frame = 0;
    s.score = 0;
    s.speed = BASE_SPEED;
    s.gameOver = false;
    s.started = false;
    s.nextObsIn = 90;
    setDisplayScore(0);
    setGameOver(false);
    setStarted(false);
  }, []);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.gameOver) { reset(); return; }
    if (!s.started) { s.started = true; setStarted(true); }
    if (s.onGround) {
      s.vy = JUMP_V;
      s.onGround = false;
    }
  }, [reset]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") { e.preventDefault(); jump(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    function loop() {
      const s = stateRef.current;
      const dark = s.isDark;

      // background
      const bgColor = dark ? "#0f0f1a" : "#e8f4fd";
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, W, H);

      // stars (night only)
      if (dark) {
        s.stars.forEach((star) => {
          star.a = Math.sin(s.frame * 0.03 + star.x) * 0.4 + 0.6;
          ctx.fillStyle = `rgba(255,255,255,${star.a})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // sun / moon
      if (!dark) {
        ctx.fillStyle = "#ffe082";
        ctx.beginPath(); ctx.arc(W - 60, 45, 22, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = "#cfd8dc";
        ctx.beginPath(); ctx.arc(W - 60, 45, 18, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#0f0f1a";
        ctx.beginPath(); ctx.arc(W - 50, 39, 14, 0, Math.PI * 2); ctx.fill();
      }

      // clouds
      s.clouds.forEach((c) => {
        if (s.started && !s.gameOver) c.x -= s.speed * 0.3;
        if (c.x < -80) c.x = W + 60;
        drawCloud(ctx, c, dark);
      });

      // ground
      ctx.fillStyle = dark ? "#1b2a1b" : "#8bc34a";
      ctx.fillRect(0, GROUND, W, H - GROUND);
      ctx.fillStyle = dark ? "#2e3d2e" : "#aed581";
      ctx.fillRect(0, GROUND, W, 6);
      // dashes
      ctx.fillStyle = dark ? "#3a5a3a" : "#c5e1a5";
      for (let i = 0; i < W; i += 30) {
        const dashX = s.started && !s.gameOver ? (i - (s.frame * s.speed * 0.5) % 30 + 30) % (W + 30) - 30 : i;
        ctx.fillRect(dashX, GROUND + 2, 18, 2);
      }

      if (s.started && !s.gameOver) {
        s.frame++;
        s.score += 1;
        s.speed = BASE_SPEED + Math.floor(s.score / 300) * 0.4;

        // night cycle
        s.darkTimer++;
        if (s.darkTimer > 800) {
          s.isDark = !s.isDark;
          s.darkTimer = 0;
        }

        // physics
        s.vy += GRAVITY;
        s.koalaY += s.vy;
        if (s.koalaY >= GROUND - KOALA_H) {
          s.koalaY = GROUND - KOALA_H;
          s.vy = 0;
          s.onGround = true;
        }

        // obstacles
        s.nextObsIn--;
        if (s.nextObsIn <= 0) {
          s.obstacles.push(randomObs(W + 20));
          s.nextObsIn = 60 + Math.floor(Math.random() * 80) - Math.min(20, Math.floor(s.score / 500));
        }
        s.obstacles.forEach((o) => { o.x -= s.speed; });
        s.obstacles = s.obstacles.filter((o) => o.x > -80);

        // collision
        const kx1 = KOALA_X + 6, ky1 = s.koalaY + 6, kx2 = KOALA_X + KOALA_W - 6, ky2 = s.koalaY + KOALA_H - 4;
        for (const o of s.obstacles) {
          const hitY = GROUND - o.h;
          if (kx2 > o.x + 4 && kx1 < o.x + o.w - 4 && ky2 > hitY + 4) {
            s.gameOver = true;
            setGameOver(true);
          }
        }

        setDisplayScore(Math.floor(s.score / 5));
      }

      // draw obstacles
      s.obstacles.forEach((o) => {
        if (o.type === "tree") drawTree(ctx, o.x, o.h);
        else if (o.type === "rock") drawRock(ctx, o.x, o.w, o.h);
        else drawBush(ctx, o.x, o.w);
      });

      // draw koala
      drawKoala(ctx, KOALA_X, s.koalaY, s.started ? s.frame : 0, s.gameOver);

      // score
      ctx.fillStyle = dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.3)";
      ctx.font = "bold 16px monospace";
      ctx.textAlign = "right";
      ctx.fillText(String(Math.floor(s.score / 5)).padStart(5, "0"), W - 16, 26);
      ctx.textAlign = "left";

      // overlay messages
      if (!s.started && !s.gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "white";
        ctx.font = "bold 26px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🐨 코알라 점프!", W / 2, H / 2 - 16);
        ctx.font = "15px sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fillText("스페이스 / 탭 / 화면 클릭으로 점프", W / 2, H / 2 + 14);
        ctx.textAlign = "left";
      }

      if (s.gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "white";
        ctx.font = "bold 26px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("게임 오버!", W / 2, H / 2 - 18);
        ctx.font = "16px sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fillText(`점수: ${Math.floor(s.score / 5)}`, W / 2, H / 2 + 10);
        ctx.font = "13px sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fillText("다시 하려면 스페이스 / 화면 클릭", W / 2, H / 2 + 32);
        ctx.textAlign = "left";
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative w-full max-w-[700px] cursor-pointer rounded-2xl overflow-hidden shadow-xl border border-black/10 dark:border-white/10"
        onClick={jump}
        onTouchStart={(e) => { e.preventDefault(); jump(); }}
        style={{ touchAction: "none" }}
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full block"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
      <div className="flex items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
        <span>
          점수: <span className="font-bold tabular-nums text-zinc-700 dark:text-zinc-200">{displayScore}</span>
        </span>
        <span className="text-xs opacity-60">스페이스 · ↑ · 클릭으로 점프</span>
        {(gameOver || started) && (
          <button
            onClick={(e) => { e.stopPropagation(); reset(); }}
            className="text-xs px-3 py-1 rounded-lg bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:hover:bg-violet-500/25 transition-colors"
          >
            다시 시작
          </button>
        )}
      </div>
    </div>
  );
}
