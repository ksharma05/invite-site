import type { InvitationContent, Lang, PersonName, Side, WeddingEvent } from "@/lib/content/types";
import { t } from "@/lib/i18n/dictionary";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Countdown } from "@/components/Countdown";
import { OrnamentalDivider } from "@/components/OrnamentalDivider";
import { Reveal } from "@/components/Reveal";
import { DownloadIcsButton } from "@/components/DownloadIcsButton";
import { KashiScrollHero } from "@/components/KashiScrollHero";
import { AuspiciousInvocation } from "@/components/AuspiciousInvocation";
import { AccordionFAQ } from "@/components/AccordionFAQ";
import { AdaptiveSectionVideo } from "@/components/AdaptiveSectionVideo";
import { EventMotif } from "@/components/ornaments/EventMotif";
import { Ornament } from "@/components/ornaments/Ornament";
import { resolveCountdownTarget } from "@/lib/invitation/resolveCountdownTarget";

function formatName(name: PersonName, lang: Lang): string {
  const honorific = lang === "hi" ? name.honorificHi : name.honorificEn;
  const value = lang === "hi" ? name.hi : name.en;
  return honorific ? `${honorific} ${value}` : value;
}

function formatDateTime(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}

interface CalendarEntry {
  startAt: string;
  endAt?: string;
  title: string;
  details: string;
  location: string;
}

/** Builds a Google Calendar URL. Timestamps are already validated in UTC/offset form; the `Z` forms are used verbatim after stripping to ISO. */
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

