import Link from "next/link";
import type { Lang, Side } from "@/lib/content/types";
import { t } from "@/lib/i18n/dictionary";
import { buildHref } from "@/lib/invitation/resolveLang";

export interface LanguageSwitcherProps {
  lang: Lang;
  side: Side | undefined;
  className?: string;
}

/**
 * Royal Glassmorphic Language Switcher matching the Hero Invitation Card aesthetic.
 * Switching language preserves the current side, and vice versa.
 */
export function LanguageSwitcher({ lang, side, className = "" }: LanguageSwitcherProps) {
  return (
    <nav
      aria-label={t(lang, "languageLabel")}
      className={`relative inline-flex items-center gap-1 rounded-full border border-gold-bright/40 bg-black/60 p-1 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.7)] ${className}`}
    >
      {/* Subtle Specular Glint Sweep Highlight */}
      <span
        className="gold-shimmer-sweep pointer-events-none absolute inset-0 rounded-full opacity-40"
        aria-hidden="true"
      />

      <Link
        href={buildHref({ side, lang: "en" })}
        aria-current={lang === "en" ? "true" : undefined}
        className={`relative z-10 rounded-full px-3 py-1 text-xs sm:text-sm font-medium transition-all duration-300 ${
          lang === "en"
            ? "border border-gold-bright/60 bg-gold-bright/25 text-gold-bright shadow-[0_0_14px_rgba(212,175,55,0.45)]"
            : "text-white/70 hover:text-white"
        }`}
      >
        {t(lang, "languageEnglish")}
      </Link>
      <Link
        href={buildHref({ side, lang: "hi" })}
        aria-current={lang === "hi" ? "true" : undefined}
        className={`relative z-10 rounded-full px-3 py-1 font-devanagari text-xs sm:text-sm font-medium transition-all duration-300 ${
          lang === "hi"
            ? "border border-gold-bright/60 bg-gold-bright/25 text-gold-bright shadow-[0_0_14px_rgba(212,175,55,0.45)]"
            : "text-white/70 hover:text-white"
        }`}
      >
        {t(lang, "languageHindi")}
      </Link>
    </nav>
  );
}
