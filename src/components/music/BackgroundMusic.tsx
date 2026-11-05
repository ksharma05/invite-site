"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

const TRACKS = ["-fxA5IAh_ZA", "D5NHvEVAbWY"] as const;
const TRACK_STORAGE_KEY = "sk-music-track";
const VOLUME = 65;
const STATE_PLAYING = 1;

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  mute(): void;
  unMute(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  getPlayerState(): number;
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

interface BackgroundMusicApi {
  isPlaying: boolean;
  /** Must be called synchronously from a real user gesture handler. */
  start: () => void;
  toggle: () => void;
}

const BackgroundMusicContext = createContext<BackgroundMusicApi | null>(null);

export function useBackgroundMusic(): BackgroundMusicApi {
  const api = useContext(BackgroundMusicContext);
  if (!api) throw new Error("useBackgroundMusic must be used within <MusicProvider>");
  return api;
}

/**
 * Streams background music through a hidden YouTube player, alternating tracks per page load.
 * The player pre-rolls muted (allowed without a gesture) so a later tap can unmute it instantly.
 */
export function MusicProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const readyRef = useRef(false);
  const audibleRef = useRef(false);
  const pendingStartRef = useRef(false);

  const playFromStart = useCallback((player: YTPlayer) => {
    audibleRef.current = true;
    player.unMute();
    player.setVolume(VOLUME);
    player.seekTo(0, true);
    player.playVideo();
    // The muted pre-roll may already be PLAYING, in which case no state change event follows.
    if (player.getPlayerState() === STATE_PLAYING) setIsPlaying(true);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    const videoId = pickTrack();

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
          autoplay: 1,
          mute: 1,
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
            const player = event.target;
            if (pendingStartRef.current) {
              playFromStart(player);
            } else {
              player.mute();
              player.playVideo();
            }
          },
          onStateChange: (event: { data: number }) => {
            if (event.data === YT.PlayerState.PLAYING) {
              setIsPlaying(audibleRef.current);
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
      playerRef.current?.destroy();
      playerRef.current = null;
      readyRef.current = false;
      host.replaceChildren();
    };
  }, [playFromStart]);

  const start = useCallback(() => {
    const player = playerRef.current;
    if (!player || !readyRef.current) {
      pendingStartRef.current = true;
      return;
    }
    playFromStart(player);
  }, [playFromStart]);

  const toggle = useCallback(() => {
    const player = playerRef.current;
    if (!player || !readyRef.current) {
      pendingStartRef.current = true;
      return;
    }
    if (isPlaying) {
      player.pauseVideo();
    } else if (!audibleRef.current) {
      playFromStart(player);
    } else {
      player.unMute();
      player.playVideo();
    }
  }, [isPlaying, playFromStart]);

  const api = useMemo(() => ({ isPlaying, start, toggle }), [isPlaying, start, toggle]);

  return (
    <BackgroundMusicContext.Provider value={api}>
      <div
        ref={hostRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 -left-[9999px] h-px w-px overflow-hidden"
      />
      {children}
    </BackgroundMusicContext.Provider>
  );
}
