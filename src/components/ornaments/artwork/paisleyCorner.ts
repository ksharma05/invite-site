/**
 * Paisley corner — a single buta with nested paisley fill + henna hatch, drawn
 * once and reused 4× at frame corners by rotation/scale, so it behaves as one
 * motif rather than four bespoke corners.
 */

import { GOLD_FOIL_DEFS } from "./helpers.ts";

export const paisleyCorner = {
  name: "paisley-corner",
  viewBox: "0 0 64 64",
  defs: GOLD_FOIL_DEFS,
  body: `
    <g fill="none" stroke="currentColor" stroke-linejoin="round">
      <!-- Outer buta outline -->
      <path d="M14 52 C 10 30 22 8 50 6 C 50 6 40 26 44 40 C 46 48 30 50 20 52 Z"
            stroke-width="1.6"/>
      <!-- Inner nested paisley -->
      <path d="M18 48 C 15 32 24 14 44 12 C 42 24 36 40 24 46 Z"
            stroke-width="0.8" opacity="0.8"/>
      <!-- veining / fill dot at the curl -->
      <circle cx="16" cy="38" r="1.3" fill="currentColor"/>
      <circle cx="18" cy="34" r="0.9" fill="currentColor"/>
      <circle cx="21" cy="31" r="0.7" fill="currentColor"/>
      <!-- leaflets at the sprouting tip -->
      <circle cx="48" cy="12" r="1.1" fill="none" stroke-width="0.8"/>
      <path d="M52 6 C 54 8 54 12 52 14" stroke-width="0.6" opacity="0.7"/>
      <path d="M48 22 C 50 30 48 36 44 40" stroke-width="0.6" opacity="0.6"/>
    </g>
  `,
};
