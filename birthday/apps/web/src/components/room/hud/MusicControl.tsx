"use client";

import { Panel } from "../../ui/Panel";
import { useMusic } from "@/providers/MusicProvider";
import styles from "./MusicControl.module.css";

/**
 * Compact music player (M7b/M11, extended in M13a): ♪ icon, live track title,
 * previous/play-pause/next controls, and a slim progress bar. Reads/controls
 * the single app-wide audio element owned by MusicProvider — this component
 * never creates its own, and track switching reassigns `.src` on that same
 * element (no duplicate audio instances). Missing or broken audio surfaces as
 * a clean "Unavailable" disabled state.
 */
export function MusicControl() {
  const { playing, loading, error, progress, trackTitle, toggle, next, previous } = useMusic();

  const title = error ? "Unavailable" : loading && !playing ? "Loading…" : trackTitle;
  const playIcon = playing ? "⏸" : "⏵";
  const playAria = error ? "Music unavailable" : playing ? "Pause music" : "Play music";

  return (
    <Panel className={`${styles.card} ${playing ? styles.playing : ""}`.trim()}>
      <div className={styles.row}>
        <span className={styles.icon} aria-hidden>
          ♪
        </span>
        <span className={styles.title}>{title}</span>
      </div>

      <div className={styles.transport}>
        <button
          className={styles.step}
          type="button"
          onClick={previous}
          disabled={error}
          aria-label="Previous track"
        >
          ⏮
        </button>
        <button
          className={styles.play}
          type="button"
          onClick={toggle}
          disabled={error || loading}
          title={error ? "Music unavailable" : undefined}
          aria-label={playAria}
          aria-pressed={playing}
        >
          {playIcon}
        </button>
        <button
          className={styles.step}
          type="button"
          onClick={next}
          disabled={error}
          aria-label="Next track"
        >
          ⏭
        </button>
      </div>

      <div className={styles.progressTrack} aria-hidden>
        <span
          className={styles.progressFill}
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </Panel>
  );
}
