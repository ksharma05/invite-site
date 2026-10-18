/**
 * Monogram rings — LAYERED for the stop-motion hero.
 *
 * Identical geometry to `monogramRings.ts` (same viewBox, same paths), with each
 * part tagged so the hero can drop the two bands onto the paper as separate
 * props. Kept separate from the static module so print/motif artwork is
 * untouched and `ornaments:export` output does not change.
 *
 * Each ring is three pieces that land together in one exposure: band, hairline
 * highlight, and the sheen ellipse inside it.
 */

import { GOLD_FOIL_DEFS, SOFT_DROP_DEFS } from "./helpers.ts";

export const monogramRingsLayered = {
  name: "monogram-rings-layered",
  viewBox: "0 0 120 96",
  defs: GOLD_FOIL_DEFS + SOFT_DROP_DEFS,
  body: `
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <g data-sm-group="rings">
        <!-- Ribbon bow beneath the rings (three parts, one exposure) -->
        <g data-sm-group="bow" stroke="currentColor" stroke-width="2.4" opacity="0.85">
          <path data-sm="bow" data-i="0" d="M60 82 C 66 74, 74 74, 78 80 C 78 82, 70 84, 62 84 Z"/>
          <path data-sm="bow" data-i="1" d="M60 82 C 54 74, 46 74, 42 80 C 42 82, 50 84, 58 84 Z"/>
          <path data-sm="bow" data-i="2" d="M60 82 L 60 92"/>
        </g>

        <!-- Left ring -->
        <g data-sm-group="ringLeft">
          <circle data-sm="ringLeft" data-i="0" cx="48" cy="34" r="20"
                  stroke="url(#goldFoil)" stroke-width="5" filter="url(#softShadow)"/>
          <circle data-sm="ringLeft" data-i="1" cx="48" cy="34" r="20"
                  stroke="#fff3c4" stroke-width="1" opacity="0.5"/>
          <ellipse data-sm="ringLeft" data-i="2" cx="48" cy="27" rx="11" ry="4"
                   stroke="none" fill="url(#goldSheen)" opacity="0.35"/>
        </g>

        <!-- Right ring, dimmed toward the back of the overlap -->
        <g data-sm-group="ringRight">
          <circle data-sm="ringRight" data-i="0" cx="72" cy="34" r="20"
                  stroke="url(#goldFoilWarm)" stroke-width="5" filter="url(#softShadow)"/>
          <circle data-sm="ringRight" data-i="1" cx="72" cy="34" r="20"
                  stroke="#fff3c4" stroke-width="1" opacity="0.45"/>
          <ellipse data-sm="ringRight" data-i="2" cx="72" cy="27" rx="8" ry="4"
                   stroke="none" fill="url(#goldSheen)" opacity="0.3"/>
        </g>
      </g>
    </g>
  `,
};
