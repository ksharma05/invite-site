import Link from "next/link";
import type { Lang, Side } from "@/lib/content/types";
import { t } from "@/lib/i18n/dictionary";
import { buildHref } from "@/lib/invitation/resolveLang";

/**
 * Switching language preserves the current side, and vice versa (Phase 3 requirement).
 */
export function LanguageSwitcher({ lang, side }: { lang: Lang; side: Side | undefined }) {
  return (
    <nav aria-label={t(lang, "languageLabel")} className="flex items-center gap-2 text-sm">
      <Link
        href={buildHref({ side, lang: "en" })}
        aria-current={lang === "en" ? "true" : undefined}
        className={`rounded-full px-3 py-1 transition ${
          lang === "en" ? "bg-primary text-white" : "text-ink-muted hover:bg-surface-alt"
        }`}
      >
        {t(lang, "languageEnglish")}
      </Link>
      <Link
        href={buildHref({ side, lang: "hi" })}
        aria-current={lang === "hi" ? "true" : undefined}
        className={`rounded-full px-3 py-1 font-devanagari transition ${
          lang === "hi" ? "bg-primary text-white" : "text-ink-muted hover:bg-surface-alt"
        }`}
      >
        {t(lang, "languageHindi")}
      </Link>
    </nav>
  );
}
