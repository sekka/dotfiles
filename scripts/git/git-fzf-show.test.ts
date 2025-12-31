/**
 * git-fzf-show.ts のテスト
 */

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { $ } from "bun";

import { getCommitLog, isGitRepository } from "./git-fzf-show";
import { createTempGitRepo, createTempDir, cleanupTempDir } from "../__tests__/test-helpers";

describe("git-fzf-show", () => {
	let tempDir: string;
	let originalCwd: string;

	beforeAll(async () => {
		originalCwd = process.cwd();
		tempDir = await createTempGitRepo("git-fzf-show-test-");
		process.chdir(tempDir);

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
		await cleanupTempDir(tempDir);
	});

	describe("isGitRepository", () => {
		it("gitリポジトリ内ではtrueを返す", async () => {
			const result = await isGitRepository();
			expect(result).toBe(true);
		});

		it("gitリポジトリ外ではfalseを返す", async () => {
			const nonGitDir = await createTempDir("non-git-");
			const currentCwd = process.cwd();

			try {
				process.chdir(nonGitDir);
				const result = await isGitRepository();
				expect(result).toBe(false);
			} finally {
				process.chdir(currentCwd);
				await cleanupTempDir(nonGitDir);
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
