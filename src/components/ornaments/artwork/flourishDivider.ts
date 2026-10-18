/**
 * Flourish divider — a foiled lotus centre with two inked ruled tails. Useful
 * as a standalone ornament and as the section-break motif. Replaces the plain
 * `❧` glyph used in the current design.
 */

import { GOLD_FOIL_DEFS, SOFT_DROP_DEFS } from "./helpers.ts";

export const flourishDivider = {
  name: "flourish-divider",
  viewBox: "0 0 480 40",
  defs: GOLD_FOIL_DEFS + SOFT_DROP_DEFS,
  body: `
    <g fill="none" stroke="currentColor" stroke-linecap="round">
      <!-- left rule with a curl -->
      <path d="M8 20 H 196" stroke-width="1" opacity="0.7"/>
      <path d="M196 20 C 206 20, 210 14, 216 14" stroke-width="1.2" opacity="0.8"/>

      <!-- right rule with a curl -->
      <path d="M472 20 H 284" stroke-width="1" opacity="0.7"/>
      <path d="M284 20 C 274 20, 270 14, 264 14" stroke-width="1.2" opacity="0.8"/>

      <!-- foiled lotus in the centre -->
      <g transform="translate(240 20)" stroke-linecap="round" stroke-linejoin="round">
        <!-- open petals -->
        <path d="M0 -2 C 12 -10, 20 -12, 24 -6 C 16 -2, 6 2, 0 2 Z" stroke-width="1.3"
              stroke="url(#goldFoil)" opacity="0.9"/>
        <path d="M0 -2 C -12 -10, -20 -12, -24 -6 C -16 -2, -6 2, 0 2 Z" stroke-width="1.3"
              stroke="url(#goldFoilWarm)" opacity="0.9"/>
        <path d="M0 -3 C 4 -14, 4 -20, 0 -24 C -4 -20, -4 -14, 0 -3 Z" stroke-width="1.2"/>
        <circle cx="0" cy="0" r="2" fill="url(#goldSheen)" opacity="0.8"/>
      </g>
    </g>
  `,
};
