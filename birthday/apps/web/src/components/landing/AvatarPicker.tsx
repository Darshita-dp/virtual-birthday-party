"use client";

import { useState } from "react";
import { AVATARS, type AvatarOption } from "@/data/avatars";
import styles from "./AvatarPicker.module.css";

interface AvatarPickerProps {
  value: string | null;
  onChange: (id: string) => void;
}

/** Soft placeholder shown when an avatar PNG is missing/fails to load. */
function AvatarFallback({ skin, hair, outfit, hat }: Pick<AvatarOption, "skin" | "hair" | "outfit" | "hat">) {
  return (
    <svg viewBox="0 0 20 20" className={styles.fallback} shapeRendering="geometricPrecision" aria-hidden focusable="false">
      <path d="M10 2 L8.4 5 L11.6 5 Z" fill={hat ?? "#ff9dc8"} />
      <path d="M6.6 8 Q10 3.6 13.4 8 Z" fill={hair ?? "#7a4a2b"} />
      <circle cx="10" cy="8.6" r="3.1" fill={skin ?? "#f0c8a0"} />
      <path d="M6.5 12 Q10 11 13.5 12 L15 19.5 Q10 20.5 5 19.5 Z" fill={outfit ?? "#c58bd8"} />
    </svg>
  );
}

function AvatarTile({
  option,
  selected,
  onSelect,
}: {
  option: AvatarOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  return (
    <button
      type="button"
      className={`${styles.tile} ${selected ? styles.tileSelected : ""}`.trim()}
      aria-pressed={selected}
      aria-label={option.label}
      title={option.label}
      onClick={onSelect}
    >
      <span className={styles.thumb}>
        {imgError ? (
          <AvatarFallback skin={option.skin} hair={option.hair} outfit={option.outfit} hat={option.hat} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.thumbImg} src={option.src} alt="" onError={() => setImgError(true)} />
        )}
      </span>
      <span className={styles.tileLabel}>{option.label}</span>
    </button>
  );
}

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  return (
    <div className={styles.grid} role="group" aria-label="Choose your avatar">
      {AVATARS.map((a) => (
        <AvatarTile key={a.id} option={a} selected={value === a.id} onSelect={() => onChange(a.id)} />
      ))}
    </div>
  );
}
