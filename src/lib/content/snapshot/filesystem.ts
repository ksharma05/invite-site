import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SnapshotEnvelope } from "@/lib/content/snapshot/format";
import type { SnapshotStore } from "@/lib/content/snapshot/index";

/**
 * Filesystem-backed last-known-good snapshot (Phase 6).
 *
 * Durable on a persistent filesystem (local dev, self-hosted `next start`).
 * On Vercel serverless the write target is per-instance and ephemeral, so this
 * backend is the local/self-hosted default; the Upstash backend is the durable
 * option for Vercel. See snapshot/index.ts.
 *
 * Writes are atomic (write temp file, then rename) so a crash mid-write never
 * leaves a truncated snapshot that could be misread as valid.
 */

const SNAPSHOT_FILENAME = "last-known-good.json";

export function createFileSnapshotStore(dir: string): SnapshotStore {
  const target = path.join(dir, SNAPSHOT_FILENAME);
  const temp = path.join(dir, `${SNAPSHOT_FILENAME}.tmp`);

  return {
    async read() {
      let raw: string;
      try {
        raw = await readFile(target, "utf8");
      } catch {
        return null; // no snapshot yet, or not readable — treated as absent
      }
      try {
        return JSON.parse(raw) as SnapshotEnvelope;
      } catch {
        return null;
      }
    },
    async write(envelope) {
      await mkdir(dir, { recursive: true });
      await writeFile(temp, JSON.stringify(envelope), "utf8");
      await rename(temp, target);
    },
  };
}
