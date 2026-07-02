"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AvatarPicker } from "./AvatarPicker";
import styles from "./RsvpModal.module.css";

interface RsvpModalProps {
  open: boolean;
  initialName?: string;
  initialAvatarId?: string | null;
  onClose: () => void;
  onSubmit: (name: string, avatarId: string) => void;
}

/**
 * RSVP flow (M4a): enter a name + choose an avatar, then enter the party.
 * Local UI only — the choice is persisted by the caller (localStorage).
 */
export function RsvpModal({
  open,
  initialName = "",
  initialAvatarId = null,
  onClose,
  onSubmit,
}: RsvpModalProps) {
  const [name, setName] = useState(initialName);
  const [avatarId, setAvatarId] = useState<string | null>(initialAvatarId);
  const nameRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    setName(initialName);
    setAvatarId(initialAvatarId);
    const focus = window.setTimeout(() => nameRef.current?.focus(), 40);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focus);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, initialName, initialAvatarId, onClose]);

  if (!open) return null;

  const trimmed = name.trim();
  const canSubmit = trimmed.length > 0 && avatarId != null;

  const submit = () => {
    if (!canSubmit || avatarId == null) return;
    onSubmit(trimmed.slice(0, 24), avatarId);
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            Join the party 🎉
          </h2>
          <button className={styles.close} type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <label className={styles.field}>
          <span className={styles.label}>Your name</span>
          <input
            ref={nameRef}
            className={styles.input}
            type="text"
            value={name}
            maxLength={24}
            placeholder="Enter your name"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSubmit) submit();
            }}
          />
        </label>

        <div className={styles.pickerWrap}>
          <span className={styles.label}>Choose your avatar</span>
          <AvatarPicker value={avatarId} onChange={setAvatarId} />
        </div>

        <button className={styles.enter} type="button" disabled={!canSubmit} onClick={submit}>
          Enter Party 🎉
        </button>
      </div>
    </div>
  );
}
