import { Panel } from "../../ui/Panel";
import { CutCakeControl } from "../celebrate/CutCakeControl";
import { MusicControl } from "./MusicControl";
import { WishesControl } from "./WishesControl";
import styles from "./BottomDock.module.css";

/**
 * The bottom HUD: Wishes (left), chat pill + Celebrate (center), music (right).
 * Wishes and Celebrate are functional; chat input is a styled placeholder (chat
 * isn't wired yet).
 */
export function BottomDock() {
  return (
    <>
      {/* Bottom-center: Wishes + chat pill + Celebrate */}
      <div className={styles.center}>
        <WishesControl />
        <Panel className={styles.chat}>
          <input
            className={styles.input}
            type="text"
            placeholder="Type a message…"
            readOnly
            aria-label="Message (coming soon)"
          />
          <button
            className={styles.chatIcon}
            type="button"
            aria-disabled="true"
            title="Coming soon"
            aria-label="Emoji (coming soon)"
          >
            😊
          </button>
          <button
            className={styles.chatSend}
            type="button"
            aria-disabled="true"
            title="Coming soon"
            aria-label="Send (coming soon)"
          >
            ➤
          </button>
        </Panel>

        <CutCakeControl />
      </div>

      {/* Bottom-right: Music */}
      <div className={styles.utility}>
        <MusicControl />
      </div>
    </>
  );
}
