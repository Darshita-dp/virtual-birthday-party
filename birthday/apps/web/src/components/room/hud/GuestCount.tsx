"use client";

import { useEffect, useState } from "react";
import { readSession } from "@/hooks/useGuestSession";
import { usePartyStats } from "@/hooks/usePartyStats";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import styles from "./GuestCount.module.css";

/**
 * Joined count (M15). Shows the real cross-visitor total of joined guests from
 * Supabase (`party_guests`). Without Supabase configured it falls back to the
 * honest local placeholder (0 or 1 for THIS browser) — never a fake global
 * number.
 */
export function GuestCount() {
  const { joined } = usePartyStats();
  const [localCount, setLocalCount] = useState(0);

  useEffect(() => {
    if (!isSupabaseConfigured() && readSession()) setLocalCount(1);
  }, []);

  const count = isSupabaseConfigured() ? (joined ?? 0) : localCount;

  return (
    <>
      <span className={styles.count}>{count}</span>
      <span className={styles.label}>Joined</span>
    </>
  );
}
