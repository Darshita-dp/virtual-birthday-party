/**
 * Shared protocol types (skeletons). Expanded as milestones land. No runtime
 * logic lives here — types and contracts only.
 */

export type Direction = "down" | "up" | "side";

/** Authoritative per-player state synced by the realtime server (M3). */
export interface PlayerState {
  id: string;
  name: string;
  avatarId: string;
  x: number;
  y: number;
  dir: Direction;
  anim: string;
  isHost: boolean;
  danceOn: boolean;
}

export type ChatScope = "all" | "nearby";

export interface ChatMessagePayload {
  scope: ChatScope;
  text: string;
}

export interface EmotePayload {
  type: string;
}

/** Lightweight, name-only guest identity (no accounts in v1). */
export interface GuestIdentity {
  name: string;
  avatarId: string;
  isHost: boolean;
}
