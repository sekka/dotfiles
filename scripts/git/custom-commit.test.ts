/**
 * custom-commit.ts のテスト
 */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { $ } from "bun";

import { appendTokyoTimezone, commitWithCustomDate, parseArgs } from "./custom-commit";

describe("custom-commit", () => {
	let tempDir: string;
	let originalCwd: string;

	beforeAll(async () => {
		originalCwd = process.cwd();
		tempDir = await mkdtemp(join(tmpdir(), "custom-commit-test-"));
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

	describe("appendTokyoTimezone", () => {
		it("タイムゾーンがない場合は+0900を追加する", () => {
			const result = appendTokyoTimezone("2024-01-01 10:00:00");
			expect(result).toBe("2024-01-01 10:00:00 +0900");
		});

		it("+のタイムゾーンがある場合はそのまま返す", () => {
			const result = appendTokyoTimezone("2024-01-01 10:00:00 +0000");
			expect(result).toBe("2024-01-01 10:00:00 +0000");
		});

		it("-のタイムゾーンがある場合はそのまま返す", () => {
			const result = appendTokyoTimezone("2024-01-01 10:00:00 -0500");
			expect(result).toBe("2024-01-01 10:00:00 -0500");
		});

		it("日付のみの場合もタイムゾーンを追加する", () => {
			const result = appendTokyoTimezone("2024-01-01");
			expect(result).toBe("2024-01-01 +0900");
		});
	});

	describe("parseArgs", () => {
		it("2引数の場合は同じ日付を両方に使う", () => {
			const result = parseArgs(["2024-01-01 10:00:00", "feat: Add feature"]);
			expect(result).toEqual({
				authorDate: "2024-01-01 10:00:00 +0900",
				committerDate: "2024-01-01 10:00:00 +0900",
				message: "feat: Add feature",
			});
		});

		it("3引数の場合は別々の日付を使う", () => {
			const result = parseArgs(["2024-01-01 10:00:00", "2024-01-01 10:05:00", "feat: Add feature"]);
			expect(result).toEqual({
				authorDate: "2024-01-01 10:00:00 +0900",
				committerDate: "2024-01-01 10:05:00 +0900",
				message: "feat: Add feature",
			});
		});

		it("引数が1つの場合はnullを返す", () => {
			const result = parseArgs(["2024-01-01"]);
			expect(result).toBeNull();
		});

		it("引数が4つ以上の場合はnullを返す", () => {
			const result = parseArgs(["a", "b", "c", "d"]);
			expect(result).toBeNull();
		});

		it("引数が0個の場合はnullを返す", () => {
			const result = parseArgs([]);
			expect(result).toBeNull();
		});
	});

	describe("commitWithCustomDate", () => {
		it("カスタム日時でコミットできる", async () => {
			const success = await commitWithCustomDate(
				"2024-06-15 12:00:00 +0900",
				"2024-06-15 12:00:00 +0900",
				"test: Custom date commit",
			);
			expect(success).toBe(true);

			// コミットログを確認
			const log = await $`git log -1 --format=%s`.text();
			expect(log.trim()).toBe("test: Custom date commit");
		});

		it("著者日時とコミッター日時を別々に設定できる", async () => {
			const success = await commitWithCustomDate(
				"2024-01-01 10:00:00 +0900",
				"2024-01-01 12:00:00 +0900",
				"test: Different dates",
			);
			expect(success).toBe(true);

			// 著者日時を確認
			const authorDate = await $`git log -1 --format=%ai`.text();
			expect(authorDate.trim()).toContain("2024-01-01");

			// コミッター日時を確認
			const committerDate = await $`git log -1 --format=%ci`.text();
			expect(committerDate.trim()).toContain("2024-01-01");
		});

		it("ステージされたファイルがない場合は失敗する", async () => {
			// ステージをリセット
			await $`git reset HEAD`.quiet().nothrow();

			const success = await commitWithCustomDate(
				"2024-01-01 10:00:00 +0900",
				"2024-01-01 10:00:00 +0900",
				"test: No staged files",
			);
			expect(success).toBe(false);
		});
	});
});
