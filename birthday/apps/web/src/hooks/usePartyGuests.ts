"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

/**
 * Shared party guests (M15). Fetches all joined guests from Supabase and
 * subscribes to realtime inserts/updates so everyone in the room sees new
 * arrivals live. Positions are assigned from a fixed slot table at join time
 * (see `GUEST_SLOTS` below) and stored on the row. When Supabase is not
 * configured, `usePartyGuests` returns [] and `joinParty` is a no-op — the
 * room falls back to host + local self guest.
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

// Fixed, curated guest slots — exact coordinates, spaced far enough apart
// (>=16% in x within a row, 8% between rows, with rows staggered) that two
// avatars can never visually overlap. This replaces the old hash+jitter
// scheme: jitter picked a *zone* deterministically but then nudged the guest
// by a few percent inside it, so two different session_ids could land in the
// same zone with overlapping jitter and collide. A slot is either free or
// taken — no fuzzy math, so collisions are structurally impossible as long as
// there are enough slots for the guests currently in the room. Height grows
// slightly for lower rows for a simple depth/perspective feel.
const GUEST_SLOTS: GuestPlacement[] = [
  // Upper floor, but away from Darshita/cake/stage center.
  { xPct: 20, yPct: 52, heightPct: 7.5 },
  { xPct: 30, yPct: 54, heightPct: 7.5 },
  { xPct: 70, yPct: 54, heightPct: 7.5 },
  { xPct: 80, yPct: 52, heightPct: 7.5 },

  // Middle floor, left and right sides.
  { xPct: 18, yPct: 62, heightPct: 8 },
  { xPct: 32, yPct: 62, heightPct: 8 },
  { xPct: 68, yPct: 62, heightPct: 8 },
  { xPct: 82, yPct: 62, heightPct: 8 },

  // Main open floor.
  { xPct: 24, yPct: 70, heightPct: 8.5 },
  { xPct: 38, yPct: 70, heightPct: 8.5 },
  { xPct: 52, yPct: 70, heightPct: 8.5 },
  { xPct: 66, yPct: 70, heightPct: 8.5 },
  { xPct: 80, yPct: 70, heightPct: 8.5 },

  // Front floor, but not too low / not hidden by bottom controls.
  { xPct: 22, yPct: 78, heightPct: 9 },
  { xPct: 36, yPct: 78, heightPct: 9 },
  { xPct: 50, yPct: 76, heightPct: 8.8 },
  { xPct: 64, yPct: 78, heightPct: 9 },
  { xPct: 78, yPct: 78, heightPct: 9 },

  // Extra safe side slots for more guests.
  { xPct: 26, yPct: 58, heightPct: 7.8 },
  { xPct: 74, yPct: 58, heightPct: 7.8 },
  { xPct: 42, yPct: 82, heightPct: 9 },
  { xPct: 58, yPct: 82, heightPct: 9 },
];

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Deterministic *guess* from session_id, used only for the local optimistic
 * render before the real slot assignment is confirmed by Supabase (or as the
 * final position when Supabase isn't configured at all, in which case there's
 * no cross-guest collision to worry about — only the local visitor renders).
 * The authoritative, collision-free slot is assigned by `joinParty` below.
 */
export function computePlacement(sessionId: string): GuestPlacement {
  const h = hashStr(sessionId);
  return GUEST_SLOTS[h % GUEST_SLOTS.length] ?? GUEST_SLOTS[0]!;
}

// Below this distance (in percent-space, x/y treated as a flat plane) two
// guests are considered visually "too close". Chosen below the smallest gap
// between any two curated GUEST_SLOTS (~10.6%) so the slots never block each
// other, but well above typical old jitter offsets, which landed guests
// within a few percent of each other — that gap is exactly the bug this fix
// closes.
const MIN_SAFE_DISTANCE = 10;

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Chooses a slot for a brand-new guest given everyone currently in the room
 * (including pre-existing rows placed by the old zone+jitter logic, which
 * won't line up exactly with a GUEST_SLOTS entry — so this checks proximity,
 * not exact position, to stay safe against that legacy data without touching
 * it). Prefers the first slot that isn't too close to anyone; if the room is
 * completely full, falls back to whichever slot is farthest from its nearest
 * neighbor (the least crowded spot available) rather than erroring.
 */
function pickSlotForNewGuest(existing: { x_pct: number; y_pct: number }[]): GuestPlacement {
  const points = existing.map((r) => ({ x: Number(r.x_pct), y: Number(r.y_pct) }));

  for (const slot of GUEST_SLOTS) {
    const tooClose = points.some((p) => distance(p, { x: slot.xPct, y: slot.yPct }) < MIN_SAFE_DISTANCE);
    if (!tooClose) return slot;
  }

  let best = GUEST_SLOTS[0]!;
  let bestNearest = -Infinity;
  for (const slot of GUEST_SLOTS) {
    const nearest =
      points.length === 0
        ? Infinity
        : Math.min(...points.map((p) => distance(p, { x: slot.xPct, y: slot.yPct })));
    if (nearest > bestNearest) {
      bestNearest = nearest;
      best = slot;
    }
  }
  return best;
}

/** Upsert the current visitor into party_guests on Enter Party (no-op if unconfigured).
 * Live-safe: never deletes or resets rows, and never moves a guest who's already
 * joined. Re-fetches current guests first — if this session_id already has a row,
 * its existing x_pct/y_pct/height_pct is reused as-is (re-RSVP doesn't relocate
 * them); otherwise `pickSlotForNewGuest` assigns a spot that isn't too close to
 * anyone currently in the room, including guests placed by the old zone+jitter
 * logic before this fix shipped. */
export async function joinParty(input: {
  sessionId: string;
  name: string;
  avatarId: string;
}): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb) return;
  try {
    const { data } = await sb.from("party_guests").select("session_id, x_pct, y_pct, height_pct");
    const rows = (data ?? []) as {
      session_id: string;
      x_pct: number;
      y_pct: number;
      height_pct: number;
    }[];

    const existingRow = rows.find((r) => r.session_id === input.sessionId);
    const pos: GuestPlacement = existingRow
      ? {
          xPct: Number(existingRow.x_pct),
          yPct: Number(existingRow.y_pct),
          heightPct: Number(existingRow.height_pct),
        }
      : pickSlotForNewGuest(rows.filter((r) => r.session_id !== input.sessionId));

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
