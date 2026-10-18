/**
 * Mandala arch — the "heraldry" crown for the hero.
 *
 * A pointed wedding-portal (toran/kudai) arch whose sweep is filled with a
 * 48-fold mandala: layered petal rings and a henna dotted band, with a foiled
 * centre. Geometry is computed (helpers/polar), so the rosettes are genuinely
 * regular rather than eyeballed. Drawn to hold up both washed out at low
 * opacity (hero background) and deep in print.
 */

import { GOLD_FOIL_DEFS, SOFT_DROP_DEFS, polar, petal, dottedRing } from "./helpers.ts";

export const mandalaArch = {
  name: "mandala-arch",
  viewBox: "0 0 260 150",
  defs: GOLD_FOIL_DEFS + SOFT_DROP_DEFS,
  body: `
    <g fill="none" stroke="currentColor">
      <!-- Outer and inner pointed portal lines -->
      <path d="M30 150 C30 76 128 18 130 16 C132 18 230 76 230 150 Z"
            stroke-width="6" stroke-linecap="round" opacity="0.9" fill="none" filter="url(#softShadow)"/>
      <path d="M44 150 C44 82 130 30 130 30 C130 30 216 82 216 150 Z"
            stroke-width="2.2" stroke-linecap="round"/>

      <!-- Mandala rosette anchored at the arch tip (cx=130) -->
      <g transform="translate(130 74)">
        <circle cx="0" cy="0" r="52" stroke-width="1.2"/>
        <circle cx="0" cy="0" r="56" stroke-width="0.8"/>

        <!-- henna dotted band just inside the outer rim -->
        ${dottedRing(0, 0, 54, 120, 0.8)}

        <!-- 48 outer petals -->
        ${Array.from({ length: 48 })
          .map((_, i) => {
            const a = (i * 360) / 48;
            return `<path d="${petal(0, 0, 12, 48, a + 90, 3.4)}" stroke-width="1.5" opacity="0.95"/>
                    <path d="${petal(0, 0, 4, 26, a + 90, 1.7)}" stroke-width="0.8" opacity="0.7"/>`;
          })
          .join("\n        ")}

        <!-- 24 thin rays reaching outward -->
        ${Array.from({ length: 24 })
          .map((_, i) => {
            const [x1, y1] = polar(0, 0, 10, (i * 360) / 24 + 90);
            const [x2, y2] = polar(0, 0, 34, (i * 360) / 24 + 90);
            return `<path d="M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)}"
                           stroke-width="0.7" opacity="0.6"/>`;
          })
          .join("\n        ")}
      </g>

      <!-- Foiled centre emblem (sun chand) -->
      <g transform="translate(130 74)" fill="none">
        <circle cx="0" cy="0" r="11" stroke-width="1.1" fill="url(#goldSheen)"/>
        <circle cx="0" cy="0" r="3" stroke-width="1.5" fill="none"/>
        <circle cx="0" cy="0" r="1" fill="currentColor"/>
      </g>
    </g>
  `,
};
