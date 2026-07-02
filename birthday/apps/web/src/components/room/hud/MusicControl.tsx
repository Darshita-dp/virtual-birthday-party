"use client";

import { Panel } from "../../ui/Panel";
import { useAmbientMusic } from "@/hooks/useAmbientMusic";
import styles from "./MusicControl.module.css";

/**
 * Mini music player (M7b): a small polished glass card with ♪ icon, track
 * title, live progress bar, and a play/pause circle. Attempts to autostart on
 * mount and gracefully falls back to Paused if the browser blocks. Missing or
 * broken audio surfaces as a clean "Unavailable" disabled state.
 */
export function MusicControl() {
  const { playing, loading, error, progress, toggle } = useAmbientMusic({ autoStart: true });

  const title = error ? "Unavailable" : loading && !playing ? "Loading…" : "Lo-fi Birthday";
  const buttonIcon = playing ? "⏸" : "⏵";
  const buttonAria = error ? "Music unavailable" : playing ? "Pause music" : "Play music";

  return (
    <Panel className={`${styles.card} ${playing ? styles.playing : ""}`.trim()}>
      <div className={styles.row}>
        <span className={styles.icon} aria-hidden>
          ♪
        </span>
        <span className={styles.title}>{title}</span>
        <button
          className={styles.play}
          type="button"
          onClick={toggle}
          disabled={error || loading}
          title={error ? "Music unavailable" : undefined}
          aria-label={buttonAria}
          aria-pressed={playing}
        >
          {buttonIcon}
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
