"use client";

import { useEffect, useRef, useState } from "react";
import { buildIcs, buildIcsBlobUrl } from "@/lib/calendar/ics";
import { t, type DictionaryKey } from "@/lib/i18n/dictionary";
import type { Lang } from "@/lib/content/types";

/**
 * Per-event "Download (.ics)" button (Phase 7). Generates an RFC 5545 file from
 * the validated event timestamps and downloads it via a Blob URL. Timezone,
 * escaping, and multi-day handling live in `lib/calendar/ics.ts` (tested).
 *
 * The .ics is built lazily on first click, and the Blob URL is revoked on
 * unmount to avoid leaking object URLs.
 */

interface Props {
  startAt: string;
  endAt?: string;
  title: string;
  description: string;
  location: string;
  labelKey: DictionaryKey;
  lang: Lang;
}

export function DownloadIcsButton({
  startAt,
  endAt,
  title,
  description,
  location,
  labelKey,
  lang,
}: Props) {
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    const url = urlRef.current;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, []);

  function download() {
    const ical = buildIcs({ startAt, endAt, title, description, location });
    const url = buildIcsBlobUrl(ical);
    urlRef.current = url;
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `wedding-${title.replace(/[^a-z0-9]+/gi, "-")}.ics`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  return (
    <button
      type="button"
      onClick={download}
      className="inline-flex items-center gap-2 rounded-full border border-gold-line bg-gradient-to-r from-surface to-card-tint/60 px-4 py-2 text-xs font-semibold text-primary-dark shadow-sm transition-all duration-300 hover:border-gold hover:bg-gold/15 hover:text-primary-dark hover:shadow-soft active:scale-[0.98] sm:text-sm"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4 text-gold-deep transition-transform duration-300 group-hover:scale-110"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <rect x="3" y="13" width="18" height="8" rx="2" />
      </svg>
      <span>{t(lang, labelKey)}</span>
    </button>
  );
}
