import type { Metadata } from "next";
import { headers } from "next/headers";
import { resolveSide } from "@/lib/invitation/resolveSide";
import { resolveLang } from "@/lib/invitation/resolveLang";
import { getInvitationContent } from "@/lib/content/source";
import { SideChooser } from "@/components/SideChooser";
import { InvitationView } from "@/components/InvitationView";
import { Unavailable } from "@/components/Unavailable";

type SearchParams = { [key: string]: string | string[] | undefined };

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const sideResolution = resolveSide(params.side);
  const isGroom = sideResolution.kind === "chosen" && sideResolution.side === "groom";

  const title = isGroom
    ? "Khushal & Sanjukta — Wedding Invitation"
    : "Sanjukta & Khushal — Wedding Invitation";
  const ogImage = isGroom ? "/og-card-groom-1200x630.jpg" : "/og-card-bride-1200x630.jpg";

  return {
    title,
    openGraph: {
      title,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      images: [ogImage],
    },
  };
}

/**
 * Side/lang resolution happens server-side so the first HTML already matches the
 * requested side and language — no hydration flash of the wrong name order.
 *
 * Language is read from the `x-lang` header set by middleware (the single
 * source of truth shared with the root layout's `<html lang>`), falling back
 * to resolving it directly from the URL if the header is ever absent.
 */
export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const headerList = await headers();
  const headerLang = headerList.get("x-lang");
  const lang = headerLang ? resolveLang(headerLang) : resolveLang(params.lang);
  const sideResolution = resolveSide(params.side);

  if (sideResolution.kind !== "chosen") {
    return <SideChooser lang={lang} />;
  }

  const result = await getInvitationContent();
  if (result.kind !== "ok") {
    return <Unavailable lang={lang} />;
  }

  return <InvitationView content={result.content} side={sideResolution.side} lang={lang} />;
}
