/**
 * Ember-speck — a tiny glowing spark dot, for sparks trailing behind the
 * aarti-trail arc. Glow is baked in (same convention as flame/diyaLit)
 * rather than left to the consumer. Used very small (4-24px), so geometry
 * is kept to two shapes to survive heavy downscaling.
 */

const EMBER_GLOW_DEFS = `
  <radialGradient id="emberGlow" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#fff3c4" stop-opacity="0.9"/>
    <stop offset="45%" stop-color="#d4af37" stop-opacity="0.45"/>
    <stop offset="100%" stop-color="#d4af37" stop-opacity="0"/>
  </radialGradient>
  <filter id="emberBlur" x="-80%" y="-80%" width="260%" height="260%">
    <feGaussianBlur stdDeviation="1.6"/>
  </filter>`;

export const emberSpeck = {
  name: "ember-speck",
  viewBox: "0 0 24 24",
  defs: EMBER_GLOW_DEFS,
  body: `
    <circle data-ember-part="glow" cx="12" cy="12" r="9" fill="url(#emberGlow)" filter="url(#emberBlur)" opacity="0.9"/>
    <circle data-ember-part="core" cx="12" cy="12" r="2.2" fill="#fff3c4"/>
  `,
};
