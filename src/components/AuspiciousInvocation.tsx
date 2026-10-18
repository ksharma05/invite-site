import type { Lang } from "@/lib/content/types";
import { Ornament } from "@/components/ornaments/Ornament";

export function AuspiciousInvocation({ lang }: { lang: Lang }) {
  const isHi = lang === "hi";

  return (
    <section
      aria-label={isHi ? "मांगलिक स्मरण एवं ईश्वर वंदना" : "Auspicious Invocations and Blessings"}
      className="gold-shimmer-sweep relative mx-auto my-4 w-full max-w-xl overflow-hidden rounded-2xl border border-gold-line bg-gradient-to-b from-[#fffbf5]/95 via-[#fcf6ee]/95 to-[#f8ede0]/90 p-6 sm:p-9 text-center shadow-ornate"
    >
      {/* 4 Corner decorative flourishes */}
      <div className="pointer-events-none absolute -top-3 -left-3 h-14 w-14 rotate-0 opacity-45">
        <Ornament name="paisley-corner" className="h-full w-full text-gold" />
      </div>
      <div className="pointer-events-none absolute -top-3 -right-3 h-14 w-14 rotate-90 opacity-45">
        <Ornament name="paisley-corner" className="h-full w-full text-gold" />
      </div>
      <div className="pointer-events-none absolute -bottom-3 -left-3 h-14 w-14 -rotate-90 opacity-35">
        <Ornament name="paisley-corner" className="h-full w-full text-gold" />
      </div>
      <div className="pointer-events-none absolute -bottom-3 -right-3 h-14 w-14 rotate-180 opacity-35">
        <Ornament name="paisley-corner" className="h-full w-full text-gold" />
      </div>

      {/* Floating Gold Sparkle Specks */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <span className="speck-1 absolute top-12 left-10 h-1.5 w-1.5 rounded-full bg-gold-bright shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
        <span className="speck-2 absolute top-24 right-12 h-1 w-1 rounded-full bg-gold shadow-[0_0_6px_rgba(201,162,39,0.7)]" />
        <span className="speck-3 absolute bottom-20 left-16 h-1.5 w-1.5 rounded-full bg-gold-bright shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
        <span className="speck-4 absolute bottom-12 right-16 h-1 w-1 rounded-full bg-gold shadow-[0_0_6px_rgba(201,162,39,0.7)]" />
      </div>

      {/* --- LORD GANESHA INVOCATION --- */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-3 flex items-center justify-center">
          <span className="gold-glow-pulse absolute -inset-3 rounded-full bg-gradient-to-r from-gold/20 via-gold-bright/35 to-gold/20 blur-lg" aria-hidden="true" />
          <Ornament
            name="ganesh-motif"
            className="relative h-20 w-20 text-gold drop-shadow-[0_4px_12px_rgba(201,162,39,0.45)] transition-transform duration-500 hover:scale-105 sm:h-24 sm:w-24"
          />
        </div>

        <h2 className="font-devanagari text-lg font-bold tracking-[0.25em] text-primary-dark sm:text-xl">
          ॥ श्री गणेशाय नमः ॥
        </h2>

        {/* Sacred Vakratunda Mahakaya Mantra */}
        <div className="mt-3 max-w-md space-y-1.5">
          <p className="font-devanagari text-base font-semibold leading-relaxed tracking-wider text-gold-deep sm:text-lg">
            वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।
            <br />
            निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥
          </p>
          <p className="pt-1 text-xs italic tracking-wide text-ink-muted/90 sm:text-[13px]">
            {isHi
              ? "हे वक्रतुण्ड, विशालकाय, करोड़ों सूर्यों के समान तेजस्वी प्रभु! हमारे इस पावन कार्य को सर्वदा विघ्न-रहित पूर्ण करें।"
              : "O Lord Ganesha of curved trunk and immense radiance like ten million suns, bless this sacred union and remove all obstacles from our path."}
          </p>
        </div>
      </div>

      {/* Ornate Divider with Kashi Lotus */}
      <div className="relative z-10 my-6 flex items-center justify-center gap-3" aria-hidden="true">
        <span className="h-px w-20 bg-gradient-to-r from-transparent via-gold-line to-gold" />
        <Ornament name="lotus-emblem" className="h-4 w-9 text-gold" />
        <span className="h-px w-20 bg-gradient-to-l from-transparent via-gold-line to-gold" />
      </div>

      {/* --- SHIV-PARVATI BLESSING (KASHI VISHWANATH & ANNAPURNA) --- */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-2 flex items-center justify-center">
          <span className="gold-glow-pulse absolute -inset-2.5 rounded-full bg-gradient-to-r from-accent/20 via-gold-bright/30 to-accent/20 blur-md" aria-hidden="true" />
          <Ornament
            name="shiv-parvati-motif"
            className="relative h-16 w-16 text-gold drop-shadow-[0_4px_10px_rgba(201,162,39,0.4)] transition-transform duration-500 hover:scale-105 sm:h-20 sm:w-20"
          />
        </div>

        <h3 className="font-devanagari text-base font-bold tracking-[0.22em] text-primary-dark sm:text-lg">
          ॥ श्री गौरी-शंकराय नमः ॥
        </h3>

        <p className="mt-1 font-devanagari text-xs font-semibold tracking-[0.18em] text-accent sm:text-sm">
          {isHi
            ? "काशी विश्वनाथ एवं माँ अन्नपूर्णा की असीम कृपा"
            : "With the divine blessings of Kashi Vishwanath & Maa Annapurna"}
        </p>

        {/* Sacred Karpura Gauram Shloka */}
        <div className="mt-2.5 max-w-md space-y-1.5">
          <p className="font-devanagari text-sm font-semibold leading-relaxed tracking-wide text-gold-deep sm:text-base">
            कर्पूरगौरं करुणावतारं संसारसारं भुजगेन्द्रहारम्।
            <br />
            सदावसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि॥
          </p>
          <p className="pt-1 text-xs italic tracking-wide text-ink-muted/90 sm:text-[13px]">
            {isHi
              ? "कर्पूर के समान श्वेत, करुणा के अवतार, संसार के सार भगवान शिव को माता भवानी (पार्वती) सहित सादर नमन।"
              : "Salutations to Lord Shiva and Divine Mother Parvati, the eternal embodyment of compassion and grace, dwelling forever in our hearts."}
          </p>
        </div>
      </div>
    </section>
  );
}
