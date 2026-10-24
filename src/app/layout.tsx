import type { Metadata } from "next";
import { headers } from "next/headers";
import { Cormorant_Garamond, Noto_Sans, Noto_Serif_Devanagari } from "next/font/google";
import { DEFAULT_LANG } from "@/lib/invitation/resolveLang";
import { t } from "@/lib/i18n/dictionary";
import "./globals.css";

const headingFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const bodyFont = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const devanagariFont = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-devanagari",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://sanjukta-khushal.wedding";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Sanjukta & Khushal — Wedding Invitation",
  description:
    "Together with our families, we cordially invite you to celebrate our wedding in Varanasi (Kashi). 23–25 November 2026.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Sanjukta & Khushal Wedding",
    title: "Sanjukta & Khushal — Wedding Invitation",
    description:
      "Together with our families, we cordially invite you to celebrate our wedding in Varanasi (Kashi). 23–25 November 2026.",
    images: [
      {
        url: "/og-card-1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "Sanjukta & Khushal Wedding Invitation",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sanjukta & Khushal — Wedding Invitation",
    description:
      "Together with our families, we cordially invite you to celebrate our wedding in Varanasi (Kashi). 23–25 November 2026.",
    images: ["/og-card-1200x630.jpg"],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const lang = headerList.get("x-lang") === "hi" ? "hi" : DEFAULT_LANG;

  return (
    <html
      lang={lang}
      data-theme="terracotta"
      className={`${headingFont.variable} ${bodyFont.variable} ${devanagariFont.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-body antialiased" suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-ornate focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
        >
          {t(lang, "skipToContent")}
        </a>
        {children}
      </body>
    </html>
  );
}
