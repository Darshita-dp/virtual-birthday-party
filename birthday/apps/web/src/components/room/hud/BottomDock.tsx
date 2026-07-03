"use client";

import { useState, type KeyboardEvent } from "react";
import { readSession } from "@/hooks/useGuestSession";
import { addWish, WISH_MAX_LENGTH } from "@/hooks/useWishes";
import { Panel } from "../../ui/Panel";
import { CutCakeControl } from "../celebrate/CutCakeControl";
import { MusicControl } from "./MusicControl";
import { WishesControl } from "./WishesControl";
import styles from "./BottomDock.module.css";

/**
 * The bottom HUD: Wishes (left), quick-wish composer + Celebrate (center),
 * music (right). The quick composer (M13a) posts straight into the SAME
 * wishes store the Wishes panel reads/writes (`useWishes`), then opens the
 * panel so the guest sees their wish land — no separate modal step required.
 */
export function BottomDock() {
  const [wishesOpen, setWishesOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const send = () => {
    const trimmed = draft.trim();
    if (trimmed.length === 0) return;
    const session = readSession();
    if (!session) {
      // No local session yet — open the panel, which explains how to RSVP.
      setWishesOpen(true);
      return;
    }
    const wish = addWish({
      name: session.name,
      avatarId: session.avatarId,
      body: trimmed.slice(0, WISH_MAX_LENGTH),
    });
    if (wish) {
      setDraft("");
      setWishesOpen(true);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Bottom-center: Wishes + quick composer + Celebrate */}
      <div className={styles.center}>
        <WishesControl open={wishesOpen} onOpenChange={setWishesOpen} />

        <Panel className={styles.chat}>
          <input
            className={styles.input}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a message…"
            maxLength={WISH_MAX_LENGTH}
            aria-label="Quick wish for Darshita"
          />
          <button
            className={styles.chatIcon}
            type="button"
            aria-disabled="true"
            title="Coming soon"
            aria-label="Emoji (coming soon)"
          >
            <svg
              className={styles.chatIconSvg}
              viewBox="0 0 20 20"
              aria-hidden
              focusable="false"
            >
              <circle cx="10" cy="10" r="8.3" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="7" cy="8.3" r="1.1" fill="currentColor" />
              <circle cx="13" cy="8.3" r="1.1" fill="currentColor" />
              <path
                d="M6.3 12.2c1 1.3 2.3 2 3.7 2s2.7-.7 3.7-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            className={styles.chatSend}
            type="button"
            onClick={send}
            disabled={draft.trim().length === 0}
            aria-label="Send wish"
          >
            ➤
          </button>
        </Panel>

        <CutCakeControl />
      </div>

      {/* Bottom-right: Music */}
      <div className={styles.utility}>
        <MusicControl />
      </div>
    </>
  );
}
