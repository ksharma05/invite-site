/**
 * Toran band — a hanging string of mango leaves and marigold blossoms with
 * small brass bells, drawn as one repeating tile via `<pattern>`. The band
 * stretches edge-to-edge (`preserveAspectRatio="none"`) so it works at any
 * page width without repeating artifacts.
 */

import { GOLD_FOIL_DEFS } from "./helpers.ts";

const TILE_W = 360;

export const toranBand = {
  name: "toran-band",
  viewBox: "0 0 1200 64",
  defs:
    GOLD_FOIL_DEFS +
    `
  <pattern id="toranTile" x="0" y="0" width="${TILE_W}" height="64"
           patternUnits="userSpaceOnUse">
    <g fill="none" stroke="currentColor">
      <!-- string -->
      <path d="M0 8 H ${TILE_W}" stroke-width="1.2" opacity="0.85"/>

      <!-- mango leaves: two pointing right, two pointing left -->
      <g stroke-width="1.6">
        <path d="M20 8 C 4 20, 4 34, 20 40 C 36 34, 36 20, 20 8 Z"/>
        <path d="M100 8 C 116 20, 116 34, 100 40 C 84 34, 84 20, 100 8 Z"/>
        <path d="M200 8 C 184 20, 184 34, 200 40 C 216 34, 216 20, 200 8 Z"/>
        <path d="M280 8 C 296 20, 296 34, 280 40 C 264 34, 264 20, 280 8 Z"/>
      </g>
      <g stroke-width="0.7" opacity="0.7">
        <path d="M20 10 L 20 36"/>
        <path d="M100 10 L 100 36"/>
        <path d="M200 10 L 200 36"/>
        <path d="M280 10 L 280 36"/>
      </g>

      <!-- marigold blossoms cradled between the leaves -->
      <g stroke-width="0.9">
        <circle cx="60" cy="18" r="6"/>
        <circle cx="160" cy="18" r="6"/>
        <circle cx="260" cy="18" r="6"/>
      </g>

      <!-- brass bells hung on cord ends -->
      <g stroke-width="1">
        <path d="M60 24 C 56 30, 56 36, 60 40 C 64 36, 64 30, 60 24 Z"/>
        <path d="M160 24 C 156 30, 156 36, 160 40 C 164 36, 164 30, 160 24 Z"/>
        <path d="M260 24 C 256 30, 256 36, 260 40 C 264 36, 264 30, 260 24 Z"/>
      </g>
    </g>
  </pattern>`,
  body: `
    <rect width="1200" height="64" fill="url(#toranTile)"/>
  `,
};
