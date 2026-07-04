"use client";

import { useEffect, useState } from "react";
import { getAvatar, getAvatarSrc } from "@/data/avatars";
import { getSessionId, readSession } from "@/hooks/useGuestSession";
import { computePlacement, usePartyGuests } from "@/hooks/usePartyGuests";
import { Character, type CharacterData } from "./Character";
import { CHARACTERS } from "./characters.data";

/**
 * Renders the fixed host (Darshita) plus every joined guest (M15). Guests come
 * from Supabase (`usePartyGuests`) with the current visitor rendered
 * optimistically from their local session so their own avatar appears instantly
 * and is de-duped against the confirmed Supabase row by session_id. When
 * Supabase is not configured, `usePartyGuests` returns [] and only the host +
 * local self guest render — the exact previous local-only behavior.
 */

interface NormalizedGuest {
  sessionId: string;
  name: string;
  avatarId: string;
  xPct: number;
  yPct: number;
  heightPct: number;
}

function toCharacter(g: NormalizedGuest, idPrefix: string): CharacterData {
  const avatar = getAvatar(g.avatarId);
  return {
    id: `${idPrefix}:${g.sessionId}`,
    name: g.name,
    isHost: false,
    xPct: g.xPct,
    yPct: g.yPct,
    heightPct: g.heightPct,
    src: getAvatarSrc(g.avatarId),
    skin: avatar?.skin,
    hair: avatar?.hair,
    outfit: avatar?.outfit,
    hat: avatar?.hat,
  };
}

export function RoomCharacters() {
  const remoteGuests = usePartyGuests();
  const [self, setSelf] = useState<NormalizedGuest | null>(null);

  useEffect(() => {
    const session = readSession();
    if (!session) return;
    const sessionId = getSessionId();
    const pos = computePlacement(sessionId);
    setSelf({
      sessionId,
      name: session.name,
      avatarId: session.avatarId,
      xPct: pos.xPct,
      yPct: pos.yPct,
      heightPct: pos.heightPct,
    });
  }, []);

  const remoteChars = remoteGuests
    .filter((g) => g.session_id !== self?.sessionId)
    .map((g) =>
      toCharacter(
        {
          sessionId: g.session_id,
          name: g.name,
          avatarId: g.avatar_id,
          xPct: g.x_pct,
          yPct: g.y_pct,
          heightPct: g.height_pct,
        },
        "guest",
      ),
    );

  return (
    <>
      {CHARACTERS.map((c) => (
        <Character key={c.id} {...c} />
      ))}
      {remoteChars.map((c) => (
        <Character key={c.id} {...c} />
      ))}
      {self && <Character {...toCharacter(self, "self")} />}
    </>
  );
}
