import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { readJson, sessionDir, writeJson } from "../lib/session-state";
import { WARN_THRESHOLD } from "../edit-counter-hook";

const SESSION = `test-edit-counter-${Date.now()}`;
let dir: string;
let stateFile: string;

beforeEach(() => {
  dir = sessionDir(`${SESSION}-${Math.random()}`);
  stateFile = join(dir, "edit-counts.json");
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("WARN_THRESHOLD", () => {
  test("3 である", () => {
    expect(WARN_THRESHOLD).toBe(3);
  });
});

describe("edit-counts.json の操作", () => {
  test("初回アクセス時は 0 から始まる", () => {
    const counts = readJson<Record<string, number>>(stateFile, {});
    expect(counts["/tmp/foo.ts"]).toBeUndefined();
    const updated = { ...counts, "/tmp/foo.ts": (counts["/tmp/foo.ts"] ?? 0) + 1 };
    expect(updated["/tmp/foo.ts"]).toBe(1);
  });

  test("複数のファイルを独立してカウントする", () => {
    const counts: Record<string, number> = {};
    counts["/tmp/a.ts"] = (counts["/tmp/a.ts"] ?? 0) + 1;
    counts["/tmp/b.ts"] = (counts["/tmp/b.ts"] ?? 0) + 1;
    counts["/tmp/a.ts"] = (counts["/tmp/a.ts"] ?? 0) + 1;
    writeJson(stateFile, counts);
    const loaded = readJson<Record<string, number>>(stateFile, {});
    expect(loaded["/tmp/a.ts"]).toBe(2);
    expect(loaded["/tmp/b.ts"]).toBe(1);
  });

  test(`${WARN_THRESHOLD} 回目に達したら警告条件を満たす`, () => {
    const counts: Record<string, number> = { "/tmp/test.ts": WARN_THRESHOLD - 1 };
    counts["/tmp/test.ts"] = (counts["/tmp/test.ts"] ?? 0) + 1;
    expect(counts["/tmp/test.ts"] >= WARN_THRESHOLD).toBe(true);
  });

  test(`${WARN_THRESHOLD - 1} 回では警告条件を満たさない`, () => {
    const counts: Record<string, number> = { "/tmp/test.ts": WARN_THRESHOLD - 2 };
    counts["/tmp/test.ts"] = (counts["/tmp/test.ts"] ?? 0) + 1;
    expect(counts["/tmp/test.ts"] >= WARN_THRESHOLD).toBe(false);
  });
});
