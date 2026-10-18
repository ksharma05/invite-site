/**
 * Decorative ornamental divider. Hidden from assistive technology (pure decoration,
 * carries no information beyond the section rhythm supplied by real headings).
 */
export function OrnamentalDivider() {
  return (
    <div aria-hidden="true" className="flex items-center justify-center gap-3">
      <span className="h-px w-16 bg-gradient-to-l from-border to-transparent" />
      <span className="text-lg text-accent" aria-hidden="true">
        ❧
      </span>
      <span className="h-px w-16 bg-gradient-to-r from-border to-transparent" />
    </div>
  );
}
