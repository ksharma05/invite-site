import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";
import { LANG_COOKIE } from "@/lib/invitation/resolveLang";

function request(url: string, cookie?: string) {
  const headers = new Headers();
  if (cookie) headers.set("cookie", cookie);
  return new NextRequest(new Request(url, { headers }));
}

// NextResponse.next({ request: { headers } }) encodes forwarded *request*
// headers on the response as `x-middleware-request-<name>` (an internal Next.js
// convention) — they are what the eventual Server Component sees via headers(),
// not a plain response header.
describe("middleware language resolution", () => {
  it("forwards the default language when nothing is specified", () => {
    const response = middleware(request("https://example.com/"));
    expect(response.headers.get("x-middleware-request-x-lang")).toBe("en");
    expect(response.cookies.get(LANG_COOKIE)?.value).toBe("en");
  });

  it("forwards and saves an explicit ?lang= value", () => {
    const response = middleware(request("https://example.com/?side=bride&lang=hi"));
    expect(response.headers.get("x-middleware-request-x-lang")).toBe("hi");
    expect(response.cookies.get(LANG_COOKIE)?.value).toBe("hi");
  });

  it("falls back to the saved cookie when there is no explicit param", () => {
    const response = middleware(request("https://example.com/", `${LANG_COOKIE}=hi`));
    expect(response.headers.get("x-middleware-request-x-lang")).toBe("hi");
  });

  it("an explicit param overrides a different saved cookie", () => {
    const response = middleware(request("https://example.com/?lang=en", `${LANG_COOKIE}=hi`));
    expect(response.headers.get("x-middleware-request-x-lang")).toBe("en");
    expect(response.cookies.get(LANG_COOKIE)?.value).toBe("en");
  });

  it("ignores an invalid saved cookie instead of forwarding it", () => {
    const response = middleware(request("https://example.com/", `${LANG_COOKIE}=fr`));
    expect(response.headers.get("x-middleware-request-x-lang")).toBe("en");
  });
});
