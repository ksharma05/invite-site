/**
 * Pure ceremony→motif resolution (no React), so it can be unit-tested in the
 * project's node-env vitest suite and reused by the React wrapper.
 */

/** Stable-id → motif name. */
const BY_ID: Record<string, string> = {
  haldi: "haldi-motif",
  mehendi: "mehendi-motif",
  mehndi: "mehendi-motif",
  sangeet: "sangeet-motif",
  "wedding-ceremony": "ceremony-motif",
  pheras: "ceremony-motif",
  vidaai: "ceremony-motif",
  reception: "reception-motif",
};

/** Bilingual title → motif name, tried after the id. */
const TITLE_RE: Array<[RegExp, string]> = [
  [/mehendi|mehndi|मेहंदी|मेहन्दी/i, "mehendi-motif"],
  [/haldi|हल्दी|पीतांबर/i, "haldi-motif"],
  [/sangeet|संगीत/i, "sangeet-motif"],
  [/wedding|ceremony|विवाह|परिणय|फेरा|विदाई/i, "ceremony-motif"],
  [/reception|रिसेप्शन|समारोह/i, "reception-motif"],
];

/**
 * Decide the motif name for an event. Tries the stable `id` first, then the
 * bilingual titles, and finally returns the neutral `kalash-motif` fallback.
 */
export function resolveMotif(id: string, titleEn: string, titleHi: string): string {
  if (BY_ID[id]) return BY_ID[id];
  const title = `${titleEn} ${titleHi}`;
  for (const [re, motif] of TITLE_RE) {
    if (re.test(title)) return motif;
  }
  return "kalash-motif";
}
