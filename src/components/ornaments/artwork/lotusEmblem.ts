/**
 * Lotus emblem — a small *pankh* lotus with a seed-pod centre. Used above the
 * host-family wording and in the frame corners at small sizes.
 */

import { GOLD_FOIL_DEFS } from "./helpers.ts";

export const lotusEmblem = {
  name: "lotus-emblem",
  viewBox: "0 0 48 24",
  defs: GOLD_FOIL_DEFS,
  body: `
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <!-- side petals -->
      <path d="M24 22 C 24 12, 12 10, 6 18 C 12 20, 20 22, 24 22 Z" stroke-width="1"/>
      <path d="M24 22 C 24 12, 36 10, 42 18 C 36 20, 28 22, 24 22 Z" stroke-width="1"/>
      <!-- central petal -->
      <path d="M24 22 C 22 14, 22 8, 24 3 C 26 8, 26 14, 24 22 Z" stroke-width="1.1"
            fill="url(#goldSheen)" opacity="0.85"/>
      <!-- seed pod marks -->
      <circle cx="24" cy="20" r="0.9" fill="url(#goldFoil)"/>
      <circle cx="24" cy="18" r="0.7" fill="url(#goldFoil)"/>
    </g>
  `,
};
