import { describe, expect, it } from "vitest";
import { mapEventRow, mapFaqRow, mapFamily, mapGalleryRow, mapSiteCopy } from "./sheetsMapping";
import {
  parseEventRow,
  parseFaqRow,
  parseGalleryRow,
  parseSiteCopy,
  familyConfigSchema,
} from "./schema";

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

  it("maps per-side venue overrides when provided", () => {
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
      venueNameBride_en: "Bride's home",
      venueNameBride_hi: "वधू का घर",
      venueAddressBride_en: "Bermo, bride's side",
      venueAddressBride_hi: "बेरमो, वधू पक्ष",
      venueNameGroom_en: "Groom's home",
      venueNameGroom_hi: "वर का घर",
      venueAddressGroom_en: "Bermo, groom's side",
      venueAddressGroom_hi: "बेरमो, वर पक्ष",
      mapUrlBride: "https://maps.google.com/?q=bride",
      mapUrlGroom: "https://maps.google.com/?q=groom",
    };
    const result = parseEventRow(mapEventRow(row));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.venueNameBride?.en).toBe("Bride's home");
      expect(result.data.venueNameGroom?.en).toBe("Groom's home");
      expect(result.data.mapUrlBride).toBe("https://maps.google.com/?q=bride");
      expect(result.data.mapUrlGroom).toBe("https://maps.google.com/?q=groom");
    }
  });

  it("accepts a row with only per-side venues and no shared venue columns", () => {
    const row = {
      id: "haldi",
      order: "1",
      active: "TRUE",
      visibleTo: "both",
      title_en: "Haldi",
      title_hi: "हल्दी",
      startAt: "2026-11-23T09:00:00+05:30",
      endAt: "",
      venueNameBride_en: "Residence, Ramnagar, Bermo",
      venueNameBride_hi: "निवास, रामनगर, बेरमो",
      venueAddressBride_en: "Ramnagar, Bermo",
      venueAddressBride_hi: "रामनगर, बेरमो",
      mapUrlBride: "https://maps.app.goo.gl/bride",
      venueNameGroom_en: "Rajendrapura, Ajmer",
      venueNameGroom_hi: "राजेंद्रपुरा, अजमेर",
      venueAddressGroom_en: "Rajendrapura, Ajmer",
      venueAddressGroom_hi: "राजेंद्रपुरा, अजमेर",
      mapUrlGroom: "https://maps.app.goo.gl/groom",
    };
    expect(parseEventRow(mapEventRow(row)).success).toBe(true);
  });

  it("accepts per-side venues whose address cells are all blank", () => {
    const row = {
      id: "haldi",
      order: "1",
      active: "TRUE",
      visibleTo: "both",
      title_en: "Haldi",
      title_hi: "हल्दी",
      startAt: "2026-11-23T09:00:00+05:30",
      venueNameBride_en: "Bride home",
      venueNameBride_hi: "वधू घर",
      venueAddressBride_en: "",
      venueAddressBride_hi: "",
      venueNameGroom_en: "Groom home",
      venueNameGroom_hi: "वर घर",
      venueAddressGroom_en: "",
      venueAddressGroom_hi: "",
    };
    const result = parseEventRow(mapEventRow(row));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.venueAddressBride).toBeUndefined();
      expect(result.data.venueAddressGroom).toBeUndefined();
    }
  });

  it("rejects a 'both' row missing a venue for one side and no shared venue", () => {
    const row = {
      id: "haldi",
      order: "1",
      active: "TRUE",
      visibleTo: "both",
      title_en: "Haldi",
      title_hi: "हल्दी",
      startAt: "2026-11-23T09:00:00+05:30",
      venueNameBride_en: "Bride home",
      venueNameBride_hi: "वधू घर",
      venueAddressBride_en: "Bermo",
      venueAddressBride_hi: "बेरमो",
    };
    expect(parseEventRow(mapEventRow(row)).success).toBe(false);
  });

  it("omits per-side venue overrides when blank, falling back to the shared venue", () => {
    const row = {
      id: "wedding-ceremony",
      order: "1",
      active: "TRUE",
      visibleTo: "both",
      title_en: "Wedding Ceremony",
      title_hi: "विवाह समारोह",
      startAt: "2026-11-25T10:00:00+05:30",
      venueName_en: "Family home",
      venueName_hi: "घर",
      venueAddress_en: "Bermo",
      venueAddress_hi: "बेरमो",
    };
    const mapped = mapEventRow(row) as Record<string, unknown>;
    expect(mapped.venueNameBride).toBeUndefined();
    expect(mapped.venueNameGroom).toBeUndefined();
    expect(mapped.mapUrlBride).toBeUndefined();
    expect(mapped.mapUrlGroom).toBeUndefined();
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

describe("mapSiteCopy", () => {
  it("builds a siteCopy candidate from known keys, ignoring unknown ones", () => {
    const rows = [
      { key: "heroEyebrow", text_en: "Wedding Invitation", text_hi: "विवाह निमंत्रण" },
      { key: "galleryHeading", text_en: "Sacred Memories", text_hi: "पावन स्मृतियाँ" },
      { key: "someUnknownKey", text_en: "Ignore me", text_hi: "मुझे अनदेखा करें" },
    ];
    const result = parseSiteCopy(mapSiteCopy(rows));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.heroEyebrow?.en).toBe("Wedding Invitation");
      expect(result.data.galleryHeading?.hi).toBe("पावन स्मृतियाँ");
      expect(result.data).not.toHaveProperty("someUnknownKey");
    }
  });

  it("returns an empty candidate when there are no rows", () => {
    const result = parseSiteCopy(mapSiteCopy([]));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(Object.keys(result.data)).toHaveLength(0);
    }
  });
});
