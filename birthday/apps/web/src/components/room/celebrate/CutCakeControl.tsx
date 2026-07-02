"use client";

import { useCallback, useEffect, useState } from "react";
import { CelebrationOverlay } from "./CelebrationOverlay";
import styles from "./CutCakeControl.module.css";

/** Total celebration duration; also the button cooldown. */
const DURATION_MS = 5000;

/**
 * The functional Cut Cake trigger. Owns local celebration state; while active,
 * mounts the CelebrationOverlay and disables itself as a cooldown. Local-only —
 * no backend, no multiplayer, no persistence.
 */
export function CutCakeControl() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;
    const id = window.setTimeout(() => setActive(false), DURATION_MS);
    return () => window.clearTimeout(id);
  }, [active]);

  const onClick = useCallback(() => setActive(true), []);

  return (
    <>
      <button
        className={styles.cutCake}
        type="button"
        onClick={onClick}
        disabled={active}
        aria-label={active ? "Celebrating" : "Celebrate"}
      >
        Celebrate
      </button>
      {active && <CelebrationOverlay />}
    </>
  );
}
