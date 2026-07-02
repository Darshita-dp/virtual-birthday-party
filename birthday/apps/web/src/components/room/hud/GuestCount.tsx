"use client";

import { useEffect, useState } from "react";
import { readSession } from "@/hooks/useGuestSession";
import styles from "./GuestCount.module.css";

/**
 * Honest local-session guest count (0 or 1). Reflects only THIS browser's RSVP
 * session; read after mount so SSR and the first client render both show 0
 * (no hydration mismatch). A true joined/attended total across everyone needs
 * backend/multiplayer, which is deferred.
 */
export function GuestCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (readSession()) setCount(1);
  }, []);

  return (
    <>
      <span className={styles.count}>{count}</span>
      <span className={styles.label}>{count === 1 ? "Guest Joined" : "Guests Joined"}</span>
    </>
  );
}
