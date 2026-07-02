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
  def: number;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

// Avoids the SSR "useLayoutEffect does nothing on the server" warning while
// still committing scroll before paint on the client.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * The room as a pannable, zoomable world/map (camera behavior — not movement).
 *
 * The art renders at natural size and is scaled with a CSS transform; the full
 * image is always shown (never cropped, aspect preserved). The initial view is a
 * responsive "venue" framing — slightly zoomed past fit so the room fills the
 * screen — while zoom-out still bottoms out at the full-room fit. Ctrl/pinch
 * zoom and native scroll/pan are unchanged. The HUD lives outside this scaled
 * world, so it never zooms or scrolls.
 *
 * Asset: apps/web/public/assets/backgrounds/room-bg.png
 */
export function RoomStage({ children }: { children?: ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [natural, setNatural] = useState<Size | null>(null);
  const [scale, setScale] = useState<number | null>(null);

  const naturalRef = useRef<Size | null>(null);
  const scaleRef = useRef(1);
  const minScaleRef = useRef(0.1);
  const maxScaleRef = useRef(3);
  // Set by zoomTo to preserve a focal point; when null, the effect re-frames
  // the view (centered horizontally, biased toward the cake/stage vertically).
  const pendingFocalRef = useRef<{ left: number; top: number } | null>(null);

  useEffect(() => {
    if (scale != null) scaleRef.current = scale;
  }, [scale]);

  /** Responsive scale bounds + a "venue" default derived from the live viewport. */
  const computeView = useCallback((size: Size): View | null => {
    const vp = viewportRef.current;
    if (!vp || size.w === 0 || size.h === 0) return null;
    const widthScale = vp.clientWidth / size.w;
    // Minimum zoom fills the viewport width so no dark side gaps can appear.
    // (widthScale === max(fitScale, fillWidthScale), since widthScale >= fitScale.)
    const min = widthScale;
    const maxScale = min * 4; // zoom-in headroom relative to the fill-width min
    // Start at ~fill-width (tiny bump avoids a 1px seam), within [min, maxScale].
    const def = clamp(min * 1.02, min, maxScale);
    return { min, maxScale, def };
  }, []);

  /** Center horizontally; bias vertically so the cake/stage + floor are framed. */
  const frameScroll = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    vp.scrollLeft = Math.max(0, (vp.scrollWidth - vp.clientWidth) * 0.5);
    vp.scrollTop = Math.max(0, (vp.scrollHeight - vp.clientHeight) * 0.4);
  }, []);

  const applyDefaultView = useCallback(
    (size: Size) => {
      const v = computeView(size);
      if (!v) return;
      minScaleRef.current = v.min; // zoom-out floor = fill-width (no side gaps)
      maxScaleRef.current = v.maxScale;
      pendingFocalRef.current = null; // re-frame after the scale commits
      setScale(v.def);
    },
    [computeView],
  );

  const handleLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return;
    const size: Size = { w: img.naturalWidth, h: img.naturalHeight };
    naturalRef.current = size;
    setNatural(size);
    applyDefaultView(size);
  }, [applyDefaultView]);

  // After a scale change (and the .world size) commits, apply the focal scroll
  // if a zoom set one, otherwise re-frame the view.
  useIsoLayoutEffect(() => {
    if (scale == null) return;
    const vp = viewportRef.current;
    if (!vp) return;
    const focal = pendingFocalRef.current;
    if (focal) {
      vp.scrollLeft = focal.left;
      vp.scrollTop = focal.top;
      pendingFocalRef.current = null;
    } else {
      frameScroll();
    }
  }, [scale, frameScroll]);

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

  // Recompute the responsive bounds on resize; keep the current zoom within them
  // and re-frame the view for the new viewport size.
  useEffect(() => {
    const onResize = () => {
      const size = naturalRef.current;
      if (!size) return;
      const v = computeView(size);
      if (!v) return;
      minScaleRef.current = v.min;
      maxScaleRef.current = v.maxScale;
      const next = clamp(scaleRef.current, v.min, v.maxScale);
      pendingFocalRef.current = null;
      if (next !== scaleRef.current) {
        setScale(next); // effect re-frames after commit
      } else {
        frameScroll(); // scale unchanged: re-frame directly for the new size
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [computeView, frameScroll]);

  const worldStyle: CSSProperties | undefined =
    natural && scale != null ? { width: natural.w * scale, height: natural.h * scale } : undefined;
  // The scaled layer that holds the room image AND the in-world characters, so
  // they share the same transform (scale/pan together).
  const innerStyle: CSSProperties | undefined =
    natural && scale != null
      ? { width: natural.w, height: natural.h, transform: `scale(${scale})`, opacity: 1 }
      : undefined;
  const ready = natural != null && scale != null;

  return (
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
  );
}
