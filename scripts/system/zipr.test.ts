import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { parseArgs, zipDirectory } from "./zipr";

describe("zipr", () => {
  describe("parseArgs", () => {
    test("ディレクトリ名を指定した場合", () => {
      const result = parseArgs(["my-folder"]);
      expect(result).toBe("my-folder");
    });

    test("パス付きディレクトリ名を指定した場合", () => {
      const result = parseArgs(["/path/to/my-folder"]);
      expect(result).toBe("/path/to/my-folder");
    });

    test("引数なしの場合はnullを返す", () => {
      const result = parseArgs([]);
      expect(result).toBeNull();
    });

    test("引数が2つ以上の場合はnullを返す", () => {
      const result = parseArgs(["dir1", "dir2"]);
      expect(result).toBeNull();
    });
  });

  describe("zipDirectory", () => {
    let testDir: string;

    beforeEach(() => {
      testDir = join(tmpdir(), `zipr-test-${Date.now()}`);
      mkdirSync(testDir, { recursive: true });
    });

    afterEach(() => {
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true, force: true });
      }
    });

    test("存在しないディレクトリの場合はfalseを返す", async () => {
      const result = await zipDirectory(join(testDir, "nonexistent"));
      expect(result).toBe(false);
    });

    test("ファイルを指定した場合はfalseを返す", async () => {
      const testFile = join(testDir, "test.txt");
      writeFileSync(testFile, "content");

      const result = await zipDirectory(testFile);
      expect(result).toBe(false);
    });

    test("ディレクトリをZIP圧縮できる", async () => {
      const targetDir = join(testDir, "target");
      mkdirSync(targetDir, { recursive: true });
      writeFileSync(join(targetDir, "file.txt"), "content");

      // カレントディレクトリを変更して実行
      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        const result = await zipDirectory("target");
        expect(result).toBe(true);

        // ZIPファイルが作成されていることを確認
        expect(existsSync(join(testDir, "target.zip"))).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});
