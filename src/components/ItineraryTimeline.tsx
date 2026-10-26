"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Lang, WeddingEvent } from "@/lib/content/types";
import { t } from "@/lib/i18n/dictionary";
import { EventMotif } from "@/components/ornaments/EventMotif";
import { DownloadIcsButton } from "@/components/DownloadIcsButton";
import { PushpaVrishti } from "@/components/PushpaVrishti";

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
          const isHaldi = event.id === "haldi";
          const isMehendi = event.id === "mehendi";
          const isSangeet = event.id === "sangeet";
          const isWedding = event.id === "wedding-ceremony";
          const isDarkThemed = isMehendi || isSangeet || isWedding;

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
                className={`group relative overflow-hidden rounded-2xl transition-all duration-300 p-5 sm:p-7 ${
                  isHaldi
                    ? "border border-amber-500/40 shadow-[0_16px_40px_-10px_rgba(202,138,4,0.35)]"
                    : isMehendi
                      ? "border border-emerald-500/40 shadow-[0_16px_40px_-10px_rgba(4,120,87,0.35)]"
                      : isSangeet
                        ? "border border-purple-500/40 shadow-[0_16px_40px_-10px_rgba(88,28,135,0.4)]"
                        : isWedding
                          ? "border-2 border-amber-500/60 wedding-card-glow shadow-[0_20px_50px_-10px_rgba(180,83,9,0.5),0_0_0_1px_rgba(212,175,55,0.5)]"
                          : "card-glass-ornate " +
                            (isActive
                              ? "border-gold-bright shadow-[0_16px_40px_-14px_rgba(178,96,47,0.35),0_0_0_1px_rgba(201,162,39,0.45)]"
                              : "hover:border-gold hover:shadow-ornate")
                }`}
              >
                {/* Authentic Peetambari Silk & Marigold Toran Background for Haldi */}
                {isHaldi && (
                  <>
                    <div
                      className="absolute inset-0 bg-cover bg-top bg-no-repeat"
                      style={{ backgroundImage: `url('/ornaments/haldi-card-bg.webp')` }}
                      aria-hidden="true"
                    />
                    {/* Subtle Warm Contrast Vignette */}
                    <div
                      className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 pointer-events-none"
                      aria-hidden="true"
                    />
                    {/* Physical Inset Dual Hairline Border */}
                    <div
                      className="pointer-events-none absolute inset-2.5 rounded-xl border border-amber-600/30 sm:inset-3.5"
                      aria-hidden="true"
                    >
                      <div className="absolute inset-1 rounded-lg border border-amber-600/20" />
                    </div>
                  </>
                )}

                {/* Royal Emerald Silk & Mughal Arch Background for Mehendi */}
                {isMehendi && (
                  <>
                    <div
                      className="absolute inset-0 bg-cover bg-top bg-no-repeat"
                      style={{ backgroundImage: `url('/ornaments/mehendi-card-bg.webp')` }}
                      aria-hidden="true"
                    />
                    {/* Subtle Contrast Vignette */}
                    <div
                      className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35 pointer-events-none"
                      aria-hidden="true"
                    />
                    {/* Physical Inset Dual Hairline Gold Border */}
                    <div
                      className="pointer-events-none absolute inset-1.5 rounded-xl border border-gold-bright/30 sm:inset-2.5"
                      aria-hidden="true"
                    >
                      <div className="absolute inset-0.5 rounded-lg border border-gold-bright/15" />
                    </div>
                  </>
                )}

                {/* Royal Jamuni Silk & Musical Mughal Arch Background for Sangeet */}
                {isSangeet && (
                  <>
                    <div
                      className="absolute inset-0 bg-cover bg-top bg-no-repeat"
                      style={{ backgroundImage: `url('/ornaments/sangeet-card-bg.webp')` }}
                      aria-hidden="true"
                    />
                    {/* Subtle Contrast Vignette */}
                    <div
                      className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35 pointer-events-none"
                      aria-hidden="true"
                    />
                    {/* Physical Inset Dual Hairline Gold Border */}
                    <div
                      className="pointer-events-none absolute inset-1.5 rounded-xl border border-gold-bright/30 sm:inset-2.5"
                      aria-hidden="true"
                    >
                      <div className="absolute inset-0.5 rounded-lg border border-gold-bright/15" />
                    </div>
                  </>
                )}

                {/* Royal Kumkum Crimson Silk & 3D Zardozi Elephants Background for Wedding */}
                {isWedding && (
                  <>
                    <div
                      className="absolute inset-0 bg-cover bg-top bg-no-repeat"
                      style={{ backgroundImage: `url('/ornaments/wedding-card-bg.webp')` }}
                      aria-hidden="true"
                    />
                    {/* Subtle Contrast Vignette */}
                    <div
                      className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35 pointer-events-none"
                      aria-hidden="true"
                    />
                    {/* Physical Inset Dual Hairline Gold Border */}
                    <div
                      className="pointer-events-none absolute inset-1.5 rounded-xl border border-gold-bright/35 sm:inset-2.5"
                      aria-hidden="true"
                    >
                      <div className="absolute inset-0.5 rounded-lg border border-gold-bright/15" />
                    </div>
                  </>
                )}

                {/* Active Indicator Left Accent Notch */}
                {isActive && (
                  <span
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 rounded-r-full shadow-[0_0_8px_rgba(201,162,39,0.7)] ${
                      isHaldi
                        ? "bg-gradient-to-b from-amber-400 via-amber-500 to-amber-300"
                        : isMehendi
                          ? "bg-gradient-to-b from-emerald-400 via-gold-bright to-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                          : isSangeet
                            ? "bg-gradient-to-b from-purple-400 via-gold-bright to-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]"
                            : isWedding
                              ? "bg-gradient-to-b from-amber-300 via-gold-bright to-amber-400 shadow-[0_0_12px_rgba(212,175,55,0.95)]"
                              : "bg-gradient-to-b from-gold via-gold-bright to-gold"
                    }`}
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

                {/* Card Content with top padding for custom themed cards */}
                <div
                  className={`relative z-10 flex flex-col ${
                    isHaldi
                      ? "pt-20 sm:pt-32 px-2 sm:px-6 text-center items-center"
                      : isWedding
                        ? "pt-12 sm:pt-20 px-4 sm:px-8 pb-44 sm:pb-6 text-center items-center"
                        : isDarkThemed
                          ? "pt-16 sm:pt-24 px-4 sm:px-8 text-center items-center"
                          : ""
                  }`}
                >
                  <div
                    className={`flex flex-col ${
                      isHaldi || isDarkThemed ? "items-center text-center" : "items-start"
                    }`}
                  >
                    {isWedding && (
                      <p
                        className="mb-1 text-xs font-bold tracking-[0.22em] text-transparent gold-text-sheen drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                        lang={lang}
                      >
                        {lang === "hi" ? "॥ शुभ विवाह ॥" : "॥ Shubh Vivah ॥"}
                      </p>
                    )}

                    <h3
                      className={`font-heading text-2xl font-semibold transition-colors duration-200 sm:text-3xl md:text-4xl ${
                        isHaldi
                          ? "text-[#340f04] drop-shadow-[0_1px_3px_rgba(255,255,255,0.95)] tracking-wide font-bold"
                          : isWedding
                            ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 via-gold-bright to-amber-100 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] tracking-wider font-extrabold"
                            : isDarkThemed
                              ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-gold-bright to-amber-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] tracking-wider font-bold"
                              : isActive
                                ? "text-primary-dark"
                                : "text-ink group-hover:text-primary-dark"
                      }`}
                      lang={lang}
                    >
                      {event.title[lang]}
                    </h3>

                    {event.subtitle && (
                      <p
                        className={`mt-1 text-sm font-semibold tracking-wide ${
                          isHaldi
                            ? "text-[#78350f] drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]"
                            : isDarkThemed
                              ? "text-amber-200/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                              : "text-gold-deep"
                        }`}
                        lang={lang}
                      >
                        {event.subtitle[lang]}
                      </p>
                    )}
                  </div>

                  {/* Date & Time with SVG Calendar Icon */}
                  <div
                    className={`mt-4 flex items-center justify-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold ${
                      isHaldi
                        ? "border border-amber-600/40 bg-white/90 backdrop-blur-sm text-[#3b1206] shadow-sm max-w-sm w-full mx-auto"
                        : isDarkThemed
                          ? "border border-gold-bright/40 bg-black/45 backdrop-blur-md text-amber-50 shadow-sm max-w-[275px] sm:max-w-sm w-full mx-auto"
                          : "border border-gold-line/40 bg-surface-alt/30 text-primary-dark"
                    }`}
                  >
                    <svg
                      className={`h-4 w-4 shrink-0 ${
                        isHaldi
                          ? "text-[#b45309]"
                          : isDarkThemed
                            ? "text-gold-bright"
                            : "text-gold-deep"
                      }`}
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
                  <div
                    className={`mt-3.5 space-y-1 text-sm ${
                      isHaldi
                        ? "max-w-sm w-full mx-auto text-center"
                        : isDarkThemed
                          ? "max-w-[265px] sm:max-w-sm w-full mx-auto text-center"
                          : ""
                    }`}
                  >
                    <div
                      className={`flex items-start gap-2.5 ${
                        isHaldi || isDarkThemed ? "justify-center" : ""
                      }`}
                    >
                      <svg
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          isHaldi
                            ? "text-[#b45309]"
                            : isDarkThemed
                              ? "text-gold-bright"
                              : "text-gold-deep"
                        }`}
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
                      <p
                        className={`font-semibold ${
                          isHaldi
                            ? "text-[#240c03] drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] text-sm sm:text-base"
                            : isDarkThemed
                              ? "text-amber-50 drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] text-sm sm:text-base"
                              : "text-ink"
                        }`}
                        lang={lang}
                      >
                        {event.venueName[lang]}
                      </p>
                    </div>
                    <p
                      className={`text-xs sm:text-sm ${
                        isHaldi
                          ? "text-[#4a1c06] font-medium drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]"
                          : isDarkThemed
                            ? "text-amber-100/90 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                            : "pl-6 text-ink-muted"
                      }`}
                      lang={lang}
                    >
                      {event.venueAddress[lang]}
                    </p>
                  </div>

                  {/* Optional Dress Code */}
                  {event.dressCode && (
                    <div
                      className={`mt-4 flex items-center justify-center gap-2 border-t pt-3 text-xs uppercase tracking-wider ${
                        isHaldi
                          ? "border-amber-600/30 text-[#57270d]"
                          : isDarkThemed
                            ? "border-gold-bright/30 text-amber-100"
                            : "border-border/50 text-ink-muted"
                      }`}
                    >
                      <span
                        className={`font-semibold ${
                          isHaldi
                            ? "text-[#92400e]"
                            : isDarkThemed
                              ? "text-gold-bright"
                              : "text-gold-deep"
                        }`}
                      >
                        {t(lang, "dressCode")}:
                      </span>
                      <span
                        className={`rounded-full border px-3 py-0.5 font-semibold shadow-sm ${
                          isHaldi
                            ? "border-amber-600/40 bg-amber-100/90 text-[#451a03]"
                            : isDarkThemed
                              ? "border-gold-bright/40 bg-black/45 text-amber-100"
                              : "border-gold-line bg-accent/15 text-accent"
                        }`}
                      >
                        {event.dressCode[lang]}
                      </span>
                    </div>
                  )}

                  {/* Optional Notes */}
                  {event.notes && (
                    <p
                      className={`mt-3 border-l-2 pl-3 text-xs italic ${
                        isHaldi
                          ? "border-amber-600/60 text-[#57270d] max-w-sm mx-auto"
                          : isDarkThemed
                            ? "border-gold-bright/60 text-amber-200/90 max-w-sm mx-auto"
                            : "border-gold-line text-ink-muted"
                      }`}
                      lang={lang}
                    >
                      {event.notes[lang]}
                    </p>
                  )}

                  {/* Optional Pushpa Vrishti Interactive Blessing Ceremony for Wedding */}
                  {isWedding && (
                    <div className="mt-4 mb-1 flex justify-center">
                      <PushpaVrishti lang={lang} />
                    </div>
                  )}

                  {/* Action Buttons: View on Map, Add to Calendar, Download .ics */}
                  <div
                    className={`mt-4 flex flex-wrap gap-2.5 pt-3 border-t ${
                      isHaldi
                        ? "border-amber-600/30 justify-center"
                        : isDarkThemed
                          ? "border-gold-bright/30 justify-center"
                          : "border-gold-line/30"
                    }`}
                  >
                    {event.mapUrl && (
                      <a
                        href={event.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold shadow-sm transition-all duration-300 active:scale-[0.98] sm:text-sm ${
                          isHaldi
                            ? "border-amber-600/40 bg-white/90 text-[#3b1206] hover:bg-white hover:border-amber-600 shadow-[0_2px_8px_rgba(180,83,9,0.15)]"
                            : isMehendi
                              ? "border-gold-bright/50 bg-black/55 backdrop-blur-sm text-amber-100 hover:bg-emerald-950/80 hover:border-gold-bright hover:text-white shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
                              : isSangeet
                                ? "border-gold-bright/50 bg-black/55 backdrop-blur-sm text-amber-100 hover:bg-purple-950/80 hover:border-gold-bright hover:text-white shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
                                : isWedding
                                  ? "border-gold-bright/50 bg-black/55 backdrop-blur-sm text-amber-100 hover:bg-red-950/80 hover:border-gold-bright hover:text-white shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
                                  : "border-gold-line bg-gradient-to-r from-surface to-card-tint/60 text-primary-dark hover:border-gold hover:bg-gold/15 hover:text-primary-dark hover:shadow-soft"
                        }`}
                      >
                        <svg
                          className={`h-4 w-4 ${
                            isHaldi
                              ? "text-[#b45309]"
                              : isDarkThemed
                                ? "text-gold-bright"
                                : "text-gold-deep"
                          }`}
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
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold shadow-sm transition-all duration-300 active:scale-[0.98] sm:text-sm ${
                        isHaldi
                          ? "border-amber-600/40 bg-white/90 text-[#3b1206] hover:bg-white hover:border-amber-600 shadow-[0_2px_8px_rgba(180,83,9,0.15)]"
                          : isMehendi
                            ? "border-gold-bright/50 bg-black/55 backdrop-blur-sm text-amber-100 hover:bg-emerald-950/80 hover:border-gold-bright hover:text-white shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
                            : isSangeet
                              ? "border-gold-bright/50 bg-black/55 backdrop-blur-sm text-amber-100 hover:bg-purple-950/80 hover:border-gold-bright hover:text-white shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
                              : isWedding
                                ? "border-gold-bright/50 bg-black/55 backdrop-blur-sm text-amber-100 hover:bg-red-950/80 hover:border-gold-bright hover:text-white shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
                                : "border-gold-line bg-gradient-to-r from-surface to-card-tint/60 text-primary-dark hover:border-gold hover:bg-gold/15 hover:text-primary-dark hover:shadow-soft"
                      }`}
                      aria-label={`${t(lang, "addToCalendar")} - ${event.title[lang]}`}
                    >
                      <svg
                        className={`h-4 w-4 ${
                          isHaldi
                            ? "text-[#b45309]"
                            : isDarkThemed
                              ? "text-gold-bright"
                              : "text-gold-deep"
                        }`}
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
                      className={
                        isHaldi
                          ? "inline-flex items-center gap-2 rounded-full border border-amber-600/40 bg-white/90 text-[#3b1206] hover:bg-white hover:border-amber-600 shadow-[0_2px_8px_rgba(180,83,9,0.15)] px-4 py-2 text-xs font-semibold shadow-sm transition-all duration-300 active:scale-[0.98] sm:text-sm"
                          : isMehendi
                            ? "inline-flex items-center gap-2 rounded-full border border-gold-bright/50 bg-black/55 backdrop-blur-sm text-amber-100 hover:bg-emerald-950/80 hover:border-gold-bright hover:text-white shadow-[0_2px_12px_rgba(0,0,0,0.4)] px-4 py-2 text-xs font-semibold shadow-sm transition-all duration-300 active:scale-[0.98] sm:text-sm"
                            : isSangeet
                              ? "inline-flex items-center gap-2 rounded-full border border-gold-bright/50 bg-black/55 backdrop-blur-sm text-amber-100 hover:bg-purple-950/80 hover:border-gold-bright hover:text-white shadow-[0_2px_12px_rgba(0,0,0,0.4)] px-4 py-2 text-xs font-semibold shadow-sm transition-all duration-300 active:scale-[0.98] sm:text-sm"
                              : isWedding
                                ? "inline-flex items-center gap-2 rounded-full border border-gold-bright/50 bg-black/55 backdrop-blur-sm text-amber-100 hover:bg-red-950/80 hover:border-gold-bright hover:text-white shadow-[0_2px_12px_rgba(0,0,0,0.4)] px-4 py-2 text-xs font-semibold shadow-sm transition-all duration-300 active:scale-[0.98] sm:text-sm"
                                : undefined
                      }
                      iconClassName={
                        isHaldi
                          ? "h-4 w-4 text-[#b45309] transition-transform duration-300 group-hover:scale-110"
                          : isDarkThemed
                            ? "h-4 w-4 text-gold-bright transition-transform duration-300 group-hover:scale-110"
                            : undefined
                      }
                    />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
