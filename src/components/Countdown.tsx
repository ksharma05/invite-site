"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/lib/content/types";
import { t, type DictionaryKey } from "@/lib/i18n/dictionary";

function getRemaining(targetIso: string) {
  const diff = new Date(targetIso).getTime() - Date.now();
  if (diff <= 0) return null;
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

const UNIT_LABELS: DictionaryKey[] = [
  "countdownDays",
  "countdownHours",
  "countdownMinutes",
  "countdownSeconds",
];

/**
 * Server renders a deterministic placeholder (all zeros) so there is no hydration
 * mismatch from `Date.now()`; the real countdown populates after mount and ticks once
 * per second. Digit widths are stable so ticking never reflows the page.
 */
export function Countdown({ targetIso, lang }: { targetIso: string; lang: Lang }) {
  const [remaining, setRemaining] = useState<ReturnType<typeof getRemaining>>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setRemaining(getRemaining(targetIso));
    setHydrated(true);
    const id = setInterval(() => setRemaining(getRemaining(targetIso)), 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  if (hydrated && remaining) {
    if (
      remaining.days === 0 &&
      remaining.hours === 0 &&
      remaining.minutes === 0 &&
      remaining.seconds === 0
    ) {
      return (
        <p className="font-heading text-2xl text-primary-dark" role="status">
          {t(lang, "countdownArrived")}
        </p>
      );
    }

    const units: Array<[number, DictionaryKey]> = [
      [remaining.days, "countdownDays"],
      [remaining.hours, "countdownHours"],
      [remaining.minutes, "countdownMinutes"],
      [remaining.seconds, "countdownSeconds"],
    ];

    return (
      <div
        className="flex flex-wrap items-center justify-center gap-2 sm:gap-4"
        role="timer"
        aria-live="off"
      >
        {units.map(([value, label], idx) => (
          <div key={label} className="flex items-center gap-2 sm:gap-4">
            <div className="countdown-tile flex min-w-[4.2rem] flex-col items-center justify-center rounded-2xl px-3 py-2.5 sm:min-w-[5.2rem] sm:px-4 sm:py-3.5">
              <span className="min-w-[2ch] text-center font-heading text-3xl font-semibold text-primary-dark tabular-nums drop-shadow-[0_1px_2px_rgba(138,70,33,0.15)] sm:text-4xl">
                {String(value).padStart(2, "0")}
              </span>
              <span className="mt-0.5 text-[10px] font-semibold tracking-widest uppercase text-gold-deep sm:text-xs">
                {t(lang, label)}
              </span>
            </div>
            {idx < units.length - 1 && (
              <span
                className="pulse-glint hidden font-heading text-xl font-bold text-gold-bright sm:inline-block"
                aria-hidden="true"
              >
                :
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4" role="timer">
      {UNIT_LABELS.map((label, idx) => (
        <div key={label} className="flex items-center gap-2 sm:gap-4">
          <div className="countdown-tile flex min-w-[4.2rem] flex-col items-center justify-center rounded-2xl px-3 py-2.5 sm:min-w-[5.2rem] sm:px-4 sm:py-3.5">
            <span className="min-w-[2ch] text-center font-heading text-3xl font-semibold text-primary-dark tabular-nums sm:text-4xl">
              00
            </span>
            <span className="mt-0.5 text-[10px] font-semibold tracking-widest uppercase text-gold-deep sm:text-xs">
              {t(lang, label)}
            </span>
          </div>
          {idx < UNIT_LABELS.length - 1 && (
            <span
              className="hidden font-heading text-xl font-bold text-gold-bright/60 sm:inline-block"
              aria-hidden="true"
            >
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
