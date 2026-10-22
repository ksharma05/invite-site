"use client";

import { useEffect, useRef, useState } from "react";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { DEFAULT_HEURISTICS_CONFIG } from "@/config/deviceHeuristics";

export interface AdaptiveSectionVideoProps {
  src: string;
  poster: string;
  className?: string;
  objectPosition?: string;
  parallax?: boolean;
  parallaxSpeed?: number;
  overlayGradient?: string;
  playOnce?: boolean;
  onEnded?: () => void;
  children?: React.ReactNode;
}

/**
 * AdaptiveSectionVideo
 * 
 * Plays only when scrolled into the viewport.
 * When `playOnce` is true (default), each video plays exactly once through its duration
 * and permanently locks on its final resting frame.
 * Reloading the page cleanly resets playback for the new session.
 * On low-tier devices, all JS scroll tracking / parallax is disabled for 60fps performance.
 */
export function AdaptiveSectionVideo({
  src,
  poster,
  className = "",
  objectPosition = "center center",
  parallax = false,
  parallaxSpeed = 0.15,
  overlayGradient,
  playOnce = DEFAULT_HEURISTICS_CONFIG.playOncePerSession,
  onEnded,
  children,
}: AdaptiveSectionVideoProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasEndedRef = useRef<boolean>(false);
  const { isLowTier, isHydrated } = useDeviceTier();
  const [, setIsPlaying] = useState(false);
  const [scrollYOffset, setScrollYOffset] = useState(0);

  // 1. IntersectionObserver for viewport-triggered single-play lifecycle
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const threshold = DEFAULT_HEURISTICS_CONFIG.observerThreshold;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // If already played its single run, stay held on the final frame
            if (playOnce && hasEndedRef.current) {
              return;
            }

            video
              .play()
              .then(() => setIsPlaying(true))
              .catch(() => {
                // Autoplay may be restricted until interaction; fallback cleanly
                setIsPlaying(false);
              });
          } else {
            // When leaving viewport, pause mid-play video to save battery and decoders
            if (!hasEndedRef.current) {
              video.pause();
              setIsPlaying(false);
            }
          }
        }
      },
      {
        threshold,
        rootMargin: "50px 0px 50px 0px", // Pre-buffer slightly before viewport entry
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      if (video) {
        video.pause();
      }
    };
  }, [playOnce]);

  // Handle single-play completion: locks on the final resting frame
  const handleEnded = () => {
    if (playOnce) {
      hasEndedRef.current = true;
      setIsPlaying(false);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
    onEnded?.();
  };

  // 2. High-tier only: Optional gentle scroll parallax (disabled on low-tier devices)
  useEffect(() => {
    if (!parallax || isLowTier || !isHydrated) return;

    let rafId: number;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;

      // Only calculate if within or near viewport
      if (rect.bottom > 0 && rect.top < windowH) {
        const offset = (rect.top - windowH / 2) * parallaxSpeed;
        setScrollYOffset(offset);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [parallax, isLowTier, isHydrated, parallaxSpeed]);

  const transformStyle =
    parallax && !isLowTier && scrollYOffset !== 0
      ? `translate3d(0, ${scrollYOffset.toFixed(1)}px, 0) scale(1.08)`
      : undefined;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop={!playOnce}
        playsInline
        preload="metadata"
        onEnded={handleEnded}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-100 ease-out pointer-events-none"
        style={{
          objectPosition,
          transform: transformStyle,
          willChange: parallax && !isLowTier ? "transform" : "auto",
        }}
      />

      {/* Optional gradient readability overlay */}
      {overlayGradient && (
        <div
          className={`absolute inset-0 pointer-events-none ${overlayGradient}`}
        />
      )}

      {/* Content slot */}
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  );
}
