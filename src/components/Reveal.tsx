"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * Progressive-enhancement reveal-on-scroll (Phase 7).
 *
 * Safe by construction:
 *  - The element is FULLY VISIBLE by default. A "pending" (pre-animation) start
 *    state is only applied once we know JS + IntersectionObserver are available
 *    (and reduced motion is handled in CSS). If JS, the observer, or reduced
 *    motion intervenes, content simply stays readable.
 *  - Reduced motion (`prefers-reduced-motion: reduce`) is honored entirely in
 *    CSS: the animation is scoped to `no-preference`, so reduced-motion users
 *    get instant, fully readable content with nothing to animate away.
 *  - No scroll hijacking, parallax, or continuous loops — one-shot fade/translate
 *    as an element scrolls into view coordinates, then the observer disconnects.
 *  - This is the Lenis-free, dependency-free baseline the phase asks for; a
 *    heavier library is only justified if it measurably improves the experience.
 */

export function Reveal({
  children,
  className = "",
  as: Tag = "div",
  "aria-labelledby": ariaLabelledby,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "li" | "span";
  "aria-labelledby"?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [seen, setSeen] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      // No observer → show immediately; never gate content on JS.
      return;
    }
    // Observer exists → we *may* animate (CSS still respects reduced motion).
    setAnimate(true);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setSeen(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const TagName = Tag as "div";

  return (
    <TagName
      ref={ref as React.Ref<HTMLDivElement>}
      className={`reveal ${animate ? "reveal--animate" : ""} ${
        seen ? "reveal--seen" : ""
      } ${className}`.trim()}
      aria-labelledby={ariaLabelledby}
      data-reveal-animate={animate ? "true" : "false"}
      data-reveal-seen={seen ? "true" : "false"}
    >
      {children}
    </TagName>
  );
}
