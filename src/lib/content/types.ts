/**
 * Content model — Phase 1 schema (approved shape, not yet wired to a live spreadsheet).
 * See DECISIONS.md for the decisions this schema encodes and the ones still open.
 */

export type Lang = "en" | "hi";
export type Side = "bride" | "groom";
export type EventSide = Side | "both";

export interface Bilingual {
  en: string;
  hi: string;
}

export interface PersonName {
  en: string;
  hi: string;
  honorificEn?: string;
  honorificHi?: string;
}

export interface FamilyConfig {
  brideName: PersonName;
  groomName: PersonName;
  brideParents: PersonName[];
  groomParents: PersonName[];
  brideGrandparents?: PersonName[];
  groomGrandparents?: PersonName[];
  /** Complete, non-stitched invitation passages — never built by concatenating fragments. */
  invitationWording: {
    bride: Bilingual;
    groom: Bilingual;
  };
  blessing?: Bilingual;
}

export interface WeddingEvent {
  /** Stable identifier — never a sheet row number or a title. */
  id: string;
  order: number;
  active: boolean;
  visibleTo: EventSide;
  title: Bilingual;
  subtitle?: Bilingual;
  /** ISO 8601 with offset, e.g. 2026-11-25T10:00:00+05:30 — canonical source of truth. */
  startAt: string;
  endAt?: string;
  venueName: Bilingual;
  venueAddress: Bilingual;
  mapUrl?: string;
  dressCode?: Bilingual;
  notes?: Bilingual;
  imageUrl?: string;
}

export interface FaqItem {
  id: string;
  order: number;
  active: boolean;
  question: Bilingual;
  answer: Bilingual;
}

export interface InvitationContent {
  family: FamilyConfig;
  events: WeddingEvent[];
  /**
   * Optional. Absent or empty means the FAQ section is not rendered at all —
   * it is not a placeholder/empty-state section like events.
   */
  faqs?: FaqItem[];
}
