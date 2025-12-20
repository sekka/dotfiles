/**
 * rewrite-commit-date.ts のテスト
 */

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { $ } from "bun";

import {
	isWorkingDirectoryClean,
	parseArgs,
	resolveCommitHash,
} from "./rewrite-commit-date";

describe("rewrite-commit-date", () => {
	let tempDir: string;
	let originalCwd: string;

	beforeAll(async () => {
		originalCwd = process.cwd();
		tempDir = await mkdtemp(join(tmpdir(), "rewrite-commit-date-test-"));
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

	describe("parseArgs", () => {
		it("2引数の場合は通常モード", () => {
			const result = parseArgs(["abc123", "2024-01-01 10:30:00"]);
			expect(result).toEqual({
				committerDateNow: false,
				commitHash: "abc123",
				newDate: "2024-01-01 10:30:00",
			});
		});

		it("--committer-date-now オプション付き3引数", () => {
			const result = parseArgs([
				"--committer-date-now",
				"abc123",
				"2024-01-01 10:30:00",
			]);
			expect(result).toEqual({
				committerDateNow: true,
				commitHash: "abc123",
				newDate: "2024-01-01 10:30:00",
			});
		});

		it("引数が0個の場合はnullを返す", () => {
			const result = parseArgs([]);
			expect(result).toBeNull();
		});

		it("引数が1個の場合はnullを返す", () => {
			const result = parseArgs(["abc123"]);
			expect(result).toBeNull();
		});

		it("--committer-date-now で引数が2個の場合はnullを返す", () => {
			const result = parseArgs(["--committer-date-now", "abc123"]);
			expect(result).toBeNull();
		});

		it("通常モードで引数が3個の場合はnullを返す", () => {
			const result = parseArgs(["abc123", "2024-01-01", "extra"]);
			expect(result).toBeNull();
		});
	});

	describe("isWorkingDirectoryClean", () => {
		it("クリーンな状態ではtrueを返す", async () => {
			const result = await isWorkingDirectoryClean();
			expect(result).toBe(true);
		});

		it("未コミットの変更がある場合はfalseを返す", async () => {
			// ファイルを変更
			await writeFile(join(tempDir, "README.md"), "# Modified");

			const result = await isWorkingDirectoryClean();
			expect(result).toBe(false);

			// 元に戻す
			await $`git checkout README.md`.quiet();
		});

		it("未追跡のファイルがある場合はfalseを返す", async () => {
			// 新しいファイルを作成
			await writeFile(join(tempDir, "untracked.txt"), "untracked");

			const result = await isWorkingDirectoryClean();
			expect(result).toBe(false);

			// クリーンアップ
			await rm(join(tempDir, "untracked.txt"));
		});
	});

	describe("resolveCommitHash", () => {
		it("HEADを解決できる", async () => {
			const result = await resolveCommitHash("HEAD");
			expect(result).not.toBeNull();
			expect(result?.length).toBe(40); // フルハッシュは40文字
		});

		it("存在しないコミットではnullを返す", async () => {
			const result = await resolveCommitHash("nonexistent123456");
			expect(result).toBeNull();
		});
	});

	// 注意: rewriteCommitDate は git filter-branch を実行するため、
	// 実際の履歴書き換えテストは別途慎重に行うべき
	// ここでは引数パースと事前チェックのみをテスト
});
