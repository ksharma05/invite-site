/**
 * Lord Ganesha auspicious motif — stylized sacred silhouette and gold foil linework.
 * Depicts the crown (mukut), large ears, curved trunk (vakratunda) holding modak,
 * sacred tilak, and auspicious aura.
 */

import { GOLD_FOIL_DEFS, SOFT_DROP_DEFS } from "./helpers.ts";

export const ganeshMotif = {
  name: "ganesh-motif",
  viewBox: "0 0 80 80",
  defs: `${GOLD_FOIL_DEFS}${SOFT_DROP_DEFS}`,
  body: `
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <!-- Auspicious Prabhavali / Sun Halo -->
      <circle cx="40" cy="40" r="36" stroke="url(#goldFoil)" stroke-width="0.8" stroke-dasharray="1.5 2.5" opacity="0.65"/>
      <circle cx="40" cy="40" r="33" stroke="url(#goldSheen)" stroke-width="0.5" opacity="0.5"/>

      <!-- Mukut / Crown -->
      <path d="M34 16 L40 7 L46 16 L43 21 L37 21 Z" fill="url(#goldFoil)" stroke="url(#goldSheen)" stroke-width="0.9"/>
      <circle cx="40" cy="12" r="1.2" fill="#fff3c4"/>
      <path d="M36 21 L44 21" stroke="url(#goldSheen)" stroke-width="1.2"/>

      <!-- Sacred Tilak / Trishul on forehead -->
      <path d="M40 23 L40 29" stroke="url(#goldSheen)" stroke-width="1.4"/>
      <path d="M38 24 Q40 27 42 24" stroke="url(#goldFoil)" stroke-width="1"/>
      <circle cx="40" cy="30" r="0.9" fill="#c9a227"/>

      <!-- Head & Ears -->
      <!-- Left Ear -->
      <path d="M34 23 C24 20, 20 27, 22 36 C24 43, 31 43, 33 42" stroke="url(#goldFoil)" stroke-width="1.5" fill="none"/>
      <path d="M26 27 C24 32, 26 38, 30 38" stroke="url(#goldSheen)" stroke-width="0.75" opacity="0.7"/>

      <!-- Right Ear -->
      <path d="M46 23 C56 20, 60 27, 58 36 C56 43, 49 43, 47 42" stroke="url(#goldFoil)" stroke-width="1.5" fill="none"/>
      <path d="M54 27 C56 32, 54 38, 50 38" stroke="url(#goldSheen)" stroke-width="0.75" opacity="0.7"/>

      <!-- Eyes -->
      <path d="M33 32 Q36 31 38 33" stroke="url(#goldSheen)" stroke-width="1.1"/>
      <path d="M47 32 Q44 31 42 33" stroke="url(#goldSheen)" stroke-width="1.1"/>

      <!-- Tusks: Ekadanta (broken right tusk, full left tusk) -->
      <path d="M35 44 L32 46" stroke="url(#goldSheen)" stroke-width="1.4"/>
      <path d="M45 44 L47 45" stroke="url(#goldSheen)" stroke-width="1.4"/>

      <!-- Trunk (Vakratunda) turning gracefully holding Modak -->
      <path d="M38 35 C38 45, 43 51, 43 58 C43 65, 33 66, 31 60 C29 55, 33 52, 36 53" 
            stroke="url(#goldFoil)" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M39 37 C39 46, 42 52, 42 58 C42 63, 34 64, 33 59" 
            stroke="url(#goldSheen)" stroke-width="0.9" opacity="0.8"/>

      <!-- Modak in Trunk -->
      <path d="M28 58 C28 54, 32 54, 32 58 Z" fill="url(#goldSheen)" stroke="url(#goldFoil)" stroke-width="0.8"/>

      <!-- Base Lotus Petals -->
      <path d="M22 69 Q40 64 58 69 Q40 76 22 69 Z" fill="url(#goldFoilWarm)" opacity="0.35"/>
      <path d="M40 64 Q32 72 26 73 Q35 75 40 71 Q45 75 54 73 Q48 72 40 64 Z" 
            fill="url(#goldFoil)" stroke="url(#goldSheen)" stroke-width="0.8"/>
    </g>
  `,
};
