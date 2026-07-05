"use client";

import { useState } from "react";
import { RoomStage } from "./RoomStage";
import { RoomCharacters } from "./RoomCharacters";
import { AboutPartyButton } from "./about/AboutPartyButton";
import { AboutPartyModal } from "./about/AboutPartyModal";
import { TopBar } from "./hud/TopBar";
import { BottomDock } from "./hud/BottomDock";
import styles from "./RoomScreen.module.css";

/**
 * Static birthday-room screen (M2 + M3). Scrollable/zoomable room with in-world
 * characters (host + sample guests), plus a fixed compact HUD overlay. Only the
 * Wishes panel toggles; no movement, multiplayer, or backend.
 *
 * M17: fills the full viewport as a horizontal "game" scene. The portrait
 * "rotate your phone" gate lives globally in app/layout.tsx (covering the
 * landing invitation too), so it isn't mounted here.
 *
 * About modal: clicking Darshita or the info button opens the same "About
 * this party" modal — the open state is lifted here since both triggers live
 * in different subtrees (RoomCharacters vs. the HUD).
 */
export function RoomScreen() {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <main className={styles.screen} aria-label="Birthday room">
      <RoomStage>
        <RoomCharacters onHostClick={() => setAboutOpen(true)} />
      </RoomStage>
      <div className={styles.hud}>
        <TopBar />
        <BottomDock />
        <AboutPartyButton onClick={() => setAboutOpen(true)} />
      </div>
      <AboutPartyModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </main>
  );
}
