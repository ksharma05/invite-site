/**
 * Stop-motion beat map — the single source of truth for the hero assembly.
 *
 * The hero is built the way a real stop-motion shot is built: the page is
 * exposed one photographed "frame" at a time, and between exposures nothing
 * moves. So every change is a DISCRETE set on a beat boundary, never a tween.
 * One beat is 100ms — the 10 frames-per-second an animator actually shoots at.
 *
 * Pure (no DOM, no gsap) so it runs in the node test environment and the browser
 * check can assert the same contract against the live markup.
 */

/** Seconds per exposure: 10 fps, the classic stop-motion shooting rate. */
export const BEAT = 0.1;

/** Total exposures in the shot (beats are 0-based: 0 .. TOTAL_BEATS - 1). */
export const TOTAL_BEATS = 86;

/** Length of the whole assembly in seconds. */
export const HERO_DURATION = TOTAL_BEATS * BEAT;

/** The hold: the last exposure, which introduces nothing new. */
export const FINAL_BEAT = TOTAL_BEATS - 1;

/** Time, in seconds, at which beat `n` is exposed. */
export function beatTime(beat: number): number {
  return Number((beat * BEAT).toFixed(4));
}

/**
 * Every animated piece group, and how many pieces it contains.
 *
 * These must match the artwork/HTML exactly. `scripts/stop-motion-check.cjs`
 * asserts each count against the live DOM, so a mismatch fails the build rather
 * than shipping a hero that silently never finishes assembling.
 */
export const PIECES = {
  // Kudai mandala (SVG)
  chandShadow: 1,
  hubDot: 1,
  hubRing: 1,
  hubDisc: 1,
  spoke: 24,
  petalInner: 48,
  petalOuter: 48,
  rimQuarter: 4,
  rimOuter: 1,
  dot: 120,
  needle: 1,
  archOuter: 3,
  archInner: 3,
  // Monogram rings (SVG)
  ringLeft: 3,
  ringRight: 3,
  bow: 3,
  // Hero copy (HTML)
  nameRule: 2,
  fleuron: 1,
  eyebrowRule: 2,
  eyebrow: 1,
  blessing: 1,
  name: 2,
} as const;

export type PieceGroup = keyof typeof PIECES;

/** Groups that are present only for some sides/languages (never fabricated). */
const OPTIONAL_HINTS: Partial<Record<PieceGroup, true>> = { blessing: true };

/** A group whose DOM absence is legal, not a defect. */
export function isOptional(group: PieceGroup): boolean {
  return group in OPTIONAL_HINTS;
}

/** Pieces per exposure for groups that land in bulk; absent = one block. */
const CHUNK = new Map<PieceGroup, { perBeat: number; from: number; step?: number }>([
  ["spoke", { perBeat: 6, from: 14, step: 2 }],
  ["petalInner", { perBeat: 12, from: 26 }],
  ["petalOuter", { perBeat: 6, from: 40 }],
  ["dot", { perBeat: 15, from: 58 }],
  ["rimQuarter", { perBeat: 2, from: 31 }],
]);

/** Exact landing beat per piece index for everything that is not chunked. */
const PARTS: Partial<Record<PieceGroup, number[]>> = {
  chandShadow: [4],
  hubDot: [6],
  hubRing: [7],
  hubDisc: [9],
  needle: [66],
  rimOuter: [33],
  archOuter: [70, 71, 71],
  archInner: [73, 74, 74],
  ringLeft: [80, 80, 80],
  ringRight: [81, 81, 81],
  bow: [81, 81, 81],
  nameRule: [82, 82],
  fleuron: [82],
  eyebrowRule: [83, 83],
  eyebrow: [83],
  blessing: [83],
  name: [84, 84],
};

/**
 * Beat at which the Nth piece (0-based) of a group is exposed. Chunked groups
 * land several pieces on the same exposure; parts of a block land together.
 */
