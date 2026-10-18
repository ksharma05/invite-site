import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { parseServerEnv, EnvConfigError } = await import("./server");

describe("parseServerEnv", () => {
  it("defaults to fixture content with fixtures not explicitly allowed", () => {
    const env = parseServerEnv({});
    expect(env.CONTENT_SOURCE).toBe("fixture");
    expect(env.ALLOW_FIXTURE_CONTENT).toBe(false);
  });

  it("parses ALLOW_FIXTURE_CONTENT=true as a boolean", () => {
    expect(parseServerEnv({ ALLOW_FIXTURE_CONTENT: "true" }).ALLOW_FIXTURE_CONTENT).toBe(true);
  });

  it("rejects an unknown CONTENT_SOURCE with a message naming the variable", () => {
    expect(() => parseServerEnv({ CONTENT_SOURCE: "csv" })).toThrow(EnvConfigError);
    expect(() => parseServerEnv({ CONTENT_SOURCE: "csv" })).toThrow(/CONTENT_SOURCE/);
  });

  it("requires all Sheets credentials when CONTENT_SOURCE=sheets, and names the missing ones", () => {
    expect(() => parseServerEnv({ CONTENT_SOURCE: "sheets" })).toThrow(
      /GOOGLE_SHEETS_SPREADSHEET_ID/
    );
  });

  it("never echoes a malformed secret value in the error message", () => {
    const secret = "not-an-email-SECRET-123";
    try {
      parseServerEnv({ GOOGLE_SERVICE_ACCOUNT_EMAIL: secret });
      throw new Error("expected failure");
    } catch (error) {
      expect(String(error)).not.toContain(secret);
      expect(String(error)).toContain("GOOGLE_SERVICE_ACCOUNT_EMAIL");
    }
  });
});
