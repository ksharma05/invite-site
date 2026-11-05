"use client";

import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/content/types";
import { t } from "@/lib/i18n/dictionary";

export interface MusicToggleProps {
  lang: Lang;
  className?: string;
}

const TRACKS = ["-fxA5IAh_ZA", "D5NHvEVAbWY"] as const;
const TRACK_STORAGE_KEY = "sk-music-track";
const VOLUME = 65;
const GESTURE_EVENTS = ["click", "keydown", "touchend"] as const;

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  setVolume(volume: number): void;
  destroy(): void;
}

interface YTNamespace {
  Player: new (element: HTMLElement, options: Record<string, unknown>) => YTPlayer;
  PlayerState: { ENDED: number; PLAYING: number; PAUSED: number };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;

function loadYouTubeApi(): Promise<YTNamespace> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      apiPromise = null;
    };
    document.head.appendChild(script);
  });
  return apiPromise;
}

// Module-level so StrictMode's double effect doesn't advance the rotation twice in one page load.
let trackThisLoad: string | null = null;

function pickTrack(): string {
  if (trackThisLoad) return trackThisLoad;
  let next = 0;
  try {
    const previous = Number.parseInt(window.localStorage.getItem(TRACK_STORAGE_KEY) ?? "", 10);
    if (previous >= 0 && previous < TRACKS.length) next = (previous + 1) % TRACKS.length;
    window.localStorage.setItem(TRACK_STORAGE_KEY, String(next));
  } catch {
    // Storage blocked: fall back to the first track.
  }
  const track = TRACKS[next] ?? TRACKS[0];
  trackThisLoad = track;
  return track;
}

/**
 * Royal Glassmorphic Music Toggle Button
 * Streams ambient wedding music via a hidden YouTube player, alternating tracks per page load.
 * Matches the LanguageSwitcher and Hero Card aesthetic with gold borders and specular shimmer.
 */
export function MusicToggle({ lang, className = "" }: MusicToggleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const readyRef = useRef(false);
  const pendingPlayRef = useRef(false);
  const userPausedRef = useRef(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    const videoId = pickTrack();

    const removeGestureListeners = () => {
      GESTURE_EVENTS.forEach((type) => window.removeEventListener(type, onGesture));
    };

    // Kept until playback actually starts: a gesture that the browser doesn't count as activation gets retried on the next one.
    function onGesture(event: Event) {
      if (buttonRef.current?.contains(event.target as Node)) return;
      if (userPausedRef.current) {
        removeGestureListeners();
        return;
      }
      if (readyRef.current) playerRef.current?.playVideo();
      else pendingPlayRef.current = true;
    }

    GESTURE_EVENTS.forEach((type) => window.addEventListener(type, onGesture, { passive: true }));

    // YT.Player replaces the element it's given, so hand it a child rather than the React-owned node.
    const mount = document.createElement("div");
    host.appendChild(mount);

    loadYouTubeApi().then((YT) => {
      if (cancelled) return;
      playerRef.current = new YT.Player(mount, {
        videoId,
        host: "https://www.youtube-nocookie.com",
        width: 200,
        height: 200,
        playerVars: {
          autoplay: 0,
          controls: 0,
          loop: 1,
          playlist: videoId,
          playsinline: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (event: { target: YTPlayer }) => {
            readyRef.current = true;
            event.target.setVolume(VOLUME);
            if (pendingPlayRef.current && !userPausedRef.current) event.target.playVideo();
          },
          onStateChange: (event: { data: number }) => {
            if (event.data === YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              removeGestureListeners();
            } else if (
              event.data === YT.PlayerState.PAUSED ||
              event.data === YT.PlayerState.ENDED
            ) {
              setIsPlaying(false);
            }
          },
          onError: (event: { data: number }) => {
            console.warn(`Background music unavailable (YouTube error ${event.data})`);
            setIsPlaying(false);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      removeGestureListeners();
      playerRef.current?.destroy();
      playerRef.current = null;
      readyRef.current = false;
      host.replaceChildren();
    };
  }, []);

  const toggleMusic = () => {
    const player = playerRef.current;
    if (!player || !readyRef.current) {
      userPausedRef.current = false;
      pendingPlayRef.current = true;
      return;
    }

    if (isPlaying) {
      userPausedRef.current = true;
      player.pauseVideo();
    } else {
      userPausedRef.current = false;
      player.playVideo();
    }
  };

  const actionLabel = isPlaying ? t(lang, "musicPause") : t(lang, "musicPlay");

  return (
    <>
      <div
        ref={hostRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 -left-[9999px] h-px w-px overflow-hidden"
      />
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMusic}
        aria-label={actionLabel}
        title={actionLabel}
        aria-pressed={isPlaying}
        className={`group relative inline-flex items-center justify-center gap-2 h-8 sm:h-9 px-3 rounded-full border border-gold-bright/40 bg-black/60 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.7)] text-gold-bright transition-all duration-300 hover:border-gold-bright hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] ${className}`}
      >
        {/* Specular Glint Sweep Highlight */}
        <span
          className="gold-shimmer-sweep pointer-events-none absolute inset-0 rounded-full opacity-40"
          aria-hidden="true"
        />

        {/* Ambient Glow Aura when Playing */}
        {isPlaying && (
          <span
            className="pointer-events-none absolute inset-0 rounded-full bg-gold-bright/15 shadow-[0_0_12px_rgba(212,175,55,0.5)] animate-pulse"
            aria-hidden="true"
          />
        )}

        <span className="relative z-10 flex items-center gap-1.5 text-xs sm:text-sm font-medium">
          {isPlaying ? (
            // Equalizer Waveform Animation
            <span className="flex items-end gap-[2.5px] h-3.5 w-3.5 pb-[1px]" aria-hidden="true">
              <span className="w-[2px] bg-gold-bright rounded-full animate-music-bar-1" />
              <span className="w-[2px] bg-gold-bright rounded-full animate-music-bar-2" />
              <span className="w-[2px] bg-gold-bright rounded-full animate-music-bar-3" />
            </span>
          ) : (
            // Elegant Muted Speaker / Audio Icon
            <svg
              className="h-3.5 w-3.5 text-white/70 transition-colors group-hover:text-gold-bright"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}

          {/* Music Note Icon / Symbol */}
          <span className="text-xs sm:text-sm tracking-wide text-white/80 group-hover:text-white">
            ♫
          </span>
        </span>
      </button>
    </>
  );
}
