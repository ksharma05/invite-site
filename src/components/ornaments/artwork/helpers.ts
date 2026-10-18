/**
 * Shared geometry + gradient helpers used by the ornament artwork modules.
 *
 * Pure string builders, so every exported SVG is a regular, writable `<svg>`
 * document with no runtime state. Units are authoring units (u); callers pick
 * the viewBox. Hairlines never go below 0.35u so they survive 300dpi print.
 */

/** Metallic gold foil gradients (multi-stop + specular sheen). One foil tone. */
export const GOLD_FOIL_DEFS = `
  <linearGradient id="goldFoil" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#e9c766"/>
    <stop offset="35%" stop-color="#c9a227"/>
    <stop offset="68%" stop-color="#8a6a1d"/>
    <stop offset="100%" stop-color="#d4af37"/>
  </linearGradient>
  <linearGradient id="goldFoilWarm" x1="0%" y1="100%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#d4af37"/>
    <stop offset="45%" stop-color="#c9a227"/>
    <stop offset="72%" stop-color="#e9c766"/>
    <stop offset="100%" stop-color="#8a6a1d"/>
  </linearGradient>
  <linearGradient id="goldSheen" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#fff3c4"/>
    <stop offset="55%" stop-color="#e9c766"/>
    <stop offset="100%" stop-color="#b8922a"/>
  </linearGradient>`;

/** Soft drop shadow (never heavy grey — keeps the foil effect). */
export const SOFT_DROP_DEFS = `
  <filter id="softShadow" x="-40%" y="-40%" width="180%" height="180%">
    <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="#3b2a21" flood-opacity="0.18"/>
  </filter>`;

/** Polar → cartesian for regular symmetric layout (24/48-fold work). */
export function polar(cx: number, cy: number, r: number, angleDeg: number): [number, number] {
  const a = (angleDeg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

/**
 * A single turned petal for a mandala rosette: pointed outer rim, closed base.
 * `centerAngleDeg` is the petal's centre direction (0 = right, 90 = down).
 * `halfWidthDeg` is half the angular width at the inner rim.
 */
export function petal(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  centerAngleDeg: number,
  halfWidthDeg: number
): string {
  const [x0, y0] = polar(cx, cy, rInner, centerAngleDeg - halfWidthDeg);
  const [x1, y1] = polar(cx, cy, rInner, centerAngleDeg + halfWidthDeg);
  const [xp, yp] = polar(cx, cy, rOuter, centerAngleDeg);
  return (
    "M " +
    x0.toFixed(2) +
    " " +
    y0.toFixed(2) +
    " Q " +
    xp.toFixed(2) +
    " " +
    yp.toFixed(2) +
    ", " +
    x1.toFixed(2) +
    " " +
    y1.toFixed(2) +
    " L " +
    x0.toFixed(2) +
    " " +
    y0.toFixed(2) +
    " Z"
  );
}

/**
 * A ring of evenly spaced dots (henna-style dotted band). Returns SVG markup.
 */
export function dottedRing(
  cx: number,
  cy: number,
  radius: number,
  dotCount: number,
  dotR: number
): string {
  const out: string[] = [];
  for (let i = 0; i < dotCount; i++) {
    const [x, y] = polar(cx, cy, radius, (i * 360) / dotCount);
    out.push(
      '<circle cx="' +
        x.toFixed(2) +
        '" cy="' +
        y.toFixed(2) +
        '" r="' +
        dotR +
        '" fill="currentColor" opacity="0.55"/>'
    );
  }
  return out.join("");
}
