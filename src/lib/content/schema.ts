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
    venueName: bilingualSchema,
    venueAddress: bilingualSchema,
    mapUrl: z.string().url().optional(),
    dressCode: bilingualSchema.optional(),
    notes: bilingualSchema.optional(),
    imageUrl: z.string().url().optional(),
  })
  .refine((event) => !event.endAt || Date.parse(event.endAt) >= Date.parse(event.startAt), {
    message: "endAt must not be before startAt",
    path: ["endAt"],
  });

export const faqItemSchema = z.object({
  id: z.string().min(1, "FAQ id is required"),
  order: z.number().int(),
  active: z.boolean(),
  question: bilingualSchema,
  answer: bilingualSchema,
});

export const invitationContentSchema = z.object({
  family: familyConfigSchema,
  events: z.array(weddingEventSchema),
  /** Absent/empty means the FAQ section is skipped entirely — not an "optional feature" approval. */
  faqs: z.array(faqItemSchema).optional(),
});

/** Validates one event row; used so a single malformed row can be skipped without failing the batch. */
export function parseEventRow(row: unknown) {
  return weddingEventSchema.safeParse(row);
}

/** Validates one FAQ row; same row-skip philosophy as parseEventRow. */
export function parseFaqRow(row: unknown) {
  return faqItemSchema.safeParse(row);
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
