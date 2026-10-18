import { describe, expect, it } from "vitest";
import { buildIcs } from "@/lib/calendar/ics";

describe("buildIcs", () => {
  it("emits a VCALENDAR with validated UTC timestamps preserving the instant", () => {
    const ics = buildIcs({
      startAt: "2026-11-25T10:00:00+05:30",
      title: "Wedding Ceremony",
      description: "At the venue",
      location: "Address",
    });
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("END:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("DTSTART:2026-11-25T04:30:00Z"); // 10:00 IST === 04:30 UTC
    expect(ics).toContain("DTEND:2026-11-25T04:30:00Z"); // no end → same as start
  });

  it("keeps a supplied end timestamp (multi-hour event)", () => {
    const ics = buildIcs({
      startAt: "2026-11-25T10:00:00+05:30",
      endAt: "2026-11-25T13:00:00+05:30",
      title: "Ceremony",
      description: "",
      location: "",
    });
    expect(ics).toContain("DTSTART:2026-11-25T04:30:00Z");
    expect(ics).toContain("DTEND:2026-11-25T07:30:00Z");
  });

  it("handles overnight events whose end falls on a later calendar day", () => {
    const ics = buildIcs({
      startAt: "2026-11-24T19:00:00+05:30",
      endAt: "2026-11-25T00:30:00+05:30",
      title: "Sangeet",
      description: "Music night",
      location: "Hall",
    });
    expect(ics).toContain("DTSTART:2026-11-24T13:30:00Z");
    expect(ics).toContain("DTEND:2026-11-24T19:00:00Z"); // crosses into the next local day
  });

  it("escapes RFC 5545 special characters", () => {
    const ics = buildIcs({
      startAt: "2026-11-25T10:00:00+05:30",
      title: "Lunch, Snacks & Tea; with (family)",
      description: "Line one\nLine two",
      location: "A, B; C",
    });
    expect(ics).toContain("SUMMARY:Lunch\\, Snacks & Tea\\; with (family)");
    expect(ics).toContain("DESCRIPTION:Line one\\nLine two");
    expect(ics).toContain("LOCATION:A\\, B\\; C");
  });

  it("folds any content line longer than 75 octets with CRLF continuation", () => {
    const longDescription = "d".repeat(120);
    const ics = buildIcs({
      startAt: "2026-11-25T10:00:00+05:30",
      title: "T",
      description: longDescription,
      location: "",
    });
    const descriptionLine = "DESCRIPTION:" + "d".repeat(120); // graphemes == octets here
    expect(ics).toContain(descriptionLine.slice(0, 70));
    expect(ics).toContain("\r\n ");
    // No single unfolded line may exceed 75 octets.
    for (const line of ics.split("\r\n")) {
      expect(Buffer.byteLength(line, "utf8")).toBeLessThanOrEqual(75);
    }
  });
});
