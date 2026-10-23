import "server-only";
import { unstable_cache } from "next/cache";
import type { FaqItem, GalleryItem, InvitationContent, WeddingEvent } from "@/lib/content/types";
import type { SheetRow } from "@/lib/content/normalize";
import {
  familyConfigSchema,
  findDuplicateEventIds,
  parseEventRow,
  parseFaqRow,
  parseGalleryRow,
} from "@/lib/content/schema";
import { fetchSheetTab } from "@/lib/content/sheetsClient";
import { mapEventRow, mapFaqRow, mapFamily, mapGalleryRow } from "@/lib/content/sheetsMapping";
import { getServerEnv } from "@/lib/env/server";

export type SheetsContentResult =
  | { kind: "ok"; content: InvitationContent }
  | { kind: "error"; reason: "invalid-family" | "fetch-failed" };

const TABS = { events: "Events", faqs: "Faqs", family: "Family", wording: "Wording" } as const;

/**
 * Logs only what is needed to find a bad row (tab, row id/index, field errors).
 * Never logs raw API errors or credential material.
 */
function logRejectedRow(tab: string, index: number, errors: string[]) {
  console.warn(`[sheets] rejected ${tab} row #${index + 1}: ${errors.join("; ")}`);
}

async function loadFromSheets(): Promise<SheetsContentResult> {
  let eventRows, faqRows, familyRows, wordingRows;
  try {
    [eventRows, faqRows, familyRows, wordingRows] = await Promise.all([
      fetchSheetTab(TABS.events),
      fetchSheetTab(TABS.faqs),
      fetchSheetTab(TABS.family),
      fetchSheetTab(TABS.wording),
    ]);
  } catch (error) {
    console.error(
      `[sheets] fetch failed: ${error instanceof Error ? error.message : "unknown error"}`
    );
    return { kind: "error", reason: "fetch-failed" };
  }

  const familyCandidate = mapFamily(familyRows, wordingRows);
  const familyResult = familyConfigSchema.safeParse(familyCandidate);
  if (!familyResult.success) {
    for (const issue of familyResult.error.issues) {
      logRejectedRow(TABS.family, 0, [`${issue.path.join(".")}: ${issue.message}`]);
    }
    return { kind: "error", reason: "invalid-family" };
  }

  const validEvents: WeddingEvent[] = [];
  eventRows.forEach((row, index) => {
    const result = parseEventRow(mapEventRow(row));
    if (result.success) {
      validEvents.push(result.data);
    } else {
      logRejectedRow(
        TABS.events,
        index,
        result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`)
      );
    }
  });

  const duplicateIds = findDuplicateEventIds(validEvents);
  const events = validEvents.filter((e) => !duplicateIds.includes(e.id));
  if (duplicateIds.length > 0) {
    console.warn(`[sheets] dropped events with duplicate ids: ${duplicateIds.join(", ")}`);
  }

  const faqs: FaqItem[] = [];
  faqRows.forEach((row, index) => {
    const result = parseFaqRow(mapFaqRow(row));
    if (result.success) {
      faqs.push(result.data);
    } else {
      logRejectedRow(
        TABS.faqs,
        index,
        result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`)
      );
    }
  });

  let galleryRows: SheetRow[] = [];
  try {
    galleryRows = await fetchSheetTab("Gallery");
  } catch {
    // Gallery tab is optional; ignore if not present in the sheet
  }

  const gallery: GalleryItem[] = [];
  galleryRows.forEach((row, index) => {
    const result = parseGalleryRow(mapGalleryRow(row));
    if (result.success) {
      if (result.data.active) {
        gallery.push(result.data);
      }
    } else {
      logRejectedRow(
        "Gallery",
        index,
        result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`)
      );
    }
  });

  return {
    kind: "ok",
    content: {
      family: familyResult.data,
      events: events.sort((a, b) => a.order - b.order),
      faqs: faqs.length > 0 ? faqs.sort((a, b) => a.order - b.order) : undefined,
      gallery: gallery.length > 0 ? gallery.sort((a, b) => a.order - b.order) : undefined,
    },
  };
}

/**
 * Explicit caching (required — direct Google API calls bypass Next.js fetch caching).
 * Revalidates every SHEETS_REVALIDATE_SECONDS (default 60). See README "Update
 * behavior" for what this means for an editor waiting on a change to appear.
 */
export function getSheetsContent(): Promise<SheetsContentResult> {
  const env = getServerEnv();
  const revalidateSeconds = env.SHEETS_REVALIDATE_SECONDS;
  const cached = unstable_cache(loadFromSheets, ["invitation-content"], {
    revalidate: revalidateSeconds,
    tags: ["invitation-content"],
  });
  return cached();
}