export function InvitationView({
  content,
  side,
  lang,
}: {
  content: InvitationContent;
  side: Side;
  lang: Lang;
}) {
  const { family, events } = content;
  const [primaryName, secondaryName] =
    side === "bride" ? [family.brideName, family.groomName] : [family.groomName, family.brideName];
  const hostParents = side === "bride" ? family.brideParents : family.groomParents;
  const otherParents = side === "bride" ? family.groomParents : family.brideParents;
  const wording = family.invitationWording[side];

  const visibleEvents = events
    .filter((e) => e.active && (e.visibleTo === "both" || e.visibleTo === side))
    .sort((a, b) => a.order - b.order);

  const visibleFaqs = (content.faqs ?? [])
    .filter((f) => f.active)
    .sort((a, b) => a.order - b.order);

  // Countdown target: the wedding ceremony among the side-visible events
  const countdownTarget = resolveCountdownTarget(visibleEvents, side);
  const isHi = lang === "hi";

  return (
    <div className="min-h-screen bg-surface selection:bg-primary selection:text-white">
      {/* Sticky Navigation Header with Scroll Progress */}
      <NavigationHeader lang={lang} side={side} />

      {/*
        Hero: Scroll-controlled stop-motion journey of Kashi (Varanasi) Ghats
        Dawn on Ganga -> Evening Ganga Aarti -> Royal Mandap Portal with couple names.
      */}
      <KashiScrollHero
        lang={lang}
        primaryName={formatName(primaryName, lang)}
        secondaryName={formatName(secondaryName, lang)}
        blessing={family.blessing ? family.blessing[lang] : null}
      />

      {/* Main Content Area */}
      <main id="main-content" className="mx-auto flex max-w-2xl flex-col gap-14 px-5 py-12 sm:px-6">
        {/*
          1. SACRED AUSPICIOUS INVOCATIONS
          Lord Ganesha with Vakratunda Mahakaya Mantra & Lord Shiva + Mata Parvati blessing
        */}
        <AuspiciousInvocation lang={lang} />

        <OrnamentalDivider />

        {/* 2. HOST FAMILY INVITATION CARD */}
        <Reveal
          as="section"
          className="card-glass-ornate gold-shimmer-sweep relative overflow-hidden rounded-2xl p-6 text-center sm:p-10"
          aria-labelledby="host-heading"
        >
          {/* 4 Corner decorative flourishes */}
          <div className="pointer-events-none absolute -top-3 -left-3 h-14 w-14 opacity-40">
            <Ornament name="paisley-corner" className="h-full w-full text-gold" />
          </div>
          <div className="pointer-events-none absolute -top-3 -right-3 h-14 w-14 rotate-90 opacity-40">
            <Ornament name="paisley-corner" className="h-full w-full text-gold" />
          </div>
          <div className="pointer-events-none absolute -bottom-3 -left-3 h-14 w-14 -rotate-90 opacity-35">
            <Ornament name="paisley-corner" className="h-full w-full text-gold" />
          </div>
          <div className="pointer-events-none absolute -bottom-3 -right-3 h-14 w-14 rotate-180 opacity-35">
            <Ornament name="paisley-corner" className="h-full w-full text-gold" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <Ornament name="lotus-emblem" className="mb-4 h-6 w-14 text-gold-deep" />

            <h2 id="host-heading" className="sr-only">
              {t(lang, "hostedBy")}
            </h2>
            <p className="font-body text-lg leading-relaxed text-ink sm:text-xl" lang={lang}>
              {wording[lang]}
            </p>

            <div className="mt-7 w-full space-y-2 border-t border-gold-line/60 pt-6 text-sm text-ink-muted">
              <p className="text-base font-semibold text-ink">
                <span className="text-gold-deep">{t(lang, "hostedBy")}:</span>{" "}
                {hostParents.map((p) => formatName(p, lang)).join(" & ")}
              </p>
              <p className="text-sm">
                <span className="font-medium text-ink">{t(lang, "withOurFamilies")}:</span>{" "}
                {otherParents.map((p) => formatName(p, lang)).join(" & ")}
              </p>
            </div>
          </div>
        </Reveal>

        {/* 3. WEDDING COUNTDOWN */}
        <section
          className="card-glass-ornate relative overflow-hidden rounded-2xl p-6 text-center sm:p-9"
          aria-labelledby="countdown-heading"
        >
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="text-xs text-gold/60">✦</span>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-deep">
              {isHi ? "शुभ विवाह का आगमन" : "Celebrating Sacred Union"}
            </span>
            <span className="text-xs text-gold/60">✦</span>
          </div>

          <h2 id="countdown-heading" className="font-heading text-2xl font-medium text-primary-dark sm:text-3xl">
            {t(lang, "countdownHeading")}
          </h2>

          <div className="mt-6">
            {countdownTarget ? (
              <Countdown targetIso={countdownTarget.startAt} lang={lang} />
            ) : (
              <p className="text-ink-muted">{t(lang, "noEventsYet")}</p>
            )}
          </div>
        </section>

        {/* 4. CELEBRATION ITINERARY (VERTICAL TIMELINE) */}
        <Reveal as="section" aria-labelledby="events-heading">
          {/* Living Kashi Dawn Vignette Banner (Shot 2) */}
          <div className="relative mb-8 overflow-hidden rounded-2xl border border-gold-line shadow-ornate">
            <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-black">
              <AdaptiveSectionVideo
                src="/videos/kashi-dawn.mp4"
                poster="/videos/kashi-dawn-poster.jpg"
                className="h-full w-full"
                objectPosition="center 60%"
                parallax={true}
                parallaxSpeed={0.1}
                overlayGradient="bg-gradient-to-t from-black/80 via-black/25 to-black/30"
              >
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 px-4 text-center text-white">
                  <span className="font-devanagari text-[11px] font-medium uppercase tracking-[0.25em] text-gold-bright drop-shadow">
                    {isHi ? "काशी की पावन धरा" : "The Sacred Ghats of Kashi"}
                  </span>
                  <p className="mt-0.5 font-heading text-lg sm:text-2xl font-light text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                    {isHi ? "मांगलिक उत्सव यात्रा" : "Ceremonial Celebration"}
                  </p>
                </div>
              </AdaptiveSectionVideo>
            </div>
          </div>

          <div className="mb-8 flex items-center justify-center gap-3 text-center">
            <span className="h-px w-12 bg-gradient-to-r from-transparent via-gold-line to-gold" aria-hidden="true" />
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-deep">
                {isHi ? "मांगलिक उत्सव" : "Ceremonial Journey"}
              </span>
              <h2 id="events-heading" className="mt-0.5 font-heading text-2xl text-primary-dark sm:text-3xl">
                {t(lang, "eventsHeading")}
              </h2>
            </div>
            <span className="h-px w-12 bg-gradient-to-l from-transparent via-gold-line to-gold" aria-hidden="true" />
          </div>

          {visibleEvents.length === 0 ? (
            <p className="mt-4 text-center text-ink-muted">{t(lang, "noEventsYet")}</p>
          ) : (
            <div className="relative pl-6 sm:pl-10">
              {/* Continuous vertical timeline stem */}
              <div
                className="timeline-stem absolute top-6 bottom-6 left-2.5 sm:left-4 w-[2px] rounded-full"
                aria-hidden="true"
              />

              <ol className="flex flex-col gap-8">
                {visibleEvents.map((event) => (
                  <li key={event.id} className="relative">
                    {/* Timeline Node Badge with Ceremony Motif */}
                    <div
                      className="absolute top-6 -left-[27px] sm:-left-[37px] z-10 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 border-gold bg-[#fefbf7] shadow-[0_0_12px_rgba(201,162,39,0.35)] transition-transform duration-300 hover:scale-110"
                      aria-hidden="true"
                    >
                      <EventMotif
                        id={event.id}
                        titleEn={event.title.en}
                        titleHi={event.title.hi}
                        className="h-4 w-4 sm:h-5 sm:w-5 text-gold-deep"
                      />
                    </div>

                    {/* Event Card */}
                    <div className="group card-glass-ornate relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:border-gold hover:shadow-ornate sm:p-7">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-heading text-2xl font-medium text-ink transition-colors duration-200 group-hover:text-primary-dark sm:text-3xl" lang={lang}>
                              {event.title[lang]}
                            </h3>
                          </div>

                          {event.subtitle && (
                            <p className="mt-1 text-sm font-semibold tracking-wide text-gold-deep" lang={lang}>
                              {event.subtitle[lang]}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Date & Time with SVG Calendar Icon */}
                      <div className="mt-4.5 flex items-center gap-2.5 rounded-xl border border-gold-line/40 bg-surface-alt/30 px-3.5 py-2.5 text-sm font-semibold text-primary-dark">
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

                      {event.notes && (
                        <p
                          className="mt-3 border-l-2 border-gold-line pl-3 text-xs italic text-ink-muted"
                          lang={lang}
                        >
                          {event.notes[lang]}
                        </p>
                      )}

                      {/* Action Buttons */}
                      <div className="mt-5 flex flex-wrap gap-2.5 pt-2 border-t border-gold-line/30">
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
                          href={googleCalendarUrl({
                            startAt: event.startAt,
                            endAt: event.endAt,
                            title: event.title[lang],
                            details: event.venueName[lang],
                            location: event.venueAddress[lang],
                          })}
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
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                            <line x1="12" y1="14" x2="12" y2="18" />
                            <line x1="10" y1="16" x2="14" y2="16" />
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

                      {event.dressCode && (
                        <div className="mt-4 flex items-center gap-2 border-t border-border/50 pt-3 text-xs uppercase tracking-wider text-ink-muted">
                          <span className="font-semibold text-gold-deep">{t(lang, "dressCode")}:</span>
                          <span className="rounded-full border border-gold-line bg-accent/15 px-3 py-0.5 font-semibold text-accent shadow-sm">
                            {event.dressCode[lang]}
                          </span>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </Reveal>

        {/* 5. GOOD TO KNOW (INTERACTIVE ACCORDION FAQS) */}
        {visibleFaqs.length > 0 && (
          <Reveal as="section" aria-labelledby="faq-heading">
            <div className="mb-6 flex items-center justify-center gap-3 text-center">
              <span className="h-px w-10 bg-gold-line" aria-hidden="true" />
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-deep">
                  {isHi ? "महत्वपूर्ण जानकारी" : "Helpful Information"}
                </span>
                <h2 id="faq-heading" className="mt-0.5 text-center font-heading text-2xl text-primary-dark sm:text-3xl">
                  {t(lang, "faqHeading")}
                </h2>
              </div>
              <span className="h-px w-10 bg-gold-line" aria-hidden="true" />
            </div>

            <AccordionFAQ faqs={visibleFaqs} lang={lang} />
          </Reveal>
        )}

        {/* 6. SACRED MEMORIES / PHOTO CORNER */}
        <section
          aria-label={isHi ? "पावन स्मृतियाँ" : "Sacred Memories in Kashi"}
          className="card-glass-ornate gold-shimmer-sweep relative overflow-hidden rounded-2xl p-8 text-center sm:p-10"
        >
          {/* Subtle corner flourishes */}
          <div className="pointer-events-none absolute -top-3 -left-3 h-12 w-12 opacity-35">
            <Ornament name="paisley-corner" className="h-full w-full text-gold" />
          </div>
          <div className="pointer-events-none absolute -top-3 -right-3 h-12 w-12 rotate-90 opacity-35">
            <Ornament name="paisley-corner" className="h-full w-full text-gold" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <Ornament
              name="couple-silhouette"
              className="pulse-glint mx-auto h-12 w-28 text-gold drop-shadow-[0_2px_8px_rgba(201,162,39,0.35)]"
            />
            <h3 className="mt-4 font-heading text-2xl text-primary-dark sm:text-3xl">
              {isHi ? "पावन स्मृतियाँ • काशी" : "Sacred Memories in Kashi"}
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
              {isHi
                ? "विवाह के पावन क्षण एवं उत्सव की तस्वीरें शीघ्र ही यहाँ प्रकाशित की जाएंगी।"
                : "Cherished moments, candid memories, and wedding photographs will be shared here soon."}
            </p>
          </div>
        </section>

        <OrnamentalDivider />

        {/* 7. FOOTER */}
        <footer className="relative pb-12 text-center text-sm text-ink-muted">
          <h2 className="sr-only">{t(lang, "contactHeading")}</h2>

          {/* Crown Mandala Arch */}
          <Ornament
            name="mandala-arch"
            className="mx-auto mb-3 h-12 w-28 text-gold drop-shadow-[0_2px_8px_rgba(201,162,39,0.3)] opacity-85"
          />

          <p className="font-heading text-3xl font-semibold text-primary-dark sm:text-4xl">
            {isHi ? "संजुक्ता एवं खुशाल" : "Sanjukta & Khushal"}
          </p>

          {/* Floating river diyas row */}
          <div className="my-4 flex items-center justify-center gap-5" aria-hidden="true">
            <span className="float-diya text-lg drop-shadow-[0_2px_6px_rgba(201,162,39,0.5)]">🪔</span>
            <span className="h-px w-16 bg-gradient-to-r from-transparent via-gold-line to-gold" />
            <span className="float-diya text-xl drop-shadow-[0_2px_8px_rgba(201,162,39,0.6)]" style={{ animationDelay: "1.2s" }}>🪔</span>
            <span className="h-px w-16 bg-gradient-to-l from-transparent via-gold-line to-gold" />
            <span className="float-diya text-lg drop-shadow-[0_2px_6px_rgba(201,162,39,0.5)]" style={{ animationDelay: "2.4s" }}>🪔</span>
          </div>

          <p className="font-devanagari text-xs font-semibold tracking-[0.25em] uppercase text-gold-deep sm:text-sm">
            {isHi
              ? "काशी विश्वनाथ की असीम कृपा से परिणय सूत्र"
              : "Bound in Love with the Grace of Kashi Vishwanath"}
          </p>

          <p className="mt-4 text-xs tracking-wider text-ink-muted/80">
            {isHi ? "सादर उपस्थिति एवं शुभाशीष की प्रतीक्षा में" : "Looking forward to celebrating this sacred beginning with you"}
          </p>
        </footer>
      </main>
    </div>
  );
}

