import styles from "./InvitationCard.module.css";

interface InvitationCardProps {
  onAccept: () => void;
  onAlreadyAccepted: () => void;
}

/**
 * The overlay for the landing page: just the two real HTML buttons. All
 * title / kicker / wordmark / subtitle / date copy is baked into the
 * background image; this overlay only adds the interactive bits. Position is
 * tuned in InvitationCard.module.css (`.actions`) — a single-value tweak.
 */
export function InvitationCard({ onAccept, onAlreadyAccepted }: InvitationCardProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.actions}>
        <button
          className={styles.accept}
          type="button"
          onClick={onAccept}
          aria-label="Accept invite"
        >
          <span aria-hidden></span> Accept Invite
        </button>
        <button
          className={styles.already}
          type="button"
          onClick={onAlreadyAccepted}
          aria-label="Already accepted — enter party"
        >
          <span aria-hidden></span> Accepted <span aria-hidden></span>
        </button>
      </div>
    </div>
  );
}
