"use client";

import { useEffect, useState } from "react";

/**
 * Unlocks audio on the first user gesture (browser autoplay policy compliance).
 *
 * M1 ships NO audio track — this only flips an "unlocked" flag on the first
 * pointer or keyboard interaction. The real ambient track is wired to this gate
 * in a later milestone (M6); keyboard users are covered via the keydown listener.
 */
export function useAudioUnlock(): { unlocked: boolean } {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (unlocked) return;

    const unlock = () => setUnlocked(true);
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [unlocked]);

  return { unlocked };
}
