/**
 * EventMotif — resolves a ceremony to one distinct ornament and renders it.
 *
 * Mapping is defence-in-depth: it tries the stable `id` first, then falls back
 * to matching the bilingual titles, so a brand-new sheet row (which gets an
 * unknown `id`) still renders a sensible ornament instead of a blank. Pure
 * presentation — no schema or sheet change, preserving the Phase 4 decision
 * that a new schedule row needs "no code change".
 */

import { resolveMotif } from "./resolveMotif";
import { Ornament } from "./Ornament";

interface EventMotifProps {
  id: string;
  titleEn: string;
  titleHi: string;
  className?: string;
}

/** Renders the event's motif, stamped with a data-motif attr for testing. */
export function EventMotif({ id, titleEn, titleHi, className }: EventMotifProps) {
  const motif = resolveMotif(id, titleEn, titleHi);
  return (
    <span data-motif={motif} className={className}>
      <Ornament name={motif} />
    </span>
  );
}
