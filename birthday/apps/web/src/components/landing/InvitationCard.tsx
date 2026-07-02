import { EVENT } from "@dvb/config";
import styles from "./InvitationCard.module.css";

interface InvitationCardProps {
  audioUnlocked: boolean;
  onAccept: () => void;
  onAlreadyAccepted: () => void;
}

/** Formats an ISO date (YYYY-MM-DD) as e.g. "June 15, 2026". */
function formatEventDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function InvitationCard({
  audioUnlocked,
  onAccept,
  onAlreadyAccepted,
}: InvitationCardProps) {
  return (
    <section className={styles.card}>
      <div className={styles.starRow} aria-hidden>
        ★ ✦ ★
      </div>

      <p className={styles.kicker}>✦ You are cordially invited ✦</p>

      <h1 className={styles.wordmark}>
        <span className={styles.line1}>DARSHITA&apos;S</span>
        <span className={styles.line2}>VIRTUAL BIRTHDAY</span>
      </h1>

      <p className={styles.subtitle}>
        {EVENT.subtitle} · {formatEventDate(EVENT.date)}
      </p>

      <div className={styles.actions}>
        <button className={styles.accept} type="button" onClick={onAccept}>
          🎉 Accept
        </button>
        <button className={styles.already} type="button" onClick={onAlreadyAccepted}>
          ♥ Already Accepted
        </button>
      </div>

      <p className={styles.helper}>
        {audioUnlocked
          ? "♪ music ready — the track arrives soon ✨"
          : "(music unlocks on your first click ✨)"}
      </p>
    </section>
  );
}
