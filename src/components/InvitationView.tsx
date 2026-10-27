import type { InvitationContent, Lang, PersonName, Side, WeddingEvent } from "@/lib/content/types";
import { t } from "@/lib/i18n/dictionary";
import { Countdown } from "@/components/Countdown";
import { FloatingControls } from "@/components/FloatingControls";
import { OrnamentalDivider } from "@/components/OrnamentalDivider";
import { Reveal } from "@/components/Reveal";
import { ItineraryTimeline } from "@/components/ItineraryTimeline";
import { PhotoGallery } from "@/components/PhotoGallery";
import { KashiScrollHero } from "@/components/KashiScrollHero";
import { AuspiciousInvocation } from "@/components/AuspiciousInvocation";
import { AccordionFAQ } from "@/components/AccordionFAQ";
import { AdaptiveSectionVideo } from "@/components/AdaptiveSectionVideo";
import { Ornament } from "@/components/ornaments/Ornament";
import { resolveCountdownTarget } from "@/lib/invitation/resolveCountdownTarget";

function formatName(name: PersonName, lang: Lang): string {
  const honorific = lang === "hi" ? name.honorificHi : name.honorificEn;
  const rawValue = lang === "hi" ? name.hi : name.en;
  const value =
    lang === "hi" &&
    (rawValue === "सजुक्ता" || (name.en.toLowerCase() === "sanjukta" && rawValue === "सजुक्ता"))
      ? "संजुक्ता"
      : rawValue;
  return honorific ? `${honorific} ${value}` : value;
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
      {/*
        Fixed Viewport Controls: Royal Language Switcher (Eng | हिन्दी) & Music Toggle
        Permanently pinned to viewport across all sections for flawless, immediate control.
      */}
      <FloatingControls lang={lang} side={side} />

      {/*
        Hero: Cinematic Kashi Mandap video prologue with dual-mode card entrance.
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
          className="relative overflow-hidden rounded-2xl py-7 px-4 xs:px-6 text-center sm:py-10 sm:px-10 border border-gold-bright/40 shadow-[0_20px_50px_rgba(70,14,20,0.45)]"
          aria-labelledby="host-heading"
        >
          {/* Authentic Royal Crimson Banarasi Silk & Gold Brocade Background */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('/ornaments/banarasi-card-bg.webp')` }}
            aria-hidden="true"
          />

          {/* Subtle Warm Vignette Overlay & Soft Radial Backplate for crystal-clear mobile contrast */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/45 pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(25,3,6,0.45)_0%,_rgba(35,4,8,0.25)_55%,_transparent_100%)] pointer-events-none"
            aria-hidden="true"
          />

          {/* Physical "Embossed Card" Inset Dual Border */}
          <div
            className="pointer-events-none absolute inset-2.5 rounded-xl border border-gold-bright/35 sm:inset-4"
            aria-hidden="true"
          >
            {/* Subtle inner gold hairline frame */}
            <div className="absolute inset-1 rounded-lg border border-gold-bright/20" />
          </div>

          <div className="relative z-10 flex flex-col items-center w-full max-w-[250px] xs:max-w-[280px] sm:max-w-[390px] mx-auto">
            <Ornament
              name="lotus-emblem"
              className="mb-3 h-5 w-12 sm:mb-4 sm:h-6 sm:w-14 text-gold-bright drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
            />

            <h2 id="host-heading" className="sr-only">
              {t(lang, "hostedBy")}
            </h2>

            {/* Host Invitation Body */}
            <div className="flex flex-col items-center text-center w-full">
              {/* Host Parents */}
              <p className="text-xs sm:text-base font-semibold text-amber-50 drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] leading-snug tracking-wide text-balance">
                {hostParents.map((p) => formatName(p, lang)).join(isHi ? " एवं " : " and ")}
              </p>

              {/* Relationship & Invitation Phrase */}
              <p className="mt-1 text-[11px] sm:text-sm text-amber-100/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] leading-normal tracking-wide text-balance">
                {isHi
                  ? side === "bride"
                    ? "अपनी सुपुत्री"
                    : "अपने सुपुत्र"
                  : side === "bride"
                    ? "cordially invite you to the wedding of their daughter"
                    : "cordially invite you to the wedding of their son"}
              </p>

              {/* Primary Couple Name on its own individual line */}
              <p className="mt-2.5 sm:mt-3 font-heading text-2xl sm:text-4xl md:text-5xl font-semibold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-gold-bright to-amber-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.98)] leading-tight">
                {formatName(primaryName, lang)}
              </p>

              {/* Ornamental Connector */}
              <div
                className="my-1 sm:my-1.5 flex items-center justify-center gap-2 sm:gap-3"
                aria-hidden="true"
              >
                <span className="h-px w-6 sm:w-12 bg-gradient-to-r from-transparent via-gold-bright to-gold opacity-80" />
                <span className="font-heading text-xs sm:text-base font-normal italic text-amber-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  {isHi ? "संग" : "with"}
                </span>
                <span className="h-px w-6 sm:w-12 bg-gradient-to-l from-transparent via-gold-bright to-gold opacity-80" />
              </div>

              {/* Secondary Couple Name on its own individual line */}
              <p className="font-heading text-2xl sm:text-4xl md:text-5xl font-semibold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-gold-bright to-amber-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.98)] leading-tight">
                {formatName(secondaryName, lang)}
              </p>

              {/* Hindi ceremonial closing */}
              {isHi && (
                <p className="mt-1.5 text-[11px] sm:text-sm text-amber-100/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] leading-normal text-balance">
                  के पावन विवाह में आपको सादर आमंत्रित करते हैं।
                </p>
              )}

              {/* With our families */}
              <p className="mt-3.5 sm:mt-5 text-[11px] sm:text-sm text-amber-100/90 leading-relaxed text-balance">
                <span className="font-medium text-amber-200/90 drop-shadow">
                  {t(lang, "withOurFamilies")}:
                </span>{" "}
                <span className="font-semibold text-amber-50 drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
                  {otherParents.map((p) => formatName(p, lang)).join(isHi ? " एवं " : " and ")}
                </span>
              </p>
            </div>

            <div className="mt-5 sm:mt-7 w-full space-y-1.5 border-t border-gold-bright/35 pt-4 sm:pt-6 text-[11px] sm:text-sm text-amber-100/80">
              <p className="text-xs sm:text-base font-semibold text-amber-50 drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] text-balance">
                <span className="text-amber-200/90 font-medium">{t(lang, "hostedBy")}:</span>{" "}
                {hostParents.map((p) => formatName(p, lang)).join(" & ")}
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

          <h2
            id="countdown-heading"
            className="font-heading text-2xl font-medium text-primary-dark sm:text-3xl"
          >
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
                parallax={false}
                overlayGradient="bg-gradient-to-t from-black/80 via-black/25 to-black/30"
              >
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 px-4 text-center text-white">
                  <p className="mt-0.5 font-heading text-lg sm:text-2xl font-light text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                    {isHi ? "मांगलिक उत्सव यात्रा" : "Ceremonial Celebration"}
                  </p>
                </div>
              </AdaptiveSectionVideo>
            </div>
          </div>

          <div className="mb-8 flex items-center justify-center gap-3 text-center">
            <span
              className="h-px w-12 bg-gradient-to-r from-transparent via-gold-line to-gold"
              aria-hidden="true"
            />
            <h2 id="events-heading" className="font-heading text-2xl text-primary-dark sm:text-3xl">
              {t(lang, "eventsHeading")}
            </h2>
            <span
              className="h-px w-12 bg-gradient-to-l from-transparent via-gold-line to-gold"
              aria-hidden="true"
            />
          </div>

          {/* Interactive Sticky Focal Node Itinerary Timeline */}
          <ItineraryTimeline events={visibleEvents} lang={lang} />
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
                <h2
                  id="faq-heading"
                  className="mt-0.5 text-center font-heading text-2xl text-primary-dark sm:text-3xl"
                >
                  {t(lang, "faqHeading")}
                </h2>
              </div>
              <span className="h-px w-10 bg-gold-line" aria-hidden="true" />
            </div>

            <AccordionFAQ faqs={visibleFaqs} lang={lang} />
          </Reveal>
        )}

        {/* 6. SACRED MEMORIES / PHOTO GALLERY */}
        <Reveal as="section" aria-label={isHi ? "पावन स्मृतियाँ" : "Sacred Memories"}>
          <PhotoGallery items={content.gallery} lang={lang} />
        </Reveal>

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
            {formatName(primaryName, lang)} {isHi ? "एवं" : "&"} {formatName(secondaryName, lang)}
          </p>

          {/* Floating river diyas row */}
          <div className="my-4 flex items-center justify-center gap-5" aria-hidden="true">
            <span className="float-diya text-lg drop-shadow-[0_2px_6px_rgba(201,162,39,0.5)]">
              🪔
            </span>
            <span className="h-px w-16 bg-gradient-to-r from-transparent via-gold-line to-gold" />
            <span
              className="float-diya text-xl drop-shadow-[0_2px_8px_rgba(201,162,39,0.6)]"
              style={{ animationDelay: "1.2s" }}
            >
              🪔
            </span>
            <span className="h-px w-16 bg-gradient-to-l from-transparent via-gold-line to-gold" />
            <span
              className="float-diya text-lg drop-shadow-[0_2px_6px_rgba(201,162,39,0.5)]"
              style={{ animationDelay: "2.4s" }}
            >
              🪔
            </span>
          </div>

          <p className="font-devanagari text-xs font-semibold tracking-[0.25em] uppercase text-gold-deep sm:text-sm">
            {isHi
              ? "ईश्वर की असीम कृपा से परिणय सूत्र"
              : "Bound in Love with Divine Grace & Blessings"}
          </p>

          <p className="mt-4 text-xs tracking-wider text-ink-muted/80">
            {isHi
              ? "सादर उपस्थिति एवं शुभाशीष की प्रतीक्षा में"
              : "Looking forward to celebrating this sacred beginning with you"}
          </p>
        </footer>
      </main>
    </div>
  );
}
