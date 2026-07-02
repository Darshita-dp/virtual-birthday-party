/**
 * Local guest identity (M4a) — name + chosen avatar, persisted in localStorage.
 * No backend/persistence beyond the browser yet. SSR-safe and resilient to
 * storage being unavailable (private mode) via an in-memory fallback.
 */
export interface GuestSession {
  name: string;
  avatarId: string;
  acceptedAt: number;
}

const STORAGE_KEY = "dvb.guestSession.v1";

let memory: GuestSession | null = null;

function isValid(v: unknown): v is GuestSession {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as GuestSession).name === "string" &&
    typeof (v as GuestSession).avatarId === "string"
  );
}

export function readSession(): GuestSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isValid(parsed)) return parsed;
    }
  } catch {
    /* storage blocked — fall through to memory */
  }
  return memory;
}

export function saveSession(data: { name: string; avatarId: string }): GuestSession {
  const session: GuestSession = { name: data.name, avatarId: data.avatarId, acceptedAt: Date.now() };
  memory = session;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* storage blocked — memory keeps it for this tab */
  }
  return session;
}

export function clearSession(): void {
  memory = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function hasSession(): boolean {
  return readSession() !== null;
}
