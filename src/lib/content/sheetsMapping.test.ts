import { describe, expect, it } from "vitest";
import { mapEventRow, mapFaqRow, mapFamily, mapGalleryRow } from "./sheetsMapping";
import { parseEventRow, parseFaqRow, parseGalleryRow, familyConfigSchema } from "./schema";

describe("mapEventRow", () => {
  it("maps a well-formed row into a valid event", () => {
    const row = {
      id: "haldi",
      order: "1",
      active: "TRUE",
      visibleTo: "both",
      title_en: "Haldi",
      title_hi: "हल्दी",
      startAt: "2026-11-23T09:00:00+05:30",
      venueName_en: "Family home",
      venueName_hi: "घर",
      venueAddress_en: "Bermo",
      venueAddress_hi: "बेरमो",
    };
    const result = parseEventRow(mapEventRow(row));
    expect(result.success).toBe(true);
  });

  it("omits optional bilingual fields when both language cells are blank", () => {
    const row = {
      id: "haldi",
      order: "1",
      active: "TRUE",
      visibleTo: "both",
      title_en: "Haldi",
      title_hi: "हल्दी",
      startAt: "2026-11-23T09:00:00+05:30",
      venueName_en: "Family home",
      venueName_hi: "घर",
      venueAddress_en: "Bermo",
      venueAddress_hi: "बेरमो",
      notes_en: "",
      notes_hi: "",
    };
    const mapped = mapEventRow(row) as Record<string, unknown>;
    expect(mapped.notes).toBeUndefined();
  });

  it("rejects a row with a bad timestamp instead of crashing", () => {
    const row = {
      id: "haldi",
      order: "1",
      active: "TRUE",
      visibleTo: "both",
      title_en: "Haldi",
      title_hi: "हल्दी",
      startAt: "not-a-date",
      venueName_en: "Family home",
      venueName_hi: "घर",
      venueAddress_en: "Bermo",
      venueAddress_hi: "बेरमो",
    };
    expect(parseEventRow(mapEventRow(row)).success).toBe(false);
  });
});

describe("mapFaqRow", () => {
  it("maps a well-formed row into a valid FAQ", () => {
    const row = {
      id: "dress-code",
      order: "1",
      active: "TRUE",
      question_en: "What should I wear?",
      question_hi: "मुझे क्या पहनना चाहिए?",
      answer_en: "Festive Indian wear.",
      answer_hi: "उत्सवी भारतीय परिधान।",
    };
    expect(parseFaqRow(mapFaqRow(row)).success).toBe(true);
  });
});

describe("mapFamily", () => {
  it("assembles a valid FamilyConfig from Family + Wording rows", () => {
    const peopleRows = [
      { role: "brideName", name_en: "Sanjukta", name_hi: "संजुक्ता" },
      { role: "groomName", name_en: "Khushal", name_hi: "खुशाल" },
      { role: "brideParent", order: "1", name_en: "Parent A", name_hi: "अ" },
      { role: "brideParent", order: "2", name_en: "Parent B", name_hi: "ब" },
      { role: "groomParent", order: "1", name_en: "Parent C", name_hi: "स" },
      { role: "groomParent", order: "2", name_en: "Parent D", name_hi: "द" },
    ];
    const wordingRows = [
      { side: "bride", text_en: "Bride wording", text_hi: "वधू पाठ" },
      { side: "groom", text_en: "Groom wording", text_hi: "वर पाठ" },
    ];
    const result = familyConfigSchema.safeParse(mapFamily(peopleRows, wordingRows));
    expect(result.success).toBe(true);
  });

  it("orders parents by the order column", () => {
    const peopleRows = [
      { role: "brideName", name_en: "Sanjukta", name_hi: "संजुक्ता" },
      { role: "groomName", name_en: "Khushal", name_hi: "खुशाल" },
      { role: "brideParent", order: "2", name_en: "Second", name_hi: "दूसरा" },
      { role: "brideParent", order: "1", name_en: "First", name_hi: "पहला" },
      { role: "groomParent", order: "1", name_en: "Parent C", name_hi: "स" },
    ];
    const wordingRows = [
      { side: "bride", text_en: "Bride wording", text_hi: "वधू पाठ" },
      { side: "groom", text_en: "Groom wording", text_hi: "वर पाठ" },
    ];
    const candidate = mapFamily(peopleRows, wordingRows) as { brideParents: { en: string }[] };
    expect(candidate.brideParents.map((p) => p.en)).toEqual(["First", "Second"]);
  });
});

describe("mapGalleryRow", () => {
  it("maps a well-formed gallery row with captions", () => {
    const row = {
      id: "photo-1",
      order: "1",
      active: "TRUE",
      imageUrl: "https://drive.google.com/file/d/1AbC-123_xyz/view?usp=sharing",
      caption_en: "At the Ghats",
      caption_hi: "घाटों पर",
    };
    const mapped = mapGalleryRow(row);
    const result = parseGalleryRow(mapped);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.imageUrl).toBe("https://lh3.googleusercontent.com/d/1AbC-123_xyz");
      expect(result.data.caption?.en).toBe("At the Ghats");
      expect(result.data.caption?.hi).toBe("घाटों पर");
    }
  });

  it("maps a gallery row without captions", () => {
    const row = {
      id: "photo-2",
      order: "2",
      active: "TRUE",
      imageUrl: "/gallery/candid.webp",
    };
    const mapped = mapGalleryRow(row);
    const result = parseGalleryRow(mapped);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.caption).toBeUndefined();
    }
  });
});
