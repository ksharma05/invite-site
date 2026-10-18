"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import { Ornament } from "@/components/ornaments/Ornament";
import { mandalaArchLayered } from "@/components/ornaments/artwork/mandalaArchLayered";
import { monogramRingsLayered } from "@/components/ornaments/artwork/monogramRingsLayered";
import {
  FINAL_BEAT,
  HERO_DURATION,
  PIECES,
  SEEN_KEY,
  TOTAL_BEATS,
  beatTime,
  exposureFlicker,
  isOptional,
  pieceBeat,
  stageJitter,
  wobble,
} from "@/lib/motion/beats";
import type { PieceGroup } from "@/lib/motion/beats";

gsap.registerPlugin(useGSAP);

type Lang = "en" | "hi";

/**
 * Props tagging an element as stop-motion piece `group` #`i`, with its layout
 * classes. `data-i` is the piece's index within its OWN group (the beat map and
 * the wobble seed both depend on it), never a global counter.
 */
function sm(group: PieceGroup, i: number, className = "") {
  return {
    className: className ? `sm-piece ${className}` : "sm-piece",
    "data-sm": group,
    "data-i": String(i),
  };
}

/** Groups whose pieces are stamped HTML copy, not cut-out props on the table. */
const COPY: ReadonlySet<PieceGroup> = new Set<PieceGroup>([
  "eyebrowRule",
  "eyebrow",
  "blessing",
  "name",
  "nameRule",
  "fleuron",
]);

/** Where a cut-out begins its exposure: off the table, or already placed. */
function startPose(group: PieceGroup, i: number): gsap.TweenVars {
  const seed = PIECES[group] * i + group.length;
  switch (group) {
    case "chandShadow":
    case "hubDisc":
    case "hubRing":
    case "dot":
    case "rimOuter":
    case "rimQuarter":
    case "ringLeft":
    case "ringRight":
    case "bow":
    case "needle":
      // Dropped in from above — falls, tiny and turned.
      return { visibility: "hidden", scale: 0.4, y: -14, rotation: wobble(seed, 26) };
    case "spoke":
      // Twisted onto the wheel rather than laid flat on it.
      return { visibility: "hidden", rotation: 90, scale: 0.82, transformOrigin: "92% 50%" };
    case "petalOuter":
    case "petalInner":
      // Folded against the centre, then hinged open.
      return { visibility: "hidden", scale: 0.42, transformOrigin: "50% 100%" };
    case "archOuter":
    case "archInner":
      // Curved down from above, springing slightly about its own top edge.
      return { visibility: "hidden", y: -20, scale: 0.94, transformOrigin: "50% 0%" };
    default:
      // Copy is present from the start (it is content, not decoration); it gets
      // no pose at all so a text node can never land half-visible.
      return {};
  }
}

/**
 * Corrections and props that belong to a whole group rather than a piece.
 *
 * Keyed by beat, so these are checked against the same act ranges as the piece
 * schedule — every key here must land inside its act, and a "hold" beat must
 * introduce nothing new.
 */
