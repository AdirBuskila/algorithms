"use client";

import { useEffect, useRef } from "react";

type RGB = { r: number; g: number; b: number };

function parseColor(value: string): RGB | null {
  const v = value.trim();
  if (!v) return null;
  const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }
  const rgb = v.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (rgb) return { r: +rgb[1], g: +rgb[2], b: +rgb[3] };
  return null;
}

const rgba = (c: RGB, a: number) => `rgba(${c.r},${c.g},${c.b},${a})`;
const mix = (a: RGB, b: RGB, t: number): RGB => ({
  r: Math.round(a.r + (b.r - a.r) * t),
  g: Math.round(a.g + (b.g - a.g) * t),
  b: Math.round(a.b + (b.b - a.b) * t),
});
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

interface GNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  disc: number; // BFS discovery time offset (ms); Infinity = unreached this ripple
  act: number; // current activation 0..1
  source: boolean;
}

export default function HeroGraph() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const FALLBACK = {
      base: { r: 120, g: 120, b: 120 } as RGB,
      accent: { r: 15, g: 110, b: 86 } as RGB,
      amber: { r: 186, g: 117, b: 23 } as RGB,
    };
    let colors = FALLBACK;
    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      colors = {
        base: parseColor(cs.getPropertyValue("--text-dim")) ?? FALLBACK.base,
        accent: parseColor(cs.getPropertyValue("--accent")) ?? FALLBACK.accent,
        amber: parseColor(cs.getPropertyValue("--accent-amber")) ?? FALLBACK.amber,
      };
    };
    readColors();

    let w = 0;
    let h = 0;
    let threshold = 120;
    let nodes: GNode[] = [];

    const RISE = 220;
    const DECAY = 1100;
    const LAYER_DELAY = 175;
    const IDLE = 1500;

    const layout = () => {
      w = wrap.clientWidth;
      h = wrap.clientHeight;
      if (w === 0 || h === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      threshold = clamp(w / 7, 90, 150);
      const N = clamp(Math.round(w / 46), 12, 26);
      const pad = 14;
      nodes = Array.from({ length: N }, () => ({
        x: pad + Math.random() * (w - 2 * pad),
        y: pad + Math.random() * (h - 2 * pad),
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        disc: Infinity,
        act: 0,
        source: false,
      }));
    };
    layout();

    const dist = (a: GNode, b: GNode) => Math.hypot(a.x - b.x, a.y - b.y);

    // ---- BFS ripple ----
    let rippleStart: number | null = null;
    let maxDisc = 0;
    let nextRippleAt = 0;

    const startRipple = (now: number) => {
      const n = nodes.length;
      if (n === 0) return;
      // adjacency by current proximity
      const adj: number[][] = nodes.map(() => []);
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          if (dist(nodes[i], nodes[j]) < threshold) {
            adj[i].push(j);
            adj[j].push(i);
          }
        }
      }
      const src = Math.floor(Math.random() * n);
      const layer = new Array(n).fill(Infinity);
      layer[src] = 0;
      const queue = [src];
      while (queue.length) {
        const u = queue.shift() as number;
        for (const v of adj[u]) {
          if (layer[v] === Infinity) {
            layer[v] = layer[u] + 1;
            queue.push(v);
          }
        }
      }
      maxDisc = 0;
      nodes.forEach((node, i) => {
        node.disc = layer[i] === Infinity ? Infinity : layer[i] * LAYER_DELAY;
        node.source = i === src;
        node.act = 0;
        if (node.disc !== Infinity) maxDisc = Math.max(maxDisc, node.disc);
      });
      rippleStart = now;
    };

    const intensity = (e: number) => {
      if (e < 0) return 0;
      if (e < RISE) return e / RISE;
      const d = (e - RISE) / DECAY;
      return d >= 1 ? 0 : 1 - d;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      // edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const d = dist(nodes[i], nodes[j]);
          if (d >= threshold) continue;
          const prox = 1 - d / threshold;
          ctx.strokeStyle = rgba(colors.base, prox * 0.16);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
          const act = Math.min(nodes[i].act, nodes[j].act);
          if (act > 0.02) {
            ctx.strokeStyle = rgba(colors.accent, 0.15 + 0.6 * act);
            ctx.lineWidth = 1 + act;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      // nodes
      for (const node of nodes) {
        const act = node.act;
        const r = 2.4 + act * 1.9;
        if (act > 0.02) {
          const glow = node.source ? colors.amber : colors.accent;
          const halo = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 5);
          halo.addColorStop(0, rgba(glow, 0.28 * act));
          halo.addColorStop(1, rgba(glow, 0));
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r * 5, 0, Math.PI * 2);
          ctx.fill();
        }
        const core = node.source
          ? mix(colors.base, colors.amber, Math.max(act, 0.0))
          : mix(colors.base, colors.accent, act);
        ctx.fillStyle = rgba(core, 0.55 + 0.45 * act);
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = (now: number) => {
      const pad = 12;
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < pad || node.x > w - pad) {
          node.vx *= -1;
          node.x = clamp(node.x, pad, w - pad);
        }
        if (node.y < pad || node.y > h - pad) {
          node.vy *= -1;
          node.y = clamp(node.y, pad, h - pad);
        }
      }
      if (rippleStart === null) {
        if (now >= nextRippleAt) startRipple(now);
      } else {
        const elapsed = now - rippleStart;
        for (const node of nodes) {
          node.act = node.disc === Infinity ? 0 : intensity(elapsed - node.disc);
        }
        if (elapsed > maxDisc + RISE + DECAY) {
          rippleStart = null;
          for (const node of nodes) node.act = 0;
          nextRippleAt = now + IDLE;
        }
      }
      draw();
    };

    // ---- loop control ----
    let raf = 0;
    let running = false;
    const tick = (now: number) => {
      step(now);
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (running) return;
      running = true;
      if (nextRippleAt === 0) nextRippleAt = performance.now() + 900;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const themeMq = window.matchMedia("(prefers-color-scheme: dark)");

    const renderStatic = () => {
      readColors();
      layout();
      for (const node of nodes) node.act = 0;
      draw();
    };

    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (!reduceMq.matches) start();
    };
    const onTheme = () => {
      readColors();
      if (reduceMq.matches) draw();
    };
    const onReduce = () => {
      if (reduceMq.matches) {
        stop();
        renderStatic();
      } else {
        start();
      }
    };

    if (reduceMq.matches) {
      renderStatic();
    } else {
      io = new IntersectionObserver(
        (entries) => {
          const visible = entries.some((e) => e.isIntersecting);
          if (visible && !document.hidden) start();
          else stop();
        },
        { threshold: 0 },
      );
      io.observe(wrap);
    }

    ro = new ResizeObserver(() => {
      layout();
      if (reduceMq.matches || !running) draw();
    });
    ro.observe(wrap);

    document.addEventListener("visibilitychange", onVisibility);
    themeMq.addEventListener("change", onTheme);
    reduceMq.addEventListener("change", onReduce);

    return () => {
      stop();
      io?.disconnect();
      ro?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      themeMq.removeEventListener("change", onTheme);
      reduceMq.removeEventListener("change", onReduce);
    };
  }, []);

  return (
    <div ref={wrapRef} className="hero-graph" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
