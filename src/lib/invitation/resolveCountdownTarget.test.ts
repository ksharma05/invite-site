import { describe, expect, it } from "vitest";
import type { WeddingEvent } from "@/lib/content/types";
import { resolveCountdownTarget } from "@/lib/invitation/resolveCountdownTarget";

function ev(id: string, order: number, extra: Partial<WeddingEvent> = {}): WeddingEvent {
  return {
    id,
    order,
    active: true,
    visibleTo: "both",
    title: { en: `${id} title`, hi: "" },
    startAt: "2026-11-25T04:30:00Z",
    venueName: { en: "Venue", hi: "" },
    venueAddress: { en: "Address", hi: "" },
    ...extra,
  };
}

describe("resolveCountdownTarget", () => {
  it("prefers the wedding ceremony event over an earlier-ordered event", () => {
    const events = [ev("haldi", 1), ev("wedding-ceremony", 4), ev("sangeet", 2)];
    expect(resolveCountdownTarget(events, "bride")?.id).toBe("wedding-ceremony");
  });

  it("does not blindly pick the first row / earliest event", () => {
    // wedding-ceremony is ordered last, yet is still the target.
    const events = [ev("haldi", 1), ev("mehendi", 0), ev("wedding-ceremony", 5)];
    expect(resolveCountdownTarget(events, "bride")?.id).toBe("wedding-ceremony");
  });

  it("falls back to the earliest visible event when no ceremony is present", () => {
    const events = [ev("haldi", 2), ev("sangeet", 1)];
    expect(resolveCountdownTarget(events, "groom")?.id).toBe("sangeet");
  });

  it("ignores events hidden from the current side", () => {
    const events = [ev("haldi", 1), ev("wedding-ceremony", 4, { visibleTo: "bride" })];
    // Groom cannot see the ceremony → falls back to the visible earliest event.
    expect(resolveCountdownTarget(events, "groom")?.id).toBe("haldi");
    expect(resolveCountdownTarget(events, "bride")?.id).toBe("wedding-ceremony");
  });

  it("ignores inactive events even if they look like the ceremony", () => {
    const events = [ev("wedding-ceremony", 3, { active: false }), ev("sangeet", 1)];
    expect(resolveCountdownTarget(events, "bride")?.id).toBe("sangeet");
  });

  it("returns null when no visible active event exists", () => {
    expect(
      resolveCountdownTarget([ev("wedding-ceremony", 1, { active: false })], "bride")
    ).toBeNull();
    expect(resolveCountdownTarget([], "bride")).toBeNull();
  });
});