const CORRECTIONS: ReadonlyArray<{
  beat: number;
  sel: string;
  vars: gsap.TweenVars;
}> = [
  // Truing the wheel up: one visible correction pass.
  { beat: 22, sel: '[data-sm-group="wheel"]', vars: { rotation: 3.1 } },
  { beat: 24, sel: '[data-sm-group="wheel"]', vars: { rotation: 0 } },
  // The turntable jumps a hair while the rosette is re-pressed.
  { beat: 35, sel: '[data-sm-group="rosette"]', vars: { x: 1.2, y: -0.8 } },
  { beat: 36, sel: '[data-sm-group="rosette"]', vars: { x: 0, y: 0 } },
  // Foil glint: four DISCRETE highlight positions, then gone. Real foil tilted
  // between frames, never a gradient sweep.
  { beat: 43, sel: ".sm-glint", vars: { autoAlpha: 0.8, x: 0 } },
  { beat: 44, sel: ".sm-glint", vars: { x: 90 } },
  { beat: 45, sel: ".sm-glint", vars: { x: 200 } },
  { beat: 46, sel: ".sm-glint", vars: { x: 320, autoAlpha: 0 } },
  // Two deliberate reposition jumps keep the bloom alive.
  { beat: 50, sel: '[data-sm-group="petalOuter"]', vars: { x: 0.7 } },
  { beat: 51, sel: '[data-sm-group="petalOuter"]', vars: { x: 0 } },
  { beat: 54, sel: '[data-sm-group="petalOuter"]', vars: { y: -0.6 } },
  { beat: 55, sel: '[data-sm-group="petalOuter"]', vars: { y: 0 } },
  // The needle tool rests on the table for exactly one exposure (beat 66)...
  { beat: 66, sel: ".sm-tool-shadow", vars: { autoAlpha: 0.22 } },
  // ...then both it and its hairline shadow leave the frame.
  { beat: 67, sel: '[data-sm="needle"]', vars: { visibility: "hidden" } },
  { beat: 67, sel: ".sm-tool-shadow", vars: { autoAlpha: 0 } },
  // The canopy is a prop: placeable only as its halves arrive (arch: 70-71).
  { beat: 70, sel: '[data-sm-group="arch"]', vars: { opacity: 1 } },
  // Both halves land, leaving a visible seam at the apex (outer arch 70-71).
  { beat: 72, sel: ".sm-arch-seam", vars: { autoAlpha: 0.55 } },
  // The inner arch (73-74) covers the apex; the seam is corrected away.
  { beat: 75, sel: ".sm-arch-seam", vars: { autoAlpha: 0 } },
  { beat: 75, sel: '[data-sm-group="arch"]', vars: { y: 1 } },
  { beat: 76, sel: '[data-sm-group="arch"]', vars: { y: 0 } },
  // Final hold: everything square, nothing arriving, nothing moving.
  {
    beat: FINAL_BEAT,
    sel: '[data-sm-group="rosette"], [data-sm-group="petalOuter"], [data-sm-group="wheel"]',
    vars: { x: 0, y: 0, rotation: 0 },
  },
];

/**
 * The stop-motion hero.
 *
 * Assembled like a real shot: one exposure per 100ms beat (the 10fps an
 * animator shoots at), each change a DISCRETE `set` at the boundary — nothing
 * ever tweens between exposures. 86 beats = 8.6s, plays ONCE, then the
 * timeline kills itself, so there is no loop, no ticker and nothing to keep
 * repainting.
 *
 * Safe by construction (the same contract as `Reveal.tsx`):
 *  - SSR emits the FINISHED hero. Pre-start poses exist only while the
 *    timeline runs, so JS-off, reduced-motion and the final frame are one and
 *    the same DOM.
 *  - A repeat visit in the same session skips to the finished state.
 *  - Only `transform`/`opacity` animate; `will-change` is cleared on completion.
 *  - `window.__heroSeek(t)` exists purely so a Playwright check can scrub
 *    frames deterministically. It is bound to nothing a visitor can trigger.
 */
