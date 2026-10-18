/**
 * Event motifs — one distinct illustrated symbol per ceremony, drawn at a
 * consistent 48×48 so they sit equally in the card header bands. Each is a
 * stroke motif using only fixed coordinates (path data is pure decimal tokens,
 * no interpolation), which keeps the artwork immune to the authoring mistakes
 * that plague computed geometry. `currentColor` owns the hue.
 */

export const mehendiMotif = {
  name: "mehendi-motif",
  viewBox: "0 0 48 48",
  defs: "",
  body: `
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
       stroke-width="1.6">
      <path d="M24 6 C 16 16 16 30 24 40 C 32 30 32 16 24 6 Z" opacity="0.95"/>
      <path d="M24 10 C 20 18 20 28 24 34" stroke-width="0.8" opacity="0.7"/>
      <path d="M21 20 C 19 24 19 28 21 32 C 24 30 24 22 21 20 Z" stroke-width="0.8" opacity="0.8"/>
      <circle cx="21" cy="26" r="2" stroke-width="0.8" opacity="0.8"/>
      <path d="M24 8 L 28 4" stroke-width="0.9" opacity="0.7"/>
      <path d="M24 40 L 28 44" stroke-width="0.9" opacity="0.7"/>
    </g>
  `,
};

export const haldiMotif = {
  name: "haldi-motif",
  viewBox: "0 0 48 48",
  defs: "",
  body: `
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
       stroke-width="1.6">
      <circle cx="24" cy="24" r="11" stroke-width="1.6"/>
      <circle cx="24" cy="24" r="15" stroke-width="0.8" opacity="0.6"/>
      <!-- rays: fixed array so nothing enumerates -->
      <path d="M24 2 L 24 7 M33 5 L 30 9 M40 11 L 37 13 M46 24 L 41 24 M45 38 L 39 36 M38 44 L 34 39 M24 47 L 24 41 M14 44 L 18 39 M6 38 L 12 36 M2 24 L 7 24 M4 11 L 11 13 M10 3 L 14 8"
            stroke-width="0.9" opacity="0.85"/>
      <!-- marigold blossom pair below -->
      <circle cx="12" cy="38" r="4" stroke-width="1.3"/>
      <circle cx="36" cy="40" r="4" stroke-width="1.3"/>
      <circle cx="24" cy="42" r="4.5" stroke-width="1.3"/>
    </g>
  `,
};

export const sangeetMotif = {
  name: "sangeet-motif",
  viewBox: "0 0 48 48",
  defs: "",
  body: `
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
       stroke-width="1.6">
      <!-- dholak body (trapezoid, two heads) -->
      <path d="M14 14 L 34 14 L 38 36 L 10 36 Z"/>
      <ellipse cx="24" cy="14" rx="10" ry="4"/>
      <ellipse cx="24" cy="36" rx="14" ry="4"/>
      <!-- lacing straps -->
      <path d="M16 12 L 13 38 M32 12 L 35 38 M20 9 L 18 39 M28 9 L 30 39"
            stroke-width="0.8" opacity="0.7"/>
      <!-- tuning tensioner hooks -->
      <path d="M12 30 L 8 28 M36 30 L 40 28" stroke-width="1" opacity="0.8"/>
      <!-- beamed note rising from the drum -->
      <path d="M30 8 C 30 3 34 2 37 4" stroke-width="1.4"/>
      <path d="M37 4 L 37 10" stroke-width="1.4"/>
      <circle cx="41" cy="8" r="1.2" fill="currentColor"/>
    </g>
  `,
};

export const ceremonyMotif = {
  name: "ceremony-motif",
  viewBox: "0 0 48 48",
  defs: "",
  body: `
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
       stroke-width="1.6">
      <!-- mandap corner posts -->
      <path d="M6 46 L 6 14 M42 46 L 42 14" stroke-width="1.8"/>
      <path d="M6 14 L 12 20 M42 14 L 36 20" stroke-width="1.3" opacity="0.9"/>
      <!-- sacred fire (agni) -->
      <path d="M24 44 C 17 40 19 30 24 24 C 29 30 31 40 24 44 Z" stroke-width="1.5"/>
      <path d="M24 40 C 22 38 22 32 24 28 C 26 32 26 38 24 40 Z" stroke-width="0.9" opacity="0.7"/>
      <path d="M24 46 L 24 48 M22 46 L 20 48 M26 46 L 28 48" stroke-width="0.8"
            opacity="0.7"/>
      <!-- jaimala garlands draped across -->
      <path d="M10 22 C 18 28 30 28 38 22" stroke-width="1.3" opacity="0.85"/>
      <path d="M10 22 C 12 25 13 27 12 30 M38 22 C 36 25 35 27 36 30 M24 24 C 24 28 23 30 22 32 M24 24 C 24 28 25 30 26 32 M16 25 C 16 28 15 30 14 32 M32 25 C 32 28 33 30 34 32"
            stroke-width="0.8" opacity="0.8"/>
    </g>
  `,
};

export const receptionMotif = {
  name: "reception-motif",
  viewBox: "0 0 48 48",
  defs: "",
  body: `
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
       stroke-width="1.6">
      <!-- diya base bowl -->
      <path d="M16 30 C 16 40 32 40 32 30 Z" stroke-width="1.6"/>
      <path d="M16 32 C 22 34 26 34 32 32" stroke-width="0.8" opacity="0.7"/>
      <!-- flame -->
      <path d="M24 18 C 21 24 21 27 24 30 C 27 27 27 24 24 18 Z" stroke-width="1.4"/>
      <path d="M24 22 C 23 26 23 28 24 30" stroke-width="0.8" opacity="0.7"/>
      <!-- glow halo -->
      <circle cx="24" cy="24" r="15" stroke-width="0.8" opacity="0.5"/>
    </g>
  `,
};

export const kalashMotif = {
  name: "kalash-motif",
  viewBox: "0 0 48 48",
  defs: "",
  body: `
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
       stroke-width="1.6">
      <!-- pot body -->
      <path d="M14 26 C 14 40 34 40 34 26 Z" stroke-width="1.6"/>
      <path d="M18 20 L 30 20 L 34 26 L 14 26 Z" stroke-width="1.5"/>
      <path d="M16 45 L 32 45" stroke-width="0.8" opacity="0.6"/>
      <!-- coconut on top -->
      <circle cx="24" cy="18" r="4" stroke-width="1.4"/>
      <path d="M24 14 C 24 10 24 8 26 25" stroke-width="0.7" opacity="0.6"/>
      <!-- five mango leaves fanning up -->
      <path d="M20 15 C 14 8 17 3 23 4 C 22 9 21 13 20 15 Z" stroke-width="1"
            opacity="0.85"/>
      <path d="M27 14 C 33 7 30 2 24 3 C 25 8 26 11 27 14 Z" stroke-width="1"
            opacity="0.85"/>
      <path d="M24 8 L 24 10" stroke-width="1" opacity="0.8"/>
    </g>
  `,
};
