/**
 * Diya-unlit — the same oil lamp as `diyaLit`, dim/extinguished, used for the
 * small diyas strung along the aarti-trail arc before the flame reaches them.
 * Shares diyaLit's saucer/rim/spout geometry byte-for-byte so the two can be
 * swapped in place without any positional shift. Dimness is baked into a
 * muted gradient + reduced opacities rather than left to the consumer.
 */

import { SOFT_DROP_DEFS } from "./helpers.ts";

const GOLD_DIM_DEFS = `
  <linearGradient id="goldDim" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#574215"/>
    <stop offset="50%" stop-color="#453410"/>
    <stop offset="100%" stop-color="#30240a"/>
  </linearGradient>`;

export const diyaUnlit = {
  name: "diya-unlit",
  viewBox: "0 0 120 140",
  defs: `${GOLD_DIM_DEFS}${SOFT_DROP_DEFS}`,
  body: `
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <!-- saucer bowl, dim -->
      <path d="M16 98 C16 88 36 84 60 84 C84 84 104 88 104 98 C104 110 86 118 60 118 C34 118 16 110 16 98 Z"
            fill="url(#goldDim)" opacity="0.8" stroke="currentColor" stroke-width="1" stroke-opacity="0.3"/>

      <!-- rim inner highlight, faint -->
      <path d="M22 97 C22 90 40 87 60 87 C80 87 98 90 98 97" stroke="url(#goldDim)" stroke-width="1" opacity="0.4"/>

      <!-- spout nub -->
      <path d="M96 96 L112 90 L100 100 Z" fill="url(#goldDim)" stroke="currentColor" stroke-width="0.8" stroke-opacity="0.3" opacity="0.85"/>

      <!-- wick, extinguished -->
      <path d="M60 86 L60 78" stroke="currentColor" stroke-width="2" opacity="0.4"/>
      <circle cx="60" cy="78" r="2" fill="currentColor" opacity="0.4"/>
    </g>
  `,
};
