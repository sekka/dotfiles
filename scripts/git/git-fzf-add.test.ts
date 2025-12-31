/**
 * git-fzf-add.ts のテスト
 *
 * 実行方法: bun test scripts/git/git-fzf-add.test.ts
 */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { $ } from "bun";

import { createTempDir, createTempGitRepo, cleanupTempDir } from "../__tests__/test-helpers";
import { getChangedFiles, isGitRepository, stageFiles } from "./git-fzf-add";

describe("git-fzf-add", () => {
	let tempDir: string;
	let originalCwd: string;

	// テスト用の一時gitリポジトリを作成
	beforeAll(async () => {
		originalCwd = process.cwd();
		tempDir = await createTempGitRepo("git-fzf-add-test-");
		process.chdir(tempDir);

		// 初期コミットを作成
		await writeFile(join(tempDir, "initial.txt"), "initial content");
		await $`git add initial.txt`.quiet();
		await $`git commit -m "Initial commit"`.quiet();
	});

	afterAll(async () => {
		process.chdir(originalCwd);
		await cleanupTempDir(tempDir);
	});

	// 各テスト前に作業ディレクトリをクリーンにする
	beforeEach(async () => {
		await $`git checkout -- .`.quiet().nothrow();
		await $`git clean -fd`.quiet().nothrow();
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

	describe("getChangedFiles", () => {
		it("変更がない場合は空配列を返す", async () => {
			const files = await getChangedFiles();
			expect(files).toEqual([]);
		});

		it("変更されたファイルの一覧を返す", async () => {
			// ファイルを変更
			await writeFile(join(tempDir, "initial.txt"), "modified content");

			const files = await getChangedFiles();
			expect(files).toContain("initial.txt");
		});

		it("新規ファイル（untracked）は含まない", async () => {
			// 新規ファイルを作成（git addしていない）
			await writeFile(join(tempDir, "new-file.txt"), "new content");

			const files = await getChangedFiles();
			expect(files).not.toContain("new-file.txt");
		});

		it("複数の変更ファイルを返す", async () => {
			// 複数ファイルを作成してコミット
			await writeFile(join(tempDir, "file1.txt"), "content1");
			await writeFile(join(tempDir, "file2.txt"), "content2");
			await $`git add file1.txt file2.txt`.quiet();
			await $`git commit -m "Add files"`.quiet();

			// ファイルを変更
			await writeFile(join(tempDir, "file1.txt"), "modified1");
			await writeFile(join(tempDir, "file2.txt"), "modified2");

			const files = await getChangedFiles();
			expect(files).toContain("file1.txt");
			expect(files).toContain("file2.txt");
			expect(files.length).toBe(2);
		});

		it("スペースを含むファイル名も正しく処理する", async () => {
			const fileName = "file with spaces.txt";
			await writeFile(join(tempDir, fileName), "content");
			await $`git add ${fileName}`.quiet();
			await $`git commit -m "Add file with spaces"`.quiet();

			// ファイルを変更
			await writeFile(join(tempDir, fileName), "modified");

			const files = await getChangedFiles();
			expect(files).toContain(fileName);
		});
	});

	describe("stageFiles", () => {
		it("空配列の場合はfalseを返す", async () => {
			const result = await stageFiles([]);
			expect(result).toBe(false);
		});

		it("ファイルを正しくステージングする", async () => {
			// ファイルを変更
			await writeFile(join(tempDir, "initial.txt"), "modified content");

			const result = await stageFiles(["initial.txt"]);
			expect(result).toBe(true);

			// ステージされたことを確認
			const staged = await $`git diff --cached --name-only`.quiet();
			expect(staged.stdout.toString()).toContain("initial.txt");
		});

		it("複数ファイルをステージングする", async () => {
			// 複数ファイルを作成してコミット
			await writeFile(join(tempDir, "a.txt"), "a");
			await writeFile(join(tempDir, "b.txt"), "b");
			await $`git add a.txt b.txt`.quiet();
			await $`git commit -m "Add a and b"`.quiet();

			// ファイルを変更
			await writeFile(join(tempDir, "a.txt"), "modified a");
			await writeFile(join(tempDir, "b.txt"), "modified b");

			const result = await stageFiles(["a.txt", "b.txt"]);
			expect(result).toBe(true);

			// ステージされたことを確認
			const staged = await $`git diff --cached --name-only`.quiet();
			const stagedFiles = staged.stdout.toString().trim().split("\n");
			expect(stagedFiles).toContain("a.txt");
			expect(stagedFiles).toContain("b.txt");
		});

		it("存在しないファイルをステージしようとするとfalseを返す", async () => {
			const result = await stageFiles(["nonexistent.txt"]);
			expect(result).toBe(false);
		});
	});
});
