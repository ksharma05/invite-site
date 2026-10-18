/**
 * Frame corner flourish — an inner-corner scroll used at the four corners of
 * the host card and photo mat (drawn once, rotated into place). Cleaner than
 * the paisley for very small sites; both are available.
 */

export const frameCornerFlourish = {
  name: "frame-corner-flourish",
  viewBox: "0 0 48 48",
  defs: "",
  body: `
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
       stroke-width="1.5">
      <path d="M6 2 C 6 22, 6 42, 26 42" opacity="0.85"/>
      <path d="M10 6 C 10 20, 12 36, 26 40" opacity="0.6"/>
      <!-- curl -->
      <path d="M26 42 C 30 42, 34 40, 35 36" opacity="0.8"/>
      <circle cx="35" cy="34" r="1" fill="currentColor"/>
    </g>
  `,
};
