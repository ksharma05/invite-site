/**
 * Ornament asset registry — single source of truth for every piece of artwork.
 *
 * Each entry is `{ name, viewBox, defs, body }`. The inline renderer
 * (`Ornament.tsx`) and the export script share this list, so there is exactly
 * one definition for the artwork and zero duplication.
 */

import { mandalaArch } from "./mandalaArch.ts";
import { monogramRings, monogramLockup } from "./monogramRings.ts";
import { paisleyCorner } from "./paisleyCorner.ts";
import { toranBand } from "./toranBand.ts";
import { herringboneBand } from "./herringboneBand.ts";
import { flourishDivider } from "./flourishDivider.ts";
import { lotusEmblem } from "./lotusEmblem.ts";
import { coupleSilhouette } from "./coupleSilhouette.ts";
import { frameCornerFlourish } from "./frameCornerFlourish.ts";
import { dateCadenceFlourish } from "./dateCadenceFlourish.ts";
import {
  mehendiMotif,
  haldiMotif,
  sangeetMotif,
  ceremonyMotif,
  receptionMotif,
  kalashMotif,
} from "./motifs.ts";
import { ganeshMotif } from "./ganeshMotif.ts";
import { shivParvatiMotif } from "./shivParvatiMotif.ts";

/** The full catalogue, in render order (decorations before motifs). */
export const ornamentCatalogue = [
  ganeshMotif,
  shivParvatiMotif,
  mandalaArch,
  monogramRings,
  monogramLockup,
  paisleyCorner,
  toranBand,
  herringboneBand,
  flourishDivider,
  lotusEmblem,
  coupleSilhouette,
  frameCornerFlourish,
  dateCadenceFlourish,
  mehendiMotif,
  haldiMotif,
  sangeetMotif,
  ceremonyMotif,
  receptionMotif,
  kalashMotif,
] as const;

export type Ornament = (typeof ornamentCatalogue)[number];

/** Convenience accessor for the renderer and pages. */
export function getOrnament(name: string): Ornament | undefined {
  return ornamentCatalogue.find((o) => o.name === name);
}
