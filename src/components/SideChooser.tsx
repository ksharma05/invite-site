import Link from "next/link";
import type { Lang } from "@/lib/content/types";
import { t } from "@/lib/i18n/dictionary";
import { buildHref } from "@/lib/invitation/resolveLang";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { OrnamentalDivider } from "@/components/OrnamentalDivider";

export function SideChooser({ lang }: { lang: Lang }) {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16 text-center"
    >
      <LanguageSwitcher lang={lang} side={undefined} />
      <div className="space-y-3">
        <h1 className="font-heading text-3xl font-medium text-primary-dark sm:text-4xl">
          {t(lang, "chooseSideTitle")}
        </h1>
        <p className="mx-auto max-w-md text-ink-muted">{t(lang, "chooseSideSubtitle")}</p>
      </div>
      <OrnamentalDivider />
      <div className="flex w-full max-w-sm flex-col gap-4 sm:flex-row">
        <Link
          href={buildHref({ side: "bride", lang })}
          className="flex-1 rounded-ornate bg-primary px-6 py-4 font-heading text-lg text-white shadow-soft transition hover:bg-primary-dark"
        >
          {t(lang, "brideSideCta")}
        </Link>
        <Link
          href={buildHref({ side: "groom", lang })}
          className="flex-1 rounded-ornate border-2 border-primary px-6 py-4 font-heading text-lg text-primary-dark transition hover:bg-surface-alt"
        >
          {t(lang, "groomSideCta")}
        </Link>
      </div>
    </main>
  );
}
