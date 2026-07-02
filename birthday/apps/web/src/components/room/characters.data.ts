import type { CharacterData } from "./Character";

/**
 * Static character placement (M3). Positions are percentages of the room world
 * (xPct/yPct = feet anchor; heightPct = size relative to world height). Tune
 * these to match the room art — this list is the single source of placement and
 * is designed to be swapped for dynamic player entities later (M4/M5).
 *
 * Host uses the real sprite at /assets/characters/host-darshita.png (with a
 * clean pixel fallback if the file is absent).
 */

/**
 * Guests now come from real RSVP sessions (M4b), not a hand-authored list.
 * Keep this false — the SAMPLE_GUESTS below stay only as inert reference data
 * and are never rendered in the room.
 */
export const SHOW_SAMPLE_GUESTS = false;

const HOST: CharacterData = {
  id: "host",
  name: "Darshita",
  isHost: true,
  xPct: 53,
  yPct: 40.5,
  heightPct: 10,
  src: "/assets/characters/darshita.png",
  skin: "#f0c8a0",
  hair: "#c8722e",
  outfit: "#ff9dc8",
  hat: "#f77ab0",
};

/**
 * Sample guests (M4) — 6 soft background attendees, all smaller than Darshita
 * (heightPct 10) and rendered without name tags via SoftGuest. First-pass
 * positions kept off the cake, off Darshita's column, and off the piano/
 * fountain/seating; tune xPct/yPct here after a visual check.
 */
const SAMPLE_GUESTS: CharacterData[] = [
  { id: "g1", name: "Ananya", xPct: 35, yPct: 40, heightPct: 6.5, skin: "#f0c8a0", hair: "#3a2b40", outfit: "#8a66e0", hat: "#ffc2dd" },
  { id: "g2", name: "Rohan", xPct: 68, yPct: 40, heightPct: 6.5, skin: "#d8a878", hair: "#5a3da6", outfit: "#6fa3e0", hat: "#f9da86" },
  { id: "g3", name: "Meera", xPct: 25, yPct: 52, heightPct: 7.5, skin: "#f0c8a0", hair: "#e85a9b", outfit: "#c6b2f2", hat: "#ff9dc8" },
  { id: "g4", name: "Kabir", xPct: 73, yPct: 52, heightPct: 7.5, skin: "#c89060", hair: "#7a4a2b", outfit: "#93beec", hat: "#f77ab0" },
  { id: "g5", name: "Meili", xPct: 40, yPct: 66, heightPct: 8, skin: "#f0c8a0", hair: "#4a3a55", outfit: "#a98ce8", hat: "#fdebb4" },
  { id: "g6", name: "Vivaan", xPct: 64, yPct: 64, heightPct: 8, skin: "#e8b890", hair: "#2e1a55", outfit: "#f77ab0", hat: "#b8d6f4" },
];

export const CHARACTERS: CharacterData[] = SHOW_SAMPLE_GUESTS ? [HOST, ...SAMPLE_GUESTS] : [HOST];
