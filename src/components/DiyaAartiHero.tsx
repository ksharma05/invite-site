"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Lang } from "@/lib/content/types";
import { Ornament } from "@/components/ornaments/Ornament";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

// Frame sets (see DECISIONS.md): "d" = 1280x720 from ganeshjiHero.mp4 for desktop,
// "m" = 720x1280 from the dedicated 9:16 ganeshjiHero-mobile.mp4 for tall screens.
// PHONE_QUERY must match the poster <source media> below.
const PHONE_QUERY = "(max-aspect-ratio: 4/5)";
const FRAME_COUNT = 121;
const COARSE_STEP = 8;
const LOAD_CONCURRENCY = 6;
const frameUrl = (set: "d" | "m", i: number) =>
  `/videos/ganeshji-frames/${set}/${String(i + 1).padStart(4, "0")}.webp`;

export function DiyaAartiHero({
  lang,
  primaryName,
  secondaryName,
  blessing,
  eyebrow,
}: {
  lang: Lang;
  primaryName: string;
  secondaryName: string;
  blessing: string | null;
  eyebrow: string;
}) {
  const isHi = lang === "hi";

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const veilRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLDivElement | null>(null);

  // Scroll-scrubbed hero: the pinned section maps scroll progress onto an image
  // sequence drawn to <canvas> (smooth in both directions on every device,
  // unlike seeking an MP4), then reveals the veil, card and controls.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const header = headerRef.current;
    const canvas = canvasRef.current;
    const card = cardRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrapper || !header || !canvas || !card || !ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const set = window.matchMedia(PHONE_QUERY).matches ? "m" : "d";
    // Portrait frames keep Ganesh ji in the upper half; when a wider portrait
    // screen (tablet) crops top/bottom, crop mostly from the empty reflection below.
    const focalY = set === "m" ? 0.3 : 0.5;
    const frames: Array<HTMLImageElement | null> = new Array(FRAME_COUNT).fill(null);
    const state = { frame: prefersReducedMotion ? FRAME_COUNT - 1 : 0 };
    let drawnKey = "";
    let rafId = 0;
    let disposed = false;

    const nearestLoaded = (i: number) => {
      for (let d = 0; d < FRAME_COUNT; d++) {
        if (frames[i - d]) return i - d;
        if (frames[i + d]) return i + d;
      }
      return -1;
    };

    const drawCover = (img: HTMLImageElement, alpha: number) => {
      const { width: cw, height: ch } = canvas;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) * focalY, w, h);
    };

    // Draws the nearest loaded frame, cross-fading into the next one by the
    // fractional position so motion stays fluid between the 121 frames.
    const render = () => {
      const base = Math.floor(state.frame);
      const frac = state.frame - base;
      const shown = nearestLoaded(base);
      if (shown < 0) return;
      const next = shown === base && frames[base + 1] && frac > 0.02 ? base + 1 : -1;
      const key = `${shown}:${next >= 0 ? frac.toFixed(2) : "0"}:${canvas.width}x${canvas.height}`;
      if (key === drawnKey) return;
      drawnKey = key;
      drawCover(frames[shown]!, 1);
      if (next >= 0) drawCover(frames[next]!, frac);
      ctx.globalAlpha = 1;
      canvas.style.opacity = "1";
    };

    const requestDraw = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          rafId = 0;
          render();
        });
      }
    };

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      requestDraw();
    };
    sizeCanvas();
    const resizeObserver = new ResizeObserver(sizeCanvas);
    resizeObserver.observe(canvas);

    // Load order: first frame alone (fast first paint), then a coarse pass so
    // early fast scrolls still scrub, then everything else in parallel.
    const order: number[] = [];
    const queued = new Set<number>();
    const enqueue = (i: number) => {
      if (!queued.has(i)) {
        queued.add(i);
        order.push(i);
      }
    };
    if (prefersReducedMotion) {
      enqueue(FRAME_COUNT - 1);
    } else {
      enqueue(0);
      for (let i = 0; i < FRAME_COUNT; i += COARSE_STEP) enqueue(i);
      enqueue(FRAME_COUNT - 1);
      for (let i = 0; i < FRAME_COUNT; i++) enqueue(i);
    }

    let cursor = 0;
    let workersStarted = false;
    const loadNext = () => {
      const i = order[cursor++];
      if (disposed || i === undefined) return;
      const img = new Image();
      img.decoding = "async";
      img.src = frameUrl(set, i);
      img
        .decode()
        .then(() => {
          if (disposed) return;
          frames[i] = img;
          requestDraw();
        })
        .catch(() => {})
        .finally(() => {
          if (!workersStarted) {
            workersStarted = true;
            for (let k = 1; k < LOAD_CONCURRENCY; k++) loadNext();
          }
          loadNext();
        });
    };
    loadNext();

    const cleanupBase = () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      frames.forEach((img) => {
        if (img) img.src = "";
      });
    };

    if (prefersReducedMotion) {
      gsap.set([veilRef.current, card], { opacity: 1, y: 0, scale: 1 });
      gsap.set(hintRef.current, { opacity: 0 });
      gsap.set("#floating-viewport-controls", { opacity: 1, y: 0, pointerEvents: "auto" });
      return cleanupBase;
    }

    gsap.set(card, { y: 60, opacity: 0, scale: 0.96 });
    gsap.set(veilRef.current, { opacity: 0 });
    gsap.set("#floating-viewport-controls", { y: -14, opacity: 0, pointerEvents: "none" });

    const pinLength = set === "m" ? 2.5 : 3;
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: wrapper,
        start: "top top",
        end: () => "+=" + Math.round(window.innerHeight * pinLength),
        pin: header,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    tl.to(state, { frame: FRAME_COUNT - 1, duration: 0.72, onUpdate: requestDraw }, 0)
      .to(hintRef.current, { opacity: 0, duration: 0.04 }, 0)
      .to(veilRef.current, { opacity: 1, duration: 0.1 }, 0.7)
      .to(card, { y: 0, opacity: 1, scale: 1, duration: 0.14, ease: "power2.out" }, 0.72)
      .to(
        "#floating-viewport-controls",
        { y: 0, opacity: 1, pointerEvents: "auto", duration: 0.08, ease: "power2.out" },
        0.8
      )
      .to({}, { duration: 0.12 }, 0.88);

    return () => {
      cleanupBase();
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <header
        ref={headerRef}
        className="relative h-[100svh] min-h-[520px] w-full overflow-hidden bg-[#fbf4ec] text-ink"
      >
        {/* Instant first paint until the canvas has drawn its first frame */}
        <picture>
          <source
            media="(max-aspect-ratio: 4/5)"
            srcSet="/videos/ganeshji-hero-mobile-poster.jpg"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/videos/ganeshji-hero-poster.jpg"
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[center_30%] [@media(min-aspect-ratio:4/5)]:object-center"
          />
        </picture>

        {/* Bal Ganesh invocation, scrubbed frame-by-frame with scroll */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-300"
          style={{ opacity: 0 }}
        />

        {/* Ivory veil, faded in with the card so names read without dimming Ganesh ji's face */}
        <div
          ref={veilRef}
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#fbf4ec]/90 via-[#fbf4ec]/30 to-transparent"
          style={{ opacity: 0 }}
        />

        {/* Hero Content Overlay: card sits low so the face, crown and halo stay visible above it */}
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-end px-4 pb-10 pt-16 text-center sm:pb-6">
          <div
            ref={cardRef}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#c9a227]/50 bg-[#fbf4ec]/80 p-6 shadow-ornate backdrop-blur-md will-change-transform sm:px-8 sm:py-6"
            style={{ opacity: 0, transform: "translate3d(0, 60px, 0) scale(0.96)" }}
          >
            {/* Specular Glint Sweep on Card */}
            <span
              className="gold-shimmer-sweep pointer-events-none absolute inset-0 opacity-40"
              aria-hidden="true"
            />

            {/* Foil Monogram Rings */}
            <Ornament
              name="monogram-rings"
              className="mx-auto block h-9 w-[4.5rem] text-gold sm:h-11 sm:w-[5.5rem]"
            />

            {/* Wedding Invitation Eyebrow */}
            <p className="mt-2 flex items-center justify-center gap-2.5 text-xs font-medium uppercase tracking-[0.3em] text-gold-deep sm:text-sm">
              <span className="h-px w-6 sm:w-8 bg-[#c9a227]/60" aria-hidden="true" />
              <span>{eyebrow}</span>
              <span className="h-px w-6 sm:w-8 bg-[#c9a227]/60" aria-hidden="true" />
            </p>

            {/* Primary Couple Name (from Google Sheets) */}
            <h1 className="mt-2 font-heading text-4xl font-normal tracking-wide text-primary-dark sm:text-5xl">
              {primaryName}
            </h1>

            {/* Sacred Lotus Fleuron Divider */}
            <div className="my-1.5 flex items-center justify-center gap-3" aria-hidden="true">
              <span className="h-px w-8 sm:w-10 bg-[#c9a227]/60" />
              <span className="font-heading text-xl sm:text-2xl text-gold">{"❦"}</span>
              <span className="h-px w-8 sm:w-10 bg-[#c9a227]/60" />
            </div>

            {/* Secondary Couple Name (from Google Sheets) */}
            <p className="font-heading text-4xl font-normal tracking-wide text-primary-dark sm:text-5xl">
              {secondaryName}
            </p>

            {/* Blessing Passage (from Google Sheets) */}
            {blessing && (
              <p className="mt-3 font-devanagari text-sm font-semibold tracking-widest text-gold-deep sm:text-base">
                {blessing}
              </p>
            )}
          </div>
        </div>

        {/* Scroll hint: visible on load, fades as soon as scrubbing begins */}
        <div
          ref={hintRef}
          className="pointer-events-none absolute inset-x-0 bottom-10 z-20 flex flex-col items-center gap-2"
          aria-hidden="true"
        >
          <span className="flex h-14 w-10 items-start justify-center rounded-full border-2 border-gold-deep p-2.5">
            <span className="scroll-overlay-dot h-2.5 w-2.5 rounded-full bg-gold-deep" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-deep">
            {isHi ? "आशीर्वाद हेतु स्क्रॉल करें" : "Scroll to begin"}
          </span>
          <span className="scroll-overlay-chevron text-2xl leading-none text-gold-deep">⌄</span>
        </div>
      </header>
    </div>
  );
}
