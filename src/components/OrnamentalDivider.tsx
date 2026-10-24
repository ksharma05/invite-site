import { Ornament } from "@/components/ornaments/Ornament";

/**
 * Decorative ornamental divider. Hidden from assistive technology (pure decoration,
 * carries no information beyond the section rhythm supplied by real headings).
 */
export function OrnamentalDivider() {
  return (
    <div aria-hidden="true" className="my-2 flex items-center justify-center gap-3">
      <span className="h-px w-20 bg-gradient-to-r from-transparent via-gold-line to-gold" />
      <span className="text-xs text-gold/60">✦</span>
      <Ornament name="lotus-emblem" className="h-4 w-9 text-gold-deep" />
      <span className="text-xs text-gold/60">✦</span>
      <span className="h-px w-20 bg-gradient-to-l from-transparent via-gold-line to-gold" />
    </div>
  );
}
