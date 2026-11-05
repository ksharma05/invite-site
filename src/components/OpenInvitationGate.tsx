"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Lang } from "@/lib/content/types";
import { t } from "@/lib/i18n/dictionary";
import { Ornament } from "@/components/ornaments/Ornament";
import { useBackgroundMusic } from "@/components/music/BackgroundMusic";

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const panelGlow = (edge: "left" | "right") =>
  `radial-gradient(ellipse 70% 60% at ${edge === "left" ? "100%" : "0%"} 50%, rgba(201,162,39,0.14), transparent 70%)`;

/**
 * Full-screen welcome gate. The guest's tap is the user gesture browsers require
 * before audio, so the background music starts as the doors part.
 */
export function OpenInvitationGate({ lang }: { lang: Lang }) {
  const { start } = useBackgroundMusic();
  const [open, setOpen] = useState(true);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLSpanElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const openingRef = useRef(false);

  const isHi = lang === "hi";
  const tapText = t(lang, "gateTapToOpen");

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    window.scrollTo(0, 0);
    buttonRef.current?.focus({ preventScroll: true });
    return () => {
      html.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    const items = contentRef.current?.querySelectorAll("[data-gate-item]");
    if (!items?.length) return;
    if (prefersReducedMotion()) {
      gsap.set(items, { opacity: 1 });
      return;
    }
    const tween = gsap.fromTo(
      items,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.9, stagger: 0.18, ease: "power2.out", delay: 0.15 }
    );
    return () => {
      tween.kill();
    };
  }, []);

  const handleOpen = () => {
    if (openingRef.current) return;
    openingRef.current = true;
    start();

    const finish = () => {
      setOpen(false);
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    if (prefersReducedMotion()) {
      gsap.to(rootRef.current, { opacity: 0, duration: 0.3, onComplete: finish });
      return;
    }

    gsap
      .timeline({ onComplete: finish })
      .to(contentRef.current, { opacity: 0, y: -10, duration: 0.4, ease: "power2.in" })
      .to(leftRef.current, { xPercent: -100, duration: 1.1, ease: "power3.inOut" }, 0.25)
      .to(rightRef.current, { xPercent: 100, duration: 1.1, ease: "power3.inOut" }, 0.25);
  };

  if (!open) return null;

  return (
    <div ref={rootRef} className="fixed inset-0 z-[60] overflow-hidden">
      <div
        ref={leftRef}
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1/2 border-r border-gold/45 bg-[#fbf4ec] shadow-[6px_0_24px_-12px_rgba(138,106,29,0.35)]"
        style={{ backgroundImage: panelGlow("left") }}
      />
      <div
        ref={rightRef}
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-1/2 border-l border-gold/45 bg-[#fbf4ec] shadow-[-6px_0_24px_-12px_rgba(138,106,29,0.35)]"
        style={{ backgroundImage: panelGlow("right") }}
      />

      <button
        ref={buttonRef}
        type="button"
        onClick={handleOpen}
        aria-label={tapText}
        className="absolute inset-0 flex cursor-pointer items-center justify-center px-8 focus:outline-none"
      >
        <span ref={contentRef} className="flex flex-col items-center text-center">
          <span data-gate-item className="opacity-0">
            <Ornament name="lotus-emblem" className="h-6 w-14 text-gold sm:h-7 sm:w-16" />
          </span>

          <span
            data-gate-item
            className={`mt-6 bg-gradient-to-r from-gold-deep via-gold to-gold-deep bg-clip-text px-3 pb-1 text-3xl leading-tight font-medium text-transparent opacity-0 sm:text-5xl ${
              isHi ? "font-devanagari" : "font-heading italic"
            }`}
          >
            {t(lang, "gateInvited")}
          </span>

          <span
            data-gate-item
            aria-hidden="true"
            className="mt-6 h-px w-28 bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 sm:w-36"
          />

          <span data-gate-item className="mt-6 opacity-0">
            <span
              className={`animate-gate-breath block text-[11px] text-gold-deep sm:text-xs ${
                isHi ? "font-devanagari tracking-[0.12em]" : "tracking-[0.32em] uppercase"
              }`}
            >
              {tapText}
            </span>
          </span>
        </span>
      </button>
    </div>
  );
}
