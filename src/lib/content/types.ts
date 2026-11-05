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
  /** ISO 8601 with offset, e.g. 2026-11-25T10:00:00+05:30. Optional when every side that sees the event has its own startAt override below. */
  startAt?: string;
  endAt?: string;
  /** Per-side overrides for ceremonies held at different times for each side; fall back to startAt/endAt when absent. */
  startAtBride?: string;
  endAtBride?: string;
  startAtGroom?: string;
  endAtGroom?: string;
  /** Shared venue; optional when every side that sees the event has its own override below. */
  venueName?: Bilingual;
  venueAddress?: Bilingual;
  mapUrl?: string;
  /** Per-side overrides for ceremonies held at different venues for each side; falls back to venueName/venueAddress/mapUrl when absent. */
  venueNameBride?: Bilingual;
  venueNameGroom?: Bilingual;
  venueAddressBride?: Bilingual;
  venueAddressGroom?: Bilingual;
  mapUrlBride?: string;
  mapUrlGroom?: string;
  dressCode?: Bilingual;
  notes?: Bilingual;
  imageUrl?: string;
}

/** An event as seen by one side: per-side time/venue overrides already applied to the shared fields. */
export type SideEvent = Omit<WeddingEvent, "startAt"> & { startAt: string };

export interface FaqItem {
  id: string;
  order: number;
  active: boolean;
  question: Bilingual;
  answer: Bilingual;
}

export interface GalleryItem {
  id: string;
  order: number;
  active: boolean;
  imageUrl: string;
  caption?: Bilingual;
}

/**
 * Guest-facing ceremonial copy from the optional "Copy" sheet tab. Every key is optional —
 * a missing tab/row falls back to DEFAULT_SITE_COPY (src/lib/content/copyDefaults.ts).
 */
export interface SiteCopy {
  invocationGaneshaHeader?: Bilingual;
  invocationGaneshaBody?: Bilingual;
  invocationShivParvatiHeader?: Bilingual;
  invocationShivParvatiBody?: Bilingual;
  heroEyebrow?: Bilingual;
  weddingCardEyebrow?: Bilingual;
  galleryHeading?: Bilingual;
  galleryBadge?: Bilingual;
}

export interface InvitationContent {
  family: FamilyConfig;
  events: WeddingEvent[];
  /**
   * Optional. Absent or empty means the FAQ section is not rendered at all —
   * it is not a placeholder/empty-state section like events.
   */
  faqs?: FaqItem[];
  /**
   * Optional. Absent or empty means the photo gallery displays the celebratory
   * placeholder until family publishes photos.
   */
  gallery?: GalleryItem[];
  /** Optional. Absent means every ceremonial copy string falls back to DEFAULT_SITE_COPY. */
  siteCopy?: SiteCopy;
}
