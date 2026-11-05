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
 *   Optional per-side venue overrides (for ceremonies held at different
 *   venues for bride's side vs groom's side, e.g. Haldi/Mehendi/Sangeet):
 *   venueNameBride_en, venueNameBride_hi, venueNameGroom_en, venueNameGroom_hi,
 *   venueAddressBride_en, venueAddressBride_hi, venueAddressGroom_en,
 *   venueAddressGroom_hi, mapUrlBride, mapUrlGroom. Leave these blank to use
 *   the shared venueName/venueAddress/mapUrl for both sides.
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
 *
 * Tab "Copy" (optional): key, text_en, text_hi
 *   One row per ceremonial-copy string (invocation shlokas, hero eyebrow,
 *   wedding-card eyebrow, gallery heading/badge). Any missing key/row falls
 *   back to DEFAULT_SITE_COPY (src/lib/content/copyDefaults.ts). Known keys:
 *   invocationGaneshaHeader, invocationGaneshaBody, invocationShivParvatiHeader,
 *   invocationShivParvatiBody, heroEyebrow, weddingCardEyebrow, galleryHeading,
 *   galleryBadge.
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
    venueName:
      emptyToUndefined(row.venueName_en) || emptyToUndefined(row.venueName_hi)
        ? { en: normalizeCell(row.venueName_en), hi: normalizeCell(row.venueName_hi) }
        : undefined,
    venueAddress:
      emptyToUndefined(row.venueAddress_en) || emptyToUndefined(row.venueAddress_hi)
        ? { en: normalizeCell(row.venueAddress_en), hi: normalizeCell(row.venueAddress_hi) }
        : undefined,
    mapUrl: emptyToUndefined(row.mapUrl),
    venueNameBride:
      emptyToUndefined(row.venueNameBride_en) || emptyToUndefined(row.venueNameBride_hi)
        ? { en: normalizeCell(row.venueNameBride_en), hi: normalizeCell(row.venueNameBride_hi) }
        : undefined,
    venueNameGroom:
      emptyToUndefined(row.venueNameGroom_en) || emptyToUndefined(row.venueNameGroom_hi)
        ? { en: normalizeCell(row.venueNameGroom_en), hi: normalizeCell(row.venueNameGroom_hi) }
        : undefined,
    venueAddressBride:
      emptyToUndefined(row.venueAddressBride_en) || emptyToUndefined(row.venueAddressBride_hi)
        ? {
            en: normalizeCell(row.venueAddressBride_en),
            hi: normalizeCell(row.venueAddressBride_hi),
          }
        : undefined,
    venueAddressGroom:
      emptyToUndefined(row.venueAddressGroom_en) || emptyToUndefined(row.venueAddressGroom_hi)
        ? {
            en: normalizeCell(row.venueAddressGroom_en),
            hi: normalizeCell(row.venueAddressGroom_hi),
          }
        : undefined,
    mapUrlBride: emptyToUndefined(row.mapUrlBride),
    mapUrlGroom: emptyToUndefined(row.mapUrlGroom),
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

const SITE_COPY_KEYS = [
  "invocationGaneshaHeader",
  "invocationGaneshaBody",
  "invocationShivParvatiHeader",
  "invocationShivParvatiBody",
  "heroEyebrow",
  "weddingCardEyebrow",
  "galleryHeading",
  "galleryBadge",
] as const;

/** Builds the unvalidated SiteCopy candidate from the optional "Copy" tab; unknown keys are ignored. */
export function mapSiteCopy(rows: SheetRow[]): unknown {
  const result: Record<string, unknown> = {};
  for (const key of SITE_COPY_KEYS) {
    const row = rows.find((r) => normalizeCell(r.key) === key);
    if (!row) continue;
    if (!emptyToUndefined(row.text_en) && !emptyToUndefined(row.text_hi)) continue;
    result[key] = { en: normalizeCell(row.text_en), hi: normalizeCell(row.text_hi) };
  }
  return result;
}
