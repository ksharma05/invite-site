import type { InvitationContent } from "@/lib/content/types";
import type { ServerEnv } from "@/lib/env/server";
import type { SnapshotEnvelope } from "@/lib/content/snapshot/format";
import { createUpstashSnapshotStore } from "@/lib/content/snapshot/upstash";
import { createFileSnapshotStore } from "@/lib/content/snapshot/filesystem";

/**
 * Durable last-known-good snapshot store (Phase 6).
 *
 * A process-local variable or an ordinary cache is NOT a dependable
 * last-known-good store across deployments and cold starts. This module keeps
 * the last successfully published InvitationContent in a store that survives
 * restart.
 *
 * Backends, chosen by config:
 *  - Upstash KV (REST) when KV_REST_API_URL + KV_REST_API_TOKEN are set —
 *    durable across Vercel serverless cold starts and deployments. This is the
 *    recommended durable option for the confirmed Vercel host.
 *  - Filesystem (SNAPSHOT_DIR) otherwise — durable on a persistent filesystem
 *    (local `next start`, self-hosting). On Vercel serverless the filesystem is
 *    per-instance and ephemeral, so it only provides cold-start-relevant
 *    durability when a real durable store (upstash) is configured.
 *
 * All stacks degrade gracefully: the store is best-effort. A read that fails
 * returns null (→ honest "unavailable"), and a write that fails is logged but
 * never blocks serving the valid content that triggered it.
 */

export interface SnapshotStore {
  read(): Promise<SnapshotEnvelope | null>;
  /** Best-effort publish. Callers must never let a thrown error break serving. */
  write(envelope: SnapshotEnvelope): Promise<void>;
}

export function createSnapshotStore(env: ServerEnv): SnapshotStore {
  if (env.KV_REST_API_URL && env.KV_REST_API_TOKEN) {
    return createUpstashSnapshotStore({
      url: env.KV_REST_API_URL,
      token: env.KV_REST_API_TOKEN,
    });
  }
  return createFileSnapshotStore(env.SNAPSHOT_DIR);
}

/**
 * Publishes a validated content snapshot (best-effort). Only ever called with
 * content that passed the full pipeline, so an invalid publish is impossible
 * to store by construction.
 */
export async function publishSnapshot(
  store: SnapshotStore,
  content: InvitationContent
): Promise<void> {
  try {
    const envelope: SnapshotEnvelope = {
      schemaVersion: 1,
      savedAt: new Date().toISOString(),
      content,
    };
    await store.write(envelope);
  } catch (error) {
    console.error(
      `[snapshot] publish failed (best-effort, continuing): ${
        error instanceof Error ? error.message : "unknown error"
      }`
    );
  }
}

/** Reads the last published snapshot, re-validating its content. Null if absent/unusable. */
export async function readSnapshot(store: SnapshotStore): Promise<InvitationContent | null> {
  try {
    const envelope = await store.read();
    return envelope ? envelope.content : null;
  } catch (error) {
    console.error(
      `[snapshot] read failed: ${error instanceof Error ? error.message : "unknown error"}`
    );
    return null;
  }
}
