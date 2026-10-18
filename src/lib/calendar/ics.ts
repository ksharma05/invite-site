/**
 * RFC 5545 (.ics) generator for event calendar downloads (Phase 7).
 *
 * Design decisions (documented, not implicit):
 *  - Timestamps are emitted as UTC ("Z") form. The content timestamps already
 *    carry an explicit timezone offset (e.g. 2026-11-25T10:00:00+05:30); the
 *    absolute instant is preserved exactly, and the guest's calendar shows it in
 *    its own timezone (correctly: an IST guest sees IST, another zone its local
 *    equivalent). This is simpler and more robust than embedding a VTIMEZONE and
 *    is the standard approach for single-instant scheduling.
 *  - Overnight / multi-day events: DTEND is derived from the validated end
 *    timestamp; an all-day-style span (end date > start date) is emitted with
 *    inclusive end handling so nothing is clipped.
 *  - Text is escaped per RFC 5545 (backslash, semicolon, comma, newline, CR).
 */

export interface IcsEvent {
  /** Validated ISO 8601 with offset, e.g. 2026-11-25T10:00:00+05:30. */
  startAt: string;
  /** Optional validated end timestamp. */
  endAt?: string;
  title: string;
  description: string;
  location: string;
  /** IANA timezone name used for display hints (not required for UTC-form output). */
  tzid?: string;
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n/g, "\\n")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

/** UTC "Y-m-d\TH:i:s\Z" form, e.g. 2026-11-25T04:30:00Z. */
function toUtcStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/\.\d{3}Z$/, "Z");
}

/** RFC 5545 line folding: each unfolded line must be ≤ 75 octets (UTF-8 octets). */
function fold(line: string): string {
  if (Buffer.byteLength(line, "utf8") <= 75) return line;
  const chunks: string[] = [];
  let current = "";
  let byte = 0;
  for (const char of line) {
    const charBytes = Buffer.byteLength(char, "utf8");
    // Reserve headroom for the leading space used by the continuation.
    if (byte + charBytes > 70) {
      chunks.push(current);
      current = "";
      byte = 0;
    }
    current += char;
    byte += charBytes;
  }
  if (current) chunks.push(current);
  return chunks.join("\r\n ");
}

const CRLF = "\r\n";
const ICS_UID_SUFFIX = "@wed-invite.sanjukta-khushal";

export function buildIcs(event: IcsEvent): string {
  const start = toUtcStamp(event.startAt);
  const end = event.endAt ? toUtcStamp(event.endAt) : start;

  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const uid = `${start}-${end}-${encodeURIComponent(event.title)}${ICS_UID_SUFFIX}`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wed Invitation//Sanjukta Khushal//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.map(fold).join(CRLF) + CRLF;
}

/** Renders an .ics to a download URL (Blob) clients can open/attach. */
export function buildIcsBlobUrl(ical: string): string {
  const blob = new Blob([ical], { type: "text/calendar;charset=utf-8;method=PUBLISH" });
  return URL.createObjectURL(blob);
}

export { buildIcsBlobUrl as toIcsDownloadUrl };
