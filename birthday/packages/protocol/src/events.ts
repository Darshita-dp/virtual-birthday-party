/**
 * Realtime event names — the shared contract between the web client and the
 * Colyseus server. Names only; payload shapes live in ./types and the handlers
 * are implemented per milestone (movement M3, chat M4, wishes/emotes/dance M5,
 * cake M6). No logic here.
 */

/** Messages the client sends to the server (intents). */
export const ClientEvents = {
  Move: "move",
  Chat: "chat",
  Emote: "emote",
  Dance: "dance",
  WishAdded: "wish_added",
  CutCake: "cut_cake",
} as const;
export type ClientEvent = (typeof ClientEvents)[keyof typeof ClientEvents];

/** Messages the server broadcasts to clients (beyond state patches). */
export const ServerEvents = {
  Chat: "chat",
  Emote: "emote",
  System: "system",
  CakeCut: "cake_cut",
  RateLimited: "rate_limited",
  Error: "error",
} as const;
export type ServerEvent = (typeof ServerEvents)[keyof typeof ServerEvents];
