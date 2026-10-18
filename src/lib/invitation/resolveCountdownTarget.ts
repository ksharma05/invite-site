import type { Side, WeddingEvent } from "@/lib/content/types";

/**
 * Resolves which event the countdown counts down to (Phase 7).
 *
 * The countdown heading says "counting down to the wedding", so the target must
 * be the wedding ceremony explicitly — never just the first spreadsheet row.
 * Events are ordered by `order` in the content pipeline, so "first row" and
 * "earliest event" are not the same as "the wedding".
 *
 * Strategy (documented, not implicit):
 *  1. Only candidates are events that are `active` and visible to the current side.
 *  2. Prefer the event explicitly identified as the wedding ceremony.
 *     Recognition is by a stable marker, in preference order:
 *       - the event id contains "wedding" (ids are stable identifiers, never row
 *         numbers, per the content schema), or failing that
 *       - the English title matches a known main-ceremony label.
 *  3. If no ceremony is found, fall back to the earliest-ordered visible event so
 *     the countdown still points at a real, next-up moment rather than nothing.
 *
 * Returns null when no visible active event exists (e.g. everything hidden).
 */

const CEREMONY_ID_MARKERS = ["wedding", "ceremony", "phere", "mundap", "vivaah", "विवाह"];
const CEREMONY_TITLE_MATCH = /\b(wedding|marriage|vivaah|विवाह)\b/i;

export function resolveCountdownTarget(
  events: readonly WeddingEvent[],
  side: Side
): WeddingEvent | null {
  const visibleActive = events
    .filter((e) => e.active && (e.visibleTo === "both" || e.visibleTo === side))
    .sort((a, b) => a.order - b.order);

  if (visibleActive.length === 0) return null;

  const hero = visibleActive.find(
    (e) =>
      CEREMONY_ID_MARKERS.some((m) => e.id.toLowerCase().includes(m)) ||
      CEREMONY_TITLE_MATCH.test(e.title.en)
  );

  return hero ?? visibleActive[0]!;
}
