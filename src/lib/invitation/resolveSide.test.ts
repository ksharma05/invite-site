import { describe, expect, it } from "vitest";
import { resolveSide, otherSide } from "./resolveSide";
import { resolveLang, DEFAULT_LANG } from "./resolveLang";

describe("resolveSide", () => {
  it("returns unset when no side param is present", () => {
    expect(resolveSide(undefined)).toEqual({ kind: "unset" });
  });

  it("returns chosen for a valid side", () => {
    expect(resolveSide("bride")).toEqual({ kind: "chosen", side: "bride" });
    expect(resolveSide("groom")).toEqual({ kind: "chosen", side: "groom" });
  });

  it("returns invalid for an unrecognized value instead of guessing a default", () => {
    expect(resolveSide("uncle")).toEqual({ kind: "invalid", raw: "uncle" });
  });

  it("handles duplicated query params by taking the first value", () => {
    expect(resolveSide(["bride", "groom"])).toEqual({ kind: "chosen", side: "bride" });
  });

  it("flips between sides", () => {
    expect(otherSide("bride")).toBe("groom");
    expect(otherSide("groom")).toBe("bride");
  });
});

describe("resolveLang", () => {
  it("falls back to the documented default when unset", () => {
    expect(resolveLang(undefined)).toBe(DEFAULT_LANG);
  });

  it("accepts an explicit valid language", () => {
    expect(resolveLang("hi")).toBe("hi");
    expect(resolveLang("en")).toBe("en");
  });

  it("falls back to default for an unsupported language instead of guessing", () => {
    expect(resolveLang("fr")).toBe(DEFAULT_LANG);
  });

  it("falls back to a valid saved preference when there is no explicit param", () => {
    expect(resolveLang(undefined, "hi")).toBe("hi");
  });

  it("ignores an invalid saved preference and falls back to the default", () => {
    expect(resolveLang(undefined, "fr")).toBe(DEFAULT_LANG);
  });

  it("an explicit param always wins over a saved preference, even a different valid one", () => {
    expect(resolveLang("en", "hi")).toBe("en");
  });
});
