/**
 * Diya-lit — a single lit oil lamp (deepak) with a glowing flame, used as the
 * hero diya in the aarti-trail reveal. Glow halo is baked in via a blurred
 * radial gradient so the mark reads correctly on any dark hero backdrop with
 * no extra CSS.
 */

import { GOLD_FOIL_DEFS, SOFT_DROP_DEFS } from "./helpers.ts";

const FLAME_GLOW_DEFS = `
  <radialGradient id="flameGlow" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#fff3c4" stop-opacity="0.9"/>
    <stop offset="45%" stop-color="#d4af37" stop-opacity="0.45"/>
    <stop offset="100%" stop-color="#d4af37" stop-opacity="0"/>
  </radialGradient>
  <filter id="flameBlur" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="6"/>
  </filter>`;

export const diyaLit = {
  name: "diya-lit",
  viewBox: "0 0 120 140",
  defs: `${GOLD_FOIL_DEFS}${SOFT_DROP_DEFS}${FLAME_GLOW_DEFS}`,
  body: `
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <!-- glow halo -->
      <ellipse cx="60" cy="48" rx="38" ry="46" fill="url(#flameGlow)" filter="url(#flameBlur)" opacity="0.85"/>

      <!-- saucer bowl -->
      <path d="M16 98 C16 88 36 84 60 84 C84 84 104 88 104 98 C104 110 86 118 60 118 C34 118 16 110 16 98 Z"
            fill="url(#goldFoil)" opacity="0.88" filter="url(#softShadow)" stroke-width="2"/>

      <!-- rim inner highlight -->
      <path d="M22 97 C22 90 40 87 60 87 C80 87 98 90 98 97" stroke="url(#goldSheen)" stroke-width="1.3" opacity="0.65"/>

      <!-- spout nub -->
      <path d="M96 96 L112 90 L100 100 Z" fill="url(#goldFoilWarm)" stroke="currentColor" stroke-width="1" opacity="0.9"/>

      <!-- wick -->
      <path d="M60 86 L60 78" stroke="currentColor" stroke-width="2.2"/>

      <!-- flame outer -->
      <path d="M60 22 C48 36 42 56 60 78 C78 56 72 36 60 22 Z" fill="url(#goldFoilWarm)" opacity="0.92"/>

      <!-- flame middle -->
      <path d="M60 30 C52 40 48 54 60 70 C72 54 68 40 60 30 Z" fill="url(#goldFoil)" opacity="0.9"/>

      <!-- flame inner core -->
      <path d="M60 42 C56 48 55 56 60 62 C65 56 64 48 60 42 Z" fill="#fff3c4"/>
    </g>
  `,
};
