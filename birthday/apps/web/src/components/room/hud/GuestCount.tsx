"use client";

import { useEffect, useState } from "react";
import { readSession } from "@/hooks/useGuestSession";
import styles from "./GuestCount.module.css";

/**
 * Local-session presence (0 or 1) for THIS browser only, labeled "Joined"
 * (M13a). A real cross-visitor total lands in M13b via Supabase — until then
 * this stays an honest local placeholder, never a fake global number.
 */
export function GuestCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (readSession()) setCount(1);
  }, []);

  return (
    <>
      <span className={styles.count}>{count}</span>
      <span className={styles.label}>Joined</span>
    </>
  );
}
