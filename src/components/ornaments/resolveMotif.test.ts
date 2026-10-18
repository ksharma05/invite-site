/**
 * Unit coverage for the ceremony→motif resolution, the presentation-only
 * mapping that must never require a schema or sheet change.
 */
import { describe, it, expect } from "vitest";
import { resolveMotif } from "../ornaments/resolveMotif";

describe("resolveMotif", () => {
  it("maps known stable ids", () => {
    expect(resolveMotif("haldi", "", "")).toBe("haldi-motif");
    expect(resolveMotif("mehendi", "", "")).toBe("mehendi-motif");
    expect(resolveMotif("sangeet", "", "")).toBe("sangeet-motif");
    expect(resolveMotif("wedding-ceremony", "", "")).toBe("ceremony-motif");
    expect(resolveMotif("reception", "", "")).toBe("reception-motif");
  });

  it("falls back to bilingual title matching for unknown ids", () => {
    expect(resolveMotif("row-7", "Mehendi", "")).toBe("mehendi-motif");
    expect(resolveMotif("row-9", "", "संगीत")).toBe("sangeet-motif");
    expect(resolveMotif("row-11", "Wedding Ceremony", "")).toBe("ceremony-motif");
    expect(resolveMotif("row-12", "", "विवाह समारोह")).toBe("ceremony-motif");
  });

  it("ignores case when matching titles", () => {
    expect(resolveMotif("x", "sangeet", "")).toBe("sangeet-motif");
    expect(resolveMotif("x", "MEHNDI", "")).toBe("mehendi-motif");
  });

  it("returns the neutral kalash fallback when nothing matches", () => {
    expect(resolveMotif("brunch", "Sunday brunch", "")).toBe("kalash-motif");
    expect(resolveMotif("", "", "")).toBe("kalash-motif");
  });
});
