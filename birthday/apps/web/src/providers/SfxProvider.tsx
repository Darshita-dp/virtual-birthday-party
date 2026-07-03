"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";

/**
 * Global UI click sound (M12). Mounted once near the root layout, alongside
 * (but fully independent of) MusicProvider. Uses event delegation on
 * `document` — NOT per-button onClick handlers — so every current and future
 * button/link/role="button" control gets the sound automatically.
 *
 * - `pointerdown` covers mouse/touch/pen activation.
 * - `keydown` (Enter/Space only, non-repeat) covers keyboard activation.
 * - Deliberately never listens for `click`, to avoid double-firing (a
 *   keyboard Enter/Space on a <button> also dispatches a native `click`,
 *   which would otherwise double up with the keydown handler).
 *
 * A small audio-element pool (not a single element) lets rapid clicks
 * overlap cleanly instead of cutting each other off. Fully separate from the
 * looping background-music element in MusicProvider — playing a click sound
 * can never pause, restart, or otherwise affect the music.
 */

const CLICK_SRC = "/assets/audio/ui-click.m4a";
const CLICK_VOLUME = 0.3;
const POOL_SIZE = 5;

// Real-shape interactive elements only; disabled/aria-disabled state is
// checked separately below so nested icons/spans inside a button still
// resolve to that button via closest(), even when the button is disabled.
const INTERACTIVE_SELECTOR = 'button, a[href], [role="button"], input[type="button"], input[type="submit"]';

function resolveInteractiveTarget(target: EventTarget | null): Element | null {
  if (!(target instanceof Element)) return null;
  const el = target.closest(INTERACTIVE_SELECTOR);
  if (!el) return null;
  if (el.matches(":disabled")) return null;
  if (el.getAttribute("aria-disabled") === "true") return null;
  if (el.closest("[data-no-click-sound]")) return null;
  return el;
}

interface SfxContextValue {
  /** Manually trigger the click sound (for future non-native interactive elements). */
  playClick: () => void;
}

const SfxContext = createContext<SfxContextValue | null>(null);

export function SfxProvider({ children }: { children: ReactNode }) {
  const poolRef = useRef<HTMLAudioElement[]>([]);
  const cursorRef = useRef(0);

  const playClick = () => {
    const pool = poolRef.current;
    if (pool.length === 0) return;
    let a = pool.find((el) => el.paused || el.ended);
    if (!a) {
      a = pool[cursorRef.current % pool.length];
      cursorRef.current += 1;
    }
    if (!a) return;
    try {
      a.currentTime = 0;
    } catch {
      /* media not ready to seek yet — play() below still attempts playback */
    }
    const p = a.play();
    if (p && typeof p.then === "function") {
      p.catch(() => {
        /* silent — e.g. a stray autoplay-policy edge case on a very fast click */
      });
    }
  };

  useEffect(() => {
    const pool: HTMLAudioElement[] = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      const a = new Audio(CLICK_SRC);
      a.preload = "auto";
      a.volume = CLICK_VOLUME;
      pool.push(a);
    }
    poolRef.current = pool;

    const onPointerDown = (e: PointerEvent) => {
      if (resolveInteractiveTarget(e.target)) playClick();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key !== "Enter" && e.key !== " ") return;
      if (resolveInteractiveTarget(e.target)) playClick();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      for (const a of pool) {
        a.pause();
        a.src = "";
      }
      poolRef.current = [];
    };
    // Deliberately empty deps: `playClick` reads only from refs (pool/cursor),
    // so the closure captured here at mount never goes stale.
  }, []);

  return <SfxContext.Provider value={{ playClick }}>{children}</SfxContext.Provider>;
}

/** Manually trigger the click sound. Must be used within <SfxProvider>. */
export function useSfx(): SfxContextValue {
  const ctx = useContext(SfxContext);
  if (!ctx) {
    throw new Error("useSfx must be used within <SfxProvider>");
  }
  return ctx;
}
