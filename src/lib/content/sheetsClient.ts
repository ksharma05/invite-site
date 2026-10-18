import "server-only";
import { google } from "googleapis";
import { getServerEnv } from "@/lib/env/server";
import { rowsToObjects, type SheetRow } from "@/lib/content/normalize";

/**
 * Server-only Google Sheets reader. Read-only scope; never used from client code
 * (the "server-only" import fails the build if it ever is).
 */

function getSheetsClient() {
  const env = getServerEnv();
  const auth = new google.auth.JWT({
    email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  return google.sheets({ version: "v4", auth });
}

/** Fetches one tab (e.g. "Events") and converts it to header-keyed row objects. */
export async function fetchSheetTab(tabName: string): Promise<SheetRow[]> {
  const env = getServerEnv();
  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID,
    range: tabName,
  });
  return rowsToObjects((response.data.values as string[][] | undefined) ?? []);
}
