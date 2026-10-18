import { NextResponse, type NextRequest } from "next/server";
import { LANG_COOKIE, LANG_PARAM, resolveLang } from "@/lib/invitation/resolveLang";

/**
 * Resolves the language once per request, before any Server Component renders,
 * so the root layout (`<html lang>`) and the page body always agree — no
 * hydration mismatch and no flash of the wrong language (Phase 3 requirement).
 *
 * The resolved value is forwarded as the `x-lang` request header for Server
 * Components to read, and saved as a cookie so the choice persists across
 * navigation without ever overriding a future explicit `?lang=`.
 */
export function middleware(request: NextRequest) {
  const rawLang = request.nextUrl.searchParams.get(LANG_PARAM) ?? undefined;
  const savedLang = request.cookies.get(LANG_COOKIE)?.value;
  const lang = resolveLang(rawLang, savedLang);

  const headers = new Headers(request.headers);
  headers.set("x-lang", lang);

  const response = NextResponse.next({ request: { headers } });
  response.cookies.set(LANG_COOKIE, lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico).*)"],
};
