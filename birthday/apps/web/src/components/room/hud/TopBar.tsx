import { EVENT } from "@dvb/config";
import { Panel } from "../../ui/Panel";
import { GuestCount } from "./GuestCount";
import styles from "./TopBar.module.css";

/** Top-left title card + top-right guest count and settings (placeholders). */
export function TopBar() {
  return (
    <>
      <Panel className={styles.titleCard}>
        <span className={styles.cake} aria-hidden>
          🎂
        </span>
        <span className={styles.titleText}>
          <span className={styles.title}>{EVENT.title}</span>
          <span className={styles.status}>
            <span className={styles.dot} aria-hidden /> Online: —
          </span>
        </span>
      </Panel>

      <div className={styles.right}>
        <Panel className={styles.guests}>
          <span className={styles.guestIcon} aria-hidden>
            👥
          </span>
          <GuestCount />
        </Panel>
        <button
          className={styles.settings}
          type="button"
          aria-disabled="true"
          title="Coming soon"
          aria-label="Settings (coming soon)"
        >
          ⚙
        </button>
      </div>
    </>
  );
}
