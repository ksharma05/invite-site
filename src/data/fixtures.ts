import type { InvitationContent } from "@/lib/content/types";

/**
 * DEVELOPMENT FIXTURE — NOT PRODUCTION CONTENT.
 *
 * English invitation wording below was supplied verbatim by the family.
 * The Hindi invitation wording is a DRAFT machine/agent translation and is
 * explicitly NOT approved — per the project rule, it must not be treated as
 * real content until a family member signs off (see DECISIONS.md, item D1).
 * Event dates/venues are placeholders pending Phase 1 approval.
 */
export const isFixtureContent = true;

export const fixtureContent: InvitationContent = {
  family: {
    brideName: { en: "Sanjukta", hi: "संजुक्ता" },
    groomName: { en: "Khushal", hi: "खुशाल" },
    brideParents: [
      { en: "Smt. Sangita Singh", hi: "श्रीमती संगीता सिंह (मसौदा — अस्वीकृत)" },
      { en: "Shri Ranjeet Kumar Singh", hi: "श्री रणजीत कुमार सिंह (मसौदा — अस्वीकृत)" },
    ],
    groomParents: [
      { en: "Smt. Neena Sharma", hi: "श्रीमती नीना शर्मा (मसौदा — अस्वीकृत)" },
      { en: "Shri Krishan Swaroop Sharma", hi: "श्री कृष्ण स्वरूप शर्मा (मसौदा — अस्वीकृत)" },
    ],
    invitationWording: {
      bride: {
        en: "Smt. Sangita Singh and Shri Ranjeet Kumar Singh cordially invite you to the wedding of their daughter Sanjukta with Khushal. With our families: Smt. Neena Sharma and Shri Krishan Swaroop Sharma.",
        hi: "[मसौदा — पारिवारिक स्वीकृति लंबित] श्रीमती संगीता सिंह एवं श्री रणजीत कुमार सिंह अपनी पुत्री संजुक्ता के विवाह में खुशाल के साथ आपको सादर आमंत्रित करते हैं। हमारे परिवार सहित: श्रीमती नीना शर्मा एवं श्री कृष्ण स्वरूप शर्मा।",
      },
      groom: {
        en: "Smt. Neena Sharma and Shri Krishan Swaroop Sharma cordially invite you to the wedding of their son Khushal with Sanjukta. With our families: Smt. Sangita Singh and Shri Ranjeet Kumar Singh.",
        hi: "[मसौदा — पारिवारिक स्वीकृति लंबित] श्रीमती नीना शर्मा एवं श्री कृष्ण स्वरूप शर्मा अपने पुत्र खुशाल के विवाह में संजुक्ता के साथ आपको सादर आमंत्रित करते हैं। हमारे परिवार सहित: श्रीमती संगीता सिंह एवं श्री रणजीत कुमार सिंह।",
      },
    },
  },
  events: [
    {
      id: "haldi",
      order: 1,
      active: true,
      visibleTo: "both",
      title: { en: "Haldi", hi: "[मसौदा] हल्दी" },
      startAt: "2026-11-23T09:00:00+05:30",
      venueName: {
        en: "Venue to be confirmed, Bermo, Jharkhand",
        hi: "[मसौदा] स्थान की पुष्टि होनी बाकी है, बेरमो, झारखंड",
      },
      venueAddress: {
        en: "Exact address pending family confirmation.",
        hi: "[मसौदा] सटीक पता पारिवारिक पुष्टि के लिए लंबित है।",
      },
      notes: {
        en: "Placeholder event — real schedule comes from the spreadsheet (Phase 5).",
        hi: "[मसौदा] यह एक नमूना कार्यक्रम है।",
      },
    },
    {
      id: "mehendi",
      order: 2,
      active: true,
      visibleTo: "bride",
      title: { en: "Mehendi", hi: "[मसौदा] मेहंदी" },
      startAt: "2026-11-23T16:00:00+05:30",
      venueName: {
        en: "Venue to be confirmed, Bermo, Jharkhand",
        hi: "[मसौदा] स्थान की पुष्टि होनी बाकी है, बेरमो, झारखंड",
      },
      venueAddress: {
        en: "Exact address pending family confirmation.",
        hi: "[मसौदा] सटीक पता पारिवारिक पुष्टि के लिए लंबित है।",
      },
      notes: {
        en: "Placeholder event — real schedule comes from the spreadsheet (Phase 5).",
        hi: "[मसौदा] यह एक नमूना कार्यक्रम है।",
      },
    },
    {
      id: "sangeet",
      order: 3,
      active: true,
      visibleTo: "both",
      title: { en: "Sangeet", hi: "[मसौदा] संगीत" },
      startAt: "2026-11-24T19:00:00+05:30",
      venueName: {
        en: "Venue to be confirmed, Bermo, Jharkhand",
        hi: "[मसौदा] स्थान की पुष्टि होनी बाकी है, बेरमो, झारखंड",
      },
      venueAddress: {
        en: "Exact address pending family confirmation.",
        hi: "[मसौदा] सटीक पता पारिवारिक पुष्टि के लिए लंबित है।",
      },
      notes: {
        en: "Placeholder event — real schedule comes from the spreadsheet (Phase 5).",
        hi: "[मसौदा] यह एक नमूना कार्यक्रम है।",
      },
    },
    {
      id: "wedding-ceremony",
      order: 4,
      active: true,
      visibleTo: "both",
      title: {
        en: "Wedding Ceremony",
        hi: "[मसौदा] विवाह समारोह",
      },
      startAt: "2026-11-25T10:00:00+05:30",
      venueName: {
        en: "Venue to be confirmed, Bermo, Jharkhand",
        hi: "[मसौदा] स्थान की पुष्टि होनी बाकी है, बेरमो, झारखंड",
      },
      venueAddress: {
        en: "Exact address pending family confirmation.",
        hi: "[मसौदा] सटीक पता पारिवारिक पुष्टि के लिए लंबित है।",
      },
      notes: {
        en: "Placeholder event — replace once the spreadsheet schema (Phase 1) is approved.",
        hi: "[मसौदा] यह एक नमूना कार्यक्रम है।",
      },
    },
  ],
};

export const WEDDING_DATE_ISO = "2026-11-25T10:00:00+05:30";
