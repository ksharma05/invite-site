"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Lang, WeddingEvent } from "@/lib/content/types";
import { t } from "@/lib/i18n/dictionary";
import { EventMotif } from "@/components/ornaments/EventMotif";
import { DownloadIcsButton } from "@/components/DownloadIcsButton";

interface CalendarEntry {
  startAt: string;
  endAt?: string;
  title: string;
  details: string;
  location: string;
}

/** Builds a Google Calendar URL. */
function googleCalendarUrl(entry: CalendarEntry): string {
  const toGCal = (iso: string) =>
    new Date(iso)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: entry.title,
    details: entry.details,
    location: entry.location,
    dates: entry.endAt
      ? `${toGCal(entry.startAt)}/${toGCal(entry.endAt)}`
      : `${toGCal(entry.startAt)}/${toGCal(entry.startAt)}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Formats ISO datetime for Indian Standard Time. */
function formatDateTime(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}

export interface ItineraryTimelineProps {
  events: WeddingEvent[];
  lang: Lang;
}

/**
 * ItineraryTimeline — Sticky Focal Node Wedding Timeline
 *
 * A single, stationary golden circular medallion sits pinned at eye level (40vh) along
 * the timeline rail. As the guest scrolls, the event cards glide past and the icon inside
 * the medallion dynamically transforms (cross-fades with a golden specular glint) to reflect
 * the active ceremony in focus.
 */
export function ItineraryTimeline({ events, lang }: ItineraryTimelineProps) {
  const [activeEventId, setActiveEventId] = useState<string>(events[0]?.id ?? "");
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const activeIdRef = useRef<string>(events[0]?.id ?? "");
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Current active event
  const activeEvent = events.find((e) => e.id === activeEventId) ?? events[0];

  const updateActiveCard = useCallback(() => {
    if (events.length === 0) return;

    // The sticky focal medallion sits at 40vh from the top of the viewport
    const focalY = window.innerHeight * 0.4;
    let closestId = events[0]?.id;
    let minDiff = Infinity;

    cardRefs.current.forEach((el, id) => {
      const rect = el.getBoundingClientRect();
      // Target the card's vertical center relative to viewport
      const cardCenter = rect.top + rect.height / 2;
      const diff = Math.abs(cardCenter - focalY);
      if (diff < minDiff) {
        minDiff = diff;
        closestId = id;
      }
    });

    if (closestId && closestId !== activeIdRef.current) {
      activeIdRef.current = closestId;
      setActiveEventId(closestId);
      setIsTransitioning(true);
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 260);
    }
  }, [events]);

  useEffect(() => {
    if (events.length === 0) return;

    let ticking = false;
    const onScrollOrResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveCard();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial check
    updateActiveCard();

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [events, updateActiveCard]);

  if (events.length === 0) {
    return <p className="mt-4 text-center text-ink-muted">{t(lang, "noEventsYet")}</p>;
  }

  return (
    <div className="relative flex items-start gap-3 sm:gap-6">
      {/* Sticky Focal Rail Column */}
      <div className="relative flex flex-col items-center shrink-0 w-10 sm:w-14 self-stretch pt-2">
        {/* Continuous vertical golden timeline stem */}
        <div
          className="timeline-stem absolute top-4 bottom-4 left-1/2 -translate-x-1/2 w-[2px] rounded-full"
          aria-hidden="true"
        />

        {/* The Stationary Medallion (pinned at 40vh) */}
        <div
          className="sticky top-[40vh] z-20 flex flex-col items-center justify-center transition-transform duration-300"
          aria-hidden="true"
        >
          {/* Ambient Glow Aura */}
          <span
            className="gold-glow-pulse pointer-events-none absolute -inset-2.5 rounded-full bg-gradient-to-r from-gold/25 via-gold-bright/40 to-gold/25 blur-md"
            aria-hidden="true"
          />

          {/* Medallion Circle */}
          <div
            className={`relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-gold-bright bg-[#fffdf9] dark:bg-[#1a120c] shadow-[0_0_20px_rgba(201,162,39,0.45)] transition-all duration-300 ${
              isTransitioning ? "scale-110 shadow-[0_0_28px_rgba(212,175,55,0.7)]" : "scale-100"
            }`}
          >
            {/* Specular Shimmer Sweep */}
            <span
              className="gold-shimmer-sweep pointer-events-none absolute inset-0 rounded-full opacity-40"
              aria-hidden="true"
            />

            {/* Dynamic Event Motif with Crossfade/Scale Transition */}
            <div
              className={`flex items-center justify-center transition-all duration-300 ease-out ${
                isTransitioning ? "opacity-0 scale-75 rotate-12" : "opacity-100 scale-100 rotate-0"
              }`}
            >
              {activeEvent?.title && (
                <EventMotif
                  id={activeEvent.id}
                  titleEn={activeEvent.title.en}
                  titleHi={activeEvent.title.hi}
                  className="h-5 w-5 sm:h-6 sm:w-6 text-primary-dark dark:text-gold-bright"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Event Cards Column */}
      <ol className="flex-1 flex flex-col gap-8 pb-4 min-w-0">
        {events.map((event) => {
          const isActive = event.id === activeEventId;

          const calEntry: CalendarEntry = {
            title: event.title[lang],
            details: event.venueName[lang],
            location: event.venueAddress[lang],
            startAt: event.startAt,
            endAt: event.endAt,
          };

          const gcalUrl = googleCalendarUrl(calEntry);

          return (
            <li
              key={event.id}
              data-event-id={event.id}
              ref={(el) => {
                if (el) cardRefs.current.set(event.id, el);
                else cardRefs.current.delete(event.id);
              }}
              className={`relative transition-all duration-500 ease-out ${
                isActive
                  ? "opacity-100 scale-100 translate-x-0"
                  : "opacity-75 sm:opacity-70 scale-[0.985]"
              }`}
            >
              {/* Event Card */}
              <div
                className={`group card-glass-ornate relative overflow-hidden rounded-2xl p-6 transition-all duration-300 sm:p-7 ${
                  isActive
                    ? "border-gold-bright shadow-[0_16px_40px_-14px_rgba(178,96,47,0.35),0_0_0_1px_rgba(201,162,39,0.45)]"
                    : "hover:border-gold hover:shadow-ornate"
                }`}
              >
                {/* Active Indicator Left Accent Notch */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 rounded-r-full bg-gradient-to-b from-gold via-gold-bright to-gold shadow-[0_0_8px_rgba(201,162,39,0.7)]"
                    aria-hidden="true"
                  />
                )}

                {/* Active Indicator Flare on Card Corner */}
                {isActive && (
                  <span
                    className="gold-shimmer-sweep pointer-events-none absolute inset-0 opacity-25"
                    aria-hidden="true"
                  />
                )}

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3
                        className={`font-heading text-2xl font-medium transition-colors duration-200 sm:text-3xl ${
                          isActive ? "text-primary-dark" : "text-ink group-hover:text-primary-dark"
                        }`}
                        lang={lang}
                      >
                        {event.title[lang]}
                      </h3>
                    </div>

                    {event.subtitle && (
                      <p
                        className="mt-1 text-sm font-semibold tracking-wide text-gold-deep"
                        lang={lang}
                      >
                        {event.subtitle[lang]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date & Time with SVG Calendar Icon */}
                <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-gold-line/40 bg-surface-alt/30 px-3.5 py-2.5 text-sm font-semibold text-primary-dark">
                  <svg
                    className="h-4 w-4 shrink-0 text-gold-deep"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{formatDateTime(event.startAt, lang)}</span>
                </div>

                {/* Venue with SVG Pin Icon */}
                <div className="mt-3.5 space-y-1 text-sm">
                  <div className="flex items-start gap-2.5">
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <p className="font-semibold text-ink" lang={lang}>
                      {event.venueName[lang]}
                    </p>
                  </div>
                  <p className="pl-6 text-ink-muted text-xs sm:text-sm" lang={lang}>
                    {event.venueAddress[lang]}
                  </p>
                </div>

                {/* Optional Dress Code */}
                {event.dressCode && (
                  <div className="mt-4 flex items-center gap-2 border-t border-border/50 pt-3 text-xs uppercase tracking-wider text-ink-muted">
                    <span className="font-semibold text-gold-deep">{t(lang, "dressCode")}:</span>
                    <span className="rounded-full border border-gold-line bg-accent/15 px-3 py-0.5 font-semibold text-accent shadow-sm">
                      {event.dressCode[lang]}
                    </span>
                  </div>
                )}

                {/* Optional Notes */}
                {event.notes && (
                  <p
                    className="mt-3 border-l-2 border-gold-line pl-3 text-xs italic text-ink-muted"
                    lang={lang}
                  >
                    {event.notes[lang]}
                  </p>
                )}

                {/* Action Buttons: View on Map, Add to Calendar, Download .ics */}
                <div className="mt-5 flex flex-wrap gap-2.5 pt-3 border-t border-gold-line/30">
                  {event.mapUrl && (
                    <a
                      href={event.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-gold-line bg-gradient-to-r from-surface to-card-tint/60 px-4 py-2 text-xs font-semibold text-primary-dark shadow-sm transition-all duration-300 hover:border-gold hover:bg-gold/15 hover:text-primary-dark hover:shadow-soft active:scale-[0.98] sm:text-sm"
                    >
                      <svg
                        className="h-4 w-4 text-gold-deep"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                      </svg>
                      <span>{t(lang, "viewOnMap")}</span>
                    </a>
                  )}

                  <a
                    href={gcalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-gold-line bg-gradient-to-r from-surface to-card-tint/60 px-4 py-2 text-xs font-semibold text-primary-dark shadow-sm transition-all duration-300 hover:border-gold hover:bg-gold/15 hover:text-primary-dark hover:shadow-soft active:scale-[0.98] sm:text-sm"
                    aria-label={`${t(lang, "addToCalendar")} - ${event.title[lang]}`}
                  >
                    <svg
                      className="h-4 w-4 text-gold-deep"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                      <line x1="12" y1="14" x2="12" y2="18" />
                      <line x1="9" y1="16" x2="15" y2="16" />
                    </svg>
                    <span>{t(lang, "addToCalendar")}</span>
                  </a>

                  <DownloadIcsButton
                    startAt={event.startAt}
                    endAt={event.endAt}
                    title={event.title[lang]}
                    description={event.venueName[lang]}
                    location={event.venueAddress[lang]}
                    labelKey="downloadIcs"
                    lang={lang}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
