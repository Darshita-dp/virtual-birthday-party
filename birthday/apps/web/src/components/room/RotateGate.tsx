import styles from "./RotateGate.module.css";

/**
 * Portrait-mode "rotate your phone" gate (M17). Rendered on top of the room but
 * kept hidden by default — a CSS media query reveals it only on small screens
 * held in portrait orientation, so the party room plays as a horizontal game in
 * landscape. Visibility is CSS-only (no JS/orientation API) to stay reliable on
 * iOS Safari, where programmatic orientation locking is unsupported.
 */
export function RotateGate() {
  return (
    <div className={styles.gate} role="dialog" aria-label="Rotate your phone" aria-modal="true">
      <div className={styles.card}>
        <span className={styles.icon} aria-hidden>
          📱
        </span>
        <h2 className={styles.title}>Rotate your phone</h2>
        <p className={styles.subtitle}>This party room works best in landscape mode.</p>
      </div>
    </div>
  );
}
