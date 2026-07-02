"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { readSession } from "@/hooks/useGuestSession";
import { addWish, useWishesLive, WISH_MAX_LENGTH } from "@/hooks/useWishes";
import { ROUTES } from "@/lib/routes";
import styles from "./WishesControl.module.css";

type Mode = "list" | "compose";

/**
 * Compact Wishes button + an openable/closable overlay panel showing real,
 * locally-persisted wishes (M6). Docks right on desktop, bottom sheet on
 * mobile. Local-only: reads the guest session for the author name, writes to
 * `dvb.wishes.v1` via useWishes. No backend, no fake sample data.
 */
export function WishesControl() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("list");
  const [draft, setDraft] = useState("");
  const [name, setName] = useState<string | null>(null);
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const panelId = useId();
  const wishes = useWishesLive();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendBtnRef = useRef<HTMLButtonElement>(null);

  // Read the guest session on open (SSR-safe; picks up updates between opens).
  useEffect(() => {
    if (!open) return;
    const s = readSession();
    setName(s?.name ?? null);
    setAvatarId(s?.avatarId ?? null);
  }, [open]);

  // Esc: compose → list, then panel close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (mode === "compose") setMode("list");
      else setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, mode]);

  // Autofocus the textarea when the compose form opens.
  useEffect(() => {
    if (!open || mode !== "compose") return;
    const id = window.setTimeout(() => textareaRef.current?.focus(), 30);
    return () => window.clearTimeout(id);
  }, [open, mode]);

  const trimmed = draft.trim();
  const remaining = WISH_MAX_LENGTH - trimmed.length;
  const nearLimit = remaining >= 0 && remaining <= 30;
  const hasSession = name != null;
  const canPost = hasSession && trimmed.length >= 1 && trimmed.length <= WISH_MAX_LENGTH;

  const openCompose = () => {
    setDraft("");
    setMode("compose");
  };

  const cancelCompose = () => {
    setMode("list");
    setDraft("");
    window.setTimeout(() => sendBtnRef.current?.focus(), 30);
  };

  const submit = () => {
    if (!canPost || name == null) return;
    const w = addWish({ name, avatarId: avatarId ?? undefined, body: draft });
    if (w) {
      setDraft("");
      setMode("list");
      window.setTimeout(() => sendBtnRef.current?.focus(), 30);
    }
  };

  const onTextareaKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  return (
    <>
      <button
        className={styles.trigger}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden>💌</span>
        <span className={styles.triggerLabel}>Wishes</span>
      </button>

      {open && (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} aria-hidden />
          <aside id={panelId} className={styles.panel} role="dialog" aria-label="Birthday Wishes">
            <header className={styles.header}>
              <h2 className={styles.title}>Birthday Wishes 💌</h2>
              <button
                className={styles.close}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close wishes"
              >
                ✕
              </button>
            </header>

            <div className={styles.list}>
              {!hasSession ? (
                <div className={styles.empty}>
                  <p className={styles.emptyText}>
                    Accept the invitation first to leave a wish for Darshita.
                  </p>
                  <Link className={styles.emptyLink} href={ROUTES.LANDING}>
                    Back to invitation →
                  </Link>
                </div>
              ) : wishes.length === 0 ? (
                <p className={styles.note}>No wishes yet — be the first to send one! ✨</p>
              ) : (
                wishes.map((w) => (
                  <article key={w.id} className={styles.card}>
                    <p className={styles.body}>{w.body}</p>
                    <p className={styles.author}>– {w.name}</p>
                  </article>
                ))
              )}
            </div>

            {hasSession &&
              (mode === "list" ? (
                <button
                  ref={sendBtnRef}
                  className={styles.send}
                  type="button"
                  onClick={openCompose}
                >
                  + Send a Wish
                </button>
              ) : (
                <div className={styles.compose}>
                  <textarea
                    ref={textareaRef}
                    className={styles.textarea}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={onTextareaKeyDown}
                    placeholder={`Write a wish for Darshita, ${name}…`}
                    maxLength={WISH_MAX_LENGTH}
                    rows={3}
                    aria-label="Your birthday wish"
                  />
                  <div className={styles.composeFooter}>
                    <span
                      className={`${styles.counter} ${nearLimit ? styles.counterNear : ""}`.trim()}
                      aria-live="polite"
                    >
                      {trimmed.length} / {WISH_MAX_LENGTH}
                    </span>
                    <div className={styles.actions}>
                      <button className={styles.cancel} type="button" onClick={cancelCompose}>
                        Cancel
                      </button>
                      <button
                        className={styles.post}
                        type="button"
                        onClick={submit}
                        disabled={!canPost}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                  <p className={styles.hint}>Ctrl / Cmd + Enter to post</p>
                </div>
              ))}
          </aside>
        </>
      )}
    </>
  );
}
