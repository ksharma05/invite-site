import { headers } from "next/headers";
import { resolveSide } from "@/lib/invitation/resolveSide";
import { resolveLang } from "@/lib/invitation/resolveLang";
import { getInvitationContent } from "@/lib/content/source";
import { SideChooser } from "@/components/SideChooser";
import { InvitationView } from "@/components/InvitationView";
import { Unavailable } from "@/components/Unavailable";

type SearchParams = { [key: string]: string | string[] | undefined };

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
