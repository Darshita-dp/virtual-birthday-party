import { EVENT } from "@dvb/config";
import styles from "./InvitationCard.module.css";

interface InvitationCardProps {
  onAccept: () => void;
  onAlreadyAccepted: () => void;
}

/** Formats an ISO date (YYYY-MM-DD) as e.g. "June 15, 2026". */
function formatEventDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/**
 * The overlay for the landing page: a small date / status line and the two
 * real HTML buttons. All title / kicker / wordmark / subtitle copy is baked
 * into the background image; this overlay only adds the interactive bits.
 * Positions are tuned in InvitationCard.module.css (`.dateRow`, `.actions`) —
 * easy single-value tweaks after visual testing.
 */
export function InvitationCard({ onAccept, onAlreadyAccepted }: InvitationCardProps) {
  return (
    <div className={styles.overlay}>
      <p className={styles.dateRow}>{formatEventDate(EVENT.date)} · Party is live</p>
      <div className={styles.actions}>
        <button
          className={styles.accept}
          type="button"
          onClick={onAccept}
          aria-label="Accept invite"
        >
          <span aria-hidden>💗</span> Accept Invite
        </button>
        <button
          className={styles.already}
          type="button"
          onClick={onAlreadyAccepted}
          aria-label="Already accepted — enter party"
        >
          <span aria-hidden>✓</span> Accepted <span aria-hidden>✓</span>
        </button>
      </div>
    </div>
  );
}
