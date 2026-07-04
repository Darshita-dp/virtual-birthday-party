"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import { getSessionId } from "./useGuestSession";

/**
 * Wishes store. Shared + realtime via Supabase (M15) when configured; otherwise
 * the original local-only implementation (M6): localStorage under `dvb.wishes.v1`,
 * newest first, cross-tab sync via `storage` events. Public API is unchanged
 * (`WishRecord`, `WISH_MAX_LENGTH`, `readWishes`, `addWish`, `useWishesLive`),
 * so WishesControl and the BottomDock quick composer need no changes.
 *
 * `addWish` is optimistic: it returns a local record immediately (instant UI)
 * and, when Supabase is on, inserts it in the background. Because the record's
 * `id` is a client-generated UUID stored as the row's primary key, the realtime
 * echo of your own insert is de-duped by id.
 */

export interface WishRecord {
  id: string;
  name: string;
  avatarId?: string;
  body: string;
  createdAt: number;
}

interface WishRow {
  id: string;
  session_id: string;
  name: string;
  avatar_id: string | null;
  body: string;
  created_at: string;
}

const STORAGE_KEY = "dvb.wishes.v1";
const MIN_INTERVAL_MS = 5000; // duplicate/spam guard
export const WISH_MAX_LENGTH = 280;

let memory: WishRecord[] = [];
const listeners = new Set<() => void>();

function isValid(v: unknown): v is WishRecord[] {
  if (!Array.isArray(v)) return false;
  return v.every((w) => {
    if (typeof w !== "object" || w === null) return false;
    const r = w as Partial<WishRecord>;
    return (
      typeof r.id === "string" &&
      typeof r.name === "string" &&
      typeof r.body === "string" &&
      typeof r.createdAt === "number"
    );
  });
}

function notify(): void {
  listeners.forEach((cb) => cb());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function makeId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return `w_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function rowToRecord(r: WishRow): WishRecord {
  return {
    id: r.id,
    name: r.name,
    body: r.body,
    createdAt: Date.parse(r.created_at) || Date.now(),
    ...(r.avatar_id ? { avatarId: r.avatar_id } : {}),
  };
}

// ── Local (fallback) persistence ────────────────────────────────────────────
function loadLocal(): WishRecord[] {
  if (typeof window === "undefined") return memory;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isValid(parsed)) {
        memory = parsed;
        return parsed;
      }
    }
  } catch {
    /* storage blocked — fall through to memory */
  }
  return memory;
}

function persistLocal(list: WishRecord[]): void {
  memory = list;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* memory-only session */
  }
  notify();
}

// Cross-tab sync for the local fallback: another tab writes the key → refresh.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY || isSupabaseConfigured()) return;
    try {
      const parsed: unknown = e.newValue ? JSON.parse(e.newValue) : [];
      if (isValid(parsed)) {
        memory = parsed;
        notify();
      }
    } catch {
      /* ignore */
    }
  });
}

// ── Supabase (shared) source ────────────────────────────────────────────────
let supabaseInited = false;

function initSupabase(): void {
  if (supabaseInited) return;
  supabaseInited = true;
  const sb = getSupabaseClient();
  if (!sb) return;

  sb.from("party_wishes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500)
    .then(
      ({ data }) => {
        if (!data) return;
        const rows = (data as WishRow[]).map(rowToRecord);
        const ids = new Set(memory.map((m) => m.id));
        const merged = [...memory, ...rows.filter((r) => !ids.has(r.id))];
        merged.sort((a, b) => b.createdAt - a.createdAt);
        memory = merged;
        notify();
      },
      () => {},
    );

  // One session-long channel; not torn down (shared by all consumers).
  sb.channel("party_wishes_rt")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "party_wishes" },
      (payload) => {
        const rec = rowToRecord(payload.new as WishRow);
        if (memory.some((m) => m.id === rec.id)) return; // our own echo, or dup
        memory = [rec, ...memory];
        notify();
      },
    )
    .subscribe();
}

// ── Public API ──────────────────────────────────────────────────────────────
export function readWishes(): WishRecord[] {
  if (isSupabaseConfigured()) {
    initSupabase();
    return memory;
  }
  return loadLocal();
}

/**
 * Add a wish. Returns the new record immediately (optimistic), or `null` if
 * rejected (invalid length, or a duplicate-of-last within the spam window).
 */
export function addWish(input: {
  name: string;
  avatarId?: string;
  body: string;
}): WishRecord | null {
  const body = input.body.trim();
  const name = input.name.trim() || "Guest";
  if (body.length < 1 || body.length > WISH_MAX_LENGTH) return null;

  const configured = isSupabaseConfigured();
  const list = configured ? memory : loadLocal();
  const last = list[0];
  if (
    last &&
    last.name === name &&
    last.body === body &&
    Date.now() - last.createdAt < MIN_INTERVAL_MS
  ) {
    return null;
  }

  const wish: WishRecord = {
    id: makeId(),
    name,
    body,
    createdAt: Date.now(),
    ...(input.avatarId ? { avatarId: input.avatarId } : {}),
  };

  if (configured) {
    memory = [wish, ...memory];
    notify();
    const sb = getSupabaseClient();
    if (sb) {
      sb.from("party_wishes")
        .insert({
          id: wish.id,
          session_id: getSessionId(),
          name,
          avatar_id: input.avatarId ?? null,
          body,
        })
        .then(
          () => {},
          () => {},
        );
    }
  } else {
    persistLocal([wish, ...loadLocal()]);
  }

  return wish;
}

/** React hook: reactive list of wishes (newest first). Loads after mount. */
export function useWishesLive(): WishRecord[] {
  const [list, setList] = useState<WishRecord[]>([]);
  useEffect(() => {
    if (isSupabaseConfigured()) initSupabase();
    setList(readWishes());
    return subscribe(() => setList([...memory]));
  }, []);
  return list;
}
