"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import type { Lang } from "@/lib/content/types";
import { Ornament } from "@/components/ornaments/Ornament";
import { AdaptiveSectionVideo } from "@/components/AdaptiveSectionVideo";

// Register GSAP plugins safely on client
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

export function KashiScrollHero({
  lang,
  primaryName,
  secondaryName,
  blessing,
}: {
  lang: Lang;
  primaryName: string;
  secondaryName: string;
  blessing: string | null;
}) {
  const isHi = lang === "hi";

  const pinWrapperRef = useRef<HTMLDivElement | null>(null);
  const heroHeaderRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);

  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const hasUserScrolledRef = useRef<boolean>(false);
  const isAutoScrollingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!pinWrapperRef.current || !heroHeaderRef.current || !cardRef.current) return;

    // Accessibility check: immediately reveal for users who prefer reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      gsap.set(cardRef.current, { opacity: 1, y: 0, scale: 1 });
      gsap.set("#floating-viewport-controls", { opacity: 1, y: 0, pointerEvents: "auto" });
      if (indicatorRef.current) {
        gsap.set(indicatorRef.current, { opacity: 1, y: 0 });
      }
      return;
    }

    // Set initial GSAP values explicitly matching SSR style
    gsap.set(cardRef.current, { y: 90, opacity: 0, scale: 0.96 });
    gsap.set("#floating-viewport-controls", { y: -14, opacity: 0, pointerEvents: "none" });
    if (indicatorRef.current) {
      gsap.set(indicatorRef.current, { y: 16, opacity: 0 });
    }

    // Detect user interactions to cancel auto-scroll seamlessly
    const handleUserGesture = () => {
      if (!isAutoScrollingRef.current) {
        hasUserScrolledRef.current = true;
      }
    };

    window.addEventListener("wheel", handleUserGesture, { passive: true });
    window.addEventListener("touchstart", handleUserGesture, { passive: true });

    // Choreographed Scroll Scrub Timeline with Pinning:
    // Pinned distance: 1.1x viewport height ("quick" scroll mode)
    // 0.0 -> 0.45: Card floats up naturally from bottom with fade-in into dead center
    // 0.45 -> 1.0: Card remains firmly locked in center for reading
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: pinWrapperRef.current,
        start: "top top",
        end: () => "+=" + Math.round(window.innerHeight * 1.1),
        pin: heroHeaderRef.current,
        pinSpacing: true,
        scrub: 0.5,
        anticipatePin: 1,
        onUpdate: (self) => {
          if (!isAutoScrollingRef.current && self.scroll() > 15) {
            hasUserScrolledRef.current = true;
          }
        },
      },
    });

    scrollTriggerRef.current = tl.scrollTrigger ?? null;

    // 1. Card floats into dead center
    tl.to(
      cardRef.current,
      {
        y: 0,
        opacity: 1,
        scale: 1,
        ease: "power2.out",
        duration: 0.45,
      },
      0
    );

    // 2. Fixed viewport controls (Language Switcher + Music Toggle) reveal at top right
    tl.to(
      "#floating-viewport-controls",
      {
        y: 0,
        opacity: 1,
        pointerEvents: "auto",
        ease: "power2.out",
        duration: 0.35,
      },
      0.1
    );

    // 3. Scroll indicator reveals at bottom
    if (indicatorRef.current) {
      tl.to(
        indicatorRef.current,
        {
          y: 0,
          opacity: 1,
          ease: "power2.out",
          duration: 0.3,
        },
        0.15
      );
    }

    // 4. Locked plateau: Keep card centered from 45% to 100% of the pin track
    tl.to({}, { duration: 0.55 });

    return () => {
      window.removeEventListener("wheel", handleUserGesture);
      window.removeEventListener("touchstart", handleUserGesture);
      tl.kill();
    };
  }, []);

  // Auto Mode Handler: Fires when the 7.04s hero video finishes playing
  const handleVideoEnded = () => {
    // If guest already began scrolling, respect their manual interaction
    if (hasUserScrolledRef.current) return;
    if (!scrollTriggerRef.current) return;

    const st = scrollTriggerRef.current;
    // Target position at ~50% of the pin track (where card is centered & locked)
    const targetScrollY = st.start + (st.end - st.start) * 0.5;

    isAutoScrollingRef.current = true;

    // Crisp cinematic float into center (~1.15s)
    gsap.to(window, {
      scrollTo: targetScrollY,
      duration: 1.15,
      ease: "power2.out",
      overwrite: "auto",
      onComplete: () => {
        isAutoScrollingRef.current = false;
        hasUserScrolledRef.current = true;
      },
      onInterrupt: () => {
        isAutoScrollingRef.current = false;
        hasUserScrolledRef.current = true;
      },
    });
  };

  return (
    <div ref={pinWrapperRef} className="relative w-full">
      <header
        ref={heroHeaderRef}
        className="relative h-screen min-h-[640px] w-full overflow-hidden bg-black text-white"
      >
        {/* 
          Background: Shot 3 (Mandap Portal Reveal overlooking moonlit Kashi & Aarti Fire)
          Unobstructed cinematic view on initial render.
        */}
        <AdaptiveSectionVideo
          src="/videos/hero-mandap.mp4"
          poster="/videos/hero-mandap-poster.jpg"
          className="absolute inset-0 h-full w-full"
          objectPosition="center center"
          parallax={false}
          overlayGradient="bg-gradient-to-t from-black/85 via-black/30 to-black/60"
          onEnded={handleVideoEnded}
        >
          {/* Floating Sacred River Diyas / Embers */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <span className="float-diya absolute bottom-28 left-[15%] h-3 w-3 rounded-full bg-gold-bright shadow-[0_0_12px_#f5d77f] opacity-80" />
            <span
              className="float-diya absolute bottom-24 right-[20%] h-4 w-4 rounded-full bg-amber-400 shadow-[0_0_16px_#f59e0b] opacity-85"
              style={{ animationDelay: "1.8s" }}
            />
            <span
              className="float-diya absolute bottom-36 left-[48%] h-2.5 w-2.5 rounded-full bg-yellow-300 shadow-[0_0_10px_#fef08a] opacity-75"
              style={{ animationDelay: "0.9s" }}
            />
          </div>

          {/* Hero Content Overlay: Centered Royal Wedding Invitation Card */}
          <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-4 py-16 text-center">
            <div
              ref={cardRef}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-gold-bright/40 bg-black/60 p-7 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_28px_rgba(212,175,55,0.2)] sm:p-11"
              style={{ opacity: 0, transform: "translate3d(0, 90px, 0) scale(0.96)" }}
            >
              {/* Specular Glint Sweep on Card */}
              <span
                className="gold-shimmer-sweep pointer-events-none absolute inset-0 opacity-40"
                aria-hidden="true"
              />

              {/* Foil Monogram Rings */}
              <Ornament
                name="monogram-rings"
                className="mx-auto block h-10 w-20 text-gold-bright sm:h-12 sm:w-24 drop-shadow-[0_2px_8px_rgba(212,175,55,0.6)]"
              />

              {/* Wedding Invitation Eyebrow */}
              <p className="mt-3 flex items-center justify-center gap-2.5 text-xs font-medium uppercase tracking-[0.3em] text-gold-bright sm:text-sm">
                <span className="h-px w-6 sm:w-8 bg-gold-bright/60" aria-hidden="true" />
                <span>{isHi ? "॥ शुभ विवाह निमंत्रण ॥" : "Wedding Invitation"}</span>
                <span className="h-px w-6 sm:w-8 bg-gold-bright/60" aria-hidden="true" />
              </p>

              {/* Primary Couple Name (from Google Sheets) */}
              <h1 className="mt-3 font-heading text-4xl font-normal tracking-wide text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)] sm:text-6xl md:text-7xl">
                {primaryName}
              </h1>

              {/* Sacred Lotus Fleuron Divider */}
              <div className="my-2 flex items-center justify-center gap-3" aria-hidden="true">
                <span className="h-px w-8 sm:w-10 bg-gold-bright/50" />
                <span className="font-heading text-xl sm:text-2xl text-gold-bright">
                  {"\u2766"}
                </span>
                <span className="h-px w-8 sm:w-10 bg-gold-bright/50" />
              </div>

              {/* Secondary Couple Name (from Google Sheets) */}
              <p className="font-heading text-4xl font-normal tracking-wide text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)] sm:text-6xl md:text-7xl">
                {secondaryName}
              </p>

              {/* Blessing Passage (from Google Sheets) */}
              {blessing && (
                <p className="mt-4 font-devanagari text-sm font-semibold tracking-widest text-gold-bright drop-shadow sm:text-base">
                  {blessing}
                </p>
              )}
            </div>

            {/* Elegant Downward Scroll Indicator */}
            <div
              ref={indicatorRef}
              className="absolute bottom-6 flex flex-col items-center gap-1.5 text-white/80 transition-opacity duration-300 hover:text-white"
              style={{ opacity: 0, transform: "translate3d(0, 16px, 0)" }}
            >
              <span className="text-[11px] uppercase tracking-[0.25em] text-gold-bright font-medium drop-shadow">
                {isHi ? "शुभ दर्शन हेतु नीचे स्क्रॉल करें" : "Scroll to begin"}
              </span>
              <span className="animate-bounce text-xl text-gold-bright">↓</span>
            </div>
          </div>
        </AdaptiveSectionVideo>
      </header>
    </div>
  );
}
