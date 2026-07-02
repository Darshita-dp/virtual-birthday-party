/**
 * Room world dimensions. Per locked decision, the world is NOT fixed at the
 * prototype size — the architecture must support a larger scrollable world to
 * hold 100+ guests. Consumers (Phaser camera/bounds, Tiled map) read these
 * values; nothing hardcodes raw pixel sizes.
 */
export const WORLD = {
  /** Tile size for the Tiled map / grid. */
  tileSize: 32,

  /** Minimum prototype size — used only for early local iteration. */
  prototype: { width: 2304, height: 1536 },

  /** Target production size for a 100–150+ guest venue (scrollable). */
  target: { width: 3200, height: 2200 },

  /** Share of floor that must remain open/walkable (see DESIGN_SYSTEM §22). */
  walkableAreaTargetRatio: 0.6,
} as const;

export type WorldConfig = typeof WORLD;
