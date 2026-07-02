"use client";

import { useState } from "react";
import styles from "./Character.module.css";

export interface CharacterData {
  id: string;
  name: string;
  isHost?: boolean;
  /** Feet-anchor position as a percentage of the room world. */
  xPct: number;
  yPct: number;
  /** Character height as a percentage of the room world height (scales with zoom). */
  heightPct: number;
  /** Optional sprite image; falls back to the pixel placeholder if missing/errors. */
  src?: string;
  // Placeholder palette (pixel guest).
  skin?: string;
  hair?: string;
  outfit?: string;
  hat?: string;
}

/** A small front-facing pixel birthday guest (placeholder until real crops/atlas). */
function PixelGuest({
  skin = "#f0c8a0",
  hair = "#7a4a2b",
  outfit = "#c58bd8",
  hat = "#ff9dc8",
}: Pick<CharacterData, "skin" | "hair" | "outfit" | "hat">) {
  return (
    <svg className={styles.pixel} viewBox="0 0 16 24" shapeRendering="crispEdges" aria-hidden focusable="false">
      {/* party hat */}
      <rect x="7" y="0" width="2" height="2" fill={hat} />
      <rect x="6" y="2" width="4" height="1" fill={hat} />
      <rect x="7" y="0" width="1" height="1" fill="#ffffff" />
      {/* hair */}
      <rect x="4" y="3" width="8" height="2" fill={hair} />
      <rect x="3" y="5" width="2" height="6" fill={hair} />
      <rect x="11" y="5" width="2" height="6" fill={hair} />
      {/* face + bangs */}
      <rect x="5" y="5" width="6" height="5" fill={skin} />
      <rect x="5" y="5" width="6" height="1" fill={hair} />
      {/* eyes */}
      <rect x="6" y="7" width="1" height="1" fill="#3a2b40" />
      <rect x="9" y="7" width="1" height="1" fill="#3a2b40" />
      {/* body / outfit */}
      <rect x="4" y="10" width="8" height="7" fill={outfit} />
      {/* arms */}
      <rect x="3" y="11" width="1" height="4" fill={skin} />
      <rect x="12" y="11" width="1" height="4" fill={skin} />
      {/* legs */}
      <rect x="5" y="17" width="2" height="3" fill={skin} />
      <rect x="9" y="17" width="2" height="3" fill={skin} />
      {/* shoes */}
      <rect x="5" y="20" width="2" height="1" fill="#4a3a55" />
      <rect x="9" y="20" width="2" height="1" fill="#4a3a55" />
    </svg>
  );
}

/**
 * A soft, rounded sample-guest attendee (non-host placeholder). Smooth shapes,
 * subtle shading, slightly transparent, and NO white sticker outline — so the
 * crowd reads as soft background attendees and Darshita stays the focus.
 * Separate from PixelGuest, which remains Darshita's untouched fallback.
 */
function SoftGuest({
  skin = "#f0c8a0",
  hair = "#7a4a2b",
  outfit = "#c58bd8",
  hat = "#ff9dc8",
}: Pick<CharacterData, "skin" | "hair" | "outfit" | "hat">) {
  return (
    <svg className={styles.pixel} viewBox="0 0 20 30" shapeRendering="geometricPrecision" aria-hidden focusable="false">
      <g opacity="0.96">
        {/* party hat */}
        <path d="M10 0.5 L7.6 5 L12.4 5 Z" fill={hat} />
        <circle cx="10" cy="0.9" r="0.8" fill="#ffffff" />
        {/* hair + head */}
        <ellipse cx="10" cy="10" rx="5" ry="5.4" fill={hair} />
        <circle cx="10" cy="10.2" r="4.2" fill={skin} />
        {/* fringe */}
        <path d="M6 8.4 Q10 6.2 14 8.4 L14 7 Q10 5.4 6 7 Z" fill={hair} />
        {/* eyes */}
        <circle cx="8.4" cy="10.4" r="0.55" fill="#3a2b40" />
        <circle cx="11.6" cy="10.4" r="0.55" fill="#3a2b40" />
        {/* dress */}
        <path d="M7 14 Q10 13.1 13 14 L15.5 27 Q10 28.4 4.5 27 Z" fill={outfit} />
        {/* soft shading */}
        <path d="M10 13.5 L13 14 L15.5 27 Q10 28.4 10 27 Z" fill="#000000" fillOpacity={0.1} />
        {/* arms */}
        <ellipse cx="6.4" cy="18" rx="1.1" ry="2.4" fill={skin} />
        <ellipse cx="13.6" cy="18" rx="1.1" ry="2.4" fill={skin} />
        {/* feet */}
        <rect x="7.2" y="27" width="2.2" height="1.8" rx="0.9" fill="#4a3a55" />
        <rect x="10.6" y="27" width="2.2" height="1.8" rx="0.9" fill="#4a3a55" />
      </g>
    </svg>
  );
}

/**
 * A character placed inside the room world layer (scales/pans with the room).
 * Host uses her sprite image (with PixelGuest as her unchanged fallback); sample
 * guests use SoftGuest. Only the host shows a name tag. Non-interactive.
 */
export function Character(props: CharacterData) {
  const { name, isHost, xPct, yPct, heightPct, src, skin, hair, outfit, hat } = props;
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(src) && !imgError;

  return (
    <div
      className={styles.marker}
      style={{ left: `${xPct}%`, top: `${yPct}%`, height: `${heightPct}%`, zIndex: Math.round(yPct) }}
    >
      <span className={styles.shadow} aria-hidden />
      <div className={styles.sprite}>
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.spriteImg} src={src} alt="" onError={() => setImgError(true)} />
        ) : isHost ? (
          <PixelGuest skin={skin} hair={hair} outfit={outfit} hat={hat} />
        ) : (
          <SoftGuest skin={skin} hair={hair} outfit={outfit} hat={hat} />
        )}
      </div>
      {isHost && <span className={`${styles.nameTag} ${styles.hostTag}`}>👑 {name}</span>}
    </div>
  );
}
