"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAmbientMusic, type UseAmbientMusic } from "@/hooks/useAmbientMusic";

/**
 * Global ambient music (M11). Mounted once in app/layout.tsx, above both the
 * landing page and /party, so the SAME audio element and playback state
 * persist across client-side route changes — no restart, no duplicate
 * `<audio>`. Attempts to autoplay as soon as the app loads (landing or a
 * direct /party visit); if the browser blocks it, useAmbientMusic's one-shot
 * document-level pointerdown/keydown fallback starts it on the first gesture
 * anywhere in the app.
 */
const MusicContext = createContext<UseAmbientMusic | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const music = useAmbientMusic({ autoStart: true });
  return <MusicContext.Provider value={music}>{children}</MusicContext.Provider>;
}

/** Reads the single global music state. Must be used within <MusicProvider>. */
export function useMusic(): UseAmbientMusic {
  const ctx = useContext(MusicContext);
  if (!ctx) {
    throw new Error("useMusic must be used within <MusicProvider>");
  }
  return ctx;
}
