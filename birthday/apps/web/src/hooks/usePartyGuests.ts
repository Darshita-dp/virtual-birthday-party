"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

/**
 * Shared party guests (M15). Fetches all joined guests from Supabase and
 * subscribes to realtime inserts/updates so everyone in the room sees new
 * arrivals live. Positions are computed deterministically from `session_id`
 * (so every viewer reads the same spot) and stored on the row at join time.
 * When Supabase is not configured, `usePartyGuests` returns [] and `joinParty`
 * is a no-op — the room falls back to host + local self guest.
 */

export interface PartyGuestRow {
  id: string;
  session_id: string;
  name: string;
  avatar_id: string;
  x_pct: number;
  y_pct: number;
  height_pct: number;
  joined_at: string;
}

export interface GuestPlacement {
  xPct: number;
  yPct: number;
  heightPct: number;
}

// Curated open-floor zones (spirit of the earlier hand-tuned sample positions):
// off the cake, off Darshita's column, off the piano/fountain/seating.
const GUEST_ZONES: GuestPlacement[] = [
  { xPct: 35, yPct: 40, heightPct: 6.5 },
  { xPct: 68, yPct: 40, heightPct: 6.5 },
  { xPct: 25, yPct: 52, heightPct: 7.5 },
  { xPct: 73, yPct: 52, heightPct: 7.5 },
  { xPct: 40, yPct: 66, heightPct: 8 },
  { xPct: 64, yPct: 64, heightPct: 8 },
  { xPct: 30, yPct: 72, heightPct: 8 },
  { xPct: 70, yPct: 72, heightPct: 8 },
  { xPct: 48, yPct: 74, heightPct: 8 },
  { xPct: 20, yPct: 62, heightPct: 7.5 },
];

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic placement from session_id: same guest → same spot everywhere. */
export function computePlacement(sessionId: string): GuestPlacement {
  const h = hashStr(sessionId);
  const zone = GUEST_ZONES[h % GUEST_ZONES.length] ?? GUEST_ZONES[0]!;
  const jitterX = (((h >> 8) % 61) - 30) / 10; // -3..3
  const jitterY = (((h >> 16) % 41) - 20) / 10; // -2..2
  return {
    xPct: clamp(zone.xPct + jitterX, 8, 92),
    yPct: clamp(zone.yPct + jitterY, 36, 82),
    heightPct: zone.heightPct,
  };
}

/** Upsert the current visitor into party_guests on Enter Party (no-op if unconfigured). */
export async function joinParty(input: {
  sessionId: string;
  name: string;
  avatarId: string;
}): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb) return;
  const pos = computePlacement(input.sessionId);
  try {
    await sb.from("party_guests").upsert(
      {
        session_id: input.sessionId,
        name: input.name,
        avatar_id: input.avatarId,
        x_pct: pos.xPct,
        y_pct: pos.yPct,
        height_pct: pos.heightPct,
      },
      { onConflict: "session_id" },
    );
  } catch {
    /* network/RLS issue — local self guest still renders, no crash */
  }
}

export function usePartyGuests(): PartyGuestRow[] {
  const [guests, setGuests] = useState<PartyGuestRow[]>([]);

  useEffect(() => {
    const sb = getSupabaseClient();
    if (!sb) return;
    let active = true;

    sb.from("party_guests")
      .select("*")
      .order("joined_at", { ascending: true })
      .then(
        ({ data }) => {
          if (active && data) setGuests(data as PartyGuestRow[]);
        },
        () => {},
      );

    const channel = sb
      .channel("party_guests_rt")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "party_guests" },
        (payload) => {
          const g = payload.new as PartyGuestRow;
          setGuests((prev) =>
            prev.some((p) => p.session_id === g.session_id) ? prev : [...prev, g],
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "party_guests" },
        (payload) => {
          const g = payload.new as PartyGuestRow;
          setGuests((prev) => prev.map((p) => (p.session_id === g.session_id ? g : p)));
        },
      )
      .subscribe();

    return () => {
      active = false;
      sb.removeChannel(channel);
    };
  }, []);

  return guests;
}
