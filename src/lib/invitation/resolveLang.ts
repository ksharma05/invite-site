import type { Lang } from "@/lib/content/types";

export const LANG_PARAM = "lang";
export const LANG_COOKIE = "lang";
export const DEFAULT_LANG: Lang = "en";
const VALID_LANGS: Lang[] = ["en", "hi"];

export function isLang(value: string): value is Lang {
  return (VALID_LANGS as string[]).includes(value);
}

/**
 * Resolves the active language with a strict precedence so server and first
 * client render always agree (Phase 3 requirement — no language/name-order flash):
 *   1. Explicit, valid `?lang=` URL param.
 *   2. A previously saved preference (the `lang` cookie, set by middleware
 *      whenever a visitor used an explicit `?lang=`), if still valid.
 *   3. Documented default ("en").
 * A saved preference can never silently override an explicit URL param —
 * only steps 2/3 compete, and an explicit param always wins.
 */
export function resolveLang(
  rawLang: string | string[] | undefined,
  savedPreference?: string
): Lang {
  const value = Array.isArray(rawLang) ? rawLang[0] : rawLang;
  if (value && isLang(value)) return value;
  if (savedPreference && isLang(savedPreference)) return savedPreference;
  return DEFAULT_LANG;
}

export function buildHref(params: {
  side?: string;
  lang?: Lang;
  extra?: Record<string, string>;
}): string {
  const search = new URLSearchParams();
  if (params.side) search.set("side", params.side);
  if (params.lang) search.set("lang", params.lang);
  if (params.extra) {
    for (const [key, value] of Object.entries(params.extra)) search.set(key, value);
  }
  const query = search.toString();
  return query ? `/?${query}` : "/";
}
