import { EVENT } from "@dvb/config";
import { Panel } from "../../ui/Panel";
import { GuestCount } from "./GuestCount";
import { ViewerCount } from "./ViewerCount";
import styles from "./TopBar.module.css";

/**
 * Top-left title/status card + top-right Joined tile (M13a).
 * Viewer/Joined counts become real cross-visitor totals in M13b (Supabase);
 * until then these stay honest placeholders — never a fake global number.
 */
export function TopBar() {
  return (
    <>
      <Panel className={styles.titleCard}>
        <span className={styles.titleText}>
          <span className={styles.title}>{EVENT.title}</span>
          <span className={styles.status}>
            <span className={styles.dot} aria-hidden /> <ViewerCount /> Viewers
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
      </div>
    </>
  );
}
