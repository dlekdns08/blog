"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const W = 700;
const H = 280;
const GROUND = H - 50; // 230
const GRAVITY = 0.6;
const JUMP_V = -13;
const JUMP_V2 = -11; // double jump
const BASE_SPEED = 5;
const KOALA_W = 38;
const KOALA_H = 42;
const KOALA_X = 80;

// Bird dimensions and heights
const BIRD_W = 36;
const BIRD_H = 22;
const BIRD_LOW_Y = GROUND - 14;   // flies low → must jump over
const BIRD_HIGH_Y = GROUND - 112; // flies high → safe on ground, dangerous mid-jump

type Obstacle   = { x: number; w: number; h: number; type: "tree" | "rock" | "bush"; passed: boolean };
type Bird       = { x: number; y: number; frame: number; passed: boolean };
type Collectible = { x: number; y: number; type: "leaf" | "shield"; collected: boolean };
type Particle   = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; r: number };
type Popup      = { x: number; y: number; text: string; life: number; maxLife: number; vy: number };
type Cloud      = { x: number; y: number; w: number };
type Star       = { x: number; y: number; r: number; a: number };

function randomObs(x: number): Obstacle {
  const types: Obstacle["type"][] = ["tree", "rock", "bush"];
  const type = types[Math.floor(Math.random() * types.length)];
  const dims =
    type === "tree"  ? { w: 22, h: 55 } :
    type === "rock"  ? { w: 32, h: 26 } :
    { w: 44, h: 20 };
  return { x, ...dims, type, passed: false };
}

function spawnParticles(
  particles: Particle[],
  x: number, y: number,
  count: number,
  colors: string[],
  speed = 3, gravity = 0.15
) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const v = speed * (0.5 + Math.random() * 0.8);
    particles.push({
      x, y,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v - gravity * 10,
      life: 30 + Math.floor(Math.random() * 20),
      maxLife: 50,
      color: colors[Math.floor(Math.random() * colors.length)],
      r: 2 + Math.random() * 3,
    });
  }
}

