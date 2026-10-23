/**
 * Pure row -> candidate-object mapping for each sheet tab (Phase 5).
 * Output here is UNVALIDATED — callers must run it through schema.ts before
 * treating it as real content. Kept separate from network code so it is
 * testable without mocking the Google API.
 *
 * Sheet layout (see README "Setting up the Google Sheet" for the full guide):
 *
 * Tab "Events":  id, order, active, visibleTo, title_en, title_hi,
 *   subtitle_en, subtitle_hi, startAt, endAt, venueName_en, venueName_hi,
 *   venueAddress_en, venueAddress_hi, mapUrl, dressCode_en, dressCode_hi,
 *   notes_en, notes_hi, imageUrl
 *
 * Tab "Faqs":    id, order, active, question_en, question_hi, answer_en, answer_hi
 *
 * Tab "Family":  role, order, name_en, name_hi, honorific_en, honorific_hi
 *   role is one of: brideName, groomName, brideParent, groomParent,
 *   brideGrandparent, groomGrandparent (one row per person; order sorts
 *   parents/grandparents, ignored for the single-row roles)
 *
 * Tab "Wording": side, text_en, text_hi
 *   side is one of: bride, groom, blessing (blessing row is optional)
 */

import {
  emptyToUndefined,
  normalizeBoolean,
  normalizeCell,
  normalizeOrder,
  resolveImageUrl,
  type SheetRow,
} from "@/lib/content/normalize";

export function mapEventRow(row: SheetRow): unknown {
  return {
    id: normalizeCell(row.id),
    order: normalizeOrder(row.order),
    active: normalizeBoolean(row.active),
    visibleTo: normalizeCell(row.visibleTo) || undefined,
    title: { en: normalizeCell(row.title_en), hi: normalizeCell(row.title_hi) },
    subtitle:
      emptyToUndefined(row.subtitle_en) || emptyToUndefined(row.subtitle_hi)
        ? { en: normalizeCell(row.subtitle_en), hi: normalizeCell(row.subtitle_hi) }
        : undefined,
    startAt: normalizeCell(row.startAt),
    endAt: emptyToUndefined(row.endAt),
    venueName: { en: normalizeCell(row.venueName_en), hi: normalizeCell(row.venueName_hi) },
    venueAddress: {
      en: normalizeCell(row.venueAddress_en),
      hi: normalizeCell(row.venueAddress_hi),
    },
    mapUrl: emptyToUndefined(row.mapUrl),
    dressCode:
      emptyToUndefined(row.dressCode_en) || emptyToUndefined(row.dressCode_hi)
        ? { en: normalizeCell(row.dressCode_en), hi: normalizeCell(row.dressCode_hi) }
        : undefined,
    notes:
      emptyToUndefined(row.notes_en) || emptyToUndefined(row.notes_hi)
        ? { en: normalizeCell(row.notes_en), hi: normalizeCell(row.notes_hi) }
        : undefined,
    imageUrl: resolveImageUrl(emptyToUndefined(row.imageUrl)),
  };
}

export function mapFaqRow(row: SheetRow): unknown {
  return {
    id: normalizeCell(row.id),
    order: normalizeOrder(row.order),
    active: normalizeBoolean(row.active),
    question: { en: normalizeCell(row.question_en), hi: normalizeCell(row.question_hi) },
    answer: { en: normalizeCell(row.answer_en), hi: normalizeCell(row.answer_hi) },
  };
}

export function mapGalleryRow(row: SheetRow): unknown {
  const rawUrl = normalizeCell(row.imageUrl);
  const resolvedUrl = resolveImageUrl(rawUrl);

  const hasCaption =
    Boolean(normalizeCell(row.caption_en)) || Boolean(normalizeCell(row.caption_hi));

  return {
    id: normalizeCell(row.id),
    order: normalizeOrder(row.order),
    active: normalizeBoolean(row.active),
    imageUrl: resolvedUrl,
    caption: hasCaption
      ? {
          en: normalizeCell(row.caption_en) || normalizeCell(row.caption_hi) || "",
          hi: normalizeCell(row.caption_hi) || normalizeCell(row.caption_en) || "",
        }
      : undefined,
  };
}

function mapPerson(row: SheetRow): unknown {
  return {
    en: normalizeCell(row.name_en),
    hi: normalizeCell(row.name_hi),
    honorificEn: emptyToUndefined(row.honorific_en),
    honorificHi: emptyToUndefined(row.honorific_hi),
  };
}

function peopleForRole(rows: SheetRow[], role: string): unknown[] {
  return rows
    .filter((r) => normalizeCell(r.role) === role)
    .sort((a, b) => normalizeOrder(a.order) - normalizeOrder(b.order))
    .map(mapPerson);
}

function singlePersonForRole(rows: SheetRow[], role: string): unknown | undefined {
  const row = rows.find((r) => normalizeCell(r.role) === role);
  return row ? mapPerson(row) : undefined;
}

function wordingFor(rows: SheetRow[], side: string): unknown {
  const row = rows.find((r) => normalizeCell(r.side) === side);
  return { en: normalizeCell(row?.text_en), hi: normalizeCell(row?.text_hi) };
}

/** Builds the unvalidated FamilyConfig candidate from the "Family" and "Wording" tabs. */
export function mapFamily(peopleRows: SheetRow[], wordingRows: SheetRow[]): unknown {
  const brideGrandparents = peopleForRole(peopleRows, "brideGrandparent");
  const groomGrandparents = peopleForRole(peopleRows, "groomGrandparent");
  const blessingRow = wordingRows.find((r) => normalizeCell(r.side) === "blessing");

  return {
    brideName: singlePersonForRole(peopleRows, "brideName"),
    groomName: singlePersonForRole(peopleRows, "groomName"),
    brideParents: peopleForRole(peopleRows, "brideParent"),
    groomParents: peopleForRole(peopleRows, "groomParent"),
    brideGrandparents: brideGrandparents.length > 0 ? brideGrandparents : undefined,
    groomGrandparents: groomGrandparents.length > 0 ? groomGrandparents : undefined,
    invitationWording: {
      bride: wordingFor(wordingRows, "bride"),
      groom: wordingFor(wordingRows, "groom"),
    },
    blessing: blessingRow
      ? { en: normalizeCell(blessingRow.text_en), hi: normalizeCell(blessingRow.text_hi) }
      : undefined,
  };
}
