import "server-only";
import { z } from "zod";

/**
 * Server-only environment validation (Phase 2).
 * Imports "server-only", so bundling this into client code fails the build.
 *
 * Sheets variables are optional until Phase 5 wires the integration; they are
 * validated for shape when present so a typo fails loudly, not silently.
 */

const serverEnvSchema = z.object({
  CONTENT_SOURCE: z.enum(["fixture", "sheets"]).default("fixture"),
  ALLOW_FIXTURE_CONTENT: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  GOOGLE_SHEETS_SPREADSHEET_ID: z.string().min(1).optional(),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().email().optional(),
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string().min(1).optional(),
  SHEETS_REVALIDATE_SECONDS: z
    .string()
    .default("60")
    .transform((v) => {
      const n = Number.parseInt(v, 10);
      return Number.isNaN(n) || n < 1 ? 60 : n;
    }),
  /** Durable last-known-good snapshot (Phase 6). See snapshot/ and README. */
  KV_REST_API_URL: z.string().url().optional(),
  KV_REST_API_TOKEN: z.string().min(1).optional(),
  SNAPSHOT_DIR: z.string().min(1).default(".data"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export class EnvConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnvConfigError";
  }
}

/**
 * Parses an env object and throws an EnvConfigError that names each bad variable
 * and says what to do about it. Never echoes the offending values (they may be secrets).
 */
export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.safeParse(source);
  if (result.success) {
    const env = result.data;
    if (env.CONTENT_SOURCE === "sheets") {
      const missing = (
        [
          "GOOGLE_SHEETS_SPREADSHEET_ID",
          "GOOGLE_SERVICE_ACCOUNT_EMAIL",
          "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
        ] as const
      ).filter((key) => !env[key]);
      if (missing.length > 0) {
        throw new EnvConfigError(
          `CONTENT_SOURCE=sheets requires ${missing.join(", ")}. Set them in .env.local (see .env.example).`
        );
      }
    }
    return env;
  }

  const problems = result.error.issues.map(
    (issue) => `  - ${issue.path.join(".")}: ${issue.message}`
  );
  throw new EnvConfigError(
    `Invalid environment configuration:\n${problems.join("\n")}\nSee .env.example for the expected variables.`
  );
}

let cached: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  cached ??= parseServerEnv(process.env);
  return cached;
}
