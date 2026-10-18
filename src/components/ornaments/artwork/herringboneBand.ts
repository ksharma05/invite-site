/**
 * Herringbone band — a slender woven gold ribbon with a bevel highlight. Used
 * as the page-bottom rail and as a divider between major sections. A tiny
 * pattern tile keeps it clean at any width.
 */

import { GOLD_FOIL_DEFS } from "./helpers.ts";

export const herringboneBand = {
  name: "herringbone-band",
  viewBox: "0 0 1200 16",
  defs:
    GOLD_FOIL_DEFS +
    `
  <pattern id="herringbone" x="0" y="0" width="40" height="16" patternUnits="userSpaceOnUse">
    <g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-linecap="round">
      <path d="M0 12 L 12 6 L 24 12 L 36 6 L 48 12 L 60 6" stroke-width="1.5" opacity="0.9"/>
      <path d="M0 10 L 12 4 L 24 10 L 36 4 L 48 10 L 60 4" stroke-width="0.9" opacity="0.55"/>
      <path d="M6 5 L 14 9 L 22 5 L 30 9 L 38 5 L 46 9" stroke-width="0.7" opacity="0.4"/>
    </g>
  </pattern>`,
  body: `
    <rect width="1200" height="16" fill="url(#herringbone)"/>
  `,
};
