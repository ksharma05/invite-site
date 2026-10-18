import type { Lang } from "@/lib/content/types";
import { Ornament } from "@/components/ornaments/Ornament";

export function AuspiciousInvocation({ lang }: { lang: Lang }) {
  const isHi = lang === "hi";

  return (
    <section
      aria-label={isHi ? "मांगलिक स्मरण एवं ईश्वर वंदना" : "Auspicious Invocations and Blessings"}
      className="relative mx-auto my-4 w-full max-w-xl overflow-hidden rounded-2xl border border-gold-line bg-gradient-to-b from-[#fffbf5]/90 via-[#fcf6ee]/95 to-[#f8ede0]/90 p-6 sm:p-8 text-center shadow-ornate"
    >
      {/* Corner decorative flourishes */}
      <div className="pointer-events-none absolute -top-3 -left-3 h-14 w-14 rotate-0 opacity-40">
        <Ornament name="paisley-corner" className="h-full w-full text-gold" />
      </div>
      <div className="pointer-events-none absolute -top-3 -right-3 h-14 w-14 rotate-90 opacity-40">
        <Ornament name="paisley-corner" className="h-full w-full text-gold" />
      </div>

      {/* --- LORD GANESHA INVOCATION --- */}
      <div className="flex flex-col items-center">
        <div className="relative mb-3 flex items-center justify-center">
          <span className="absolute -inset-2 rounded-full bg-gold/15 blur-md" aria-hidden="true" />
          <Ornament
            name="ganesh-motif"
            className="relative h-20 w-20 text-gold drop-shadow-[0_2px_8px_rgba(201,162,39,0.35)] sm:h-24 sm:w-24"
          />
        </div>

        <h2 className="font-devanagari text-lg font-bold tracking-[0.25em] text-primary-dark sm:text-xl">
          ॥ श्री गणेशाय नमः ॥
        </h2>

        {/* Sacred Vakratunda Mahakaya Mantra */}
        <div className="mt-3 max-w-md space-y-1">
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
      <div className="my-6 flex items-center justify-center gap-3" aria-hidden="true">
        <span className="h-px w-16 bg-gradient-to-r from-transparent via-gold-line to-gold" />
        <Ornament name="lotus-emblem" className="h-4 w-8 text-gold" />
        <span className="h-px w-16 bg-gradient-to-l from-transparent via-gold-line to-gold" />
      </div>

      {/* --- SHIV-PARVATI BLESSING (KASHI VISHWANATH & ANNAPURNA) --- */}
      <div className="flex flex-col items-center">
        <div className="relative mb-2 flex items-center justify-center">
          <Ornament
            name="shiv-parvati-motif"
            className="h-16 w-16 text-gold drop-shadow-[0_2px_6px_rgba(201,162,39,0.3)] sm:h-20 sm:w-20"
          />
        </div>

        <h3 className="font-devanagari text-base font-bold tracking-[0.22em] text-primary-dark sm:text-lg">
          ॥ श्री गौरी-शंकराय नमः ॥
        </h3>

        <p className="mt-1 font-devanagari text-xs font-medium tracking-[0.18em] text-accent sm:text-sm">
          {isHi
            ? "काशी विश्वनाथ एवं माँ अन्नपूर्णा की असीम कृपा"
            : "With the divine blessings of Kashi Vishwanath & Maa Annapurna"}
        </p>

        {/* Sacred Karpura Gauram Shloka */}
        <div className="mt-2.5 max-w-md space-y-1">
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
