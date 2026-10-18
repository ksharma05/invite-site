import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { InvitationContent } from "@/lib/content/types";
import { fixtureContent } from "@/data/fixtures";
import { decodeSnapshot, encodeSnapshot } from "@/lib/content/snapshot/format";
import { createFileSnapshotStore } from "@/lib/content/snapshot/filesystem";
import { createUpstashSnapshotStore } from "@/lib/content/snapshot/upstash";
import { publishSnapshot, readSnapshot } from "@/lib/content/snapshot/index";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Runs the store through a full publish→read round trip, asserting valid content comes back. */
async function expectRoundTrip(store: Parameters<typeof publishSnapshot>[0]) {
  await publishSnapshot(store, fixtureContent);
  const restored = await readSnapshot(store);
  expect(restored).toBeDefined();
  expect(restored?.family.brideName.en).toBe("Sanjukta");
  expect(restored?.events.map((e) => e.id)).toContain("wedding-ceremony");
}

describe("snapshot format", () => {
  it("encodes and decodes a valid snapshot intact", () => {
    const raw = encodeSnapshot(fixtureContent);
    const decoded = decodeSnapshot(raw);
    expect(decoded).toEqual(fixtureContent);
  });

  it("rejects malformed or invalid snapshot strings (returns null)", () => {
    expect(decodeSnapshot("not json")).toBeNull();
    expect(decodeSnapshot(JSON.stringify({ schemaVersion: 99 }))).toBeNull();
    expect(
      decodeSnapshot(
        JSON.stringify({ schemaVersion: 1, content: { family: {}, events: [] } }) as string
      )
    ).toBeNull();
  });

  it("will not encode schema-invalid content", () => {
    expect(() =>
      encodeSnapshot({ family: {}, events: [] } as unknown as InvitationContent)
    ).toThrow();
  });
});

describe("filesystem snapshot store", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "snap-"));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("round-trips content through the filesystem", async () => {
    await expectRoundTrip(createFileSnapshotStore(dir));
  });

  it("preserves the snapshot across a cold start (fresh store instance over the same dir)", async () => {
    await publishSnapshot(createFileSnapshotStore(dir), fixtureContent);
    // A brand-new store in the same directory models a fresh instance/cold start.
    const restored = await readSnapshot(createFileSnapshotStore(dir));
    expect(restored?.family.groomName.en).toBe("Khushal");
  });

  it("returns null when no snapshot has been published yet", async () => {
    expect(await readSnapshot(createFileSnapshotStore(dir))).toBeNull();
  });
});

describe("upstash snapshot store", () => {
  const makeStore = () =>
    createUpstashSnapshotStore({
      url: "https://example.upstash.io",
      token: "test-token",
    });

  it("round-trips content through the KV REST API", async () => {
    const store = makeStore();
    // Mock fetch: SET records the key→value; GET returns the stored value.
    const captured: Record<string, string> = {};
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const segments = new URL(String(input)).pathname.split("/").filter(Boolean);
        const [command, key, value] = segments;
        expect(command).toBeTruthy();
        expect(key).toBeTruthy();
        if (command === "get") {
          return new Response(JSON.stringify({ result: captured[key ?? ""] ?? null }), {
            status: 200,
          });
        }
        if (command === "set") {
          captured[key ?? ""] = value ?? "";
          return new Response(JSON.stringify({ result: key ?? "" }), { status: 200 });
        }
        throw new Error("unexpected upstash url");
      })
    );

    await expectRoundTrip(store);
  });
});
