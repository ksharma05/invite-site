/**
 * Monogram rings — two interlocking wedding bands with a ribbon bow, in foil
 * gold. The `S ♥ K` lockup for the couple's initials is drawn separately as a
 * companion (monogramLockup) so the rings can be reused at smaller sizes too.
 */

import { GOLD_FOIL_DEFS, SOFT_DROP_DEFS } from "./helpers.ts";

export const monogramRings = {
  name: "monogram-rings",
  viewBox: "0 0 120 96",
  defs: GOLD_FOIL_DEFS + SOFT_DROP_DEFS,
  body: `
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <!-- Ribbon bow beneath the rings -->
      <g stroke="currentColor" stroke-width="2.4" opacity="0.85">
        <path d="M60 82 C 66 74, 74 74, 78 80 C 78 82, 70 84, 62 84 Z"/>
        <path d="M60 82 C 54 74, 46 74, 42 80 C 42 82, 50 84, 58 84 Z"/>
        <path d="M60 82 L 60 92"/>
      </g>

      <!-- Left ring -->
      <circle cx="48" cy="34" r="20" stroke="url(#goldFoil)" stroke-width="5" filter="url(#softShadow)"/>
      <circle cx="48" cy="34" r="20" stroke="#fff3c4" stroke-width="1" opacity="0.5"/>
      <ellipse cx="48" cy="27" rx="11" ry="4" stroke="none" fill="url(#goldSheen)" opacity="0.35"/>

      <!-- Right ring, dimmed toward the back of the overlap -->
      <circle cx="72" cy="34" r="20" stroke="url(#goldFoilWarm)" stroke-width="5" filter="url(#softShadow)"/>
      <circle cx="72" cy="34" r="20" stroke="#fff3c4" stroke-width="1" opacity="0.45"/>
      <ellipse cx="72" cy="27" rx="8" ry="4" stroke="none" fill="url(#goldSheen)" opacity="0.3"/>
    </g>
  `,
};

/**
 * `S ♥ K` letter lockup — drawn as strokes so it inherits currentColor (usable
 * anywhere at any size, including as the footer monogram mark).
 */
export const monogramLockup = {
  name: "monogram-lockup",
  viewBox: "0 0 150 64",
  defs: "",
  body: `
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" opacity="0.9">
      <!-- S -->
      <path d="M40 20 C 34 16, 24 16, 24 24 C 24 32, 42 30, 44 40 C 45 48, 34 48, 28 44"
            stroke-width="5"/>
      <!-- heart -->
      <path d="M82 34 C 82 28, 72 26, 70 32 C 68 26, 58 28, 58 34 C 58 42, 70 48, 70 48 C 70 48, 82 42, 82 34 Z"
            stroke-width="4" fill="currentColor"/>
      <!-- K -->
      <path d="M102 16 L 102 48" stroke-width="5"/>
      <path d="M102 31 L 128 16" stroke-width="5"/>
      <path d="M102 31 L 128 48" stroke-width="5"/>
    </g>
  `,
};
