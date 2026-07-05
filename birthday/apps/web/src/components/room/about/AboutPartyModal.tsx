"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./AboutPartyModal.module.css";

interface AboutPartyModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * "About this party" modal — Darshita's personal note on why this room exists.
 * Opened by clicking Darshita or the info button (see RoomScreen). Portal to
 * <body> so `position: fixed` isn't trapped by an ancestor's transform (same
 * reasoning as CelebrationOverlay).
 */
export function AboutPartyModal({ open, onClose }: AboutPartyModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-party-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id="about-party-title" className={styles.title}>
            About this party
          </h2>
          <button className={styles.close} type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <div className={styles.body}>
          <p>
            Being an international student away from home, I wanted to celebrate my birthday
            with the friends and loved ones who could not be here with me physically.
          </p>
          <p>So, as a developer, I built this virtual birthday party and shared it with them.</p>
          <p>
            This little room is my way of turning distance into connection — a place where
            technology brings us together, even when we are far apart.
          </p>
          <p className={styles.signature}>
            With love,
            <br />
            Darshita
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
