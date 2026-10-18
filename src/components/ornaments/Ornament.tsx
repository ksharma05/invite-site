/**
 * Ornament renderer — renders one piece of the artwork catalogue inline.
 *
 * The `defs`/`body` come from static, hand-authored modules under `artwork/`,
 * never from user or sheet input, so the `dangerouslySetInnerHTML` here is not
 * an injection surface. The `<svg>` is `aria-hidden` (pure decoration) and
 * inherits `currentColor` so the theme owns the hue.
 *
 * ID namespacing: the artwork modules use fixed gradient/filter ids
 * (`goldFoil`, `goldSheen`, `softShadow`…). Because several ornaments can
 * appear on one page, each rendering instance is given a `useId()`-derived
 * prefix and every `id="…"` + matching `url(#…)` reference is rewritten to that
 * prefix — so browsers never clash on a duplicate global SVG id. The defs are
 * static authored strings, so this deterministic rewrite is safe.
 */

import { useId } from "react";
import { getOrnament } from "./artwork";
import type { Ornament as OrnamentArtwork } from "./artwork";

interface OrnamentProps {
  /** Catalogue name, e.g. "mandala-arch". */
  name?: string;
  /**
   * Artwork object rendered directly, bypassing the catalogue. Used by the
   * stop-motion hero, whose LAYERED variants (`*-layered`) must stay out of
   * `ornamentCatalogue` so `npm run ornaments:export` keeps emitting exactly the
   * print/motif artwork it always has. Same id namespacing either way.
   */
  art?: OrnamentArtwork | { name: string; viewBox: string; defs: string; body: string };
  className?: string;
}

export function Ornament({ name, art, className }: OrnamentProps) {
  const artwork = art ?? (name ? getOrnament(name) : undefined);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  let markup = "";
  if (artwork) {
    const inner = (artwork.defs ? `<defs>${artwork.defs}</defs>` : "") + artwork.body;
    // Namespace every id definition and every url(#…) reference.
    markup = uid
      ? inner
          .replace(/id="([^"]+)"/g, `id="${uid}-$1"`)
          .replace(/url\(#([^)]+)\)/g, `url(#${uid}-$1)`)
      : inner;
  }

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox={artwork?.viewBox}
      role="presentation"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
