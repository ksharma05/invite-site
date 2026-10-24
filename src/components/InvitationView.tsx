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
  const value = lang === "hi" ? name.hi : name.en;
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
              {/* <p className="text-sm">
                <span className="font-medium text-ink">{t(lang, "withOurFamilies")}:</span>{" "}
                {otherParents.map((p) => formatName(p, lang)).join(" & ")}
              </p> */}
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
                parallax={true}
                parallaxSpeed={0.1}
                overlayGradient="bg-gradient-to-t from-black/80 via-black/25 to-black/30"
              >
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 px-4 text-center text-white">
                  {/* <span className="font-devanagari text-[11px] font-medium uppercase tracking-[0.25em] text-gold-bright drop-shadow">
                    {isHi ? "काशी की पावन धरा" : "The Sacred Ghats of Kashi"}
                  </span> */}
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
              ? "काशी विश्वनाथ की असीम कृपा से परिणय सूत्र"
              : "Bound in Love with the Grace of Kashi Vishwanath"}
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
