"use client";

import { useEffect, useState } from "react";
import { getAvatar, getAvatarSrc } from "@/data/avatars";
import { readSession } from "@/hooks/useGuestSession";
import { Character, type CharacterData } from "./Character";
import { CHARACTERS } from "./characters.data";

/**
 * Renders the fixed host (Darshita) plus, if the visitor has RSVP'd, the single
 * self guest read from their localStorage session. The session is read after
 * mount so SSR and the first client render match (host-only) — no hydration
 * mismatch. No mock guests, multiplayer, or backend.
 */
export function RoomCharacters() {
  const [selfGuest, setSelfGuest] = useState<CharacterData | null>(null);

  useEffect(() => {
    const session = readSession();
    if (!session) return;
    const avatar = getAvatar(session.avatarId);
    setSelfGuest({
      id: "self",
      name: session.name, // not shown (guests have no name tag)
      isHost: false,
      xPct: 43,
      yPct: 58,
      heightPct: 8,
      src: getAvatarSrc(session.avatarId),
      skin: avatar?.skin,
      hair: avatar?.hair,
      outfit: avatar?.outfit,
      hat: avatar?.hat,
    });
  }, []);

  return (
    <>
      {CHARACTERS.map((c) => (
        <Character key={c.id} {...c} />
      ))}
      {selfGuest && <Character {...selfGuest} />}
    </>
  );
}
