"use client";

import type { Lang } from "@/lib/content/types";
import { Ornament } from "@/components/ornaments/Ornament";
import { AdaptiveSectionVideo } from "@/components/AdaptiveSectionVideo";

export function AuspiciousInvocation({ lang }: { lang: Lang }) {
  const isHi = lang === "hi";

  return (
    <section
      aria-label={isHi ? "मांगलिक स्मरण एवं ईश्वर वंदना" : "Auspicious Invocations and Blessings"}
      className="gold-shimmer-sweep relative mx-auto my-4 w-full max-w-xl overflow-hidden rounded-2xl border border-gold-line bg-gradient-to-b from-[#fffbf5]/95 via-[#fcf6ee]/95 to-[#f8ede0]/90 p-6 sm:p-9 text-center shadow-ornate"
    >
      {/* 4 Corner decorative flourishes with subtle drop shadow */}
      <div className="pointer-events-none absolute -top-3 -left-3 h-14 w-14 rotate-0 opacity-50 drop-shadow-[0_2px_6px_rgba(201,162,39,0.25)]">
        <Ornament name="paisley-corner" className="h-full w-full text-gold" />
      </div>
      <div className="pointer-events-none absolute -top-3 -right-3 h-14 w-14 rotate-90 opacity-50 drop-shadow-[0_2px_6px_rgba(201,162,39,0.25)]">
        <Ornament name="paisley-corner" className="h-full w-full text-gold" />
      </div>
      <div className="pointer-events-none absolute -bottom-3 -left-3 h-14 w-14 -rotate-90 opacity-40 drop-shadow-[0_2px_6px_rgba(201,162,39,0.2)]">
        <Ornament name="paisley-corner" className="h-full w-full text-gold" />
      </div>
      <div className="pointer-events-none absolute -bottom-3 -right-3 h-14 w-14 rotate-180 opacity-40 drop-shadow-[0_2px_6px_rgba(201,162,39,0.2)]">
        <Ornament name="paisley-corner" className="h-full w-full text-gold" />
      </div>

      {/* Floating Sacred Incense & Gold Sparkle Embers */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <span className="speck-1 absolute top-12 left-10 h-1.5 w-1.5 rounded-full bg-gold-bright shadow-[0_0_8px_rgba(212,175,55,0.85)]" />
        <span className="speck-2 absolute top-24 right-12 h-1 w-1 rounded-full bg-gold shadow-[0_0_6px_rgba(201,162,39,0.7)]" />
        <span className="speck-3 absolute top-1/2 left-8 h-1 w-1 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.7)]" />
        <span className="speck-4 absolute bottom-28 right-10 h-1.5 w-1.5 rounded-full bg-yellow-300 shadow-[0_0_8px_rgba(253,224,71,0.8)]" />
        <span className="speck-1 absolute bottom-20 left-16 h-1 w-1 rounded-full bg-gold-bright shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
        <span className="speck-2 absolute bottom-10 right-16 h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_6px_rgba(201,162,39,0.7)]" />
      </div>

      {/* =========================================================================
          1. LORD GANESHA INVOCATION (Multi-Layered Temple Jharokha Portal)
         ========================================================================= */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Multi-Layered Sacred Jharokha Portal */}
        <div className="relative mb-5 flex items-center justify-center">
          {/* Layer 1: Ambient Radiant Sanctum Aura */}
          <span
            className="gold-glow-pulse absolute -inset-4 rounded-full bg-gradient-to-r from-gold/25 via-gold-bright/40 to-gold/25 blur-xl"
            aria-hidden="true"
          />

          {/* Layer 2: Ornate Rotating Beaded Accent Ring */}
          <div
            className="pointer-events-none absolute -inset-2.5 rounded-full border border-gold/40 border-dashed animate-[spin_80s_linear_infinite]"
            aria-hidden="true"
          />

          {/* Layer 3: Double-Beveled Brass Temple Jharokha Frame with Cardinal Bindus */}
          <div className="relative rounded-full p-2 border-2 border-gold-bright/70 bg-gradient-to-b from-amber-100/40 via-gold/15 to-amber-900/30 shadow-[0_12px_32px_rgba(201,162,39,0.35),inset_0_2px_4px_rgba(255,255,255,0.7)]">
            {/* 4 Cardinal Golden Bindus */}
            <span
              className="absolute -top-1 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rotate-45 rounded-[1px] bg-gradient-to-br from-yellow-200 to-gold-deep border border-gold-bright shadow-[0_0_8px_#f5d77f]"
              aria-hidden="true"
            />
            <span
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rotate-45 rounded-[1px] bg-gradient-to-br from-yellow-200 to-gold-deep border border-gold-bright shadow-[0_0_8px_#f5d77f]"
              aria-hidden="true"
            />
            <span
              className="absolute top-1/2 -left-1 -translate-y-1/2 h-2 w-2 rounded-full bg-gold-bright shadow-[0_0_6px_#f5d77f]"
              aria-hidden="true"
            />
            <span
              className="absolute top-1/2 -right-1 -translate-y-1/2 h-2 w-2 rounded-full bg-gold-bright shadow-[0_0_6px_#f5d77f]"
              aria-hidden="true"
            />

            {/* Layer 4: Deep Inset Viewport with Parallax Video Window */}
            <div className="relative h-44 w-44 sm:h-52 sm:w-52 overflow-hidden rounded-full border border-gold-bright/80 bg-black shadow-[inset_0_4px_16px_rgba(0,0,0,0.85)]">
              <AdaptiveSectionVideo
                src="/videos/ganesha-invocation.mp4"
                poster="/videos/ganesha-invocation-poster.jpg"
                className="h-full w-full"
                objectPosition="center center"
                parallax={true}
                parallaxSpeed={0.12}
                overlayGradient="bg-gradient-to-t from-black/45 via-transparent to-black/25"
              />
            </div>
          </div>
        </div>

        {/* Sacred Invocation Title */}
        <h2 className="font-devanagari text-xl font-bold tracking-[0.25em] text-primary-dark sm:text-2xl drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
          ॥ श्री गणेशाय नमः ॥
        </h2>

        {/* Sacred Vakratunda Mahakaya Mantra in Illuminated Inset Box */}
        <div className="mt-3.5 w-full max-w-lg rounded-xl border border-gold-line/50 bg-gradient-to-b from-white/70 via-[#fdf9f3]/60 to-gold/10 p-4 sm:p-5 backdrop-blur-[2px] shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_6px_20px_-8px_rgba(178,96,47,0.18)]">
          <p className="font-devanagari text-base font-semibold leading-relaxed tracking-wider text-gold-deep sm:text-lg">
            वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।
            <br />
            निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥
          </p>

          <div className="my-2.5 flex items-center justify-center gap-2" aria-hidden="true">
            <span className="h-px w-12 bg-gradient-to-r from-transparent via-gold-line to-gold-line/80" />
            <span className="text-xs text-gold">✦</span>
            <span className="h-px w-12 bg-gradient-to-l from-transparent via-gold-line to-gold-line/80" />
          </div>

          <p className="text-xs italic leading-relaxed tracking-wide text-ink-muted/95 sm:text-sm">
            {isHi
              ? "हे वक्रतुण्ड, विशालकाय, करोड़ों सूर्यों के समान तेजस्वी प्रभु! हमारे इस पावन कार्य को सर्वदा विघ्न-रहित पूर्ण करें।"
              : "O Lord Ganesha of curved trunk and immense radiance like ten million suns, bless this sacred union and remove all obstacles from our path."}
          </p>
        </div>
      </div>

      {/* Ornate Lotus Fleur-de-lis Divider */}
      <div className="relative z-10 my-7 flex items-center justify-center gap-3" aria-hidden="true">
        <span className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent via-gold-line to-gold" />
        <Ornament
          name="lotus-emblem"
          className="h-5 w-11 text-gold drop-shadow-[0_2px_5px_rgba(201,162,39,0.4)]"
        />
        <span className="h-px w-16 sm:w-24 bg-gradient-to-l from-transparent via-gold-line to-gold" />
      </div>

      {/* =========================================================================
          2. SHIV-PARVATI BLESSING (Kashi Vishwanath & Maa Annapurna)
         ========================================================================= */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Concentric Divine Mandala Backdrop */}
        <div className="relative mb-3 flex items-center justify-center">
          {/* Sacred Green-Gold Vishwanath Aura */}
          <span
            className="gold-glow-pulse absolute -inset-3.5 rounded-full bg-gradient-to-r from-accent/20 via-gold-bright/35 to-accent/20 blur-lg"
            aria-hidden="true"
          />

          {/* Concentric Dashed Sacred Orbit */}
          <div
            className="pointer-events-none absolute -inset-2 rounded-full border border-gold/45 border-dashed animate-[spin_90s_linear_infinite]"
            aria-hidden="true"
          />

          {/* Elevated Trishul-Damru Sacred Motif */}
          <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full border border-gold-bright/50 bg-gradient-to-b from-white/80 to-amber-100/40 p-2 shadow-[0_4px_16px_rgba(201,162,39,0.3),inset_0_1px_2px_rgba(255,255,255,0.8)]">
            <Ornament
              name="shiv-parvati-motif"
              className="h-14 w-14 text-gold drop-shadow-[0_4px_10px_rgba(201,162,39,0.45)] transition-transform duration-500 hover:scale-105 sm:h-16 sm:w-16"
            />
          </div>
        </div>

        {/* Sacred Heading */}
        <h3 className="font-devanagari text-lg font-bold tracking-[0.22em] text-primary-dark sm:text-xl drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
          ॥ श्री गौरी-शंकराय नमः ॥
        </h3>

        <p className="mt-1 font-devanagari text-xs font-semibold tracking-[0.18em] text-accent sm:text-sm">
          {isHi
            ? "काशी विश्वनाथ एवं माँ अन्नपूर्णा की असीम कृपा"
            : "With the divine blessings of Kashi Vishwanath & Maa Annapurna"}
        </p>

        {/* Sacred Karpura Gauram Shloka in Illuminated Inset Box */}
        <div className="mt-3.5 w-full max-w-lg rounded-xl border border-gold-line/50 bg-gradient-to-b from-white/70 via-[#fdf9f3]/60 to-gold/10 p-4 sm:p-5 backdrop-blur-[2px] shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_6px_20px_-8px_rgba(178,96,47,0.18)]">
          <p className="font-devanagari text-sm font-semibold leading-relaxed tracking-wider text-gold-deep sm:text-base">
            कर्पूरगौरं करुणावतारं संसारसारम् भुजगेन्द्रहारम्।
            <br />
            सदावसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि॥
          </p>

          <div className="my-2.5 flex items-center justify-center gap-2" aria-hidden="true">
            <span className="h-px w-12 bg-gradient-to-r from-transparent via-gold-line to-gold-line/80" />
            <span className="text-xs text-gold">✦</span>
            <span className="h-px w-12 bg-gradient-to-l from-transparent via-gold-line to-gold-line/80" />
          </div>

          <p className="text-xs italic leading-relaxed tracking-wide text-ink-muted/95 sm:text-sm">
            {isHi
              ? "कर्पूर के समान उज्ज्वल, करुणा के सागर, संसार के सार भगवान शिव और माता पार्वती हमारे जीवन में सदा सुख-शांति प्रदान करें।"
              : "We bow to Lord Shiva, white as camphor and the essence of compassion, and Goddess Bhavani, residing forever in the lotus of our hearts."}
          </p>
        </div>
      </div>
    </section>
  );
}
