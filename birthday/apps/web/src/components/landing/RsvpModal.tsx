"use client";

import { useEffect, useId, useRef, useState } from "react";
import { getAvatar } from "@/data/avatars";
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
 * RSVP flow (M4a, redesigned in M10b polish): the ornate frame, title,
 * subtitle, slot boxes, name input frame, and CTA bar are all baked into the
 * decorative background at /landing/avatar-modal-bg.png. Real HTML controls
 * (12 avatar buttons, name input, Enter Party CTA, close ✕, Back to Invite)
 * are absolutely positioned over the drawn regions. Session/save contract,
 * keyboard behavior, and prop shape are byte-for-byte the same.
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
  // Resolve the current avatarId against the live catalog so a stale id from an
  // earlier session (e.g. avatar-13 from before the M10b polish trim) does not
  // count as a valid selection.
  const selectedAvatar = avatarId != null ? getAvatar(avatarId) : undefined;
  const canSubmit = trimmed.length > 0 && selectedAvatar != null;

  const submit = () => {
    if (!canSubmit || selectedAvatar == null) return;
    onSubmit(trimmed.slice(0, 24), selectedAvatar.id);
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.frame}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className={styles.srTitle}>
          Choose Your Avatar
        </h2>

        {/* Ornate decorative frame — title, subtitle, slots, name-input frame,
            and CTA bar are all drawn into this image. Real controls overlay it. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/landing/avatar-modal-bg.png"
          alt=""
          className={styles.bg}
          decoding="async"
        />

        <div className={styles.overlay}>
          <button
            className={styles.close}
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>

          <div className={styles.gridWrap}>
            <AvatarPicker value={avatarId} onChange={setAvatarId} />
          </div>

          <input
            ref={nameRef}
            className={styles.input}
            type="text"
            value={name}
            maxLength={24}
            placeholder="Here"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSubmit) submit();
            }}
            aria-label="Your name"
          />

          <button
            className={styles.enter}
            type="button"
            disabled={!canSubmit}
            onClick={submit}
          >
            Enter Party
          </button>
        </div>
      </div>

      <button
        className={styles.back}
        type="button"
        onClick={onClose}
        aria-label="Back to invite"
      >
        ← Back to Invite
      </button>
    </div>
  );
}
