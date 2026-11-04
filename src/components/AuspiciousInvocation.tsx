import type { Lang } from "@/lib/content/types";
import { Ornament } from "@/components/ornaments/Ornament";

export function AuspiciousInvocation({ lang }: { lang: Lang }) {
  const isHi = lang === "hi";

  return (
    <section
      aria-label={isHi ? "मांगलिक स्मरण एवं ईश्वर वंदना" : "Auspicious Invocations and Blessings"}
      className="gold-shimmer-sweep relative mx-auto my-4 w-full overflow-hidden rounded-2xl border border-gold-line bg-gradient-to-b from-[#fffbf5]/95 via-[#fcf6ee]/95 to-[#f8ede0]/90 p-6 sm:p-9 text-center shadow-ornate"
    >
      {/* Silk parchment grain */}
      <div
        className="pointer-events-none absolute inset-0 bg-repeat opacity-[0.18] mix-blend-multiply"
        style={{
          backgroundImage: "url('/ornaments/silk-parchment-tile.webp')",
          backgroundSize: "260px",
        }}
        aria-hidden="true"
      />

      {/* Embossed inset dual gold hairline */}
      <div
        className="pointer-events-none absolute inset-2.5 rounded-xl border border-gold-line sm:inset-4"
        aria-hidden="true"
      >
        <div className="absolute inset-1 rounded-lg border border-[rgba(201,162,39,0.18)]" />
      </div>

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
        <h2 className="font-devanagari text-lg font-bold tracking-[0.25em] text-primary-dark sm:text-xl">
          ॥ श्री गणेशाय नमः ॥
        </h2>

        {/* Sacred Vakratunda Mahakaya Mantra */}
        <div className="mt-3 max-w-md">
          <p className="font-devanagari text-base font-semibold leading-relaxed tracking-wider text-gold-deep sm:text-lg">
            वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।
            <br />
            निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥
          </p>
        </div>
      </div>

      {/* Ornate Divider with Kashi Lotus */}
      <div className="relative z-10 my-6 flex items-center justify-center gap-3" aria-hidden="true">
        <span className="h-px w-20 bg-gradient-to-r from-transparent via-gold-line to-gold" />
        <Ornament name="lotus-emblem" className="h-4 w-9 text-gold" />
        <span className="h-px w-20 bg-gradient-to-l from-transparent via-gold-line to-gold" />
      </div>

      {/* --- SHIV-PARVATI BLESSING --- */}
      <div className="relative z-10 flex flex-col items-center">
        <h3 className="font-devanagari text-base font-bold tracking-[0.22em] text-primary-dark sm:text-lg">
          ॥ श्री गौरी-शंकराय नमः ॥
        </h3>

        {/* Sacred Karpura Gauram Shloka */}
        <div className="mt-2.5 max-w-md">
          <p className="font-devanagari text-sm font-semibold leading-relaxed tracking-wider text-gold-deep sm:text-base">
            कर्पूरगौरं करुणावतारं संसारसारम् भुजगेन्द्रहारम्।
            <br />
            सदावसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि॥
          </p>
        </div>
      </div>
    </section>
  );
}
