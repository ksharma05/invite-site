"use client";

import type { Lang } from "@/lib/content/types";
import { Ornament } from "@/components/ornaments/Ornament";
import { AdaptiveSectionVideo } from "@/components/AdaptiveSectionVideo";

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

  return (
    <header className="relative h-screen min-h-[640px] w-full overflow-hidden bg-black text-white">
      {/* 
        Background: Shot 3 (Mandap Portal Reveal overlooking moonlit Kashi & Aarti Fire)
        Uses AdaptiveSectionVideo for 60fps zero-crash playback across all device tiers.
      */}
      <AdaptiveSectionVideo
        src="/videos/hero-mandap.mp4"
        poster="/videos/hero-mandap-poster.jpg"
        className="absolute inset-0 h-full w-full"
        objectPosition="center center"
        parallax={true}
        parallaxSpeed={0.12}
        overlayGradient="bg-gradient-to-t from-black/85 via-black/30 to-black/60"
      >
        {/* Floating Sacred River Diyas / Embers */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <span className="float-diya absolute bottom-28 left-[15%] h-3 w-3 rounded-full bg-gold-bright shadow-[0_0_12px_#f5d77f] opacity-80" />
          <span className="float-diya absolute bottom-24 right-[20%] h-4 w-4 rounded-full bg-amber-400 shadow-[0_0_16px_#f59e0b] opacity-85" style={{ animationDelay: "1.8s" }} />
          <span className="float-diya absolute bottom-36 left-[48%] h-2.5 w-2.5 rounded-full bg-yellow-300 shadow-[0_0_10px_#fef08a] opacity-75" style={{ animationDelay: "0.9s" }} />
        </div>

        {/* Hero Content Overlay: Centered Royal Wedding Invitation Card */}
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-4 py-16 text-center">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-gold-bright/40 bg-black/60 p-7 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.85)] sm:p-11">
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
              <span className="font-heading text-xl sm:text-2xl text-gold-bright">{"\u2766"}</span>
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

            {/* City of Kashi Welcome Subtitle */}
            <p className="mt-4 text-xs font-light tracking-widest uppercase text-white/90">
              {isHi
                ? "काशी विश्वनाथ की पावन नगरी में आपका स्वागत है"
                : "Welcoming You to the Eternal City of Kashi"}
            </p>
          </div>

          {/* Elegant Downward Scroll Indicator */}
          <div className="absolute bottom-6 flex flex-col items-center gap-1.5 text-white/80 transition-opacity duration-300 hover:text-white">
            <span className="text-[11px] uppercase tracking-[0.25em] text-gold-bright font-medium drop-shadow">
              {isHi ? "शुभ दर्शन हेतु नीचे स्क्रॉल करें" : "Scroll to begin"}
            </span>
            <span className="animate-bounce text-xl text-gold-bright">↓</span>
          </div>
        </div>
      </AdaptiveSectionVideo>
    </header>
  );
}
