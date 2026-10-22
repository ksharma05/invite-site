"use client";

import type { Lang, Side } from "@/lib/content/types";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MusicToggle } from "@/components/MusicToggle";

export interface FloatingControlsProps {
  lang: Lang;
  side: Side | undefined;
  className?: string;
}

/**
 * Fixed Viewport Controls Cluster
 * Houses the Language Switcher (Eng | हिन्दी) and Music Toggle side by side.
 * Stays permanently fixed on the viewport for flawless, effortless interaction across all sections.
 */
export function FloatingControls({ lang, side, className = "" }: FloatingControlsProps) {
  return (
    <aside
      id="floating-viewport-controls"
      aria-label="Site Controls"
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 sm:top-6 sm:right-7 sm:gap-2.5 transition-all duration-300 ${className}`}
      style={{ opacity: 0, transform: "translate3d(0, -14px, 0)", pointerEvents: "none" }}
    >
      <LanguageSwitcher lang={lang} side={side} />
      <MusicToggle lang={lang} />
    </aside>
  );
}
