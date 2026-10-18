import { afterEach, describe, expect, it, vi } from "vitest";
import { fixtureContent } from "@/data/fixtures";

vi.mock("server-only", () => ({}));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function loadSource(env: Record<string, string>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  return import("./source");
}

const SHEETS_ENV = {
  NODE_ENV: "development",
  CONTENT_SOURCE: "sheets",
  GOOGLE_SHEETS_SPREADSHEET_ID: "x",
  GOOGLE_SERVICE_ACCOUNT_EMAIL: "svc@example.iam.gserviceaccount.com",
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: "k",
};

/** Mocks the durable snapshot module so source.test drives the publication lifecycle. */
function mockSnapshot({ existing }: { existing: unknown }) {
  const publish = vi.fn(async () => {});
  const read = vi.fn(async () => existing);
  vi.doMock("@/lib/content/snapshot", () => ({
    createSnapshotStore: vi.fn(() => ({})),
    publishSnapshot: publish,
    readSnapshot: read,
  }));
  return { publish, read };
}

describe("getInvitationContent", () => {
  it("serves fixtures outside production", async () => {
    const { getInvitationContent } = await loadSource({ NODE_ENV: "development" });
    const result = await getInvitationContent();
    expect(result.kind).toBe("ok");
    expect(result.kind === "ok" && result.servedFrom).toBe("fixture");
  });

  it("refuses fixtures in production unless explicitly allowed", async () => {
    const { getInvitationContent } = await loadSource({ NODE_ENV: "production" });
    expect(await getInvitationContent()).toEqual({
      kind: "unavailable",
      reason: "fixtures-disabled",
    });
  });

  it("serves fixtures in production only with ALLOW_FIXTURE_CONTENT=true", async () => {
    const { getInvitationContent } = await loadSource({
      NODE_ENV: "production",
      ALLOW_FIXTURE_CONTENT: "true",
    });
    expect((await getInvitationContent()).kind).toBe("ok");
  });

  describe("sheets mode with durable last-known-good snapshot (Phase 6)", () => {
    it("publishes and serves a valid candidate", async () => {
      vi.doMock("./sheetsSource", () => ({
        getSheetsContent: async () => ({ kind: "ok", content: fixtureContent }),
      }));
      const { publish, read } = mockSnapshot({ existing: null });
      const { getInvitationContent } = await loadSource(SHEETS_ENV);

      const result = await getInvitationContent();
      expect(result.kind).toBe("ok");
      expect(result.kind === "ok" && result.servedFrom).toBe("sheets");
      // Valid content is published to the durable store for future outages.
      expect(publish).toHaveBeenCalledTimes(1);
      expect(publish).toHaveBeenCalledWith(expect.anything(), fixtureContent);
      expect(read).not.toHaveBeenCalled();
    });

    it("retains and serves the last-known-good snapshot on a Sheets outage", async () => {
      vi.doMock("./sheetsSource", () => ({
        getSheetsContent: async () => ({ kind: "error", reason: "fetch-failed" }),
      }));
      const { publish, read } = mockSnapshot({ existing: fixtureContent });
      const { getInvitationContent } = await loadSource(SHEETS_ENV);

      const result = await getInvitationContent();
      expect(result.kind).toBe("ok");
      expect(result.kind === "ok" && result.servedFrom).toBe("snapshot");
      expect(result.kind === "ok" && result.content).toEqual(fixtureContent);
      // No new publish happened (nothing valid to publish), and the snapshot was read.
      expect(publish).not.toHaveBeenCalled();
      expect(read).toHaveBeenCalledTimes(1);
    });

    it("retains the last-known-good snapshot when an invalid edit makes a critical row fail", async () => {
      vi.doMock("./sheetsSource", () => ({
        getSheetsContent: async () => ({ kind: "error", reason: "invalid-family" }),
      }));
      const { publish } = mockSnapshot({ existing: fixtureContent });
      const { getInvitationContent } = await loadSource(SHEETS_ENV);

      const result = await getInvitationContent();
      expect(result.kind).toBe("ok");
      expect(result.kind === "ok" && result.servedFrom).toBe("snapshot");
      // An invalid edit never overwrites the good snapshot.
      expect(publish).not.toHaveBeenCalled();
    });

    it("shows unavailable only when there is no snapshot and the sheet is unusable", async () => {
      vi.doMock("./sheetsSource", () => ({
        getSheetsContent: async () => ({ kind: "error", reason: "fetch-failed" }),
      }));
      mockSnapshot({ existing: null });
      const { getInvitationContent } = await loadSource(SHEETS_ENV);

      expect(await getInvitationContent()).toEqual({
        kind: "unavailable",
        reason: "sheets-unavailable",
      });
    });
  });
});
