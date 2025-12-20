/**
 * worktree-remove.ts のテスト
 */

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { $ } from "bun";

import {
	getGhqRoot,
	getMainRepoPath,
	removeWorktree,
	resolvePath,
} from "./worktree-remove";

describe("worktree-remove", () => {
	let tempDir: string;
	let mainRepoPath: string;
	let worktreePath: string;
	let originalCwd: string;

	beforeAll(async () => {
		originalCwd = process.cwd();
		tempDir = await mkdtemp(join(tmpdir(), "worktree-remove-test-"));

		// メインリポジトリを作成
		mainRepoPath = join(tempDir, "main-repo");
		await mkdir(mainRepoPath);
		process.chdir(mainRepoPath);

		await $`git init`.quiet();
		await $`git config user.email "test@example.com"`.quiet();
		await $`git config user.name "Test User"`.quiet();

		// 初期コミット
		await writeFile(join(mainRepoPath, "README.md"), "# Main Repo");
		await $`git add README.md`.quiet();
		await $`git commit -m "Initial commit"`.quiet();

		// worktreeを作成
		worktreePath = join(tempDir, "worktree-branch");
		await $`git worktree add ${worktreePath} -b test-branch`.quiet();
	});

	afterAll(async () => {
		process.chdir(originalCwd);
		await rm(tempDir, { recursive: true, force: true });
	});

	describe("getGhqRoot", () => {
		it("ghqがインストールされている場合はルートパスを返す", async () => {
			const result = await getGhqRoot();
			// ghqがインストールされていれば文字列、なければnull
			if (result !== null) {
				expect(typeof result).toBe("string");
				expect(result.length).toBeGreaterThan(0);
			} else {
				expect(result).toBeNull();
			}
		});
	});

	describe("resolvePath", () => {
		it("絶対パスはそのまま返す", async () => {
			const result = await resolvePath("/home/user/project");
			expect(result).toBe("/home/user/project");
		});

		it("相対パス（.で始まる）を解決する", async () => {
			const result = await resolvePath("./subdir");
			expect(result).toContain("subdir");
			expect(result.startsWith("/")).toBe(true);
		});

		it("相対パス（..で始まる）を解決する", async () => {
			const result = await resolvePath("../parent");
			expect(result).toContain("parent");
			expect(result.startsWith("/")).toBe(true);
		});
	});

	describe("getMainRepoPath", () => {
		it("worktreeからメインリポジトリのパスを取得できる", async () => {
			const result = getMainRepoPath(worktreePath);
			// macOSでは /var が /private/var へのシンボリックリンクなので
			// 両方のパスを実パスに変換して比較する
			const resolvedResult = result ? await realpath(result) : null;
			const resolvedMainRepo = await realpath(mainRepoPath);
			expect(resolvedResult).toBe(resolvedMainRepo);
		});

		it("通常のリポジトリではnullを返す", () => {
			const result = getMainRepoPath(mainRepoPath);
			expect(result).toBeNull();
		});

		it("存在しないパスではnullを返す", () => {
			const result = getMainRepoPath("/nonexistent/path");
			expect(result).toBeNull();
		});
	});

	describe("removeWorktree", () => {
		it("存在しないディレクトリではfalseを返す", async () => {
			const result = await removeWorktree("/nonexistent/path");
			expect(result).toBe(false);
		});

		it("通常のリポジトリ（worktreeではない）ではfalseを返す", async () => {
			const result = await removeWorktree(mainRepoPath);
			expect(result).toBe(false);
		});

		it("worktreeを削除できる", async () => {
			// 新しいworktreeを作成
			const newWorktreePath = join(tempDir, "worktree-to-remove");
			process.chdir(mainRepoPath);
			await $`git worktree add ${newWorktreePath} -b branch-to-remove`.quiet();

			// worktreeが存在することを確認
			expect(existsSync(newWorktreePath)).toBe(true);

			// 削除
			const result = await removeWorktree(newWorktreePath);
			expect(result).toBe(true);

			// 削除されたことを確認
			expect(existsSync(newWorktreePath)).toBe(false);
		});
	});
});
