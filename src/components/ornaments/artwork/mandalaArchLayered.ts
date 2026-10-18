/**
 * Mandala arch — LAYERED for the stop-motion hero.
 *
 * Same kudai (wedding-portal) crown as `mandalaArch.ts`, same viewBox, same
 * `petal`/`polar` helpers, but every piece is emitted as its own element with a
 * `data-sm` group tag and `data-i` index so the hero can place them one
 * exposure at a time, like individual gold-foil cut-outs.
 *
 * Geometry is bit-identical to the static version (verified by the browser
 * check diffing the finished frame against the static render), so this exists
 * only to add handles — the artwork itself did not change. The static module
 * stays the source for print, motifs and `public/ornaments/`, and this module is
 * deliberately NOT in `ornamentCatalogue` so `ornaments:export` is unaffected.
 */

import { GOLD_FOIL_DEFS, SOFT_DROP_DEFS, polar, petal } from "./helpers.ts";

/** Rosette centre in viewBox units — the point every piece is placed around. */
export const ROSETTE_CENTRE = { x: 130, y: 74, rInnerRim: 52 };

const petals = (kind: "petalOuter" | "petalInner"): string =>
  Array.from({ length: 48 })
    .map((_, i) => {
      const a = (i * 360) / 48;
      return kind === "petalOuter"
        ? `<path data-sm="petalOuter" data-i="${i}" d="${petal(0, 0, 12, 48, a + 90, 3.4)}" stroke-width="1.5" opacity="0.95"/>`
        : `<path data-sm="petalInner" data-i="${i}" d="${petal(0, 0, 4, 26, a + 90, 1.7)}" stroke-width="0.8" opacity="0.7"/>`;
    })
    .join("\n        ");

const petalOuter = petals("petalOuter");
const petalInner = petals("petalInner");

/** 24 hairline spokes radiating from the sun centre. */
const spokes = Array.from({ length: 24 })
  .map((_, i) => {
    const angle = (i * 360) / 24 + 90;
    const [x1, y1] = polar(0, 0, 10, angle);
    const [x2, y2] = polar(0, 0, 34, angle);
    return `<path data-sm="spoke" data-i="${i}" d="M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)}" stroke-width="0.7" opacity="0.6"/>`;
  })
  .join("\n        ");

/** 120 henna dots, each stamped on its own beat arc. */
const dots = Array.from({ length: 120 })
  .map((_, i) => {
    const [x, y] = polar(0, 0, 54, (i * 360) / 120);
    return `<circle data-sm="dot" data-i="${i}" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="0.8" fill="currentColor" opacity="0.55"/>`;
  })
  .join("\n        ");

/** Inner rim drawn as four quarters — how you would actually stick a cut ring on. */
const rimQuarters = [
  "M 0 -52 A 52 52 0 0 1 52 0",
  "M 52 0 A 52 52 0 0 1 0 52",
  "M 0 52 A 52 52 0 0 1 -52 0",
  "M -52 0 A 52 52 0 0 1 0 -52",
]
  .map((d, i) => `<path data-sm="rimQuarter" data-i="${i}" d="${d}" stroke-width="1.2"/>`)
  .join("\n        ");

export const mandalaArchLayered = {
  name: "mandala-arch-layered",
  viewBox: "0 0 260 150",
  defs: GOLD_FOIL_DEFS + SOFT_DROP_DEFS,
  body: `
    <g fill="none" stroke="currentColor">
      <!-- Portal arch (whole canopy is one placed prop) -->
      <g data-sm-group="arch">
      <!-- Portal arch: two sweeps plus the baseline they meet on. -->
      <path data-sm="archOuter" data-i="0" d="M30 150 C30 76 128 18 130 16"
            stroke-width="6" stroke-linecap="round" opacity="0.9" filter="url(#softShadow)"/>
      <path data-sm="archOuter" data-i="1" d="M130 16 C132 18 230 76 230 150"
            stroke-width="6" stroke-linecap="round" opacity="0.9" filter="url(#softShadow)"/>
      <path data-sm="archOuter" data-i="2" d="M230 150 L30 150"
            stroke-width="6" stroke-linecap="round" opacity="0.9"/>

      <!-- Hairline inner portal, laid in three chunks. -->
      <path data-sm="archInner" data-i="0" d="M44 150 C44 82 130 30 130 30"
            stroke-width="2.2" stroke-linecap="round"/>
      <path data-sm="archInner" data-i="1" d="M130 30 C130 30 216 82 216 150"
            stroke-width="2.2" stroke-linecap="round"/>
      <path data-sm="archInner" data-i="2" d="M216 150 L44 150"
            stroke-width="2.2" stroke-linecap="round"/>
      </g>

      <!-- Mandala rosette anchored at the arch tip. -->
      <g transform="translate(130 74)">
      <g data-sm-group="rosette">
        ${rimQuarters}
        <circle data-sm="rimOuter" data-i="0" cx="0" cy="0" r="56" stroke-width="0.8"/>

        <!-- henna dotted band just inside the outer rim -->
        <g data-sm-group="dots">${dots}</g>

        <g data-sm-group="petalOuter">${petalOuter}</g>
        <g data-sm-group="petalInner">${petalInner}</g>
        <g data-sm-group="wheel">${spokes}</g>

        <!-- Where the needle tool rests for one exposure while the last arc is stamped. -->
        <path data-sm="needle" data-i="0" d="M 52.6 -3.5 L 61.5 -12.4"
              stroke-width="0.9" opacity="0.9" stroke-linecap="round"/>

      </g>
        <!-- Foiled centre emblem (sun chand): its shadow lands before the disc. -->
        <ellipse data-sm="chandShadow" data-i="0" cx="0.6" cy="1.6" rx="11.4" ry="11"
                 fill="#3b2a21" stroke="none" opacity="0.1" filter="url(#softShadow)"/>
        <circle data-sm="hubDisc" data-i="0" cx="0" cy="0" r="11" stroke-width="1.1" fill="url(#goldSheen)"/>
        <circle data-sm="hubRing" data-i="0" cx="0" cy="0" r="3" stroke-width="1.5" fill="none"/>
        <circle data-sm="hubDot" data-i="0" cx="0" cy="0" r="1" fill="currentColor"/>
      </g>
    </g>
  `,
};
