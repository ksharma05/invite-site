/**
 * Temple-arch silhouette — a simplified, two-path pointed portal (toran/kudai)
 * outline for use as a faint backdrop (e.g. behind the diya/aarti-trail hero).
 * Extracted from `mandalaArch.ts`'s outer/inner portal paths, with the fine
 * rosette/rays/dotted-ring/centre-emblem detail dropped so the shape stays
 * legible at large scale and very low opacity, where fine linework would
 * otherwise blur into noise. Recommended usage: ~opacity-10 to opacity-15 at
 * hero scale on a dark background.
 */

export const templeArchSilhouette = {
  name: "temple-arch-silhouette",
  viewBox: "0 0 260 150",
  defs: "",
  body: `
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M30 150 C30 76 128 18 130 16 C132 18 230 76 230 150 Z" stroke-width="6"/>
      <path d="M44 150 C44 82 130 30 130 30 C130 30 216 82 216 150 Z" stroke-width="2.2"/>
    </g>
  `,
};
