/**
 * Realtime tunables shared by client and server. Values are starting points to
 * be validated under load (M8). Wired into the Colyseus room in M3+.
 */
export const REALTIME = {
  /** Server simulation ticks per second. */
  tickRate: 20,

  /** Colyseus state patch interval, in milliseconds. */
  patchRateMs: 50,

  /** Soft cap per room instance; overflow shards to a new instance. */
  maxGuestsPerInstance: 150,

  /** Radius (px) defining "nearby" for proximity chat/emotes. */
  nearbyRadiusPx: 400,

  /** Grace window (seconds) to reconnect before a player is removed. */
  reconnectionSeconds: 30,
} as const;

export type RealtimeConfig = typeof REALTIME;
