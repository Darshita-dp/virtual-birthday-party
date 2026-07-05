"use client";

import styles from "./AboutPartyButton.module.css";

interface AboutPartyButtonProps {
  onClick: () => void;
}

/** Small round "i" info button (bottom-left corner) — opens the About This Party modal. */
export function AboutPartyButton({ onClick }: AboutPartyButtonProps) {
  return (
    <button
      className={styles.infoBtn}
      type="button"
      onClick={onClick}
      aria-label="About this party"
      title="About this party"
    >
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        focusable="false"
      >
        <circle cx="12" cy="12" r="9" />
        <line x1="12" y1="11" x2="12" y2="16.5" />
        <circle cx="12" cy="7.6" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    </button>
  );
}
