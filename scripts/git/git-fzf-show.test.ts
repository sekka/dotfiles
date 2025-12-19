/**
 * git-fzf-show.ts のテスト
 */

import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { $ } from "bun";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { isGitRepository, getCommitLog } from "./git-fzf-show";

describe("git-fzf-show", () => {
  let tempDir: string;
  let originalCwd: string;

  beforeAll(async () => {
    originalCwd = process.cwd();
    tempDir = await mkdtemp(join(tmpdir(), "git-fzf-show-test-"));
    process.chdir(tempDir);

    // gitリポジトリを初期化
    await $`git init`.quiet();
    await $`git config user.email "test@example.com"`.quiet();
    await $`git config user.name "Test User"`.quiet();

    // 複数のコミットを作成
    await writeFile(join(tempDir, "file1.txt"), "content1");
    await $`git add file1.txt`.quiet();
    await $`git commit -m "First commit"`.quiet();

    await writeFile(join(tempDir, "file2.txt"), "content2");
    await $`git add file2.txt`.quiet();
    await $`git commit -m "Second commit"`.quiet();
  });

  afterAll(async () => {
    process.chdir(originalCwd);
    await rm(tempDir, { recursive: true, force: true });
  });

  describe("isGitRepository", () => {
    it("gitリポジトリ内ではtrueを返す", async () => {
      const result = await isGitRepository();
      expect(result).toBe(true);
    });

    it("gitリポジトリ外ではfalseを返す", async () => {
      const nonGitDir = await mkdtemp(join(tmpdir(), "non-git-"));
      const currentCwd = process.cwd();

      try {
        process.chdir(nonGitDir);
        const result = await isGitRepository();
        expect(result).toBe(false);
      } finally {
        process.chdir(currentCwd);
        await rm(nonGitDir, { recursive: true, force: true });
      }
    });
  });

  describe("getCommitLog", () => {
    it("コミットログを取得できる", async () => {
      const log = await getCommitLog();
      expect(log).toContain("First commit");
      expect(log).toContain("Second commit");
    });

    it("--allオプションを渡せる", async () => {
      const log = await getCommitLog(["--all"]);
      expect(log.length).toBeGreaterThan(0);
    });

    it("-nオプションでコミット数を制限できる", async () => {
      const log = await getCommitLog(["-n", "1"]);
      expect(log).toContain("Second commit");
      expect(log).not.toContain("First commit");
    });
  });
});
