"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import styles from "./RoomStage.module.css";

interface Size {
  w: number;
  h: number;
}

interface View {
  min: number;
  maxScale: number;
  focus: number;
  wide: number;
}

type ViewMode = "focus" | "wide";

// Initial camera is zoomed in toward Darshita + cake ("focus"); the zoom-out
// button drops to fill-width so more of the room fits ("wide").
const FOCUS_FACTOR = 1.2;
const WIDE_FACTOR = 1.02;

// Focus target as fractions of the world: center on Darshita's column (~53%),
// biased upward to include the cake/stage (~30%). Wide keeps the venue framing.
const FOCUS_X = 0.51;
const FOCUS_Y = 0.3;
const WIDE_X = 0.5;
const WIDE_Y = 0.4;

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

// Phone "game mode" — matches the M17 HUD breakpoints. In this mode the room
// uses a COVER min-scale (fills 100vw × 100dvh, no gutters) and starts in the
// wide view so the whole room reads at first glance.
function isMobileLandscape(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(orientation: landscape) and (max-height: 500px)").matches
  );
}

// Avoids the SSR "useLayoutEffect does nothing on the server" warning while
// still committing scroll before paint on the client.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * The room as a pannable, zoomable world/map (camera behavior — not movement).
 *
 * The art renders at natural size and is scaled with a CSS transform; the full
 * image is always shown (never cropped, aspect preserved). The initial view is
 * FOCUSED on Darshita + the cake (center-upper); the zoom-out button widens to
 * a fill-width "see the whole room" view. Native scroll/pan and Ctrl/pinch zoom
 * are unchanged. The HUD lives outside this scaled world, so it never zooms.
 *
 * Asset: apps/web/public/assets/backgrounds/room-bg.png
 */
