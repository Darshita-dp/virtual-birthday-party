/**
 * Avatar catalog (M4a). Guests store an `avatarId`; the room and picker resolve
 * it to a cropped PNG at /assets/avatars/<id>.png. The fallback palette is used
 * to draw a soft placeholder when the PNG is missing (picker) or fails to load
 * (room). Labels are neutral for now and can be renamed after the real crops
 * are added. The full sprite sheet is NOT used directly — individual crops only.
 */
export interface AvatarOption {
  id: string;
  label: string;
  src: string;
  // Fallback palette (soft placeholder if the PNG is absent).
  skin?: string;
  hair?: string;
  outfit?: string;
  hat?: string;
}

type Palette = Pick<AvatarOption, "skin" | "hair" | "outfit" | "hat">;

const PALETTES: Palette[] = [
  { skin: "#f0c8a0", hair: "#3a2b40", outfit: "#8a66e0", hat: "#ffc2dd" },
  { skin: "#d8a878", hair: "#5a3da6", outfit: "#6fa3e0", hat: "#f9da86" },
  { skin: "#c89060", hair: "#e85a9b", outfit: "#c6b2f2", hat: "#ff9dc8" },
  { skin: "#e8b890", hair: "#7a4a2b", outfit: "#93beec", hat: "#f77ab0" },
  { skin: "#f0c8a0", hair: "#4a3a55", outfit: "#a98ce8", hat: "#fdebb4" },
  { skin: "#b87a50", hair: "#2e1a55", outfit: "#f77ab0", hat: "#b8d6f4" },
  { skin: "#f0c8a0", hair: "#c8722e", outfit: "#ff9dc8", hat: "#c6b2f2" },
  { skin: "#d8a878", hair: "#6fa3e0", outfit: "#fdebb4", hat: "#ff9dc8" },
  { skin: "#c89060", hair: "#8a66e0", outfit: "#6fa3e0", hat: "#f9da86" },
  { skin: "#e8b890", hair: "#e85a9b", outfit: "#b8d6f4", hat: "#ffc2dd" },
  { skin: "#f0c8a0", hair: "#2e1a55", outfit: "#c6b2f2", hat: "#f77ab0" },
  { skin: "#b87a50", hair: "#c8722e", outfit: "#8a66e0", hat: "#fdebb4" },
  { skin: "#d8a878", hair: "#4a3a55", outfit: "#ff9dc8", hat: "#b8d6f4" },
  { skin: "#f0c8a0", hair: "#5a3da6", outfit: "#93beec", hat: "#ffc2dd" },
  { skin: "#c89060", hair: "#3a2b40", outfit: "#a98ce8", hat: "#f9da86" },
];

export const AVATARS: AvatarOption[] = PALETTES.map((p, i) => {
  const n = String(i + 1).padStart(2, "0");
  return { id: `avatar-${n}`, label: `Avatar ${n}`, src: `/assets/avatars/avatar-${n}.png`, ...p };
});

export const AVATARS_BY_ID: Record<string, AvatarOption> = Object.fromEntries(
  AVATARS.map((a) => [a.id, a]),
);

export const DEFAULT_AVATAR_ID = "avatar-01";

export function getAvatar(id: string): AvatarOption | undefined {
  return AVATARS_BY_ID[id];
}

export function getAvatarSrc(id: string): string | undefined {
  return AVATARS_BY_ID[id]?.src;
}