export function pieceBeat(group: PieceGroup, index: number): number {
  const declared = PIECES[group];
  if (!Number.isInteger(index) || index < 0 || index >= declared) {
    throw new Error(`"${group}" declares ${declared} piece(s), asked for index ${index}`);
  }
  const chunk = CHUNK.get(group);
  if (chunk) {
    return chunk.from + Math.floor(index / chunk.perBeat) * (chunk.step ?? 1);
  }
  const parts = PARTS[group];
  if (!parts) throw new Error(`no beat data for group "${group}"`);
  if (parts.length !== declared) {
    throw new Error(`"${group}" declares ${declared} pieces but has ${parts.length} beats`);
  }
  const beat = parts[index];
  if (typeof beat !== "number") {
    throw new Error(`"${group}"[${index}] has no landing beat`);
  }
  return beat;
}

/**
 * True when a chunked group's pieces settle to full ink one exposure after
 * landing (the "folded, then opened" beat). Needle/arch parts do not settle.
 */
export const SETTLES: ReadonlySet<PieceGroup> = new Set<PieceGroup>([
  "petalInner",
  "petalOuter",
  "rimOuter",
  "hubDisc",
]);

/** Shot list. Ranges are inclusive and must tile the whole beat grid. */
export const ACTS = [
  { name: "table", from: 0, to: 3, note: "empty paper, stage creep and exposure flicker only" },
  {
    name: "chand",
    from: 4,
    to: 13,
    note: "sun-chand hub: its shadow lands first, then dot, ring, foil disc",
  },
  {
    name: "wheel",
    from: 14,
    to: 25,
    note: "24 spokes in 4 groups of 6, then one squaring-up correction",
  },
  {
    name: "inner",
    from: 26,
    to: 39,
    note: "48 inner petals, rim quarters, and a turntable correction jump",
  },
  {
    name: "bloom",
    from: 40,
    to: 57,
    note: "48 outer petals bloom folded-then-open; one foil glint; two repositions",
  },
  {
    name: "henna",
    from: 58,
    to: 69,
    note: "120 dots stamped in 8 arcs of 15; needle tool in frame for one exposure",
  },
  {
    name: "canopy",
    from: 70,
    to: 79,
    note: "portal arch in two halves (a visible apex seam), inner arch in chunks",
  },
  {
    name: "couple",
    from: 80,
    to: 85,
    note: "rings, rules, eyebrow and both names stamp; final corrected hold",
  },
] as const;

export type ActName = (typeof ACTS)[number]["name"];

/**
 * Deterministic, index-derived hand-place wobble in authoring units.
 *
 * Nothing is random: the same piece always wobbles by the same amount, so two
 * runs of the shot are identical and frame-diffing checks are meaningful rather
 * than comparing against noise. Range is about +/- `scale`.
 */
export function wobble(seed: number, scale = 1): number {
  const s = Math.sin(seed * 12.9898) * 43758.5453;
  return Number((((s - Math.floor(s)) * 2 - 1) * scale).toFixed(3));
}

/**
 * Per-exposure brightness offset (stop-motion flicker): every frame was lit
 * individually, so brightness steps between exposures instead of gliding.
 * Kept under ~4% so it reads as film, not as a strobe.
 */
export function exposureFlicker(beat: number): number {
  return Number((0.012 + Math.abs(wobble(beat * 3 + 1, 0.02))).toFixed(4));
}

/**
 * Set creep: at most a pixel of shift, and only on some exposures, like a
 * clamped-down shooting stage settling. Returns 0 on most beats on purpose.
 */
export function stageJitter(beat: number): { x: number; y: number } {
  return {
    x: beat % 3 === 0 ? wobble(beat, 0.6) : 0,
    y: beat % 5 === 0 ? wobble(beat + 7, 0.5) : 0,
  };
}

/** Total animated pieces the hero expects (mandatory groups only). */
export const PIECE_TOTAL = (Object.keys(PIECES) as PieceGroup[])
  .filter((g) => !isOptional(g))
  .reduce((sum, g) => sum + PIECES[g], 0);

/**
 * Storage flag so a repeat visit in the same session renders the finished hero
 * immediately. One-shot by design: nothing loops.
 */
export const SEEN_KEY = "hero-stop-motion-seen";