export function StopMotionHero({
  lang,
  blessing,
  primaryName,
  secondaryName,
}: {
  lang: Lang;
  blessing: string | null;
  primaryName: string;
  secondaryName: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [armed, setArmed] = useState(false);

  useLayoutEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function" ||
      !window.matchMedia("(prefers-reduced-motion: no-preference)").matches
    ) {
      return;
    }
    try {
      if (window.sessionStorage?.getItem(SEEN_KEY) === "1") return;
    } catch {
      /* storage disabled: play it anyway */
    }
    setArmed(true);
  }, []);

  useGSAP(
    () => {
      if (!armed) return;
      const root = containerRef.current;
      if (!root) return;
      const q = (sel: string) => root.querySelectorAll(sel);

      const tl = gsap.timeline({
        paused: true,
        onComplete: () => {
          try {
            window.sessionStorage?.setItem(SEEN_KEY, "1");
          } catch {
            /* ignore */
          }
          // Nothing survives the shot: no tweens, no promoted layers, nothing
          // that could ever become a continuous loop. `data-sm-done` is written
          // imperatively and never rendered by React, so a re-render cannot
          // clobber the flag the checks read.
          tl.kill();
          q(".sm-piece, .sm-prop, .sm-rosette, .sm-stage__plate, .sm-exposure").forEach((el) =>
            (el as HTMLElement).style.removeProperty("will-change")
          );
          root.setAttribute("data-sm-done", "true");
        },
      });

      // Only groups actually rendered on this side/language are animated, so a
      // missing optional `blessing` row is not treated as a defect.
      const groups = (Object.keys(PIECES) as PieceGroup[]).filter(
        (g) => root.querySelector(`[data-sm="${g}"]`) !== null
      );

      /**
       * Place something at an exposure boundary.
       *
       * Foil pieces toggle `visibility`, never `opacity`: their authored
       * `opacity="0.55"` (henna dots) / `0.95` (petals) IS the ink weight of
       * the foil, so forcing `opacity: 1` would flatten the whole mandala.
       * HTML copy toggles `opacity` instead, which keeps the text in the
       * accessibility tree and its layout stable — still a discrete stamp.
       */
      const on = (at: number, target: gsap.TweenTarget, vars: gsap.TweenVars) =>
        tl.set(target, vars, at);

      for (let beat = 0; beat < TOTAL_BEATS; beat++) {
        const at = beatTime(beat);

        // Every exposure was lit individually; the clamped set creeps a hair.
        // Both change only AT a boundary, never between two exposures.
        on(at, ".sm-exposure", { opacity: exposureFlicker(beat) });
        const { x, y } = stageJitter(beat);
        on(at, ".sm-stage__plate", { x, y });

        // --- pieces landing on this exposure ---------------------------------
        for (const group of groups) {
          for (let i = 0; i < PIECES[group]; i++) {
            if (pieceBeat(group, i) !== beat) continue;
            const sel = `[data-sm="${group}"][data-i="${i}"]`;
            const seed = PIECES[group] * i + group.length;
            if (COPY.has(group)) {
              on(at, sel, { opacity: 1 });
            } else {
              on(at, sel, {
                visibility: "visible",
                scale: 1,
                x: wobble(seed + 1, 0.9),
                y: 0,
                rotation: 0,
              });
            }
          }
        }

        // --- the animator's corrections (beat-checked against the shot list) --
        // gsap.context scopes each comma-separated part of a selector list
        // (verified in gsap-core: toArray(v, scope.querySelectorAll)), so a
        // multi-group list here cannot reach outside the hero.
        for (const fix of CORRECTIONS) {
          if (fix.beat !== beat) continue;
          on(at, fix.sel, fix.vars);
        }
      }

      // Pre-start poses, applied in the same tick as play() so the finished
      // hero is never visible for a frame before the shot begins.
      gsap.set(".sm-prop", { force3D: true });
      for (const group of groups) {
        for (let i = 0; i < PIECES[group]; i++) {
          const el = root.querySelector(`[data-sm="${group}"][data-i="${i}"]`);
          if (!el) {
            if (!isOptional(group)) {
              console.warn(`stop-motion: missing piece [${group}][${i}]`);
            }
            continue;
          }
          if (COPY.has(group)) {
            gsap.set(el, { opacity: 0 });
          } else {
            gsap.set(el, startPose(group, i));
          }
        }
      }
      gsap.set(".sm-glint", { x: -60, autoAlpha: 0 });
      gsap.set(".sm-arch-seam, .sm-tool-shadow", { autoAlpha: 0 });
      gsap.set(root.querySelectorAll('[data-sm-group="arch"]'), { opacity: 0 });

      (window as unknown as { __heroSeek?: (t: number) => void }).__heroSeek = (t: number) => {
        tl.pause();
        tl.time(Math.max(0, Math.min(HERO_DURATION, t)));
      };

      tl.play();
      return () => {
        tl.kill();
        delete (window as unknown as { __heroSeek?: unknown }).__heroSeek;
      };
    },
    { scope: containerRef, dependencies: [armed] }
  );

  const eyebrow = lang === "hi" ? "विवाह निमंत्रण" : "Wedding Invitation";

  return (
    <div
      ref={containerRef}
      id="hero-stage"
      className="sm-stage"
      data-sm-armed={armed ? "true" : "false"}
      data-sm-beats={TOTAL_BEATS}
      data-sm-duration={HERO_DURATION}
    >
      {/* The paper the shot is photographed on. Desktop gets the 16:9 band,
          mobile the portrait-friendly crop; avif -> webp -> jpeg. */}
      <div className="sm-stage__plate" aria-hidden="true">
        <picture>
          <source
            media="(min-width: 640px)"
            srcSet="/hero/stage-wide-1440.avif 1440w, /hero/stage-wide-960.avif 960w"
            sizes="(min-width: 768px) 736px, 100vw"
            type="image/avif"
          />
          <source
            media="(min-width: 640px)"
            srcSet="/hero/stage-wide-1440.webp 1440w, /hero/stage-wide-960.webp 960w"
            sizes="(min-width: 768px) 736px, 100vw"
            type="image/webp"
          />
          <source srcSet="/hero/stage-720.avif" type="image/avif" />
          <img
            src="/hero/stage-720.jpg"
            alt=""
            width={720}
            height={540}
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      </div>

      <div className="sm-stage__content">
        <span className="sm-exposure" aria-hidden="true" />

        {/* Foil-gold monogram: the couple's marks above the invitation line */}
        <Ornament art={monogramRingsLayered} className="sm-prop block h-12 w-24 sm:h-14 sm:w-28" />

        <p className="mt-4 flex items-center gap-4 text-xs font-medium uppercase tracking-[0.22em] text-accent sm:tracking-[0.35em]">
          <span {...sm("eyebrowRule", 0, "h-px w-8 bg-gold-line")} aria-hidden="true" />
          <span {...sm("eyebrow", 0)}>{eyebrow}</span>
          <span {...sm("eyebrowRule", 1, "h-px w-8 bg-gold-line")} aria-hidden="true" />
        </p>

        {/* Auspicious line — only when the family supplies a `blessing` row. */}
        {blessing && (
          <p
            {...sm(
              "blessing",
              0,
              "mt-3 font-devanagari text-sm font-medium tracking-[0.28em] text-gold-deep"
            )}
            lang={lang}
          >
            {blessing}
          </p>
        )}

        {/* Kudai (wedding-portal) crown behind the names */}
        <div className="relative mt-2 w-full max-w-[480px]">
          <Ornament
            art={mandalaArchLayered}
            className="sm-prop block h-20 w-full text-gold sm:h-28"
          />
          {/* Foil glint and the canopy's apex seam: overlays moved in discrete
              steps, never as a sweep. */}
          <span
            className="sm-glint pointer-events-none absolute inset-y-0 -left-24 w-24 bg-gradient-to-r from-transparent via-white/45 to-transparent"
            aria-hidden="true"
          />
          <span
            className="sm-arch-seam pointer-events-none absolute left-1/2 top-[9%] h-5 w-px -translate-x-1/2 bg-[#e6d5be]"
            aria-hidden="true"
          />
          <span
            className="sm-tool-shadow pointer-events-none absolute right-4 top-[38%] h-px w-12 rotate-[-38deg] bg-[#3b2a21]"
            aria-hidden="true"
          />
        </div>

        <h1
          id="hero-heading"
          {...sm(
            "name",
            0,
            "mt-1 font-heading text-5xl font-medium leading-tight text-primary-dark sm:text-6xl"
          )}
          lang={lang}
        >
          {primaryName}
        </h1>

        <div className="my-3 flex items-center justify-center gap-3" aria-hidden="true">
          <span {...sm("nameRule", 0, "h-px w-12 bg-gold-line")} />
          <span {...sm("fleuron", 0, "font-heading text-2xl text-gold-deep sm:text-3xl")}>
            {"\u2766"}
          </span>
          <span {...sm("nameRule", 1, "h-px w-12 bg-gold-line")} />
        </div>

        <p
          {...sm("name", 1, "font-heading text-5xl font-medium text-primary-dark sm:text-6xl")}
          lang={lang}
        >
          {secondaryName}
        </p>
      </div>
    </div>
  );
}
