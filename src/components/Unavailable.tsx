import type { Lang } from "@/lib/content/types";
import { t } from "@/lib/i18n/dictionary";

/** Shown instead of a misleading invitation when no valid content exists. No error details are exposed. */
export function Unavailable({ lang }: { lang: Lang }) {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <h1 className="font-heading text-2xl text-primary-dark">{t(lang, "unavailableTitle")}</h1>
      <p className="max-w-md text-ink-muted">{t(lang, "unavailableBody")}</p>
    </main>
  );
}
