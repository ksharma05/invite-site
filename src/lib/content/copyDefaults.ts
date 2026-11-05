import type { Bilingual, InvitationContent, Lang, SiteCopy } from "@/lib/content/types";

/**
 * Fallback values for every ceremonial-copy slot (src/lib/content/schema.ts#siteCopySchema).
 * These are the strings the app rendered before the "Copy" sheet tab existed — kept here so a
 * missing tab/row never breaks a page, it just shows what it always showed.
 */
export const DEFAULT_SITE_COPY: Required<SiteCopy> = {
  invocationGaneshaHeader: { en: "॥ श्री गणेशाय नमः ॥", hi: "॥ श्री गणेशाय नमः ॥" },
  invocationGaneshaBody: {
    en: "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥",
    hi: "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥",
  },
  invocationShivParvatiHeader: { en: "॥ श्री गौरी-शंकराय नमः ॥", hi: "॥ श्री गौरी-शंकराय नमः ॥" },
  invocationShivParvatiBody: {
    en: "कर्पूरगौरं करुणावतारं संसारसारम् भुजगेन्द्रहारम्।\nसदावसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि॥",
    hi: "कर्पूरगौरं करुणावतारं संसारसारम् भुजगेन्द्रहारम्।\nसदावसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि॥",
  },
  heroEyebrow: { en: "Wedding Invitation", hi: "॥ शुभ विवाह निमंत्रण ॥" },
  weddingCardEyebrow: { en: "॥ Shubh Vivah ॥", hi: "॥ शुभ विवाह ॥" },
  galleryHeading: { en: "Sacred Memories", hi: "पावन स्मृतियाँ" },
  galleryBadge: { en: "Sacred Moment", hi: "पावन क्षण" },
};

type SiteCopyKey = keyof SiteCopy;

/** Resolves a ceremonial-copy string: sheet value if present, else the hardcoded default. */
export function resolveCopy(
  content: Pick<InvitationContent, "siteCopy">,
  key: SiteCopyKey,
  lang: Lang
): string {
  const entry: Bilingual | undefined = content.siteCopy?.[key] ?? DEFAULT_SITE_COPY[key];
  return entry[lang];
}
