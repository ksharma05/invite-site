/**
 * Flame — glow halo + flame only, no lamp or wick. Shares diyaLit's exact
 * viewBox and flame/glow coordinates so it stacks pixel-perfectly on top of
 * diyaUnlit (its wick sits right where this flame's base lands), letting the
 * two be composited and animated independently (flicker, scale, glow pulse)
 * instead of baking a static flame into every diya along the aarti-trail arc.
 *
 * Each piece carries a data-flame-part attribute ("glow" | "outer" | "middle"
 * | "core") as a GSAP targeting hook for that future animation.
 */

import { GOLD_FOIL_DEFS } from "./helpers.ts";

const FLAME_GLOW_DEFS = `
  <radialGradient id="flameGlow" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#fff3c4" stop-opacity="0.9"/>
    <stop offset="45%" stop-color="#d4af37" stop-opacity="0.45"/>
    <stop offset="100%" stop-color="#d4af37" stop-opacity="0"/>
  </radialGradient>
  <filter id="flameBlur" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="6"/>
  </filter>`;

export const flame = {
  name: "flame",
  viewBox: "0 0 120 140",
  defs: `${GOLD_FOIL_DEFS}${FLAME_GLOW_DEFS}`,
  body: `
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <!-- glow halo -->
      <ellipse data-flame-part="glow" cx="60" cy="48" rx="38" ry="46" fill="url(#flameGlow)" filter="url(#flameBlur)" opacity="0.85"/>

      <!-- flame outer -->
      <path data-flame-part="outer" d="M60 22 C48 36 42 56 60 78 C78 56 72 36 60 22 Z" fill="url(#goldFoilWarm)" opacity="0.92"/>

      <!-- flame middle -->
      <path data-flame-part="middle" d="M60 30 C52 40 48 54 60 70 C72 54 68 40 60 30 Z" fill="url(#goldFoil)" opacity="0.9"/>

      <!-- flame inner core -->
      <path data-flame-part="core" d="M60 42 C56 48 55 56 60 62 C65 56 64 48 60 42 Z" fill="#fff3c4"/>
    </g>
  `,
};
