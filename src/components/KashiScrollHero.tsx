"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Lang } from "@/lib/content/types";
import { Ornament } from "@/components/ornaments/Ornament";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const TOTAL_FRAMES = 36;

interface Chapter {
  id: number;
  fraction: number;
  titleEn: string;
  titleHi: string;
}

const CHAPTERS: Chapter[] = [
  { id: 1, fraction: 0.05, titleEn: "Dawn at Kashi", titleHi: "सुप्रभातम्" },
  { id: 2, fraction: 0.45, titleEn: "Ganga Aarti", titleHi: "संध्या आरती" },
  { id: 3, fraction: 0.85, titleEn: "Wedding Portal", titleHi: "शुभ विवाह" },
];

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const [activeChapter, setActiveChapter] = useState(1);
  const currentFrameRef = useRef(0);

  // Render a specific frame to the canvas with mobile-aware focal centering
  const renderFrame = (idx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = framesRef.current[idx];
    if (!img || !img.complete) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth || 1280;
    const ih = img.naturalHeight || 720;

    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;

    // Mobile portrait optimization: center slightly on the boat and temples
    const isMobile = cw < 768;
    const focalX = isMobile ? 0.52 : 0.5;
    const sx = (cw - sw) * focalX;
    const sy = (ch - sh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, sx, sy, sw, sh);
    currentFrameRef.current = idx;
  };

  // Preload frames and handle responsive canvas resizing
  useEffect(() => {
    const images: HTMLImageElement[] = [];

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const num = String(i).padStart(2, "0");
      img.src = `/hero/frames/frame_${num}.webp`;
      if (i === 0) {
        img.onload = () => {
          renderFrame(0);
        };
      }
      images.push(img);
    }
    framesRef.current = images;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const parent = canvas.parentElement;
      canvas.width = parent?.clientWidth ? parent.clientWidth * dpr : 1280;
      canvas.height = parent?.clientHeight ? parent.clientHeight * dpr : 720;
      renderFrame(currentFrameRef.current);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Scroll to chapter helper for interactive timeline beads
  const scrollToChapter = (fraction: number) => {
    const root = containerRef.current;
    if (!root) return;
    const rootTop = root.getBoundingClientRect().top + window.scrollY;
    const maxScroll = root.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: rootTop + maxScroll * fraction,
      behavior: "smooth",
    });
  };

  // GSAP ScrollTrigger timeline & animations
  useGSAP(
    () => {
      const root = containerRef.current;
      if (!root) return;

      // Floating river diya ember animations
      gsap.to(".kashi-diya-1", {
        y: -14,
        x: 6,
        duration: 3.2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
      gsap.to(".kashi-diya-2", {
        y: -18,
        x: -8,
        duration: 4.1,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 0.5,
      });
      gsap.to(".kashi-diya-3", {
        y: -12,
        x: 10,
        duration: 3.7,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 1.2,
      });

      // Master scroll-driven timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.35,
          onUpdate: (self) => {
            const p = self.progress;
            // Discrete frame stepping for authentic 12fps tactile stop-motion
            const idx = Math.min(TOTAL_FRAMES - 1, Math.floor(p * TOTAL_FRAMES));
            if (idx !== currentFrameRef.current) {
              renderFrame(idx);
            }

            // Update active chapter indicator
            if (p < 0.35) {
              setActiveChapter(1);
            } else if (p < 0.7) {
              setActiveChapter(2);
            } else {
              setActiveChapter(3);
            }
          },
        },
      });

      // Chapter 1: Subah-e-Banaras (Dawn) - starts visible, fades out around 25%
      tl.to(".kashi-caption-dawn", { opacity: 0, y: -25, duration: 0.22 }, 0.08);

      // Chapter 2: Evening Ganga Aarti - fades in 30% to 60%, fades out by 65%
      tl.fromTo(
        ".kashi-caption-aarti",
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.2 },
        0.3
      );
      tl.to(".kashi-caption-aarti", { opacity: 0, y: -20, duration: 0.15 }, 0.58);

      // Chapter 3: Wedding Portal & Couple Revelation - rises 65% to 100%
      tl.fromTo(
        ".kashi-wedding-reveal",
        { opacity: 0, scale: 0.9, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "power2.out" },
        0.65
      );

      // Foil glint sweep across the couple's card as it settles
      tl.fromTo(
        ".kashi-glint-sweep",
        { x: "-120%", opacity: 0 },
        { x: "180%", opacity: 0.7, duration: 0.3, ease: "power1.inOut" },
        0.82
      );

      // Seamless golden dissolve into the page background at 88% - 100%
      tl.fromTo(
        ".kashi-bottom-fade",
        { opacity: 0 },
        { opacity: 1, duration: 0.18, ease: "power1.in" },
        0.85
      );
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[180vh] md:h-[235vh] bg-[#241510]"
      aria-label="Kashi Ghats Scroll Stop-Motion"
    >
      {/* Sticky Fullscreen Stage (uses 100dvh for mobile stability) */}
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden flex flex-col items-center justify-center">
        {/* Fallback poster background while canvas initializes */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{ backgroundImage: "url('/hero/kashi_dawn.jpg')" }}
          aria-hidden="true"
        />

        {/* Stop-Motion Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full object-cover filter brightness-[0.95] contrast-[1.04]"
          aria-hidden="true"
        />

        {/* Ambient Film Vignette & Subtle Warmth */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/50"
          aria-hidden="true"
        />

        {/* Floating Sacred River Diyas (Interactive Organic Ambience) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <span className="kashi-diya-1 absolute bottom-24 left-[15%] h-3 w-3 rounded-full bg-gold-bright shadow-[0_0_12px_#f5d77f] opacity-80" />
          <span className="kashi-diya-2 absolute bottom-20 right-[22%] h-4 w-4 rounded-full bg-amber-400 shadow-[0_0_16px_#f59e0b] opacity-85" />
          <span className="kashi-diya-3 absolute bottom-32 left-[48%] h-2.5 w-2.5 rounded-full bg-yellow-300 shadow-[0_0_10px_#fef08a] opacity-75" />
        </div>

        {/* --- SCROLL CHAPTER 1: SUBAH-E-BANARAS (DAWN) --- */}
        <div className="kashi-caption-dawn pointer-events-none absolute inset-x-4 top-24 flex flex-col items-center text-center sm:top-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-bright/40 bg-black/50 px-5 py-1.5 backdrop-blur-md shadow-lg">
            <span className="h-2 w-2 rounded-full bg-gold-bright animate-ping" />
            <span className="font-devanagari text-xs uppercase tracking-[0.25em] text-gold-bright sm:text-sm">
              {isHi ? "सुप्रभातम् • काशी की पावन धरा" : "Subah-e-Banaras • The Holy Ghats of Kashi"}
            </span>
          </div>
          <h2 className="mt-4 font-heading text-3xl font-light text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] sm:text-5xl md:text-6xl">
            {isHi
              ? "जहाँ गंगा के पावन जल पर सुबह खिलती है"
              : "Where the Sacred Ganges Greet the Morning Sun"}
          </h2>
          <div className="mt-8 flex flex-col items-center gap-2 text-white/90">
            <span className="text-xs uppercase tracking-[0.25em] text-gold-bright font-medium drop-shadow">
              {isHi ? "दर्शन हेतु नीचे स्क्रॉल करें" : "Scroll down to begin the journey"}
            </span>
            <span className="animate-bounce text-2xl text-gold-bright">↓</span>
          </div>
        </div>

        {/* --- SCROLL CHAPTER 2: EVENING GANGA AARTI --- */}
        <div className="kashi-caption-aarti pointer-events-none absolute inset-x-4 top-24 flex flex-col items-center text-center opacity-0 sm:top-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-bright/50 bg-black/65 px-5 py-1.5 backdrop-blur-md shadow-xl">
            <span className="font-devanagari text-xs font-semibold uppercase tracking-[0.28em] text-gold-bright sm:text-sm">
              {isHi ? "दीपदान एवं संध्या गंगा आरती" : "Evening Aarti • Floating Diyas on Ganga"}
            </span>
          </div>
          <h2 className="mt-4 max-w-xl font-heading text-3xl font-medium text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.95)] sm:text-5xl md:text-6xl">
            {isHi
              ? "दीपों की ज्योति एवं मंत्रोच्चार से गुंजित दशाश्वमेध"
              : "Where Millions of Prayers Turn Into Light"}
          </h2>
          <p className="mt-3 font-devanagari text-sm font-light text-gold/95 drop-shadow sm:text-base">
            {isHi ? "हर हर गंगे • ॐ नमः शिवाय" : "Har Har Gange • Om Namah Shivaya"}
          </p>
        </div>

        {/* --- SCROLL CHAPTER 3: WEDDING PORTAL REVELATION --- */}
        <div className="kashi-wedding-reveal pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 py-12 text-center opacity-0">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-gold-bright/50 bg-black/70 p-6 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.85)] sm:p-10">
            {/* Specular Glint Sweep on Card */}
            <span
              className="kashi-glint-sweep pointer-events-none absolute -inset-y-full -left-20 w-32 -rotate-12 bg-gradient-to-r from-transparent via-white/35 to-transparent"
              aria-hidden="true"
            />

            {/* Foil Monogram Rings */}
            <Ornament
              name="monogram-rings"
              className="mx-auto block h-9 w-18 text-gold-bright sm:h-12 sm:w-24"
            />

            {/* Wedding Invitation Eyebrow */}
            <p className="mt-2.5 flex items-center justify-center gap-2.5 text-xs uppercase tracking-[0.3em] text-gold-bright sm:text-sm">
              <span className="h-px w-6 sm:w-8 bg-gold-bright/60" aria-hidden="true" />
              <span>{isHi ? "शुभ विवाह निमंत्रण" : "Wedding Invitation"}</span>
              <span className="h-px w-6 sm:w-8 bg-gold-bright/60" aria-hidden="true" />
            </p>

            {/* Primary & Secondary Couple Names */}
            <h1 className="mt-2 font-heading text-4xl sm:text-6xl md:text-7xl font-normal tracking-wide text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
              {primaryName}
            </h1>

            <div className="my-1.5 flex items-center justify-center gap-3" aria-hidden="true">
              <span className="h-px w-8 sm:w-10 bg-gold-bright/50" />
              <span className="font-heading text-xl sm:text-2xl text-gold-bright">{"\u2766"}</span>
              <span className="h-px w-8 sm:w-10 bg-gold-bright/50" />
            </div>

            <p className="font-heading text-4xl sm:text-6xl md:text-7xl font-normal tracking-wide text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
              {secondaryName}
            </p>

            {blessing && (
              <p className="mt-3 font-devanagari text-sm font-semibold tracking-widest text-gold-bright drop-shadow sm:text-base">
                {blessing}
              </p>
            )}

            <p className="mt-4 text-xs tracking-widest uppercase text-white/90">
              {isHi
                ? "काशी विश्वनाथ की पावन नगरी में आपका स्वागत है"
                : "Welcoming You to the Eternal City of Kashi"}
            </p>
          </div>
        </div>

        {/* --- INTERACTIVE CHAPTER TIMELINE BEADS --- */}
        <nav
          aria-label="Story Chapters"
          className="pointer-events-auto absolute bottom-6 flex items-center gap-3 rounded-full border border-gold-line/40 bg-black/60 px-4 py-2 backdrop-blur-md shadow-lg sm:bottom-auto sm:right-6 sm:flex-col sm:gap-4 sm:px-2.5 sm:py-5"
        >
          {CHAPTERS.map((ch) => {
            const isActive = activeChapter === ch.id;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => scrollToChapter(ch.fraction)}
                className="group flex items-center gap-2 text-left focus:outline-none focus:ring-1 focus:ring-gold-bright rounded-full"
                aria-label={`Jump to ${ch.titleEn}`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-gold-bright scale-125 shadow-[0_0_8px_#f5d77f]"
                      : "bg-white/40 hover:bg-white/80"
                  }`}
                />
                <span
                  className={`hidden text-[11px] font-medium tracking-wide uppercase transition-all duration-300 sm:inline ${
                    isActive
                      ? "text-gold-bright font-semibold"
                      : "text-white/50 group-hover:text-white/90"
                  }`}
                >
                  {isHi ? ch.titleHi : ch.titleEn}
                </span>
              </button>
            );
          })}
        </nav>

        {/* --- SEAMLESS GOLDEN DISSOLVE INTO INVITATION --- */}
        <div
          className="kashi-bottom-fade pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent via-surface/60 to-surface opacity-0"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
