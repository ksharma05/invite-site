import "server-only";
import type { InvitationContent } from "@/lib/content/types";
import { invitationContentSchema } from "@/lib/content/schema";
import { fixtureContent } from "@/data/fixtures";
import { getServerEnv } from "@/lib/env/server";
import { getSheetsContent } from "@/lib/content/sheetsSource";
import { createSnapshotStore, publishSnapshot, readSnapshot } from "@/lib/content/snapshot";

export type ContentResult =
  | { kind: "ok"; content: InvitationContent; servedFrom?: "sheets" | "snapshot" | "fixture" }
  | {
      kind: "unavailable";
      reason: "fixtures-disabled" | "invalid-content" | "sheets-unavailable";
    };

/**
 * Phase 6 publication model. Sheet edits are treated as *candidate* content:
 *  1. Fetch the candidate.
 *  2. Validate it (the sheets pipeline skips bad optional rows, so a returned
 *     candidate is always schema-valid).
 *  3. Publish only an acceptable snapshot (write it to the durable store).
 *  4. When critical validation fails (fetch failure, invalid Family/Wording),
 *     retain + serve the previous valid snapshot if one exists, else "unavailable".
 *
 * Decision (documented, not silent): ONE malformed optional event/FAQ row is
 * skipped and logged and does NOT block publication of the rest. A critical
 * failure (family wording, or the sheet being unreachable) is what blocks a
 * publish and triggers the last-known-good fallback.
 *
 * The snapshot store is best-effort: a snapshot write/read failure is logged
 * and never makes a valid page fail, and invalid edits can never replace a
 * valid snapshot because snapshots are only ever written after full validation.
 */
export async function getInvitationContent(): Promise<ContentResult> {
  const env = getServerEnv();

  if (env.CONTENT_SOURCE === "sheets") {
    const store = createSnapshotStore(env);
    const candidate = await getSheetsContent();

    if (candidate.kind === "ok") {
      // Candidate is acceptable — publish it for future outages, then serve it.
      await publishSnapshot(store, candidate.content);
      return { kind: "ok", content: candidate.content, servedFrom: "sheets" };
    }

    // Critical failure — retain the last-known-good snapshot if we have one.
    const snapshot = await readSnapshot(store);
    if (snapshot) {
      console.warn(`[sheets] ${candidate.reason}: serving last-known-good snapshot.`);
      return { kind: "ok", content: snapshot, servedFrom: "snapshot" };
    }

    // Outage/first-boot fallback: if fixtures are allowed, serve them rather than a blank page.
    if (env.ALLOW_FIXTURE_CONTENT) {
      console.warn(`[sheets] ${candidate.reason}: falling back to fixture content.`);
      const parsed = invitationContentSchema.safeParse(fixtureContent);
      if (parsed.success) {
        return { kind: "ok", content: parsed.data, servedFrom: "fixture" };
      }
    }

    // No snapshot and the sheet is unusable — show an honest unavailable state.
    return { kind: "unavailable", reason: "sheets-unavailable" };
  }

  const fixturesAllowed = process.env.NODE_ENV !== "production" || env.ALLOW_FIXTURE_CONTENT;
  if (!fixturesAllowed) {
    return { kind: "unavailable", reason: "fixtures-disabled" };
  }

  const parsed = invitationContentSchema.safeParse(fixtureContent);
  if (!parsed.success) {
    return { kind: "unavailable", reason: "invalid-content" };
  }
  return { kind: "ok", content: parsed.data, servedFrom: "fixture" };
}
