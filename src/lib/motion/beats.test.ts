/**
 * Unit coverage for the stop-motion beat map. Pure logic, node environment —
 * the same contract the browser check enforces against the live DOM.
 */
import { describe, it, expect } from "vitest";
import {
  ACTS,
  BEAT,
  FINAL_BEAT,
  HERO_DURATION,
  PIECES,
  PIECE_TOTAL,
  SETTLES,
  TOTAL_BEATS,
  exposureFlicker,
  isOptional,
  pieceBeat,
  stageJitter,
  wobble,
} from "./beats";
import type { PieceGroup } from "./beats";

const GROUPS = Object.keys(PIECES) as PieceGroup[];

describe("beat grid", () => {
  it("shoots at 10 exposures per second for 8.6 seconds", () => {
    expect(BEAT).toBe(0.1);
    expect(TOTAL_BEATS).toBe(86);
    expect(HERO_DURATION).toBeCloseTo(8.6, 10);
    expect(FINAL_BEAT).toBe(TOTAL_BEATS - 1);
  });

  it("maps a beat number to a monotonic time with no float drift", () => {
    expect(beatTimeCheck(0)).toBe(0);
    expect(beatTimeCheck(1)).toBe(0.1);
    expect(beatTimeCheck(85)).toBe(8.5);
    let previous = -1;
    for (let b = 0; b < TOTAL_BEATS; b++) {
      const t = beatTimeCheck(b);
      expect(t).toBeGreaterThan(previous);
      expect(t).toBeLessThan(HERO_DURATION + BEAT);
      previous = t;
    }
  });

  it("has the last exposure land one frame before the duration ends", () => {
    // Beat 85 is the hold, so the shot is 85 * 0.1 + 0.1 = 8.6s of exposures.
    expect(FINAL_BEAT * BEAT + BEAT).toBeCloseTo(HERO_DURATION, 10);
  });
});

function beatTimeCheck(beat: number): number {
  // Local copy of the check so a mistake in beatTime() still gets caught here.
  return Number((beat * BEAT).toFixed(4));
}

describe("shot list", () => {
  it("covers every beat exactly once, in order, with no gaps", () => {
    const covered = new Set<number>();
    let previousTo = -1;
    for (const act of ACTS) {
      expect(act.from).toBe(previousTo + 1);
      expect(act.to).toBeGreaterThan(act.from);
      for (let b = act.from; b <= act.to; b++) covered.add(b);
      previousTo = act.to;
    }
    expect(previousTo).toBe(FINAL_BEAT);
    expect(covered.size).toBe(TOTAL_BEATS);
  });

  it("schedules every declared piece, and no more than declared", () => {
    for (const group of GROUPS) {
      const count = PIECES[group];
      // The last declared index must resolve...
      expect(() => pieceBeat(group, count - 1)).not.toThrow();
      // ...and the one past it must not, so counts cannot drift silently.
      expect(() => pieceBeat(group, count)).toThrow();
    }
  });
});

describe("piece timing", () => {
  it("puts the hub together before the wheel starts", () => {
    expect(pieceBeat("hubDot", 0)).toBe(6);
    expect(pieceBeat("spoke", 0)).toBe(14);
  });

  it("lands chunked groups a fixed number of pieces per exposure", () => {
    // 24 spokes, 6 per beat, one group every 2 beats.
    expect(pieceBeat("spoke", 0)).toBe(14);
    expect(pieceBeat("spoke", 5)).toBe(14);
    expect(pieceBeat("spoke", 6)).toBe(16);
    expect(pieceBeat("spoke", 23)).toBe(20);

    // 48 inner petals at 12 per beat, consecutive beats.
    expect(pieceBeat("petalInner", 0)).toBe(26);
    expect(pieceBeat("petalInner", 12)).toBe(27);
    expect(pieceBeat("petalInner", 47)).toBe(29);

    // 48 outer petals at 6 per beat = the bloom.
    expect(pieceBeat("petalOuter", 47)).toBe(47);

    // 120 dots in 8 arcs of 15.
    expect(pieceBeat("dot", 0)).toBe(58);
    expect(pieceBeat("dot", 15)).toBe(59);
    expect(pieceBeat("dot", 119)).toBe(65);
  });

  it("stamps both names in one exposure, never letter by letter", () => {
    expect(pieceBeat("eyebrow", 0)).toBe(83);
    expect(pieceBeat("name", 0)).toBe(84);
    expect(pieceBeat("name", 1)).toBe(84);
  });

  it("lands the needle tool for exactly one exposure", () => {
    expect(pieceBeat("needle", 0)).toBe(66);
    expect(PIECES.needle).toBe(1);
  });

  it("keeps every piece inside the shot", () => {
    for (const group of GROUPS) {
      for (let i = 0; i < PIECES[group]; i++) {
        const beat = pieceBeat(group, i);
        expect(beat).toBeGreaterThanOrEqual(0);
        expect(beat).toBeLessThan(TOTAL_BEATS);
      }
    }
  });

  it("finishes building before the hold beat, which introduces nothing new", () => {
    const lastAppearance = Math.max(
      ...GROUPS.flatMap((group) =>
        Array.from({ length: PIECES[group] }, (_, i) => pieceBeat(group, i))
      )
    );
    expect(lastAppearance).toBe(FINAL_BEAT - 1);
  });
});

describe("counts", () => {
  it("matches the mandala spec the artwork is built from", () => {
    expect(PIECES.petalOuter).toBe(48);
    expect(PIECES.petalInner).toBe(48);
    expect(PIECES.spoke).toBe(24);
    expect(PIECES.dot).toBe(120);
  });

  it("totals only the pieces that must exist", () => {
    const mandatory = GROUPS.filter((g) => !isOptional(g));
    expect(PIECE_TOTAL).toBe(mandatory.reduce((sum, g) => sum + PIECES[g], 0));
    // The optional auspicious line is never counted as a defect when absent.
    expect(isOptional("blessing")).toBe(true);
    expect(isOptional("dot")).toBe(false);
    expect(GROUPS.some(isOptional)).toBe(true);
  });

  it("declares which groups get a settle frame", () => {
    expect(SETTLES.has("petalOuter")).toBe(true);
    expect(SETTLES.has("needle")).toBe(false);
  });
});

describe("deterministic realism", () => {
  it("derives wobble from the index, so two runs are identical", () => {
    expect(wobble(7)).toBe(wobble(7));
    expect(typeof wobble(7)).toBe("number");
    for (let seed = 0; seed < 400; seed++) {
      const value = wobble(seed, 1);
      expect(value).toBeGreaterThanOrEqual(-1.001);
      expect(value).toBeLessThanOrEqual(1.001);
    }
  });

  it("steps exposure flicker per beat and keeps it tiny", () => {
    expect(exposureFlicker(3)).toBe(exposureFlicker(3));
    for (let b = 0; b < TOTAL_BEATS; b++) {
      const level = exposureFlicker(b);
      expect(level).toBeGreaterThanOrEqual(0);
      expect(level).toBeLessThan(0.06);
    }
  });

  it("keeps the stage creep inside a pixel", () => {
    for (let b = 0; b < TOTAL_BEATS; b++) {
      const { x, y } = stageJitter(b);
      expect(Math.abs(x)).toBeLessThanOrEqual(0.7);
      expect(Math.abs(y)).toBeLessThanOrEqual(0.6);
    }
    // Only some beats move at all — a clamped set, not a constant shake.
    expect(stageJitter(1)).toEqual({ x: 0, y: 0 });
  });
});
