/**
 * custom-commit-date.ts のテスト
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { $ } from "bun";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { parseArgs, commitWithDate } from "./custom-commit-date";

describe("custom-commit-date", () => {
  let tempDir: string;
  let originalCwd: string;

  beforeAll(async () => {
    originalCwd = process.cwd();
    tempDir = await mkdtemp(join(tmpdir(), "custom-commit-date-test-"));
    process.chdir(tempDir);

    // gitリポジトリを初期化
    await $`git init`.quiet();
    await $`git config user.email "test@example.com"`.quiet();
    await $`git config user.name "Test User"`.quiet();

    // 初期コミット
    await writeFile(join(tempDir, "README.md"), "# Test");
    await $`git add README.md`.quiet();
    await $`git commit -m "Initial commit"`.quiet();
  });

  afterAll(async () => {
    process.chdir(originalCwd);
    await rm(tempDir, { recursive: true, force: true });
  });

  beforeEach(async () => {
    // 各テスト前にファイルを追加してステージング
    const filename = `file-${Date.now()}.txt`;
    await writeFile(join(tempDir, filename), "content");
    await $`git add ${filename}`.quiet();
  });

  describe("parseArgs", () => {
    it("2引数の場合は通常モード", () => {
      const result = parseArgs(["2023-01-01 12:30:00", "feat: Add feature"]);
      expect(result).toEqual({
        committerDateNow: false,
        date: "2023-01-01 12:30:00",
        message: "feat: Add feature",
      });
    });

    it("--committer-date-now オプション付き3引数", () => {
      const result = parseArgs([
        "--committer-date-now",
        "2023-01-01 12:30:00",
        "feat: Add feature",
      ]);
      expect(result).toEqual({
        committerDateNow: true,
        date: "2023-01-01 12:30:00",
        message: "feat: Add feature",
      });
    });

    it("引数が0個の場合はnullを返す", () => {
      const result = parseArgs([]);
      expect(result).toBeNull();
    });

    it("引数が1個の場合はnullを返す", () => {
      const result = parseArgs(["2023-01-01"]);
      expect(result).toBeNull();
    });

    it("--committer-date-now で引数が2個の場合はnullを返す", () => {
      const result = parseArgs(["--committer-date-now", "2023-01-01"]);
      expect(result).toBeNull();
    });

    it("通常モードで引数が3個の場合はnullを返す", () => {
      const result = parseArgs(["2023-01-01", "message", "extra"]);
      expect(result).toBeNull();
    });
  });

  describe("commitWithDate", () => {
    it("通常モードでコミットできる", async () => {
      const success = await commitWithDate(
        "2023-06-15 12:00:00",
        "test: Normal mode commit",
        false
      );
      expect(success).toBe(true);

      // コミットログを確認
      const log = await $`git log -1 --format=%s`.text();
      expect(log.trim()).toBe("test: Normal mode commit");

      // 著者日時を確認
      const authorDate = await $`git log -1 --format=%ai`.text();
      expect(authorDate.trim()).toContain("2023-06-15");
    });

    it("--committer-date-now モードでコミットできる", async () => {
      const success = await commitWithDate(
        "2020-01-01 09:00:00",
        "test: Committer date now",
        true
      );
      expect(success).toBe(true);

      // 著者日時を確認（過去の日付）
      const authorDate = await $`git log -1 --format=%ai`.text();
      expect(authorDate.trim()).toContain("2020-01-01");

      // コミッター日時は現在時刻に近いはず（2020年ではない）
      const committerDate = await $`git log -1 --format=%ci`.text();
      expect(committerDate.trim()).not.toContain("2020-01-01");
    });

    it("ステージされたファイルがない場合は失敗する", async () => {
      // ステージをリセット
      await $`git reset HEAD`.quiet().nothrow();

      const success = await commitWithDate(
        "2023-01-01 12:00:00",
        "test: No staged files",
        false
      );
      expect(success).toBe(false);
    });
  });
});
