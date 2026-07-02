"use client";

import { useEffect, useState } from "react";

/**
 * Local wishes store (M6). Persists to localStorage under `dvb.wishes.v1`,
 * newest first. Same defensive shape as `useGuestSession`: SSR-safe, in-memory
 * fallback when storage is blocked, cross-tab sync via `storage` events.
 * No backend, no fake data.
 */

export interface WishRecord {
  id: string;
  name: string;
  avatarId?: string;
  body: string;
  createdAt: number;
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

function load(): WishRecord[] {
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

function notify(): void {
  listeners.forEach((cb) => cb());
}

function persist(list: WishRecord[]): void {
  memory = list;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* memory-only session */
  }
  notify();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

// Cross-tab sync: another tab writes the same key → refresh + notify.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
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

export function readWishes(): WishRecord[] {
  return load();
}

function makeId(): string {
  return `w_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Add a wish. Returns the new record, or `null` if it was rejected
 * (invalid length or duplicate-of-last within the spam window).
 */
export function addWish(input: {
  name: string;
  avatarId?: string;
  body: string;
}): WishRecord | null {
  const body = input.body.trim();
  const name = input.name.trim() || "Guest";
  if (body.length < 1 || body.length > WISH_MAX_LENGTH) return null;

  const list = load();
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
  persist([wish, ...list]);
  return wish;
}

/**
 * React hook: reactive list of wishes (newest first). Loads after mount so
 * SSR and the first client render match (empty list) — no hydration warning.
 */
export function useWishesLive(): WishRecord[] {
  const [list, setList] = useState<WishRecord[]>([]);
  useEffect(() => {
    setList(load());
    return subscribe(() => setList([...memory]));
  }, []);
  return list;
}
