"use client";

import { useState, useEffect, useCallback } from "react";
import type { GalleryItem, Lang } from "@/lib/content/types";
import { Ornament } from "@/components/ornaments/Ornament";

export interface PhotoGalleryProps {
  items?: GalleryItem[];
  lang: Lang;
}

export function PhotoGallery({ items, lang }: PhotoGalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const isHi = lang === "hi";

  const visibleItems = (items ?? []).filter((item) => item.active);

  const handlePrev = useCallback(() => {
    if (selectedIdx === null || visibleItems.length === 0) return;
    setSelectedIdx((prev) => (prev! > 0 ? prev! - 1 : visibleItems.length - 1));
  }, [selectedIdx, visibleItems.length]);

  const handleNext = useCallback(() => {
    if (selectedIdx === null || visibleItems.length === 0) return;
    setSelectedIdx((prev) => (prev! < visibleItems.length - 1 ? prev! + 1 : 0));
  }, [selectedIdx, visibleItems.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedIdx === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIdx(null);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedIdx, handlePrev, handleNext]);

  // Empty state placeholder
  if (visibleItems.length === 0) {
    return (
      <section
        aria-label={isHi ? "पावन स्मृतियाँ" : "Sacred Memories"}
        className="card-glass-ornate gold-shimmer-sweep relative overflow-hidden rounded-2xl p-8 text-center sm:p-10"
      >
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
            {isHi ? "पावन स्मृतियाँ" : "Sacred Memories"}
          </h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
            {isHi
              ? "विवाह के पावन क्षण एवं उत्सव की तस्वीरें शीघ्र ही यहाँ प्रकाशित की जाएंगी।"
              : "Cherished moments, candid memories, and wedding photographs will be shared here soon."}
          </p>
        </div>
      </section>
    );
  }

  const activePhoto = selectedIdx !== null ? visibleItems[selectedIdx] : null;

  return (
    <section
      aria-label={isHi ? "पावन स्मृतियाँ" : "Sacred Memories"}
      className="relative flex flex-col items-center"
    >
      {/* Section Header */}
      <div className="mb-8 flex items-center justify-center gap-3 text-center">
        <span
          className="h-px w-12 bg-gradient-to-r from-transparent via-gold-line to-gold"
          aria-hidden="true"
        />
        <h2 className="font-heading text-2xl text-primary-dark sm:text-3xl">
          {isHi ? "पावन स्मृतियाँ" : "Sacred Memories"}
        </h2>
        <span
          className="h-px w-12 bg-gradient-to-l from-transparent via-gold-line to-gold"
          aria-hidden="true"
        />
      </div>

      {/* Photo Gallery Grid */}
      <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
        {visibleItems.map((item, idx) => {
          const hasFailed = failedImages.has(item.id);
          const caption = item.caption ? item.caption[lang] : undefined;

          return (
            <div
              key={item.id}
              onClick={() => setSelectedIdx(idx)}
              className="group card-glass-ornate relative flex flex-col overflow-hidden rounded-2xl p-3 sm:p-3.5 transition-all duration-300 hover:border-gold-bright hover:shadow-ornate hover:scale-[1.015] cursor-pointer"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface-alt/40 border border-gold-line/40">
                {!hasFailed ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.imageUrl}
                    alt={caption || `Wedding memory ${idx + 1}`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={() => {
                      setFailedImages((prev) => new Set(prev).add(item.id));
                    }}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center text-ink-muted">
                    <Ornament name="lotus-emblem" className="h-8 w-12 text-gold/60" />
                    <span className="mt-2 text-xs font-devanagari">
                      {isHi ? "पावन क्षण" : "Sacred Moment"}
                    </span>
                  </div>
                )}

                {/* Ambient Shimmer */}
                <span
                  className="gold-shimmer-sweep pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-300"
                  aria-hidden="true"
                />
              </div>

              {caption && (
                <div className="mt-3 px-1 text-center">
                  <p className="font-heading text-sm text-ink group-hover:text-primary-dark transition-colors duration-200">
                    {caption}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.caption ? activePhoto.caption[lang] : "Enlarged photo"}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
          onClick={() => setSelectedIdx(null)}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setSelectedIdx(null)}
            className="absolute top-5 right-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-black/60 text-white shadow-lg backdrop-blur-md transition-all hover:bg-gold/20 hover:scale-110"
            aria-label="Close photo view"
          >
            ✕
          </button>

          {/* Previous Arrow */}
          {visibleItems.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-black/60 text-white shadow-lg backdrop-blur-md transition-all hover:bg-gold/20 hover:scale-110 sm:left-6"
              aria-label="Previous photo"
            >
              ‹
            </button>
          )}

          {/* Next Arrow */}
          {visibleItems.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-black/60 text-white shadow-lg backdrop-blur-md transition-all hover:bg-gold/20 hover:scale-110 sm:right-6"
              aria-label="Next photo"
            >
              ›
            </button>
          )}

          {/* Active Photo Container */}
          <div
            className="relative flex max-h-[85vh] max-w-4xl flex-col items-center overflow-hidden rounded-2xl border border-gold/40 bg-[#160f0a] p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activePhoto.imageUrl}
              alt={activePhoto.caption ? activePhoto.caption[lang] : "Enlarged photo"}
              referrerPolicy="no-referrer"
              className="max-h-[75vh] w-auto rounded-xl object-contain shadow-md"
            />

            {activePhoto.caption && (
              <p className="mt-3 px-4 pb-2 text-center font-heading text-base font-light text-gold-bright drop-shadow">
                {activePhoto.caption[lang]}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
