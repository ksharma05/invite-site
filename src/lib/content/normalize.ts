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
 * Automatically converts Google Drive share URLs, view URLs, or open URLs
 * into direct CDN image URLs (https://lh3.googleusercontent.com/d/{id}).
 * Preserves standard URLs and relative paths verbatim.
 */
export function resolveImageUrl(value: string | undefined): string | undefined {
  const v = normalizeCell(value);
  if (!v) return undefined;

  // Google Drive format 1: /file/d/{fileId}/view
  const fileDMatch = v.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}`;
  }

  // Google Drive format 2: drive.google.com?...id={fileId}
  const idMatch = v.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1] && v.includes("drive.google.com")) {
    return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
  }

  return v;
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
