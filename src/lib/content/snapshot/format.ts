import { z } from "zod";
import type { InvitationContent } from "@/lib/content/types";
import { invitationContentSchema } from "@/lib/content/schema";

/**
 * Durable last-known-good snapshot format (Phase 6).
 *
 * A snapshot is a validated, versioned envelope around a full InvitationContent.
 * Writes only ever contain schema-valid content (we parse before storing) and
 * reads only ever return schema-valid content (we re-validate on load) — so a
 * snapshot can never smuggle a broken page onto the site.
 *
 * schemaVersion lets us change the payload shape later without silently
 * misreading older snapshots.
 */

export const SNAPSHOT_SCHEMA_VERSION = 1 as const;

const snapshotEnvelopeSchema = z.object({
  schemaVersion: z.literal(SNAPSHOT_SCHEMA_VERSION),
  /** ISO timestamp of the last successful publication. Observability only. */
  savedAt: z.string().min(1),
  content: invitationContentSchema,
});

export type SnapshotEnvelope = z.infer<typeof snapshotEnvelopeSchema>;

export const SNAPSHOT_KIND = "wed-invite-last-known-good";

/** Renders a snapshot envelope to its transport string (JSON). Never used for secrets. */
export function encodeSnapshot(content: InvitationContent): string {
  // Throws on invalid content — callers treat that as a failed (skipped) publish.
  const parsed = invitationContentSchema.parse(content);
  const envelope: SnapshotEnvelope = {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    content: parsed,
  };
  return JSON.stringify(envelope);
}

/** Parses and re-validates a stored snapshot string; returns null if it is unusable. */
export function decodeSnapshot(raw: string): InvitationContent | null {
  try {
    const parsed = snapshotEnvelopeSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data.content : null;
  } catch {
    return null;
  }
}
