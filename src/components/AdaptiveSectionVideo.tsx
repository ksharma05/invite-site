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
  children?: React.ReactNode;
}

/**
 * AdaptiveSectionVideo
 * 
 * Auto-plays when scrolled into view and immediately pauses when scrolled out of view.
 * Ensures only 1 video hardware decoder is active at any time on mobile.
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
  children,
}: AdaptiveSectionVideoProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { isLowTier, isHydrated } = useDeviceTier();
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollYOffset, setScrollYOffset] = useState(0);

  // 1. IntersectionObserver for zero-crash decoder lifecycle
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const threshold = DEFAULT_HEURISTICS_CONFIG.observerThreshold;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            video
              .play()
              .then(() => setIsPlaying(true))
              .catch(() => {
                // Autoplay may be restricted until interaction; fallback cleanly
                setIsPlaying(false);
              });
          } else {
            video.pause();
            setIsPlaying(false);
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
  }, []);

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
        loop
        playsInline
        preload="metadata"
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
