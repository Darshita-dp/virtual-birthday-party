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
 *
 * Transport icons are inline SVG (not Unicode glyphs like ⏮/⏵/⏭) so they
 * render identically everywhere — some mobile browsers substitute those
 * glyphs with full-color emoji, breaking the soft/glassy look.
 */
function PreviousIcon() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}

export function MusicControl() {
  const { playing, loading, error, progress, trackTitle, toggle, next, previous } = useMusic();

  const title = error ? "Unavailable" : loading && !playing ? "Loading…" : trackTitle;
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
          <PreviousIcon />
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
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          className={styles.step}
          type="button"
          onClick={next}
          disabled={error}
          aria-label="Next track"
        >
          <NextIcon />
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
