/**
 * Pure cell-level normalization helpers for Google Sheets rows (Phase 5).
 * No network or Google API code here — kept testable without mocking.
 */

export function normalizeCell(value: string | undefined): string {
  return (value ?? "").trim();
}

/** Accepts common spreadsheet spellings of "yes" (checkbox TRUE, "true", "yes", "1"). Anything else is false. */
export function normalizeBoolean(value: string | undefined): boolean {
  const v = normalizeCell(value).toLowerCase();
  return v === "true" || v === "yes" || v === "1";
}

/** Falls back to 0 (sorts first) rather than throwing on a blank/non-numeric order cell. */
export function normalizeOrder(value: string | undefined): number {
  const v = normalizeCell(value);
  const n = Number.parseInt(v, 10);
  return Number.isNaN(n) ? 0 : n;
}

/** Spreadsheet convention: an empty cell means "no value", not an empty string, for optional fields. */
export function emptyToUndefined(value: string | undefined): string | undefined {
  const v = normalizeCell(value);
  return v === "" ? undefined : v;
}

/**
 * A spreadsheet row as returned by the Sheets API: header cell name -> raw cell value.
 * Values are not yet validated against the content schema.
 */
export type SheetRow = Record<string, string | undefined>;

/** Drops rows where every cell is blank (trailing blank rows commonly left in a sheet). */
export function dropBlankRows(rows: SheetRow[]): SheetRow[] {
  return rows.filter((row) => Object.values(row).some((cell) => normalizeCell(cell) !== ""));
}

/** Converts a header row + body rows (as returned by values.get) into header-keyed row objects. */
export function rowsToObjects(values: string[][]): SheetRow[] {
  if (values.length === 0) return [];
  const [header = [], ...body] = values;
  const keys = header.map((h) => normalizeCell(h));
  const rows = body.map((cells) => {
    const row: SheetRow = {};
    keys.forEach((key, i) => {
      if (key) row[key] = cells[i];
    });
    return row;
  });
  return dropBlankRows(rows);
}
