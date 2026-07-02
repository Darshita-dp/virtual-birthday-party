"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { readSession, saveSession } from "@/hooks/useGuestSession";
import { ROUTES } from "@/lib/routes";
import { InvitationCard } from "./InvitationCard";
import { RsvpModal } from "./RsvpModal";
import styles from "./LandingScreen.module.css";

const FADE_MS = 280;

/**
 * Invitation landing (M10). Renders the full pixel-art scene as a single
 * background image (`/landing/landing-bg.png`) and overlays only the functional
 * buttons + a small date/info row. RSVP + fade + navigation orchestration is
 * unchanged.
 */
export function LandingScreen() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [initialName, setInitialName] = useState("");
  const [initialAvatarId, setInitialAvatarId] = useState<string | null>(null);

  const enterParty = useCallback(() => {
    if (leaving) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      router.push(ROUTES.PARTY);
      return;
    }

    setLeaving(true);
    window.setTimeout(() => router.push(ROUTES.PARTY), FADE_MS);
  }, [leaving, router]);

  const openRsvp = useCallback(() => {
    const existing = readSession();
    setInitialName(existing?.name ?? "");
    setInitialAvatarId(existing?.avatarId ?? null);
    setRsvpOpen(true);
  }, []);

  const handleAlreadyAccepted = useCallback(() => {
    if (readSession()) {
      enterParty();
      return;
    }
    openRsvp();
  }, [enterParty, openRsvp]);

  const handleSubmit = useCallback(
    (name: string, avatarId: string) => {
      saveSession({ name, avatarId });
      setRsvpOpen(false);
      enterParty();
    },
    [enterParty],
  );

  return (
    <main className={styles.stage}>
      <div className={styles.frame}>
        {/* Large single-scene background — pixel-art illustration includes the
            wordmark and invitation copy; kept as a plain <img> so Next's
            optimizer doesn't rescale/reencode the pixel art. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/landing/landing-bg.png"
          alt="Darshita's Birthday Party — you're invited to a magical birthday bash"
          className={styles.bg}
          decoding="async"
        />
        <InvitationCard onAccept={openRsvp} onAlreadyAccepted={handleAlreadyAccepted} />
      </div>

      <RsvpModal
        open={rsvpOpen}
        initialName={initialName}
        initialAvatarId={initialAvatarId}
        onClose={() => setRsvpOpen(false)}
        onSubmit={handleSubmit}
      />
      <div className={`${styles.fade} ${leaving ? styles.fadeActive : ""}`} aria-hidden />
    </main>
  );
}
