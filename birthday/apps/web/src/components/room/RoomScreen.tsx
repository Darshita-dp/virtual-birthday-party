import { RoomStage } from "./RoomStage";
import { RoomCharacters } from "./RoomCharacters";
import { TopBar } from "./hud/TopBar";
import { BottomDock } from "./hud/BottomDock";
import styles from "./RoomScreen.module.css";

/**
 * Static birthday-room screen (M2 + M3). Scrollable/zoomable room with in-world
 * characters (host + sample guests), plus a fixed compact HUD overlay. Only the
 * Wishes panel toggles; no movement, multiplayer, or backend.
 */
export function RoomScreen() {
  return (
    <main className={styles.screen} aria-label="Birthday room">
      <RoomStage>
        <RoomCharacters />
      </RoomStage>
      <div className={styles.hud}>
        <TopBar />
        <BottomDock />
      </div>
    </main>
  );
}
