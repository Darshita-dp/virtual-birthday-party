import styles from "./StarField.module.css";

/**
 * Twinkling stars. Positions are a fixed, deterministic list (not random) so the
 * server-rendered and client-rendered markup match — no hydration mismatch.
 * Purely decorative.
 */
interface Star {
  x: number;
  y: number;
  size: number;
  delay: number;
}

const STARS: ReadonlyArray<Star> = [
  { x: 5, y: 8, size: 2, delay: 0 },
  { x: 12, y: 20, size: 1, delay: 1.2 },
  { x: 18, y: 6, size: 2, delay: 0.6 },
  { x: 24, y: 32, size: 1, delay: 2.1 },
  { x: 30, y: 14, size: 3, delay: 0.3 },
  { x: 36, y: 26, size: 1, delay: 1.8 },
  { x: 42, y: 9, size: 2, delay: 2.6 },
  { x: 48, y: 18, size: 1, delay: 0.9 },
  { x: 54, y: 5, size: 2, delay: 1.5 },
  { x: 60, y: 28, size: 1, delay: 0.2 },
  { x: 66, y: 12, size: 3, delay: 2.3 },
  { x: 72, y: 22, size: 1, delay: 1.0 },
  { x: 78, y: 7, size: 2, delay: 0.5 },
  { x: 84, y: 30, size: 1, delay: 1.9 },
  { x: 90, y: 16, size: 2, delay: 2.8 },
  { x: 95, y: 24, size: 1, delay: 0.7 },
  { x: 8, y: 40, size: 1, delay: 1.4 },
  { x: 16, y: 52, size: 2, delay: 0.4 },
  { x: 22, y: 64, size: 1, delay: 2.0 },
  { x: 28, y: 48, size: 2, delay: 1.1 },
  { x: 34, y: 70, size: 1, delay: 0.8 },
  { x: 40, y: 58, size: 3, delay: 2.4 },
  { x: 46, y: 80, size: 1, delay: 1.6 },
  { x: 52, y: 66, size: 2, delay: 0.1 },
  { x: 58, y: 84, size: 1, delay: 2.7 },
  { x: 64, y: 54, size: 2, delay: 1.3 },
  { x: 70, y: 76, size: 1, delay: 0.6 },
  { x: 76, y: 62, size: 2, delay: 2.2 },
  { x: 82, y: 88, size: 1, delay: 1.7 },
  { x: 88, y: 50, size: 2, delay: 0.9 },
  { x: 94, y: 72, size: 1, delay: 2.5 },
  { x: 3, y: 88, size: 1, delay: 1.0 },
  { x: 14, y: 92, size: 2, delay: 0.3 },
  { x: 50, y: 38, size: 1, delay: 2.9 },
  { x: 38, y: 90, size: 1, delay: 1.5 },
  { x: 86, y: 94, size: 2, delay: 0.2 },
];

export function StarField() {
  return (
    <div className={styles.field} aria-hidden>
      {STARS.map((s, i) => (
        <span
          key={i}
          className={styles.star}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
