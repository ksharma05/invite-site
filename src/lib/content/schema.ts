import { z } from "zod";

/**
 * Runtime validation for content coming from the spreadsheet (Phase 5) or fixtures (now).
 * Rejects malformed rows instead of letting them reach the page — see Phase 5/6 acceptance criteria.
 */

const bilingualSchema = z.object({
  en: z.string().min(1, "English text is required"),
  hi: z.string().min(1, "Hindi text is required"),
});

const personNameSchema = z.object({
  en: z.string().min(1),
  hi: z.string().min(1),
  honorificEn: z.string().optional(),
  honorificHi: z.string().optional(),
});

export const familyConfigSchema = z.object({
  brideName: personNameSchema,
  groomName: personNameSchema,
  brideParents: z.array(personNameSchema).min(1),
  groomParents: z.array(personNameSchema).min(1),
  brideGrandparents: z.array(personNameSchema).optional(),
  groomGrandparents: z.array(personNameSchema).optional(),
  invitationWording: z.object({
    bride: bilingualSchema,
    groom: bilingualSchema,
  }),
  blessing: bilingualSchema.optional(),
});

export const weddingEventSchema = z
  .object({
    id: z.string().min(1, "Event id is required"),
    order: z.number().int(),
    active: z.boolean(),
    visibleTo: z.enum(["bride", "groom", "both"]),
    title: bilingualSchema,
    subtitle: bilingualSchema.optional(),
    startAt: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
      message: "startAt must be a valid ISO 8601 timestamp",
    }),
    endAt: z
      .string()
      .refine((v) => !Number.isNaN(Date.parse(v)), {
        message: "endAt must be a valid ISO 8601 timestamp",
      })
      .optional(),
    /** Shared venue; optional when every side that sees the event has its own override below. */
    venueName: bilingualSchema.optional(),
    venueAddress: bilingualSchema.optional(),
    mapUrl: z.string().url().optional(),
    /** Per-side overrides for ceremonies (Haldi/Mehendi/Sangeet) held at different venues for each side; falls back to venueName/venueAddress/mapUrl when absent. */
    venueNameBride: bilingualSchema.optional(),
    venueNameGroom: bilingualSchema.optional(),
    venueAddressBride: bilingualSchema.optional(),
    venueAddressGroom: bilingualSchema.optional(),
    mapUrlBride: z.string().url().optional(),
    mapUrlGroom: z.string().url().optional(),
    dressCode: bilingualSchema.optional(),
    notes: bilingualSchema.optional(),
    imageUrl: z.string().url().optional(),
  })
  .refine((event) => !event.endAt || Date.parse(event.endAt) >= Date.parse(event.startAt), {
    message: "endAt must not be before startAt",
    path: ["endAt"],
  })
  .superRefine((event, ctx) => {
    const sides =
      event.visibleTo === "both" ? (["bride", "groom"] as const) : ([event.visibleTo] as const);
    for (const side of sides) {
      const name = side === "bride" ? event.venueNameBride : event.venueNameGroom;
      const address = side === "bride" ? event.venueAddressBride : event.venueAddressGroom;
      if (!name && !event.venueName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `needs venueName or venueName${side === "bride" ? "Bride" : "Groom"}`,
          path: ["venueName"],
        });
      }
      if (!address && !event.venueAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `needs venueAddress or venueAddress${side === "bride" ? "Bride" : "Groom"}`,
          path: ["venueAddress"],
        });
      }
    }
  });

export const faqItemSchema = z.object({
  id: z.string().min(1, "FAQ id is required"),
  order: z.number().int(),
  active: z.boolean(),
  question: bilingualSchema,
  answer: bilingualSchema,
});

export const galleryItemSchema = z.object({
  id: z.string().min(1, "Gallery item id is required"),
  order: z.number().int(),
  active: z.boolean(),
  imageUrl: z.string().min(1, "imageUrl is required"),
  caption: bilingualSchema.optional(),
});

/**
 * Guest-facing ceremonial copy (invocation shlokas, hero eyebrow, gallery heading, etc.)
 * sourced from the optional "Copy" sheet tab. Every key is optional: a missing tab or row
 * falls back to DEFAULT_SITE_COPY (src/lib/content/copyDefaults.ts) so content never breaks.
 */
export const siteCopySchema = z
  .object({
    invocationGaneshaHeader: bilingualSchema.optional(),
    invocationGaneshaBody: bilingualSchema.optional(),
    invocationShivParvatiHeader: bilingualSchema.optional(),
    invocationShivParvatiBody: bilingualSchema.optional(),
    heroEyebrow: bilingualSchema.optional(),
    weddingCardEyebrow: bilingualSchema.optional(),
    galleryHeading: bilingualSchema.optional(),
    galleryBadge: bilingualSchema.optional(),
  })
  .partial();

export const invitationContentSchema = z.object({
  family: familyConfigSchema,
  events: z.array(weddingEventSchema),
  /** Absent/empty means the FAQ section is skipped entirely — not an "optional feature" approval. */
  faqs: z.array(faqItemSchema).optional(),
  /** Absent/empty means the photo gallery displays the celebratory placeholder. */
  gallery: z.array(galleryItemSchema).optional(),
  /** Absent means every ceremonial copy string falls back to DEFAULT_SITE_COPY. */
  siteCopy: siteCopySchema.optional(),
});

/** Validates one event row; used so a single malformed row can be skipped without failing the batch. */
export function parseEventRow(row: unknown) {
  return weddingEventSchema.safeParse(row);
}

/** Validates one FAQ row; same row-skip philosophy as parseEventRow. */
export function parseFaqRow(row: unknown) {
  return faqItemSchema.safeParse(row);
}

/** Validates one Gallery row; same row-skip philosophy as parseEventRow. */
export function parseGalleryRow(row: unknown) {
  return galleryItemSchema.safeParse(row);
}

/** Validates the assembled siteCopy candidate built from the "Copy" tab. */
export function parseSiteCopy(candidate: unknown) {
  return siteCopySchema.safeParse(candidate);
}

/** Detects duplicate stable ids among otherwise-valid events (Phase 5 acceptance criterion). */
export function findDuplicateEventIds(events: { id: string }[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const event of events) {
    if (seen.has(event.id)) duplicates.add(event.id);
    seen.add(event.id);
  }
  return Array.from(duplicates);
}
