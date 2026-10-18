"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { buildHref } from "@/lib/invitation/resolveLang";
import { t } from "@/lib/i18n/dictionary";
import type { Lang, Side } from "@/lib/content/types";

interface NavigationHeaderProps {
  lang: Lang;
  side: Side;
}

export function NavigationHeader({ lang, side }: NavigationHeaderProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gold-line/35 bg-[#21140f]/90 px-4 py-3 backdrop-blur-md sm:px-8">
      {/* Scroll progress gold hairline */}
      <div
        className="absolute top-0 left-0 h-[2.5px] bg-gradient-to-r from-gold via-gold-bright to-gold shadow-[0_0_8px_rgba(212,175,55,0.8)] transition-all duration-75 ease-out"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      <Link
        href={buildHref({ lang })}
        className="group inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gold-bright transition-colors hover:text-white sm:text-sm"
      >
        <span className="transition-transform duration-200 group-hover:-translate-x-1" aria-hidden="true">
          ←
        </span>
        <span>{t(lang, "switchSide")}</span>
      </Link>

      <LanguageSwitcher lang={lang} side={side} />
    </header>
  );
}
