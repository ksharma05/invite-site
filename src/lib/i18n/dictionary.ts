import type { Lang } from "@/lib/content/types";

/**
 * Interface strings only (buttons, labels, nav, a11y, empty/validation states).
 * Invitation wording and event content live in src/data (fixtures for now, the
 * spreadsheet from Phase 5 onward) — never hard-coded here.
 */
export const dictionary = {
  en: {
    chooseSideTitle: "Who's invitation is this?",
    chooseSideSubtitle: "Please choose how you were invited so we can show the right details.",
    brideSideCta: "Bride's side",
    groomSideCta: "Groom's side",
    switchSide: "Choose a different side",
    languageLabel: "Language",
    languageEnglish: "English",
    languageHindi: "हिन्दी",
    hostedBy: "Hosted by",
    withOurFamilies: "With our families",
    eventsHeading: "Celebration itinerary",
    venueHeading: "Venue & travel",
    contactHeading: "Contact",
    viewOnMap: "View on map",
    addToCalendar: "Add to calendar",
    downloadIcs: "Download (.ics)",
    dressCode: "Dress code",
    countdownHeading: "Counting down to the wedding",
    countdownDays: "days",
    countdownHours: "hours",
    countdownMinutes: "minutes",
    countdownSeconds: "seconds",
    countdownArrived: "Today is the day!",
    noEventsYet: "Event details will be published here soon.",
    faqHeading: "Good to know",
    photoPlaceholder: "Photo coming soon",
    skipToContent: "Skip to content",
    unavailableTitle: "The invitation is temporarily unavailable",
    unavailableBody: "Please try again later or contact the family.",
  },
  hi: {
    chooseSideTitle: "यह निमंत्रण किसकी ओर से है?",
    chooseSideSubtitle: "कृपया बताएं कि आपको किस ओर से आमंत्रित किया गया है।",
    brideSideCta: "वधू पक्ष",
    groomSideCta: "वर पक्ष",
    switchSide: "दूसरा पक्ष चुनें",
    languageLabel: "भाषा",
    languageEnglish: "English",
    languageHindi: "हिन्दी",
    hostedBy: "आमंत्रणकर्ता",
    withOurFamilies: "हमारे परिवार सहित",
    eventsHeading: "समारोह का विवरण",
    venueHeading: "स्थान एवं यात्रा",
    contactHeading: "संपर्क",
    viewOnMap: "मानचित्र पर देखें",
    addToCalendar: "कैलेंडर में जोड़ें",
    downloadIcs: "डाउनलोड (.ics)",
    dressCode: "पहनावा",
    countdownHeading: "विवाह की उलटी गिनती",
    countdownDays: "दिन",
    countdownHours: "घंटे",
    countdownMinutes: "मिनट",
    countdownSeconds: "सेकंड",
    countdownArrived: "आज वह दिन है!",
    noEventsYet: "कार्यक्रम का विवरण शीघ्र ही यहाँ प्रकाशित किया जाएगा।",
    faqHeading: "जानने योग्य बातें",
    photoPlaceholder: "फोटो जल्द ही आएगी",
    skipToContent: "सामग्री पर जाएँ",
    unavailableTitle: "निमंत्रण अभी उपलब्ध नहीं है",
    unavailableBody: "कृपया बाद में पुनः प्रयास करें या परिवार से संपर्क करें।",
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type DictionaryKey = keyof typeof dictionary.en;

export function t(lang: Lang, key: DictionaryKey): string {
  return dictionary[lang][key];
}
