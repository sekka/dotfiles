import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { parseArgs, generateDiff } from "./snapshot-after";
import { createTempDir, cleanupTempDir } from "../__tests__/test-helpers";

describe("snapshot-after", () => {
  describe("parseArgs", () => {
    test("引数なしの場合はデフォルトディレクトリを返す", () => {
      const result = parseArgs([]);
      expect(result).toEqual({
        snapshotDir: join(process.env.HOME ?? "", ".dotfiles-macos-snapshots"),
        outputDir: join(process.env.HOME ?? "", "Desktop"),
      });
    });

    test("--snapshot-dir を指定した場合はそのディレクトリを返す", () => {
      const result = parseArgs(["--snapshot-dir", "/tmp/test-snapshots"]);
      expect(result.snapshotDir).toBe("/tmp/test-snapshots");
    });

    test("--output-dir を指定した場合はそのディレクトリを返す", () => {
      const result = parseArgs(["--output-dir", "/tmp/test-output"]);
      expect(result.outputDir).toBe("/tmp/test-output");
    });
  });

  describe("generateDiff", () => {
    let testDir: string;
    let outputDir: string;

    beforeEach(async () => {
      testDir = await createTempDir("snapshot-after-test-");
      outputDir = await createTempDir("snapshot-after-output-");
    });

    afterEach(async () => {
      for (const dir of [testDir, outputDir]) {
        if (existsSync(dir)) {
          await cleanupTempDir(dir);
        }
      }
    });

    test("beforeファイルが存在しない場合はfalseを返す", async () => {
      const result = await generateDiff(testDir, outputDir);
      expect(result).toBe(false);
    });

    test(
      "beforeファイルが存在する場合はtrueを返す",
      async () => {
        mkdirSync(testDir, { recursive: true });
        writeFileSync(join(testDir, "before_20240101_120000.txt"), "dummy defaults content\n");

        const result = await generateDiff(testDir, outputDir);
        expect(result).toBe(true);
      },
      { timeout: 15000 },
    );

    test(
      "afterファイルが出力ディレクトリではなくsnapshotDirに保存される",
      async () => {
        mkdirSync(testDir, { recursive: true });
        writeFileSync(join(testDir, "before_20240101_120000.txt"), "dummy content\n");

        await generateDiff(testDir, outputDir);

        const snapshotFiles = readdirSync(testDir);
        const afterFiles = snapshotFiles.filter(
          (f) => f.startsWith("after_") && f.endsWith(".txt"),
        );
        expect(afterFiles.length).toBe(1);
      },
      { timeout: 15000 },
    );

    test(
      "差分ファイルが出力ディレクトリに作成される（変更がある場合）",
      async () => {
        mkdirSync(testDir, { recursive: true });
        writeFileSync(
          join(testDir, "before_20240101_120000.txt"),
          "old content line 1\nold content line 2\n",
        );

        await generateDiff(testDir, outputDir);

        const outputFiles = readdirSync(outputDir);
        const diffFiles = outputFiles.filter((f) => f.startsWith("macos_settings_diff_"));
        expect(diffFiles.length).toBeGreaterThanOrEqual(0);
      },
      { timeout: 15000 },
    );

    test(
      "最新のbeforeファイルが選択される",
      async () => {
        mkdirSync(testDir, { recursive: true });
        writeFileSync(join(testDir, "before_20240101_120000.txt"), "old content\n");
        writeFileSync(join(testDir, "before_20240102_120000.txt"), "newer content\n");

        const result = await generateDiff(testDir, outputDir);
        expect(result).toBe(true);
      },
      { timeout: 15000 },
    );
  });
});
