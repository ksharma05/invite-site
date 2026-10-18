import type { InvitationContent, Lang, PersonName, Side, WeddingEvent } from "@/lib/content/types";
import { t } from "@/lib/i18n/dictionary";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Countdown } from "@/components/Countdown";
import { OrnamentalDivider } from "@/components/OrnamentalDivider";
import { Reveal } from "@/components/Reveal";
import { DownloadIcsButton } from "@/components/DownloadIcsButton";
import { KashiScrollHero } from "@/components/KashiScrollHero";
import { AuspiciousInvocation } from "@/components/AuspiciousInvocation";
import { EventMotif } from "@/components/ornaments/EventMotif";
import { Ornament } from "@/components/ornaments/Ornament";
import { resolveCountdownTarget } from "@/lib/invitation/resolveCountdownTarget";
import Link from "next/link";
import { buildHref } from "@/lib/invitation/resolveLang";

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
      {/* Floating Glass Navigation Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gold-line/30 bg-[#241510]/80 px-4 py-3 backdrop-blur-md sm:px-8">
        <Link
          href={buildHref({ lang })}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gold-bright transition hover:text-white sm:text-sm"
        >
          <span aria-hidden="true">←</span>
          <span>{t(lang, "switchSide")}</span>
        </Link>
        <LanguageSwitcher lang={lang} side={side} />
      </header>

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
      <main id="main-content" className="mx-auto flex max-w-2xl flex-col gap-12 px-5 py-12 sm:px-6">
        {/*
          1. SACRED AUSPICIOUS INVOCATIONS
          Lord Ganesha with Vakratunda Mahakaya Mantra & Lord Shiva + Mata Parvati blessing
        */}
        <AuspiciousInvocation lang={lang} />

        <OrnamentalDivider />

        {/* 2. HOST FAMILY INVITATION CARD */}
        <Reveal
          as="section"
          className="relative overflow-hidden rounded-2xl border border-gold-line bg-gradient-to-b from-card-tint to-surface-alt/70 p-6 text-center shadow-ornate sm:p-9"
          aria-labelledby="host-heading"
        >
          <div className="pointer-events-none absolute -bottom-4 -right-4 h-16 w-16 opacity-35">
            <Ornament name="paisley-corner" className="h-full w-full text-gold" />
          </div>

          <Ornament name="lotus-emblem" className="mx-auto mb-4 h-6 w-12 text-gold-deep" />

          <h2 id="host-heading" className="sr-only">
            {t(lang, "hostedBy")}
          </h2>
          <p className="font-body text-lg leading-relaxed text-ink sm:text-xl" lang={lang}>
            {wording[lang]}
          </p>

          <div className="mt-6 space-y-2 border-t border-gold-line/60 pt-5 text-sm text-ink-muted">
            <p className="text-base font-medium text-ink">
              <span className="text-gold-deep">{t(lang, "hostedBy")}:</span>{" "}
              {hostParents.map((p) => formatName(p, lang)).join(" & ")}
            </p>
            <p className="text-sm">
              <span className="font-medium text-ink">{t(lang, "withOurFamilies")}:</span>{" "}
              {otherParents.map((p) => formatName(p, lang)).join(" & ")}
            </p>
          </div>
        </Reveal>

        {/* 3. WEDDING COUNTDOWN */}
        <section
          className="rounded-2xl border border-border/80 bg-surface/80 p-6 text-center shadow-soft sm:p-8"
          aria-labelledby="countdown-heading"
        >
          <h2 id="countdown-heading" className="font-heading text-xl text-primary-dark sm:text-2xl">
            {t(lang, "countdownHeading")}
          </h2>
          <div className="mt-5">
            {countdownTarget ? (
              <Countdown targetIso={countdownTarget.startAt} lang={lang} />
            ) : (
              <p className="text-ink-muted">{t(lang, "noEventsYet")}</p>
            )}
          </div>
        </section>

        {/* 4. CELEBRATION ITINERARY (EVENTS) */}
        <Reveal as="section" aria-labelledby="events-heading">
          <div className="mb-6 flex items-center justify-center gap-3 text-center">
            <span className="h-px w-10 bg-gold-line" aria-hidden="true" />
            <h2 id="events-heading" className="font-heading text-2xl text-primary-dark sm:text-3xl">
              {t(lang, "eventsHeading")}
            </h2>
            <span className="h-px w-10 bg-gold-line" aria-hidden="true" />
          </div>

          {visibleEvents.length === 0 ? (
            <p className="mt-4 text-center text-ink-muted">{t(lang, "noEventsYet")}</p>
          ) : (
            <ol className="flex flex-col gap-6">
              {visibleEvents.map((event) => (
                <li
                  key={event.id}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface via-[#fdf9f4] to-card-tint/40 p-6 shadow-soft transition-all duration-300 hover:border-gold hover:shadow-ornate sm:p-7"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold-deep shadow-sm">
                          <EventMotif
                            id={event.id}
                            titleEn={event.title.en}
                            titleHi={event.title.hi}
                            className="h-6 w-6"
                          />
                        </span>
                        <h3 className="font-heading text-2xl font-medium text-ink" lang={lang}>
                          {event.title[lang]}
                        </h3>
                      </div>

                      {event.subtitle && (
                        <p className="mt-1 pl-13 text-sm font-medium text-gold-deep" lang={lang}>
                          {event.subtitle[lang]}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-surface-alt/40 px-3 py-2 text-sm font-semibold text-primary-dark">
                    <span>🗓️</span>
                    <span>{formatDateTime(event.startAt, lang)}</span>
                  </div>

                  <div className="mt-3 space-y-1 text-sm">
                    <p className="font-medium text-ink" lang={lang}>
                      📍 {event.venueName[lang]}
                    </p>
                    <p className="pl-6 text-ink-muted" lang={lang}>
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

                  <div className="mt-5 flex flex-wrap gap-2.5 pt-2">
                    {event.mapUrl && (
                      <a
                        href={event.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-surface px-4 py-1.5 text-xs font-medium text-primary-dark shadow-sm transition hover:bg-primary hover:text-white"
                      >
                        <span>🧭</span>
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
                      className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-surface px-4 py-1.5 text-xs font-medium text-primary-dark shadow-sm transition hover:bg-primary hover:text-white"
                    >
                      <span>📅</span>
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
                      <span className="rounded-full bg-accent/15 px-2.5 py-0.5 font-medium text-accent">
                        {event.dressCode[lang]}
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
        </Reveal>

        {/* 5. GOOD TO KNOW (FAQS) */}
        {visibleFaqs.length > 0 && (
          <Reveal as="section" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-center font-heading text-2xl text-primary-dark">
              {t(lang, "faqHeading")}
            </h2>
            <dl className="mt-6 flex flex-col gap-4">
              {visibleFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-border bg-surface p-5 shadow-soft transition hover:border-gold-line sm:p-6"
                >
                  <dt
                    className="flex items-start gap-2 font-heading text-lg font-medium text-ink"
                    lang={lang}
                  >
                    <span className="text-gold-deep">✦</span>
                    <span>{faq.question[lang]}</span>
                  </dt>
                  <dd className="mt-2 pl-5 text-sm leading-relaxed text-ink-muted" lang={lang}>
                    {faq.answer[lang]}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}

        {/* 6. SACRED MEMORIES / PHOTO CORNER */}
        <section
          aria-label={isHi ? "पावन स्मृतियाँ" : "Sacred Memories in Kashi"}
          className="relative overflow-hidden rounded-2xl border border-dashed border-gold-line bg-gradient-to-b from-card-tint/50 to-surface-alt/30 p-8 text-center shadow-soft"
        >
          <Ornament name="couple-silhouette" className="mx-auto h-12 w-24 text-gold opacity-80" />
          <h3 className="mt-3 font-heading text-xl text-primary-dark">
            {isHi ? "पावन स्मृतियाँ • काशी" : "Sacred Memories in Kashi"}
          </h3>
          <p className="mt-1 text-sm text-ink-muted">
            {isHi
              ? "विवाह के पावन क्षण एवं उत्सव की तस्वीरें शीघ्र ही यहाँ प्रकाशित की जाएंगी।"
              : "Cherished moments and wedding gallery photographs will be shared here soon."}
          </p>
        </section>

        <OrnamentalDivider />

        {/* 7. FOOTER */}
        <footer className="pb-8 text-center text-sm text-ink-muted">
          <h2 className="sr-only">{t(lang, "contactHeading")}</h2>
          <Ornament
            name="lotus-emblem"
            className="mx-auto mb-2 h-5 w-10 text-gold-deep opacity-70"
          />
          <p className="font-heading text-2xl text-primary-dark">
            {isHi ? "संजुक्ता एवं खुशाल" : "Sanjukta & Khushal"}
          </p>
          <p className="mt-2 text-xs tracking-widest uppercase text-gold-deep">
            {isHi
              ? "काशी विश्वनाथ की कृपा से परिणय सूत्र"
              : "Bound in Love with the Grace of Kashi Vishwanath"}
          </p>
          <p className="mt-4 text-[11px] text-ink-muted/70">
            {isHi ? "सादर उपस्थिति की प्रतीक्षा में" : "Looking forward to celebrating with you"}
          </p>
        </footer>
      </main>
    </div>
  );
}
