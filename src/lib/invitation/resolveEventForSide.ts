import type { Bilingual, Side, SideEvent, WeddingEvent } from "@/lib/content/types";

function pickBilingual(
  override: Bilingual | undefined,
  shared: Bilingual | undefined
): Bilingual | undefined {
  if (!override && !shared) return undefined;
  return {
    en: override?.en || shared?.en || "",
    hi: override?.hi || shared?.hi || "",
  };
}

/**
 * Applies the viewing side's time and venue overrides onto the shared fields, so
 * downstream components never need to know about per-side columns. Ceremonies
 * such as Haldi/Mehendi/Sangeet can differ per side; the wedding ceremony usually doesn't.
 */
export function resolveEventForSide(event: WeddingEvent, side: Side): SideEvent {
  const isBride = side === "bride";
  return {
    ...event,
    // The schema guarantees a start time for every side that can see the event.
    startAt: (isBride ? event.startAtBride : event.startAtGroom) ?? event.startAt ?? "",
    endAt: (isBride ? event.endAtBride : event.endAtGroom) ?? event.endAt,
    venueName: (isBride ? event.venueNameBride : event.venueNameGroom) ?? event.venueName,
    venueAddress: pickBilingual(
      isBride ? event.venueAddressBride : event.venueAddressGroom,
      event.venueAddress
    ),
    mapUrl: (isBride ? event.mapUrlBride : event.mapUrlGroom) ?? event.mapUrl,
  };
}

/** Earliest start first; the sheet's `order` only breaks ties between identical start times. */
export function compareEventsChronologically(a: SideEvent, b: SideEvent): number {
  return Date.parse(a.startAt) - Date.parse(b.startAt) || a.order - b.order;
}
