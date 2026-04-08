import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseArgs, takeSnapshot } from "./snapshot-before";
import { createTempDir, cleanupTempDir } from "../__tests__/test-helpers";

describe("snapshot-before", () => {
  describe("parseArgs", () => {
    test("引数なしの場合はデフォルトディレクトリを返す", () => {
      const result = parseArgs([]);
      expect(result).toEqual({
        outputDir: join(process.env.HOME ?? "", ".dotfiles-macos-snapshots"),
      });
    });

    test("--output-dir を指定した場合はそのディレクトリを返す", () => {
      const result = parseArgs(["--output-dir", "/tmp/test-snapshots"]);
      expect(result).toEqual({
        outputDir: "/tmp/test-snapshots",
      });
    });
  });

  describe("takeSnapshot", () => {
    let testDir: string;

    beforeEach(async () => {
      testDir = await createTempDir("snapshot-before-test-");
    });

    afterEach(async () => {
      if (existsSync(testDir)) {
        await cleanupTempDir(testDir);
      }
    });

    test("スナップショットディレクトリが存在しない場合でも作成される", async () => {
      const snapshotDir = join(testDir, "snapshots");
      const result = await takeSnapshot(snapshotDir);

      expect(result).toBe(true);
      expect(existsSync(snapshotDir)).toBe(true);
    });

    test("before_ プレフィックスを持つファイルが作成される", async () => {
      const result = await takeSnapshot(testDir);

      expect(result).toBe(true);

      const files = readdirSync(testDir);
      const beforeFiles = files.filter((f) => f.startsWith("before_") && f.endsWith(".txt"));
      expect(beforeFiles.length).toBe(1);
    });

    test("スナップショットファイルに内容が含まれている", async () => {
      const result = await takeSnapshot(testDir);

      expect(result).toBe(true);

      const files = readdirSync(testDir);
      const beforeFile = files.find((f) => f.startsWith("before_") && f.endsWith(".txt"));
      expect(beforeFile).toBeDefined();

      const size = Bun.file(join(testDir, beforeFile!)).size;
      expect(size).toBeGreaterThan(0);
    });
  });
});
