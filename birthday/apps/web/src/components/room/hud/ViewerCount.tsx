"use client";

import { usePartyStats } from "@/hooks/usePartyStats";
import { isSupabaseConfigured } from "@/lib/supabaseClient";

/**
 * Viewers count (M15) — total Accept + Accepted clicks across all visitors,
 * from Supabase (`party_events`). Renders an em-dash placeholder while loading
 * or when Supabase is not configured (never a fake number).
 */
export function ViewerCount() {
  const { viewers } = usePartyStats();
  if (!isSupabaseConfigured() || viewers == null) return <>—</>;
  return <>{viewers}</>;
}
