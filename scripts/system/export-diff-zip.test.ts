import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { $ } from "bun";
import { mkdirSync, rmSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { parseArgs, getDiffFiles } from "./export-diff-zip";

describe("export-diff-zip", () => {
  describe("parseArgs", () => {
    test("コミット1のみを指定した場合", () => {
      const result = parseArgs(["HEAD~3"]);
      expect(result).toEqual({
        ref1: "HEAD",
        ref2: "HEAD~3",
      });
    });

    test("コミット1と2を指定した場合", () => {
      const result = parseArgs(["abc123", "def456"]);
      expect(result).toEqual({
        ref1: "abc123",
        ref2: "def456",
      });
    });

    test("引数なしの場合はnullを返す", () => {
      const result = parseArgs([]);
      expect(result).toBeNull();
    });

    test("引数が3つ以上の場合はnullを返す", () => {
      const result = parseArgs(["ref1", "ref2", "ref3"]);
      expect(result).toBeNull();
    });
  });

  describe("getDiffFiles", () => {
    let testDir: string;

    beforeEach(async () => {
      testDir = join(tmpdir(), `export-diff-zip-test-${Date.now()}`);
      mkdirSync(testDir, { recursive: true });

      // テスト用のGitリポジトリを作成
      await $`git init ${testDir}`.quiet();
      await $`git -C ${testDir} config user.email "test@example.com"`.quiet();
      await $`git -C ${testDir} config user.name "Test User"`.quiet();
    });

    afterEach(() => {
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true, force: true });
      }
    });

    test("差分ファイルを取得できる", async () => {
      // 初期コミットを作成
      writeFileSync(join(testDir, "file1.txt"), "content1");
      await $`git -C ${testDir} add .`.quiet();
      await $`git -C ${testDir} commit -m "Initial commit"`.quiet();

      // 2つ目のコミットを作成
      writeFileSync(join(testDir, "file2.txt"), "content2");
      writeFileSync(join(testDir, "file1.txt"), "updated content1");
      await $`git -C ${testDir} add .`.quiet();
      await $`git -C ${testDir} commit -m "Second commit"`.quiet();

      // カレントディレクトリを変更して実行
      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        const files = await getDiffFiles("HEAD", "HEAD~1");
        expect(files.sort()).toEqual(["file1.txt", "file2.txt"]);
      } finally {
        process.chdir(originalCwd);
      }
    });

    test("差分がない場合は空配列を返す", async () => {
      // 初期コミットを作成
      writeFileSync(join(testDir, "file1.txt"), "content1");
      await $`git -C ${testDir} add .`.quiet();
      await $`git -C ${testDir} commit -m "Initial commit"`.quiet();

      // カレントディレクトリを変更して実行
      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        const files = await getDiffFiles("HEAD", "HEAD");
        expect(files).toEqual([]);
      } finally {
        process.chdir(originalCwd);
      }
    });

    test("無効なリファレンスの場合は空配列を返す", async () => {
      // 初期コミットを作成
      writeFileSync(join(testDir, "file1.txt"), "content1");
      await $`git -C ${testDir} add .`.quiet();
      await $`git -C ${testDir} commit -m "Initial commit"`.quiet();

      // カレントディレクトリを変更して実行
      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        const files = await getDiffFiles("HEAD", "nonexistent-ref");
        expect(files).toEqual([]);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});
