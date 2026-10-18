/**
 * Lord Shiva and Mata Parvati (Kalyanasundara / Gauri-Shankar) auspicious motif.
 * Features the sacred Trishul, Damru, crescent moon (Chandra), sacred Bilva leaves,
 * and twin lotus blooms representing the eternal divine union, honoring Kashi Vishwanath.
 */

import { GOLD_FOIL_DEFS, SOFT_DROP_DEFS } from "./helpers.ts";

export const shivParvatiMotif = {
  name: "shiv-parvati-motif",
  viewBox: "0 0 80 80",
  defs: `${GOLD_FOIL_DEFS}${SOFT_DROP_DEFS}`,
  body: `
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <!-- Prabhavali / Sacred Celestial Aura -->
      <circle cx="40" cy="40" r="37" stroke="url(#goldFoil)" stroke-width="0.8" stroke-dasharray="2 3" opacity="0.6"/>
      <circle cx="40" cy="40" r="34" stroke="url(#goldSheen)" stroke-width="0.5" opacity="0.45"/>

      <!-- Central Trishul (Trident) Shaft -->
      <path d="M40 70 L40 18" stroke="url(#goldFoil)" stroke-width="2"/>
      <path d="M40 70 L40 18" stroke="url(#goldSheen)" stroke-width="0.8" opacity="0.9"/>

      <!-- Center Spear Point of Trishul -->
      <path d="M40 9 L43 19 L37 19 Z" fill="url(#goldSheen)" stroke="url(#goldFoil)" stroke-width="0.8"/>

      <!-- Left Prong of Trishul -->
      <path d="M40 25 C33 25, 29 18, 29 12 C32 14, 37 17, 40 20" stroke="url(#goldFoil)" stroke-width="1.8" fill="none"/>
      <path d="M29 12 L28 10 L31 12 Z" fill="url(#goldSheen)"/>

      <!-- Right Prong of Trishul -->
      <path d="M40 25 C47 25, 51 18, 51 12 C48 14, 43 17, 40 20" stroke="url(#goldFoil)" stroke-width="1.8" fill="none"/>
      <path d="M51 12 L52 10 L49 12 Z" fill="url(#goldSheen)"/>

      <!-- Crescent Moon (Chandra) on the Trishul -->
      <path d="M45 13 C48 16, 48 22, 44 25 C47 23, 49 18, 46 13 Z" fill="url(#goldSheen)" opacity="0.95"/>

      <!-- Damru (Sacred Drum) Tied at the Center -->
      <!-- Upper cone -->
      <path d="M33 30 L47 30 L40 37 Z" fill="url(#goldFoilWarm)" stroke="url(#goldFoil)" stroke-width="1"/>
      <!-- Lower cone -->
      <path d="M33 44 L47 44 L40 37 Z" fill="url(#goldFoilWarm)" stroke="url(#goldFoil)" stroke-width="1"/>
      <!-- Damru heads -->
      <ellipse cx="40" cy="30" rx="7" ry="2" stroke="url(#goldSheen)" stroke-width="0.9" fill="url(#goldSheen)" fill-opacity="0.3"/>
      <ellipse cx="40" cy="44" rx="7" ry="2" stroke="url(#goldSheen)" stroke-width="0.9" fill="url(#goldSheen)" fill-opacity="0.3"/>
      <!-- Damru cords and striker beads -->
      <path d="M40 37 Q46 39 49 42" stroke="url(#goldFoil)" stroke-width="0.8"/>
      <circle cx="49" cy="42" r="1.3" fill="url(#goldSheen)"/>
      <path d="M40 37 Q34 35 31 32" stroke="url(#goldFoil)" stroke-width="0.8"/>
      <circle cx="31" cy="32" r="1.3" fill="url(#goldSheen)"/>

      <!-- Sacred Bilva Patra (Tri-foliate leaf of Lord Shiva) -->
      <!-- Center leaf -->
      <path d="M40 48 C37 53, 37 60, 40 64 C43 60, 43 53, 40 48 Z" 
            fill="url(#goldFoil)" stroke="url(#goldSheen)" stroke-width="0.8" opacity="0.85"/>
      <!-- Left leaf -->
      <path d="M39 56 C33 53, 26 56, 27 62 C33 63, 37 59, 39 56 Z" 
            fill="url(#goldFoilWarm)" stroke="url(#goldSheen)" stroke-width="0.8" opacity="0.8"/>
      <!-- Right leaf -->
      <path d="M41 56 C47 53, 54 56, 53 62 C47 63, 43 59, 41 56 Z" 
            fill="url(#goldFoilWarm)" stroke="url(#goldSheen)" stroke-width="0.8" opacity="0.8"/>

      <!-- Twin Lotus Blossoms (Shiva & Parvati Eternal Union) at Base -->
      <path d="M22 66 C22 60, 16 58, 12 63 C16 65, 20 66, 22 66 Z" fill="url(#goldSheen)" opacity="0.7"/>
      <path d="M58 66 C58 60, 64 58, 68 63 C64 65, 60 66, 58 66 Z" fill="url(#goldSheen)" opacity="0.7"/>
      <path d="M25 71 Q40 66 55 71 Q40 76 25 71 Z" fill="url(#goldFoil)" opacity="0.5"/>
    </g>
  `,
};
