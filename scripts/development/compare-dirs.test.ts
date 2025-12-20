import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getAllFiles, hashFile, parseArgs } from "./compare-dirs";

describe("compare-dirs", () => {
	describe("parseArgs", () => {
		test("2つのディレクトリを指定した場合", () => {
			const result = parseArgs(["/path/to/dir1", "/path/to/dir2"]);
			expect(result).toEqual({
				algo: "sha256",
				dir1: "/path/to/dir1",
				dir2: "/path/to/dir2",
			});
		});

		test("-aオプションでmd5を指定した場合", () => {
			const result = parseArgs(["-a", "md5", "/path/to/dir1", "/path/to/dir2"]);
			expect(result).toEqual({
				algo: "md5",
				dir1: "/path/to/dir1",
				dir2: "/path/to/dir2",
			});
		});

		test("-aオプションでsha256を指定した場合", () => {
			const result = parseArgs([
				"-a",
				"sha256",
				"/path/to/dir1",
				"/path/to/dir2",
			]);
			expect(result).toEqual({
				algo: "sha256",
				dir1: "/path/to/dir1",
				dir2: "/path/to/dir2",
			});
		});

		test("引数が1つの場合はnullを返す", () => {
			const result = parseArgs(["/path/to/dir1"]);
			expect(result).toBeNull();
		});

		test("引数が3つで-aがない場合はnullを返す", () => {
			const result = parseArgs([
				"/path/to/dir1",
				"/path/to/dir2",
				"/path/to/dir3",
			]);
			expect(result).toBeNull();
		});

		test("引数なしの場合はnullを返す", () => {
			const result = parseArgs([]);
			expect(result).toBeNull();
		});

		test("サポートされていないアルゴリズムの場合はnullを返す", () => {
			const result = parseArgs([
				"-a",
				"sha512",
				"/path/to/dir1",
				"/path/to/dir2",
			]);
			expect(result).toBeNull();
		});
	});

	describe("ファイル操作", () => {
		let testDir: string;

		beforeEach(() => {
			testDir = join(tmpdir(), `compare-dirs-test-${Date.now()}`);
			mkdirSync(testDir, { recursive: true });
		});

		afterEach(() => {
			if (existsSync(testDir)) {
				rmSync(testDir, { recursive: true, force: true });
			}
		});

		describe("getAllFiles", () => {
			test("ディレクトリ内のファイルを取得する", async () => {
				// テストファイルを作成
				writeFileSync(join(testDir, "file1.txt"), "content1");
				writeFileSync(join(testDir, "file2.txt"), "content2");

				const files = await getAllFiles(testDir);
				expect(files).toEqual(["file1.txt", "file2.txt"]);
			});

			test("サブディレクトリ内のファイルも取得する", async () => {
				// テストファイルを作成
				mkdirSync(join(testDir, "subdir"), { recursive: true });
				writeFileSync(join(testDir, "file1.txt"), "content1");
				writeFileSync(join(testDir, "subdir", "file2.txt"), "content2");

				const files = await getAllFiles(testDir);
				expect(files).toEqual(["file1.txt", "subdir/file2.txt"]);
			});

			test("空のディレクトリの場合は空配列を返す", async () => {
				const files = await getAllFiles(testDir);
				expect(files).toEqual([]);
			});
		});

		describe("hashFile", () => {
			test("ファイルのMD5ハッシュを計算する", async () => {
				const testFile = join(testDir, "test.txt");
				writeFileSync(testFile, "hello world");

				const hash = await hashFile(testFile, "md5");
				// "hello world"のMD5ハッシュ
				expect(hash).toBe("5eb63bbbe01eeed093cb22bb8f5acdc3");
			});

			test("ファイルのSHA256ハッシュを計算する", async () => {
				const testFile = join(testDir, "test.txt");
				writeFileSync(testFile, "hello world");

				const hash = await hashFile(testFile, "sha256");
				// "hello world"のSHA256ハッシュ
				expect(hash).toBe(
					"b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
				);
			});

			test("同じ内容のファイルは同じハッシュを返す", async () => {
				const testFile1 = join(testDir, "test1.txt");
				const testFile2 = join(testDir, "test2.txt");
				writeFileSync(testFile1, "same content");
				writeFileSync(testFile2, "same content");

				const hash1 = await hashFile(testFile1, "sha256");
				const hash2 = await hashFile(testFile2, "sha256");
				expect(hash1).toBe(hash2);
			});

			test("異なる内容のファイルは異なるハッシュを返す", async () => {
				const testFile1 = join(testDir, "test1.txt");
				const testFile2 = join(testDir, "test2.txt");
				writeFileSync(testFile1, "content1");
				writeFileSync(testFile2, "content2");

				const hash1 = await hashFile(testFile1, "sha256");
				const hash2 = await hashFile(testFile2, "sha256");
				expect(hash1).not.toBe(hash2);
			});
		});
	});
});