export function RoomStage({ children }: { children?: ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [natural, setNatural] = useState<Size | null>(null);
  const [scale, setScale] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("focus");

  const naturalRef = useRef<Size | null>(null);
  const scaleRef = useRef(1);
  const minScaleRef = useRef(0.1);
  const maxScaleRef = useRef(3);
  const viewModeRef = useRef<ViewMode>("focus");
  // Set by zoomTo to preserve a focal point; consumed by the commit effect.
  const pendingFocalRef = useRef<{ left: number; top: number } | null>(null);
  // Set by applyView/resize to re-frame focus or wide after the scale commits.
  const pendingFrameRef = useRef<ViewMode | null>(null);

  useEffect(() => {
    if (scale != null) scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

  /** Responsive scale bounds + focus/wide targets derived from the live viewport. */
  const computeView = useCallback((size: Size): View | null => {
    const vp = viewportRef.current;
    if (!vp || size.w === 0 || size.h === 0) return null;
    const widthScale = vp.clientWidth / size.w;
    const heightScale = vp.clientHeight / size.h;
    // Desktop/tablet: fill width (unchanged). Phone landscape "game mode": COVER —
    // take the larger of width/height scale so the room fills the viewport in
    // both axes with no purple gutters (the excess is scrollable/pannable).
    const min = isMobileLandscape() ? Math.max(widthScale, heightScale) : widthScale;
    const maxScale = min * 4;
    const focus = clamp(min * FOCUS_FACTOR, min, maxScale);
    const wide = clamp(min * WIDE_FACTOR, min, maxScale);
    return { min, maxScale, focus, wide };
  }, []);

  /** Center on Darshita + cake (center-upper). */
  const frameFocus = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const maxL = Math.max(0, vp.scrollWidth - vp.clientWidth);
    const maxT = Math.max(0, vp.scrollHeight - vp.clientHeight);
    vp.scrollLeft = clamp(FOCUS_X * vp.scrollWidth - vp.clientWidth / 2, 0, maxL);
    vp.scrollTop = clamp(FOCUS_Y * vp.scrollHeight - vp.clientHeight / 2, 0, maxT);
  }, []);

  /** Center horizontally; slight upward bias so the room reads as a venue. */
  const frameWide = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    vp.scrollLeft = Math.max(0, (vp.scrollWidth - vp.clientWidth) * WIDE_X);
    vp.scrollTop = Math.max(0, (vp.scrollHeight - vp.clientHeight) * WIDE_Y);
  }, []);

  const applyFrame = useCallback(
    (mode: ViewMode) => {
      if (mode === "focus") frameFocus();
      else frameWide();
    },
    [frameFocus, frameWide],
  );

  const applyView = useCallback(
    (mode: ViewMode) => {
      const size = naturalRef.current;
      if (!size) return;
      const v = computeView(size);
      if (!v) return;
      minScaleRef.current = v.min;
      maxScaleRef.current = v.maxScale;
      viewModeRef.current = mode;
      setViewMode(mode);
      pendingFocalRef.current = null;
      pendingFrameRef.current = mode;
      const target = mode === "focus" ? v.focus : v.wide;
      if (target !== scaleRef.current) {
        setScale(target);
      } else {
        applyFrame(mode); // scale unchanged → frame directly
      }
    },
    [computeView, applyFrame],
  );

  const handleLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return;
    const size: Size = { w: img.naturalWidth, h: img.naturalHeight };
    naturalRef.current = size;
    setNatural(size);
    // Phone landscape starts wide (the whole room reads at once); desktop/tablet
    // keeps the Darshita + cake focused first look.
    applyView(isMobileLandscape() ? "wide" : "focus");
  }, [applyView]);

  // After a scale change (and the .world size) commits, apply the focal scroll
  // if a zoom set one, otherwise re-frame focus/wide.
  useIsoLayoutEffect(() => {
    if (scale == null) return;
    const vp = viewportRef.current;
    if (!vp) return;
    if (pendingFocalRef.current) {
      vp.scrollLeft = pendingFocalRef.current.left;
      vp.scrollTop = pendingFocalRef.current.top;
      pendingFocalRef.current = null;
      return;
    }
    if (pendingFrameRef.current) {
      applyFrame(pendingFrameRef.current);
      pendingFrameRef.current = null;
      return;
    }
    frameWide();
  }, [scale, applyFrame, frameWide]);

  // Zoom toward a focal point (client coords); defaults to viewport center.
  const zoomTo = useCallback(
    (target: number, focalClientX?: number, focalClientY?: number) => {
      const vp = viewportRef.current;
      if (!vp || !naturalRef.current) return;
      const next = clamp(target, minScaleRef.current, maxScaleRef.current);
      const old = scaleRef.current;
      if (next === old) return;
      const rect = vp.getBoundingClientRect();
      const fx = focalClientX != null ? focalClientX - rect.left : vp.clientWidth / 2;
      const fy = focalClientY != null ? focalClientY - rect.top : vp.clientHeight / 2;
      const ux = (vp.scrollLeft + fx) / old;
      const uy = (vp.scrollTop + fy) / old;
      pendingFocalRef.current = { left: ux * next - fx, top: uy * next - fy };
      setScale(next);
    },
    [],
  );

  // Ctrl/trackpad-pinch wheel zoom (non-passive so we can preventDefault).
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return; // plain wheel stays native scroll/pan
      e.preventDefault();
      zoomTo(scaleRef.current * Math.exp(-e.deltaY * 0.0015), e.clientX, e.clientY);
    };
    vp.addEventListener("wheel", onWheel, { passive: false });
    return () => vp.removeEventListener("wheel", onWheel);
  }, [zoomTo]);

  // Recompute the responsive bounds on resize; keep the current view mode.
  useEffect(() => {
    const onResize = () => {
      const size = naturalRef.current;
      if (!size) return;
      const v = computeView(size);
      if (!v) return;
      minScaleRef.current = v.min;
      maxScaleRef.current = v.maxScale;
      const mode = viewModeRef.current;
      const target = mode === "focus" ? v.focus : v.wide;
      pendingFocalRef.current = null;
      pendingFrameRef.current = mode;
      if (target !== scaleRef.current) {
        setScale(target);
      } else {
        applyFrame(mode);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [computeView, applyFrame]);

  const toggleView = useCallback(() => {
    applyView(viewModeRef.current === "focus" ? "wide" : "focus");
  }, [applyView]);

  const worldStyle: CSSProperties | undefined =
    natural && scale != null ? { width: natural.w * scale, height: natural.h * scale } : undefined;
  const innerStyle: CSSProperties | undefined =
    natural && scale != null
      ? { width: natural.w, height: natural.h, transform: `scale(${scale})`, opacity: 1 }
      : undefined;
  const ready = natural != null && scale != null;

  return (
    <>
      <div className={styles.viewport} ref={viewportRef}>
        <div className={styles.world} style={worldStyle}>
          <div className={styles.worldInner} style={innerStyle}>
            {/* Large single world map: full image, never cropped. next/image
                resizing/optimization is intentionally not wanted here. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              className={styles.worldImg}
              src="/assets/backgrounds/room-bg.png"
              alt=""
              onLoad={handleLoad}
            />
            {ready && children}
          </div>
        </div>
      </div>

      {ready && (
        <button
          className={styles.zoomBtn}
          type="button"
          onClick={toggleView}
          aria-label={
            viewMode === "focus"
              ? "Zoom out to see the whole room"
              : "Zoom in to Darshita and the cake"
          }
          title={viewMode === "focus" ? "Zoom out" : "Zoom in"}
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            focusable="false"
          >
            <path d="M8 3 H4 V7" />
            <path d="M16 3 H20 V7" />
            <path d="M8 21 H4 V17" />
            <path d="M16 21 H20 V17" />
          </svg>
        </button>
      )}
    </>
  );
}
