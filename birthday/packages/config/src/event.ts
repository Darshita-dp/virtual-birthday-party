/**
 * Event metadata (config-driven so the engine can be re-skinned per event).
 * Real values are confirmed before launch; these match the planning docs.
 */
export const EVENT = {
  slug: "darshita",
  title: "Darshita's Virtual Birthday",
  subtitle: "a cozy pixel party",
  /** ISO date — display formatting happens in the UI layer. */
  date: "2026-06-15",
  theme: "pixel-garden",
} as const;

export type EventConfig = typeof EVENT;
