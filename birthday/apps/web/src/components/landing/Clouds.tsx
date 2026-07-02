import styles from "./Clouds.module.css";

/**
 * Floating lavender pixel clouds. Built from SVG blocks (no image assets) to stay
 * lightweight for M1; can be swapped for sprite art later via the ASSET_BIBLE
 * pipeline without changing this component's API. Purely decorative.
 */

const CLOUD_CLASSES = [
  styles.cloud1,
  styles.cloud2,
  styles.cloud3,
  styles.cloud4,
  styles.cloud5,
];

function PixelCloud() {
  return (
    <svg
      className={styles.svg}
      viewBox="0 0 32 16"
      preserveAspectRatio="none"
      aria-hidden
      focusable="false"
    >
      <g className={styles.body}>
        <rect x="8" y="3" width="7" height="4" />
        <rect x="15" y="1" width="9" height="6" />
        <rect x="5" y="6" width="22" height="5" />
        <rect x="2" y="9" width="28" height="4" />
      </g>
      <rect className={styles.shade} x="2" y="11" width="28" height="2" />
    </svg>
  );
}

export function Clouds() {
  return (
    <div className={styles.layer} aria-hidden>
      {CLOUD_CLASSES.map((cls, i) => (
        <div key={i} className={`${styles.cloud} ${cls}`}>
          <PixelCloud />
        </div>
      ))}
    </div>
  );
}
