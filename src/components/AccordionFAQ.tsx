"use client";

import { useState } from "react";
import type { FaqItem, Lang } from "@/lib/content/types";

interface AccordionFAQProps {
  faqs: FaqItem[];
  lang: Lang;
}

export function AccordionFAQ({ faqs, lang }: AccordionFAQProps) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-col gap-3.5">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div
            key={faq.id}
            className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
              isOpen
                ? "border-gold bg-gradient-to-br from-[#fffdf9] via-[#fcf8f0] to-[#f8ede0]/60 shadow-ornate"
                : "border-border/80 bg-surface/85 hover:border-gold-line hover:bg-surface-alt/25"
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(faq.id)}
              className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
              aria-expanded={isOpen}
            >
              <span className="flex items-center gap-3 font-heading text-lg font-medium text-ink sm:text-xl">
                <span
                  className={`text-sm transition-transform duration-300 ${isOpen ? "text-gold rotate-45" : "text-gold-deep"}`}
                >
                  ✦
                </span>
                <span lang={lang}>{faq.question[lang]}</span>
              </span>
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold-line transition-all duration-300 ${
                  isOpen ? "bg-gold text-white rotate-180" : "bg-surface-alt/40 text-gold-deep"
                }`}
                aria-hidden="true"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div
                  className="border-t border-gold-line/40 px-5 pt-3.5 pb-5 text-sm leading-relaxed text-ink-muted sm:px-6 sm:pb-6"
                  lang={lang}
                >
                  {faq.answer[lang]}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
