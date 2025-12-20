/**
 * git-diff-archive.ts のテスト
 */

import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "bun:test";
import { existsSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { $ } from "bun";

import {
	createArchive,
	getDiffFiles,
	isGitRepository,
	parseArgs,
} from "./git-diff-archive";

describe("git-diff-archive", () => {
	let tempDir: string;
	let originalCwd: string;

	beforeAll(async () => {
		originalCwd = process.cwd();
		tempDir = await mkdtemp(join(tmpdir(), "git-diff-archive-test-"));
		process.chdir(tempDir);

		// gitリポジトリを初期化
		await $`git init`.quiet();
		await $`git config user.email "test@example.com"`.quiet();
		await $`git config user.name "Test User"`.quiet();

		// 初期コミット
		await writeFile(join(tempDir, "file1.txt"), "content1");
		await $`git add file1.txt`.quiet();
		await $`git commit -m "First commit"`.quiet();

		// 2番目のコミット
		await writeFile(join(tempDir, "file2.txt"), "content2");
		await $`git add file2.txt`.quiet();
		await $`git commit -m "Second commit"`.quiet();

		// 3番目のコミット
		await writeFile(join(tempDir, "file3.txt"), "content3");
		await $`git add file3.txt`.quiet();
		await $`git commit -m "Third commit"`.quiet();
	});

	afterAll(async () => {
		process.chdir(originalCwd);
		await rm(tempDir, { recursive: true, force: true });
	});

	beforeEach(async () => {
		// archive.zipがあれば削除
		try {
			await rm(join(tempDir, "archive.zip"));
		} catch {
			// ファイルが存在しない場合は無視
		}
	});

	describe("isGitRepository", () => {
		it("gitリポジトリ内ではtrueを返す", async () => {
			const result = await isGitRepository();
			expect(result).toBe(true);
		});
	});

	describe("parseArgs", () => {
		it("引数なしの場合はHEAD~1からHEADまで", () => {
			const result = parseArgs([]);
			expect(result).toEqual({ headRef: "HEAD", fromRef: "HEAD~1" });
		});

		it("数値1つの場合はHEAD~Nとして扱う", () => {
			const result = parseArgs(["3"]);
			expect(result).toEqual({ headRef: "HEAD", fromRef: "HEAD~3" });
		});

		it("コミットハッシュ1つの場合はそこからHEADまで", () => {
			const result = parseArgs(["abc123"]);
			expect(result).toEqual({ headRef: "HEAD", fromRef: "abc123" });
		});

		it("2つの引数の場合は1番目がHEAD、2番目がFROM", () => {
			const result = parseArgs(["HEAD", "abc123"]);
			expect(result).toEqual({ headRef: "HEAD", fromRef: "abc123" });
		});
	});

	describe("getDiffFiles", () => {
		it("差分ファイルを取得できる", async () => {
			const files = await getDiffFiles("HEAD~1", "HEAD");
			expect(files).toContain("file3.txt");
			expect(files.length).toBe(1);
		});

		it("複数コミットの差分を取得できる", async () => {
			const files = await getDiffFiles("HEAD~2", "HEAD");
			expect(files).toContain("file2.txt");
			expect(files).toContain("file3.txt");
			expect(files.length).toBe(2);
		});

		it("差分がない場合は空配列を返す", async () => {
			const files = await getDiffFiles("HEAD", "HEAD");
			expect(files).toEqual([]);
		});
	});

	describe("createArchive", () => {
		it("アーカイブを作成できる", async () => {
			const files = ["file1.txt"];
			const success = await createArchive("HEAD", files);
			expect(success).toBe(true);

			// ファイルが存在することを確認
			expect(existsSync(join(tempDir, "archive.zip"))).toBe(true);
		});

		it("ファイルがない場合はfalseを返す", async () => {
			const success = await createArchive("HEAD", []);
			expect(success).toBe(false);
		});

		it("カスタム出力パスを指定できる", async () => {
			const files = ["file1.txt"];
			const outputPath = "custom.zip";
			const success = await createArchive("HEAD", files, outputPath);
			expect(success).toBe(true);

			expect(existsSync(join(tempDir, outputPath))).toBe(true);

			// クリーンアップ
			await rm(join(tempDir, outputPath));
		});
	});
});