function drawKoala(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  frame: number,
  isDead: boolean,
  hasShield: boolean,
  shieldFlash: number,
  canDoubleJump: boolean,
  onGround: boolean,
  airJumps: number, // 0 = can double jump, 1 = used
) {
  ctx.save();
  ctx.translate(x + KOALA_W / 2, y + KOALA_H / 2);

  if (isDead) ctx.rotate(Math.PI / 8);

  // shield aura
  if (hasShield) {
    const alpha = shieldFlash > 0 ? 0.9 : 0.35 + Math.sin(frame * 0.1) * 0.1;
    const shieldColor = shieldFlash > 0 ? `rgba(255,215,0,${alpha})` : `rgba(100,180,255,${alpha})`;
    ctx.shadowColor = shieldColor;
    ctx.shadowBlur = 18;
    ctx.strokeStyle = shieldColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 26, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
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
  ctx.beginPath(); ctx.ellipse(-10, -22, 7, 7, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(10, -22, 7, 7, 0.3, 0, Math.PI * 2); ctx.fill();

  // inner ears
  ctx.fillStyle = "#e8c8d0";
  ctx.beginPath(); ctx.ellipse(-10, -22, 4, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(10, -22, 4, 4, 0, 0, Math.PI * 2); ctx.fill();

  // nose
  ctx.fillStyle = "#3d2b1f";
  ctx.beginPath(); ctx.ellipse(0, -10, 5, 3.5, 0, 0, Math.PI * 2); ctx.fill();

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
  const legSwing = onGround ? Math.sin(frame * 0.25) * 8 : 4;
  ctx.strokeStyle = "#9e9e9e";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-5, 18); ctx.lineTo(-8, 28 + legSwing); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(5, 18); ctx.lineTo(8, 28 - legSwing); ctx.stroke();

  // arms
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-18, 8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(18, 8); ctx.stroke();

  // double-jump indicator dots above koala (when airborne and can still double jump)
  if (!onGround && canDoubleJump && airJumps === 0 && !isDead) {
    for (let i = 0; i < 3; i++) {
      const dx = (i - 1) * 8;
      ctx.fillStyle = `rgba(120,200,255,${0.7 + Math.sin(frame * 0.2 + i) * 0.2})`;
      ctx.beginPath();
      ctx.arc(dx, -32, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

function drawTree(ctx: CanvasRenderingContext2D, x: number, h: number) {
  ctx.fillStyle = "#7b5e3a";
  ctx.fillRect(x + 7, GROUND - h, 8, h);
  ctx.fillStyle = "#4caf50";
  ctx.beginPath();
  ctx.moveTo(x + 11, GROUND - h - 22);
  ctx.lineTo(x - 2, GROUND - h + 8);
  ctx.lineTo(x + 24, GROUND - h + 8);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 11, GROUND - h - 36);
  ctx.lineTo(x + 1, GROUND - h - 8);
  ctx.lineTo(x + 21, GROUND - h - 8);
  ctx.closePath();
  ctx.fill();
}

function drawRock(ctx: CanvasRenderingContext2D, x: number, w: number, h: number) {
  ctx.fillStyle = "#78909c";
  ctx.beginPath();
  ctx.moveTo(x + 4, GROUND);
  ctx.lineTo(x, GROUND - h * 0.6);
  ctx.lineTo(x + w * 0.3, GROUND - h);
  ctx.lineTo(x + w * 0.7, GROUND - h);
  ctx.lineTo(x + w, GROUND - h * 0.5);
  ctx.lineTo(x + w - 2, GROUND);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#90a4ae";
  ctx.beginPath();
  ctx.ellipse(x + w * 0.45, GROUND - h * 0.7, w * 0.2, h * 0.15, -0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawBush(ctx: CanvasRenderingContext2D, x: number, w: number) {
  ctx.fillStyle = "#388e3c";
  ctx.beginPath(); ctx.arc(x + 10, GROUND - 12, 12, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 22, GROUND - 16, 14, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 34, GROUND - 12, 11, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#2e7d32";
  ctx.fillRect(x, GROUND - 4, w, 8);
}

function drawBird(ctx: CanvasRenderingContext2D, bird: Bird, dark: boolean) {
  const { x, y, frame } = bird;
  const flap = Math.sin(frame * 0.18) > 0;
  ctx.save();
  ctx.translate(x + BIRD_W / 2, y + BIRD_H / 2);

  const bodyColor = dark ? "#b0bec5" : "#546e7a";
  ctx.fillStyle = bodyColor;
  // body
  ctx.beginPath();
  ctx.ellipse(0, 2, 9, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  // head
  ctx.beginPath();
  ctx.arc(-8, -1, 5, 0, Math.PI * 2);
  ctx.fill();
  // beak
  ctx.fillStyle = "#f4a300";
  ctx.beginPath();
  ctx.moveTo(-14, -1);
  ctx.lineTo(-12, -3);
  ctx.lineTo(-12, 1);
  ctx.closePath();
  ctx.fill();
  // eye
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(-9, -2, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#111";
  ctx.beginPath(); ctx.arc(-9.3, -2, 0.8, 0, Math.PI * 2); ctx.fill();

  // wings
  ctx.fillStyle = bodyColor;
  if (flap) {
    // wings up
    ctx.beginPath();
    ctx.moveTo(-2, -1); ctx.lineTo(-10, -12); ctx.lineTo(2, -5); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(2, -1); ctx.lineTo(14, -10); ctx.lineTo(6, -5); ctx.closePath(); ctx.fill();
  } else {
    // wings down
    ctx.beginPath();
    ctx.moveTo(-2, 2); ctx.lineTo(-12, 10); ctx.lineTo(2, 6); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(2, 2); ctx.lineTo(16, 8); ctx.lineTo(6, 6); ctx.closePath(); ctx.fill();
  }
  // tail
  ctx.beginPath();
  ctx.moveTo(8, 2); ctx.lineTo(18, -4); ctx.lineTo(18, 6); ctx.closePath(); ctx.fill();

  ctx.restore();
}

function drawLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  ctx.save();
  ctx.translate(x + 10, y + 10);
  ctx.rotate(Math.sin(frame * 0.05) * 0.3);
  ctx.fillStyle = "#66bb6a";
  ctx.beginPath();
  ctx.ellipse(0, 0, 10, 6, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#a5d6a7";
  ctx.beginPath();
  ctx.ellipse(-2, -1, 5, 3, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  // stem
  ctx.strokeStyle = "#4caf50";
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(7, 5); ctx.lineTo(10, 10); ctx.stroke();
  // glow
  ctx.shadowColor = "#66bb6a";
  ctx.shadowBlur = 8;
  ctx.fillStyle = "rgba(102,187,106,0.2)";
  ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawShieldItem(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  ctx.save();
  ctx.translate(x + 10, y + 10);
  const pulse = 1 + Math.sin(frame * 0.08) * 0.08;
  ctx.scale(pulse, pulse);
  // glow
  ctx.shadowColor = "#ffd54f";
  ctx.shadowBlur = 16;
  // shield shape
  ctx.fillStyle = "#ffd54f";
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(10, -6);
  ctx.lineTo(10, 4);
  ctx.lineTo(0, 12);
  ctx.lineTo(-10, 4);
  ctx.lineTo(-10, -6);
  ctx.closePath();
  ctx.fill();
  // inner
  ctx.fillStyle = "#fff9c4";
  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.lineTo(6, -3);
  ctx.lineTo(6, 2);
  ctx.lineTo(0, 7);
  ctx.lineTo(-6, 2);
  ctx.lineTo(-6, -3);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawCloud(ctx: CanvasRenderingContext2D, cloud: Cloud, dark: boolean) {
  ctx.fillStyle = dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.85)";
  ctx.beginPath(); ctx.arc(cloud.x, cloud.y, 14, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cloud.x + 20, cloud.y - 8, 18, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cloud.x + 40, cloud.y, 14, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(cloud.x, cloud.y - 8, cloud.w, 20);
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawPopups(ctx: CanvasRenderingContext2D, popups: Popup[], dark: boolean) {
  for (const p of popups) {
    const alpha = Math.min(1, p.life / 15);
    ctx.globalAlpha = alpha;
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "center";
    // shadow for readability
    ctx.fillStyle = dark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)";
    ctx.fillText(p.text, p.x + 1, p.y + 1);
    ctx.fillStyle = p.text.startsWith("+") ? "#4caf50" :
                    p.text.includes("COMBO") ? "#ffd54f" :
                    p.text.includes("방패") ? "#64b5f6" : "#ffffff";
    ctx.fillText(p.text, p.x, p.y);
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
}

export function KoalaGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    vy: 0,
    koalaY: GROUND - KOALA_H,
    onGround: true,
    airJumps: 0,      // how many mid-air jumps used (max 1)
    obstacles: [] as Obstacle[],
    birds: [] as Bird[],
    collectibles: [] as Collectible[],
    particles: [] as Particle[],
    popups: [] as Popup[],
    clouds: [
      { x: 150, y: 40, w: 54 },
      { x: 420, y: 28, w: 54 },
      { x: 600, y: 50, w: 54 },
    ] as Cloud[],
    stars: Array.from({ length: 30 }, () => ({
      x: Math.random() * W,
      y: Math.random() * (GROUND - 80),
      r: Math.random() * 1.5 + 0.5,
      a: Math.random(),
    })) as Star[],
    frame: 0,
    score: 0,
    bonusScore: 0,
    speed: BASE_SPEED,
    gameOver: false,
    started: false,
    nextObsIn: 90,
    nextBirdIn: 180 + Math.floor(Math.random() * 120),
    nextLeafIn: 120 + Math.floor(Math.random() * 100),
    nextShieldIn: 400 + Math.floor(Math.random() * 400),
    isDark: false,
    darkTimer: 0,
    // shield
    hasShield: false,
    shieldFlash: 0,
    // combo
    combo: 0,
    comboTimer: 0,
    obstaclesCleared: 0,
    wasOnGround: true,
  });

  const [displayScore, setDisplayScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [displayCombo, setDisplayCombo] = useState(0);
  const [hasShieldDisplay, setHasShieldDisplay] = useState(false);
  const rafRef = useRef<number>(0);

  // Load high score from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("koala_high_score");
      if (saved) setHighScore(parseInt(saved, 10));
    } catch { /* ignore */ }
  }, []);

  const reset = useCallback(() => {
    const s = stateRef.current;
    s.vy = 0;
    s.koalaY = GROUND - KOALA_H;
    s.onGround = true;
    s.airJumps = 0;
    s.obstacles = [];
    s.birds = [];
    s.collectibles = [];
    s.particles = [];
    s.popups = [];
    s.frame = 0;
    s.score = 0;
    s.bonusScore = 0;
    s.speed = BASE_SPEED;
    s.gameOver = false;
    s.started = false;
    s.nextObsIn = 90;
    s.nextBirdIn = 180 + Math.floor(Math.random() * 120);
    s.nextLeafIn = 120 + Math.floor(Math.random() * 100);
    s.nextShieldIn = 400 + Math.floor(Math.random() * 400);
    s.isDark = false;
    s.darkTimer = 0;
    s.hasShield = false;
    s.shieldFlash = 0;
    s.combo = 0;
    s.comboTimer = 0;
    s.obstaclesCleared = 0;
    s.wasOnGround = true;
    setDisplayScore(0);
    setDisplayCombo(0);
    setHasShieldDisplay(false);
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
      s.airJumps = 0;
      // landing dust on take-off
      spawnParticles(s.particles, KOALA_X + KOALA_W / 2, GROUND, 6, ["#c8b99a", "#d4c4a8", "#e0d0b8"], 2, 0.1);
    } else if (s.airJumps < 1) {
      // double jump
      s.vy = JUMP_V2;
      s.airJumps = 1;
      // double jump burst particles
      spawnParticles(s.particles, KOALA_X + KOALA_W / 2, s.koalaY + KOALA_H / 2, 12, ["#60a5fa", "#93c5fd", "#bfdbfe", "#fff"], 4, 0.05);
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
      ctx.fillStyle = dark ? "#0f0f1a" : "#e8f4fd";
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
        ctx.beginPath(); ctx.arc(W - 60, 50, 22, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = "#cfd8dc";
        ctx.beginPath(); ctx.arc(W - 60, 50, 18, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#0f0f1a";
        ctx.beginPath(); ctx.arc(W - 50, 44, 14, 0, Math.PI * 2); ctx.fill();
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
      ctx.fillStyle = dark ? "#3a5a3a" : "#c5e1a5";
      for (let i = 0; i < W; i += 30) {
        const dashX = s.started && !s.gameOver
          ? (i - (s.frame * s.speed * 0.5) % 30 + 30) % (W + 30) - 30
          : i;
        ctx.fillRect(dashX, GROUND + 2, 18, 2);
      }

      // ── game logic ──
      if (s.started && !s.gameOver) {
        s.frame++;
        s.score += 1;
        s.speed = BASE_SPEED + Math.floor(s.score / 300) * 0.4;

        // night cycle
        s.darkTimer++;
        if (s.darkTimer > 800) { s.isDark = !s.isDark; s.darkTimer = 0; }

        // physics
        s.vy += GRAVITY;
        s.koalaY += s.vy;
        const prevOnGround = s.onGround;
        if (s.koalaY >= GROUND - KOALA_H) {
          const justLanded = !prevOnGround;
          s.koalaY = GROUND - KOALA_H;
          s.vy = 0;
          s.onGround = true;
          s.airJumps = 0;
          // landing dust
          if (justLanded) {
            spawnParticles(s.particles, KOALA_X + KOALA_W / 2, GROUND, 8, ["#c8b99a", "#d4c4a8", "#a8936e"], 2.5, 0.1);
          }
        } else {
          s.onGround = false;
        }

        // ── spawn obstacles ──
        s.nextObsIn--;
        if (s.nextObsIn <= 0) {
          s.obstacles.push(randomObs(W + 20));
          s.nextObsIn = 60 + Math.floor(Math.random() * 80) - Math.min(20, Math.floor(s.score / 500));
        }

        // ── spawn birds ──
        s.nextBirdIn--;
        if (s.nextBirdIn <= 0 && s.score > 300) {
          const isLow = Math.random() < 0.55;
          const birdY = isLow ? BIRD_LOW_Y : BIRD_HIGH_Y;
          s.birds.push({ x: W + 20, y: birdY, frame: 0, passed: false });
          s.nextBirdIn = 150 + Math.floor(Math.random() * 150) - Math.min(40, Math.floor(s.score / 600));
        }

        // ── spawn leaf collectibles ──
        s.nextLeafIn--;
        if (s.nextLeafIn <= 0) {
          const leafY = Math.random() < 0.5 ? GROUND - 60 : GROUND - 110;
          s.collectibles.push({ x: W + 20, y: leafY, type: "leaf", collected: false });
          s.nextLeafIn = 100 + Math.floor(Math.random() * 120);
        }

        // ── spawn shield ──
        s.nextShieldIn--;
        if (s.nextShieldIn <= 0 && !s.hasShield) {
          s.collectibles.push({ x: W + 20, y: GROUND - 90, type: "shield", collected: false });
          s.nextShieldIn = 500 + Math.floor(Math.random() * 500);
        }

        // ── move obstacles ──
        s.obstacles.forEach((o) => { o.x -= s.speed; });
        // score obstacles cleared for combo
        s.obstacles.forEach((o) => {
          if (!o.passed && o.x + o.w < KOALA_X) {
            o.passed = true;
            s.obstaclesCleared++;
            s.combo++;
            s.comboTimer = 120;
            // combo milestones
            const comboBonus =
              s.combo === 5  ? 100 :
              s.combo === 10 ? 250 :
              s.combo === 20 ? 500 : 0;
            if (comboBonus > 0) {
              s.bonusScore += comboBonus;
              s.popups.push({
                x: W / 2, y: H / 2 - 30,
                text: `COMBO ×${s.combo}! +${comboBonus}`,
                life: 60, maxLife: 60, vy: -0.7,
              });
            }
          }
        });
        s.obstacles = s.obstacles.filter((o) => o.x > -80);

        // ── combo timer ──
        if (s.comboTimer > 0) {
          s.comboTimer--;
          if (s.comboTimer === 0) s.combo = 0;
        }
        setDisplayCombo(s.combo >= 3 ? s.combo : 0);

        // ── move birds ──
        s.birds.forEach((b) => {
          b.x -= s.speed * 1.1;
          b.frame++;
        });
        s.birds = s.birds.filter((b) => b.x > -60);

        // ── move collectibles ──
        s.collectibles.forEach((c) => { c.x -= s.speed; });
        s.collectibles = s.collectibles.filter((c) => c.x > -40 && !c.collected);

        // ── particle physics ──
        s.particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15;
          p.life--;
        });
        s.particles = s.particles.filter((p) => p.life > 0);

        // ── popup movement ──
        s.popups.forEach((p) => { p.y += p.vy; p.life--; });
        s.popups = s.popups.filter((p) => p.life > 0);

        // ── shield flash decay ──
        if (s.shieldFlash > 0) s.shieldFlash--;

        const totalScore = Math.floor(s.score / 5) + s.bonusScore;
        setDisplayScore(totalScore);
        setHasShieldDisplay(s.hasShield);

        // ── collision detection ──
        const kx1 = KOALA_X + 6,   ky1 = s.koalaY + 6;
        const kx2 = KOALA_X + KOALA_W - 6, ky2 = s.koalaY + KOALA_H - 4;

        // obstacle collision
        for (const o of s.obstacles) {
          const hitY = GROUND - o.h;
          if (kx2 > o.x + 4 && kx1 < o.x + o.w - 4 && ky2 > hitY + 4) {
            if (s.hasShield) {
              s.hasShield = false;
              s.shieldFlash = 20;
              s.popups.push({ x: KOALA_X + KOALA_W / 2, y: s.koalaY - 10, text: "방패!", life: 40, maxLife: 40, vy: -1 });
              spawnParticles(s.particles, KOALA_X + KOALA_W / 2, s.koalaY + KOALA_H / 2, 14, ["#ffd54f", "#fff176", "#ffee58"], 5, 0.05);
              // destroy the obstacle
              o.x = -200;
            } else {
              s.gameOver = true;
              try {
                const finalScore = Math.floor(s.score / 5) + s.bonusScore;
                const saved = parseInt(localStorage.getItem("koala_high_score") ?? "0", 10);
                if (finalScore > saved) {
                  localStorage.setItem("koala_high_score", String(finalScore));
                  setHighScore(finalScore);
                }
              } catch { /* ignore */ }
              setGameOver(true);
            }
          }
        }

        // bird collision
        for (const b of s.birds) {
          if (kx2 > b.x + 4 && kx1 < b.x + BIRD_W - 4 && ky2 > b.y + 3 && ky1 < b.y + BIRD_H - 3) {
            if (s.hasShield) {
              s.hasShield = false;
              s.shieldFlash = 20;
              s.popups.push({ x: KOALA_X + KOALA_W / 2, y: s.koalaY - 10, text: "방패!", life: 40, maxLife: 40, vy: -1 });
              spawnParticles(s.particles, KOALA_X + KOALA_W / 2, s.koalaY + KOALA_H / 2, 14, ["#ffd54f", "#fff176", "#ffee58"], 5, 0.05);
              b.x = -200;
            } else {
              s.gameOver = true;
              try {
                const finalScore = Math.floor(s.score / 5) + s.bonusScore;
                const saved = parseInt(localStorage.getItem("koala_high_score") ?? "0", 10);
                if (finalScore > saved) {
                  localStorage.setItem("koala_high_score", String(finalScore));
                  setHighScore(finalScore);
                }
              } catch { /* ignore */ }
              setGameOver(true);
            }
          }
        }

        // collectible collision
        for (const c of s.collectibles) {
          if (!c.collected && kx2 > c.x + 2 && kx1 < c.x + 20 && ky2 > c.y + 2 && ky1 < c.y + 20) {
            c.collected = true;
            if (c.type === "leaf") {
              s.bonusScore += 10;
              s.popups.push({ x: c.x + 10, y: c.y - 5, text: "+10", life: 40, maxLife: 40, vy: -1 });
              spawnParticles(s.particles, c.x + 10, c.y + 10, 10, ["#66bb6a", "#a5d6a7", "#c8e6c9", "#fff"], 3, 0.05);
            } else {
              s.hasShield = true;
              s.popups.push({ x: c.x + 10, y: c.y - 5, text: "방패 획득!", life: 50, maxLife: 50, vy: -0.8 });
              spawnParticles(s.particles, c.x + 10, c.y + 10, 16, ["#ffd54f", "#fff176", "#ffee58", "#fffde7"], 4, 0.04);
            }
          }
        }
      }

      // ── draw collectibles (behind koala) ──
      s.collectibles.forEach((c) => {
        if (!c.collected) {
          if (c.type === "leaf") drawLeaf(ctx, c.x, c.y, s.frame);
          else drawShieldItem(ctx, c.x, c.y, s.frame);
        }
      });

      // ── draw obstacles ──
      s.obstacles.forEach((o) => {
        if (o.type === "tree") drawTree(ctx, o.x, o.h);
        else if (o.type === "rock") drawRock(ctx, o.x, o.w, o.h);
        else drawBush(ctx, o.x, o.w);
      });

      // ── draw birds ──
      s.birds.forEach((b) => drawBird(ctx, b, dark));

      // ── draw particles ──
      drawParticles(ctx, s.particles);

      // ── draw koala ──
      drawKoala(
        ctx,
        KOALA_X, s.koalaY,
        s.started ? s.frame : 0,
        s.gameOver,
        s.hasShield,
        s.shieldFlash,
        true,        // canDoubleJump
        s.onGround,
        s.airJumps,
      );

      // ── draw score popups ──
      drawPopups(ctx, s.popups, dark);

      // ── HUD ──
      const totalScore = Math.floor(s.score / 5) + s.bonusScore;
      ctx.fillStyle = dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.3)";
      ctx.font = "bold 16px monospace";
      ctx.textAlign = "right";
      ctx.fillText(String(totalScore).padStart(5, "0"), W - 16, 26);

      // combo HUD
      if (s.combo >= 3 && s.comboTimer > 0) {
        const alpha = Math.min(1, s.comboTimer / 30);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#ffd54f";
        ctx.font = "bold 13px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(`COMBO ×${s.combo}`, W - 16, 46);
        ctx.globalAlpha = 1;
      }

      ctx.textAlign = "left";

      // ── overlay messages ──
      if (!s.started && !s.gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "white";
        ctx.font = "bold 26px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🐨 코알라 점프!", W / 2, H / 2 - 24);
        ctx.font = "14px sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fillText("스페이스 / ↑ / 화면 클릭으로 점프", W / 2, H / 2 + 4);
        ctx.font = "12px sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.fillText("공중에서 한 번 더 점프 가능 · 🍃 잎 모으기 · 🛡 방패로 1회 방어", W / 2, H / 2 + 26);
        ctx.textAlign = "left";
      }

      if (s.gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "white";
        ctx.font = "bold 26px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("게임 오버!", W / 2, H / 2 - 24);
        ctx.font = "16px sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        const finalScore = Math.floor(s.score / 5) + s.bonusScore;
        ctx.fillText(`점수: ${finalScore}`, W / 2, H / 2 + 2);
        try {
          const hi = parseInt(localStorage.getItem("koala_high_score") ?? "0", 10);
          ctx.font = "13px sans-serif";
          ctx.fillStyle = finalScore >= hi ? "#ffd54f" : "rgba(255,255,255,0.55)";
          ctx.fillText(
            finalScore >= hi ? `🏆 최고 기록 갱신! ${finalScore}` : `최고 기록: ${hi}`,
            W / 2, H / 2 + 24
          );
        } catch { /* ignore */ }
        ctx.font = "12px sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillText("다시 하려면 스페이스 / 화면 클릭", W / 2, H / 2 + 46);
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
      <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400 flex-wrap justify-center">
        <span>
          점수: <span className="font-bold tabular-nums text-zinc-700 dark:text-zinc-200">{displayScore}</span>
        </span>
        {highScore > 0 && (
          <span>
            최고: <span className="font-bold tabular-nums text-amber-500 dark:text-amber-400">{highScore}</span>
          </span>
        )}
        {displayCombo >= 3 && (
          <span className="font-bold text-amber-500 dark:text-amber-400">
            COMBO ×{displayCombo}
          </span>
        )}
        {hasShieldDisplay && (
          <span className="text-blue-500 dark:text-blue-400 font-medium">🛡 방패</span>
        )}
        <span className="text-xs opacity-60">스페이스 · ↑ · 클릭 (공중 2단 점프 가능)</span>
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
