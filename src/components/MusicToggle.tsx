"use client";

import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/content/types";
import { t } from "@/lib/i18n/dictionary";

export interface MusicToggleProps {
  lang: Lang;
  className?: string;
}

/**
 * Royal Glassmorphic Music Toggle Button
 * Controls ambient auspicious wedding background music.
 * Matches the LanguageSwitcher and Hero Card aesthetic with gold borders and specular shimmer.
 */
export function MusicToggle({ lang, className = "" }: MusicToggleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.65;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {
        // Autoplay may be restricted until direct user interaction
        setIsPlaying(false);
      });
    }
  };

  const actionLabel = isPlaying ? t(lang, "musicPause") : t(lang, "musicPlay");

  return (
    <>
      <audio ref={audioRef} src="/audio/background-music.mp3" loop preload="metadata" />
      <button
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
            {isPlaying ? "♫" : "♫"}
          </span>
        </span>
      </button>
    </>
  );
}
