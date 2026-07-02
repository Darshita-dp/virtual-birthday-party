"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import styles from "./CelebrationOverlay.module.css";

/**
 * The Cake Moment visual layer (M5): confetti, sparkles, a soft top-band
 * shimmer, and a "Happy Birthday Darshita!" banner. Fullscreen fixed layer,
 * pointer-events:none so it never blocks the HUD. Only mounts while active and
 * unmounts automatically ~5s later (managed by CutCakeControl).
 */

const COLORS = [
  "var(--c-pink-500)",
  "var(--c-pink-400)",
  "var(--c-gold-500)",
  "var(--c-gold-400)",
  "var(--c-purple-500)",
  "var(--c-lavender-400)",
  "var(--c-lavender-300)",
  "var(--c-blue-400)",
];

// Light aesthetic palette: pink · blue · green · yellow · purple. Hex so the
// SVG `fill` attribute resolves directly (CSS variables inside SVG attributes
// via currentColor is fragile inside a portal).
const BALLOON_COLORS = [
  "#ffc2dd", // pink
  "#b8d6f4", // blue
  "#c2f0d0", // mint green
  "#fdebb4", // soft yellow
  "#c6b2f2", // purple
];

interface Particle {
  x: number;
  w: number;
  h: number;
  delay: number;
  duration: number;
  drift: number;
  color: string;
  rot: number;
}

interface Sparkle {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

interface Balloon {
  x: number;
  size: number;
  delay: number;
  duration: number;
  sway: number; // vw
  tilt: number; // deg
  color: string;
}

/** X biased toward the edges so the mid-frame (Darshita + self-guest) stays clear. */
function edgeBiasedX(): number {
  const r = Math.random();
  if (r > 0.35 && r < 0.65) return r < 0.5 ? Math.random() * 0.35 : 0.65 + Math.random() * 0.35;
  return r;
}

function makeParticles(count: number): Particle[] {
  const list: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const w = 6 + Math.random() * 6;
    list.push({
      x: edgeBiasedX() * 100,
      w,
      h: w * (0.5 + Math.random() * 0.4),
      delay: Math.random() * 1.2,
      duration: 2.5 + Math.random() * 1.5,
      drift: (Math.random() - 0.5) * 40, // vw
      color: COLORS[i % COLORS.length]!,
      rot: (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 720),
    });
  }
  return list;
}

function makeSparkles(count: number): Sparkle[] {
  const list: Sparkle[] = [];
  for (let i = 0; i < count; i++) {
    const useEdge = Math.random() < 0.55;
    const x = useEdge ? edgeBiasedX() * 100 : Math.random() * 100;
    list.push({
      x,
      y: 4 + Math.random() * 82,
      size: 18 + Math.random() * 18,
      delay: Math.random() * 1.5,
      duration: 1.8 + Math.random() * 0.9,
    });
  }
  return list;
}

/** Organic, non-linear distribution across the room area. */
function makeBalloons(count: number): Balloon[] {
  const list: Balloon[] = [];
  // Shuffle color order per run so palette feels scattered, not striped.
  const palette = [...BALLOON_COLORS].sort(() => Math.random() - 0.5);
  for (let i = 0; i < count; i++) {
    list.push({
      x: 3 + Math.random() * 94, // full-width random
      size: 26 + Math.random() * 22,
      delay: Math.random() * 2.5, // stagger entry
      duration: 4 + Math.random() * 5, // wide speed range 4–9s
      sway: (Math.random() - 0.5) * 10, // ±5vw
      tilt: (Math.random() - 0.5) * 14, // ±7deg gentle sway rotation
      color: palette[i % palette.length]!,
    });
  }
  return list;
}

export function CelebrationOverlay() {
  const [profile] = useState(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth <= 640;
    return { reduced, mobile };
  });

  const particles = useMemo(
    () => (profile.reduced ? [] : makeParticles(profile.mobile ? 24 : 40)),
    [profile],
  );
  const sparkles = useMemo(
    () => makeSparkles(profile.reduced ? 10 : profile.mobile ? 22 : 36),
    [profile],
  );
  const balloons = useMemo(
    () => (profile.reduced ? [] : makeBalloons(profile.mobile ? 12 : 20)),
    [profile],
  );

  // Portal to <body> so `position: fixed` isn't trapped by an ancestor's
  // `transform` (BottomDock's `.center` uses translateX, which would otherwise
  // become the containing block and misplace/clip the overlay).
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className={styles.overlay} aria-hidden>
      <div className={styles.shimmer} />

      {particles.map((p, i) => (
        <span
          key={i}
          className={styles.particle}
          style={
            {
              left: `${p.x}%`,
              width: `${p.w}px`,
              height: `${p.h}px`,
              background: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--drift": `${p.drift}vw`,
              "--rot": `${p.rot}deg`,
            } as CSSProperties
          }
        />
      ))}

      {balloons.map((b, i) => (
        <span
          key={`b${i}`}
          className={styles.balloon}
          style={
            {
              left: `${b.x}%`,
              width: `${b.size}px`,
              height: `${b.size * 1.55}px`,
              animationDelay: `${b.delay}s`,
              animationDuration: `${b.duration}s`,
              "--sway": `${b.sway}vw`,
              "--tilt": `${b.tilt}deg`,
            } as CSSProperties
          }
        >
          <svg
            viewBox="0 0 30 46"
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
            focusable="false"
          >
            <line x1="15" y1="30" x2="15" y2="44" stroke={b.color} strokeWidth="0.6" opacity="0.5" />
            <path d="M13 28 L17 28 L15 32 Z" fill={b.color} opacity="0.95" />
            <ellipse cx="15" cy="15" rx="11" ry="14" fill={b.color} opacity="0.95" />
            <ellipse cx="11" cy="10" rx="3" ry="5" fill="#ffffff" opacity="0.55" />
            <circle cx="10" cy="8" r="1.1" fill="#ffffff" opacity="0.95" />
            <circle cx="19" cy="18" r="0.9" fill="#ffffff" opacity="0.75" />
          </svg>
        </span>
      ))}

      {sparkles.map((s, i) => (
        <svg
          key={i}
          className={styles.sparkle}
          viewBox="0 0 24 24"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        >
          <path
            d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"
            fill="#fff6c8"
          />
        </svg>
      ))}

      <div className={styles.banner} role="status">
        <span className={styles.bannerText}>Happy Birthday Darshita! ✨</span>
      </div>
    </div>,
    document.body,
  );
}
