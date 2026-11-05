import { describe, expect, it } from "vitest";
import type { Side, WeddingEvent } from "@/lib/content/types";
import {
  compareEventsChronologically,
  resolveEventForSide,
} from "@/lib/invitation/resolveEventForSide";

function ev(id: string, order: number, extra: Partial<WeddingEvent> = {}): WeddingEvent {
  return {
    id,
    order,
    active: true,
    visibleTo: "both",
    title: { en: id, hi: id },
    startAt: "2026-11-25T10:00:00+05:30",
    venueName: { en: "Shared venue", hi: "साझा स्थान" },
    venueAddress: { en: "Shared address", hi: "साझा पता" },
    ...extra,
  };
}

const orderFor = (events: WeddingEvent[], side: Side) =>
  events
    .map((e) => resolveEventForSide(e, side))
    .sort(compareEventsChronologically)
    .map((e) => e.id);

describe("resolveEventForSide", () => {
  it("uses the shared time and venue when there are no overrides", () => {
    const resolved = resolveEventForSide(ev("wedding-ceremony", 1), "groom");
    expect(resolved.startAt).toBe("2026-11-25T10:00:00+05:30");
    expect(resolved.venueName?.en).toBe("Shared venue");
    expect(resolved.venueAddress?.hi).toBe("साझा पता");
  });

  it("applies the viewing side's time and venue overrides", () => {
    const event = ev("haldi", 1, {
      startAt: undefined,
      startAtBride: "2026-11-23T09:00:00+05:30",
      endAtBride: "2026-11-23T12:00:00+05:30",
      startAtGroom: "2026-11-22T10:00:00+05:30",
      venueNameGroom: { en: "Groom home", hi: "वर घर" },
      mapUrlGroom: "https://maps.example/groom",
    });

    const bride = resolveEventForSide(event, "bride");
    expect(bride.startAt).toBe("2026-11-23T09:00:00+05:30");
    expect(bride.endAt).toBe("2026-11-23T12:00:00+05:30");
    expect(bride.venueName?.en).toBe("Shared venue");

    const groom = resolveEventForSide(event, "groom");
    expect(groom.startAt).toBe("2026-11-22T10:00:00+05:30");
    expect(groom.endAt).toBeUndefined();
    expect(groom.venueName?.en).toBe("Groom home");
    expect(groom.mapUrl).toBe("https://maps.example/groom");
  });

  it("falls back to the shared address per language", () => {
    const event = ev("sangeet", 1, { venueAddressBride: { en: "Bride address", hi: "" } });
    const resolved = resolveEventForSide(event, "bride");
    expect(resolved.venueAddress).toEqual({ en: "Bride address", hi: "साझा पता" });
  });
});

describe("compareEventsChronologically", () => {
  const events = [
    ev("haldi", 1, {
      startAtBride: "2026-11-23T09:00:00+05:30",
      startAtGroom: "2026-11-24T09:00:00+05:30",
    }),
    ev("mehendi", 2, {
      startAtBride: "2026-11-23T16:00:00+05:30",
      startAtGroom: "2026-11-23T16:00:00+05:30",
    }),
    ev("wedding-ceremony", 3),
  ];

  it("orders each side's itinerary by that side's own start times", () => {
    expect(orderFor(events, "bride")).toEqual(["haldi", "mehendi", "wedding-ceremony"]);
    expect(orderFor(events, "groom")).toEqual(["mehendi", "haldi", "wedding-ceremony"]);
  });

  it("uses order only to break ties between identical start times", () => {
    const tied = [ev("b", 2), ev("a", 1)];
    expect(orderFor(tied, "bride")).toEqual(["a", "b"]);
  });
});
