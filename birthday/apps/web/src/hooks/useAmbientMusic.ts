"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const AUDIO_SRC = "/assets/audio/lofi-birthday.mp3";

interface UseAmbientMusic {
  playing: boolean;
  loading: boolean;
  error: boolean;
  duration: number;
  currentTime: number;
  progress: number; // 0..1
  toggle: () => void;
}

interface Options {
  /** Attempt play() on mount; silently fall back to paused if the browser blocks. */
  autoStart?: boolean;
}

/**
 * Ambient looping music (M7b). Wraps a single lazily-created HTMLAudioElement:
 * loops forever, `preload="metadata"` so duration is known before play (feeds
 * the progress bar), reports playing/loading/error/progress via React state.
 *
 * Autoplay strategy: try `play()` on mount when `autoStart` is set. If the
 * promise rejects (autoplay policy / iOS Safari / direct visit), the UI stays
 * in Paused state — no console noise, no user-visible error. A one-shot
 * document-level `pointerdown`/`keydown` listener retries once on the first
 * gesture and self-cancels if the user pauses/toggles manually first.
 *
 * Local-only. No persistence. No autoplay attempts after manual pause.
 */
export function useAmbientMusic(opts: Options = {}): UseAmbientMusic {
  const { autoStart = false } = opts;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioAbortRef = useRef<AbortController | null>(null);
  const userInteractedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const ensureAudio = useCallback((): HTMLAudioElement | null => {
    if (typeof window === "undefined") return null;
    if (audioRef.current) return audioRef.current;
    try {
      const a = new Audio();
      a.src = AUDIO_SRC;
      a.loop = true;
      a.preload = "metadata";
      // All listeners share one AbortController so teardown can remove them
      // atomically. Post-teardown events on the old element (e.g. the `error`
      // that fires when we clear src during React StrictMode's dev-only
      // unmount+remount cycle) then cannot flip state and get us stuck in
      // "Unavailable".
      const controller = new AbortController();
      const { signal } = controller;
      a.addEventListener("play", () => setPlaying(true), { signal });
      a.addEventListener("pause", () => setPlaying(false), { signal });
      a.addEventListener("waiting", () => setLoading(true), { signal });
      a.addEventListener("playing", () => setLoading(false), { signal });
      a.addEventListener(
        "loadedmetadata",
        () => setDuration(Number.isFinite(a.duration) ? a.duration : 0),
        { signal },
      );
      a.addEventListener(
        "durationchange",
        () => setDuration(Number.isFinite(a.duration) ? a.duration : 0),
        { signal },
      );
      a.addEventListener("timeupdate", () => setCurrentTime(a.currentTime), { signal });
      a.addEventListener(
        "error",
        () => {
          setError(true);
          setLoading(false);
          setPlaying(false);
        },
        { signal },
      );
      audioRef.current = a;
      audioAbortRef.current = controller;
      return a;
    } catch {
      setError(true);
      return null;
    }
  }, []);

  // Tear down on unmount. Abort listeners FIRST so clearing src can't fire a
  // stale error event into a still-mounted (StrictMode-remounted) instance.
  useEffect(() => {
    return () => {
      const c = audioAbortRef.current;
      if (c) c.abort();
      audioAbortRef.current = null;
      const a = audioRef.current;
      if (a) {
        a.pause();
        a.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  // Autoplay attempt + one-shot gesture fallback.
  useEffect(() => {
    if (!autoStart) return;
    const a = ensureAudio();
    if (!a) return;

    let cancelled = false;
    let cleanupFallback: (() => void) | null = null;

    const tryPlay = () => {
      if (cancelled || userInteractedRef.current) return;
      const p = a.play();
      if (p && typeof p.then === "function") {
        p.catch(() => {
          // Autoplay blocked — stay paused. Fallback listener will retry on
          // the first user gesture (once), then self-remove.
          if (cancelled || userInteractedRef.current || cleanupFallback) return;
          const onGesture = () => {
            if (userInteractedRef.current) return;
            const p2 = a.play();
            if (p2 && typeof p2.then === "function") p2.catch(() => {});
          };
          document.addEventListener("pointerdown", onGesture, { once: true });
          document.addEventListener("keydown", onGesture, { once: true });
          cleanupFallback = () => {
            document.removeEventListener("pointerdown", onGesture);
            document.removeEventListener("keydown", onGesture);
          };
        });
      }
    };

    tryPlay();

    return () => {
      cancelled = true;
      if (cleanupFallback) cleanupFallback();
    };
  }, [autoStart, ensureAudio]);

  const toggle = useCallback(() => {
    if (error) return;
    const a = ensureAudio();
    if (!a) return;
    userInteractedRef.current = true;
    if (a.paused) {
      setLoading(true);
      const p = a.play();
      if (p && typeof p.then === "function") {
        p.catch(() => {
          setError(true);
          setLoading(false);
          setPlaying(false);
        });
      }
    } else {
      a.pause();
    }
  }, [ensureAudio, error]);

  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  return { playing, loading, error, duration, currentTime, progress, toggle };
}
