import { describe, expect, it } from "vitest";
import { parseEventRow, findDuplicateEventIds } from "./schema";

const validEvent = {
  id: "wedding-ceremony",
  order: 1,
  active: true,
  visibleTo: "both",
  title: { en: "Wedding Ceremony", hi: "विवाह समारोह" },
  startAt: "2026-11-25T10:00:00+05:30",
  venueName: { en: "Venue", hi: "स्थान" },
  venueAddress: { en: "Address", hi: "पता" },
};

describe("parseEventRow", () => {
  it("accepts a well-formed event", () => {
    expect(parseEventRow(validEvent).success).toBe(true);
  });

  it("rejects an event with an invalid timestamp instead of crashing the page", () => {
    const result = parseEventRow({ ...validEvent, startAt: "not-a-date" });
    expect(result.success).toBe(false);
  });

  it("rejects an end timestamp before the start timestamp", () => {
    const result = parseEventRow({
      ...validEvent,
      endAt: "2026-11-24T10:00:00+05:30",
    });
    expect(result.success).toBe(false);
  });

  it("accepts an event with no venue address at all", () => {
    const { venueAddress, ...withoutAddress } = validEvent;
    expect(parseEventRow(withoutAddress).success).toBe(true);
  });

  it("accepts a per-side venue address filled in only one language", () => {
    const result = parseEventRow({
      ...validEvent,
      venueAddressBride: { en: "Ramnagar, Bermo", hi: "" },
      venueAddressGroom: { en: "", hi: "राजेंद्रपुरा, अजमेर" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts per-side times without a shared startAt", () => {
    const { startAt, ...withoutStart } = validEvent;
    const result = parseEventRow({
      ...withoutStart,
      startAtBride: "2026-11-23T09:00:00+05:30",
      startAtGroom: "2026-11-24T09:00:00+05:30",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an event with no start time for a side that can see it", () => {
    const { startAt, ...withoutStart } = validEvent;
    const result = parseEventRow({
      ...withoutStart,
      startAtBride: "2026-11-23T09:00:00+05:30",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a one-side event that only has that side's time", () => {
    const { startAt, ...withoutStart } = validEvent;
    const result = parseEventRow({
      ...withoutStart,
      visibleTo: "groom",
      startAtGroom: "2026-11-24T09:00:00+05:30",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a per-side end time before that side's start time", () => {
    const result = parseEventRow({
      ...validEvent,
      startAtGroom: "2026-11-24T09:00:00+05:30",
      endAtGroom: "2026-11-24T08:00:00+05:30",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid per-side timestamp", () => {
    const result = parseEventRow({ ...validEvent, startAtBride: "23 Nov, 9am" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing stable id", () => {
    const { id, ...withoutId } = validEvent;
    const result = parseEventRow(withoutId);
    expect(result.success).toBe(false);
  });
});

describe("findDuplicateEventIds", () => {
  it("flags repeated ids", () => {
    expect(findDuplicateEventIds([{ id: "a" }, { id: "b" }, { id: "a" }])).toEqual(["a"]);
  });

  it("returns an empty array when all ids are unique", () => {
    expect(findDuplicateEventIds([{ id: "a" }, { id: "b" }])).toEqual([]);
  });
});
