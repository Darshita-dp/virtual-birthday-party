"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAudioUnlock } from "@/hooks/useAudioUnlock";
import { readSession, saveSession } from "@/hooks/useGuestSession";
import { ROUTES } from "@/lib/routes";
import { Clouds } from "./Clouds";
import { StarField } from "./StarField";
import { InvitationCard } from "./InvitationCard";
import { RsvpModal } from "./RsvpModal";
import styles from "./LandingScreen.module.css";

const FADE_MS = 280;

/**
 * Invitation landing orchestrator: first-click audio unlock, the RSVP flow
 * (name + avatar, saved to localStorage), a smooth fade-out, and navigation to
 * the birthday-room route.
 */
export function LandingScreen() {
  const router = useRouter();
  const { unlocked } = useAudioUnlock();
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
    <main className={styles.screen}>
      <Clouds />
      <StarField />
      <InvitationCard
        audioUnlocked={unlocked}
        onAccept={openRsvp}
        onAlreadyAccepted={handleAlreadyAccepted}
      />
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
