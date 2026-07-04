"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";

/**
 * Shared counters (M15):
 *  - Viewers = total Accept + Accepted clicks (party_events rows).
 *  - Joined  = total joined guests (party_guests rows, deduped by session_id).
 *
 * Module-level singleton state + a single realtime channel shared by every
 * consumer (TopBar viewers, GuestCount joined) so we don't open duplicate
 * subscriptions. Returns null counts until the first fetch resolves, and while
 * Supabase is unconfigured (callers show their local fallback).
 */

export interface PartyStats {
  viewers: number | null;
  joined: number | null;
}

let viewers: number | null = null;
let joined: number | null = null;
const listeners = new Set<() => void>();
let inited = false;

function notify(): void {
  listeners.forEach((cb) => cb());
}

function initStats(): void {
  if (inited) return;
  inited = true;
  const sb = getSupabaseClient();
  if (!sb) return;

  const loadViewers = () =>
    sb
      .from("party_events")
      .select("*", { count: "exact", head: true })
      .then(
        ({ count }) => {
          viewers = count ?? 0;
          notify();
        },
        () => {},
      );

  const loadJoined = () =>
    sb
      .from("party_guests")
      .select("*", { count: "exact", head: true })
      .then(
        ({ count }) => {
          joined = count ?? 0;
          notify();
        },
        () => {},
      );

  void loadViewers();
  void loadJoined();

  sb.channel("party_stats_rt")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "party_events" },
      () => void loadViewers(),
    )
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "party_guests" },
      () => void loadJoined(),
    )
    .subscribe();
}

/** Record a landing-page Accept / Accepted click (no-op if unconfigured). */
export async function recordViewerClick(kind: "accept" | "accepted"): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb) return;
  try {
    await sb.from("party_events").insert({ kind });
  } catch {
    /* ignore — buttons keep working, count just doesn't tick */
  }
}

export function usePartyStats(): PartyStats {
  const [, force] = useState(0);
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    initStats();
    const cb = () => force((n) => n + 1);
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);
  return { viewers, joined };
}
