import type { SnapshotEnvelope } from "@/lib/content/snapshot/format";
import type { SnapshotStore } from "@/lib/content/snapshot/index";

/**
 * Upstash Redis / Vercel KV-backed last-known-good snapshot (Phase 6).
 *
 * The recommended durable backend for the confirmed Vercel host: data lives in
 * a Redis instance that survives serverless cold starts and deployments, unlike
 * a per-instance filesystem or an in-memory cache. Uses the stable, well-known
 * Upstash REST API directly via `fetch` (no SDK dependency), guarded by env vars
 * (KV_REST_API_URL + KV_REST_API_TOKEN) so it is only selected when configured.
 *
 * The REST commands are `/set/<base64>/<value>` and `/get/<key>`, authenticated
 * with `Authorization: Bearer <token>`. Key and value are base64url-encoded so
 * the JSON snapshot travels safely through the URL path. Responses are JSON:
 *  SET -> { "result": <string> }   (matching the get key)
 *  GET -> { "result": "<binary-string>" | null }
 *
 * Any network/auth/malformed-response error surfaces to the caller. The
 * snapshot/index.ts layer logs it and downgrades gracefully (never blocks
 * serving). Only transactional robustness matters here: a partial write must
 * not be returned as a valid snapshot, which UPSTASH guarantees by only
 * returning the result after the whole value is stored.
 */

interface UpstashConfig {
  url: string;
  token: string;
}

/** base64url encoding transports arbitrary UTF-8 through the URL path safely. */
function base64url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

/**
 * Decodes the base64url-encoded snapshot value Upstash returns (it echoes the
 * exact string we stored). base64url decode yields the original UTF-8 JSON.
 */
function decodeValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const chars = String(value);
  if (chars.length === 0) return "";
  try {
    return Buffer.from(chars, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

export function createUpstashSnapshotStore(config: UpstashConfig): SnapshotStore {
  const baseUrl = config.url.replace(/\/+$/, "");
  const key = base64url("wed-invite:last-known-good");

  return {
    async read() {
      const response = await fetch(`${baseUrl}/get/${key}`, {
        headers: { Authorization: `Bearer ${config.token}` },
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`snapshot GET failed with status ${response.status}`);
      }
      const body = (await response.json()) as { result?: unknown };
      const raw = decodeValue(body.result);
      if (raw === null) return null;
      return JSON.parse(raw) as SnapshotEnvelope;
    },
    async write(envelope) {
      const value = base64url(JSON.stringify(envelope));
      const response = await fetch(`${baseUrl}/set/${key}/${value}`, {
        headers: { Authorization: `Bearer ${config.token}` },
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`snapshot SET failed with status ${response.status}`);
      }
    },
  };
}
