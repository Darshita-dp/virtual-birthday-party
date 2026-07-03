"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface Track {
  id: string;
  title: string;
  src: string;
}

export const TRACKS: readonly Track[] = [
  { id: "lofi-birthday", title: "Lo-fi Birthday", src: "/assets/audio/lofi-birthday.mp3" },
  { id: "barbie", title: "Barbie", src: "/assets/audio/Barbie.mp3" },
];

export interface UseAmbientMusic {
  playing: boolean;
  loading: boolean;
  error: boolean;
  duration: number;
  currentTime: number;
  progress: number; // 0..1
  trackIndex: number;
  trackTitle: string;
  toggle: () => void;
  next: () => void;
  previous: () => void;
}

interface Options {
  /** Attempt play() on mount; silently fall back to paused if the browser blocks. */
  autoStart?: boolean;
}

/**
 * Ambient looping music (M7b, extended in M13a for track switching). Wraps a
 * SINGLE lazily-created HTMLAudioElement for the whole app session — `next`/
 * `previous` reassign `.src` on that SAME element rather than creating a new
 * one, so the M11 "one global audio element" guarantee holds across track
 * switches too.
 *
 * Autoplay strategy unchanged from M7b/M11: try `play()` on mount when
 * `autoStart` is set. If the promise rejects (autoplay policy / iOS Safari /
 * direct visit), the UI stays in Paused state — no console noise, no
 * user-visible error. A one-shot document-level `pointerdown`/`keydown`
 * listener retries once on the first gesture and self-cancels if the user
 * pauses/toggles manually first.
 *
 * Local-only. No persistence. No autoplay attempts after manual pause.
 */
export function useAmbientMusic(opts: Options = {}): UseAmbientMusic {
  const { autoStart = false } = opts;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioAbortRef = useRef<AbortController | null>(null);
  const userInteractedRef = useRef(false);
  const trackIndexRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [trackIndex, setTrackIndex] = useState(0);

  // Bound once per audio element (not per track) — switching `.src` re-fires
  // loadedmetadata/durationchange/timeupdate on the SAME listeners, so no
  // rebinding (and no listener duplication) is needed on track change.
  const bindListeners = useCallback((a: HTMLAudioElement) => {
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
    audioAbortRef.current = controller;
  }, []);

  const ensureAudio = useCallback((): HTMLAudioElement | null => {
    if (typeof window === "undefined") return null;
    if (audioRef.current) return audioRef.current;
    try {
      const a = new Audio();
      a.src = TRACKS[trackIndexRef.current]!.src;
      a.loop = true;
      a.preload = "metadata";
      bindListeners(a);
      audioRef.current = a;
      return a;
    } catch {
      setError(true);
      return null;
    }
  }, [bindListeners]);

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

  /** Switch track on the SAME audio element (no new Audio()); resumes playback if it was playing. */
  const switchTrack = useCallback(
    (index: number) => {
      const a = ensureAudio();
      if (!a) return;
      const nextIndex = ((index % TRACKS.length) + TRACKS.length) % TRACKS.length;
      const wasPlaying = !a.paused;
      userInteractedRef.current = true;
      setError(false);
      setDuration(0);
      setCurrentTime(0);
      trackIndexRef.current = nextIndex;
      setTrackIndex(nextIndex);
      a.src = TRACKS[nextIndex]!.src;
      a.load();
      if (wasPlaying) {
        setLoading(true);
        const p = a.play();
        if (p && typeof p.then === "function") {
          p.catch(() => {
            setError(true);
            setLoading(false);
            setPlaying(false);
          });
        }
      }
    },
    [ensureAudio],
  );

  const next = useCallback(() => switchTrack(trackIndexRef.current + 1), [switchTrack]);
  const previous = useCallback(() => switchTrack(trackIndexRef.current - 1), [switchTrack]);

  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  return {
    playing,
    loading,
    error,
    duration,
    currentTime,
    progress,
    trackIndex,
    trackTitle: TRACKS[trackIndex]!.title,
    toggle,
    next,
    previous,
  };
}
