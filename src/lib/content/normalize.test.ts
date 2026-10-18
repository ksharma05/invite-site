import { describe, expect, it } from "vitest";
import {
  dropBlankRows,
  emptyToUndefined,
  normalizeBoolean,
  normalizeCell,
  normalizeOrder,
  rowsToObjects,
} from "./normalize";

describe("normalizeCell", () => {
  it("trims whitespace and treats undefined as empty", () => {
    expect(normalizeCell("  hello  ")).toBe("hello");
    expect(normalizeCell(undefined)).toBe("");
  });
});

describe("normalizeBoolean", () => {
  it.each(["true", "TRUE", "yes", "1"])("treats %s as true", (v) => {
    expect(normalizeBoolean(v)).toBe(true);
  });

  it.each(["false", "no", "0", "", undefined])("treats %s as false", (v) => {
    expect(normalizeBoolean(v)).toBe(false);
  });
});

describe("normalizeOrder", () => {
  it("parses an integer string", () => {
    expect(normalizeOrder("3")).toBe(3);
  });

  it("falls back to 0 for blank or non-numeric values instead of throwing", () => {
    expect(normalizeOrder("")).toBe(0);
    expect(normalizeOrder(undefined)).toBe(0);
    expect(normalizeOrder("not-a-number")).toBe(0);
  });
});

describe("emptyToUndefined", () => {
  it("returns undefined for a blank cell", () => {
    expect(emptyToUndefined("")).toBeUndefined();
    expect(emptyToUndefined("   ")).toBeUndefined();
    expect(emptyToUndefined(undefined)).toBeUndefined();
  });

  it("returns the trimmed value otherwise", () => {
    expect(emptyToUndefined("  hi  ")).toBe("hi");
  });
});

describe("dropBlankRows", () => {
  it("removes rows where every cell is blank", () => {
    const rows = [
      { a: "1", b: "" },
      { a: "", b: "" },
    ];
    expect(dropBlankRows(rows)).toEqual([{ a: "1", b: "" }]);
  });
});

describe("rowsToObjects", () => {
  it("converts a header row + body rows into header-keyed objects", () => {
    const values = [
      ["id", "active"],
      ["haldi", "TRUE"],
      ["mehendi", "FALSE"],
    ];
    expect(rowsToObjects(values)).toEqual([
      { id: "haldi", active: "TRUE" },
      { id: "mehendi", active: "FALSE" },
    ]);
  });

  it("returns an empty array for an empty sheet", () => {
    expect(rowsToObjects([])).toEqual([]);
  });

  it("drops trailing fully-blank rows", () => {
    const values = [["id"], ["haldi"], ["", ""]];
    expect(rowsToObjects(values)).toEqual([{ id: "haldi" }]);
  });
});
