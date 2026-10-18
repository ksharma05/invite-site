import type { Side } from "@/lib/content/types";

export const SIDE_PARAM = "side";
const VALID_SIDES: Side[] = ["bride", "groom"];

export type SideResolution =
  { kind: "chosen"; side: Side } | { kind: "unset" } | { kind: "invalid"; raw: string };

/**
 * Resolves the invitation side strictly from the explicit `side` param.
 * There is deliberately no implicit default side: an unset or invalid value
 * routes the guest to the side-chooser landing instead of guessing (Phase 0 decision).
 */
export function resolveSide(rawSide: string | string[] | undefined): SideResolution {
  if (rawSide === undefined) return { kind: "unset" };
  const value = Array.isArray(rawSide) ? rawSide[0] : rawSide;
  if (value === undefined) return { kind: "unset" };
  if (isSide(value)) return { kind: "chosen", side: value };
  return { kind: "invalid", raw: value };
}

export function isSide(value: string): value is Side {
  return (VALID_SIDES as string[]).includes(value);
}

export function otherSide(side: Side): Side {
  return side === "bride" ? "groom" : "bride";
}
