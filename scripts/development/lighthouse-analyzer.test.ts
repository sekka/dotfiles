import { describe, expect, test } from "bun:test";
import { getTimestamp, parseArgs, sanitizeUrl } from "./lighthouse-analyzer";

describe("lighthouse-analyzer", () => {
	describe("parseArgs", () => {
		test("URL、回数、間隔を指定した場合", () => {
			const result = parseArgs(["https://example.com", "5", "60"]);
			expect(result).not.toBeNull();
			expect(result!.url).toBe("https://example.com");
			expect(result!.count).toBe(5);
			expect(result!.interval).toBe(60);
			expect(result!.outputDir).toBe("./lighthouse-results");
			expect(result!.useAuth).toBe(false);
			expect(result!.chromeProfile).toBe("Default");
		});

		test("出力ディレクトリを指定した場合", () => {
			const result = parseArgs(["https://example.com", "3", "30", "./results"]);
			expect(result).not.toBeNull();
			expect(result!.outputDir).toBe("./results");
		});

		test("--authオプションを指定した場合", () => {
			const result = parseArgs(["https://example.com", "3", "30", "--auth"]);
			expect(result).not.toBeNull();
			expect(result!.useAuth).toBe(true);
		});

		test("--profileオプションを指定した場合", () => {
			const result = parseArgs([
				"https://example.com",
				"3",
				"30",
				"--auth",
				"--profile=Profile 1",
			]);
			expect(result).not.toBeNull();
			expect(result!.chromeProfile).toBe("Profile 1");
		});

		test("引数が不足している場合はnullを返す", () => {
			expect(parseArgs(["https://example.com"])).toBeNull();
			expect(parseArgs(["https://example.com", "5"])).toBeNull();
		});

		test("引数なしの場合はnullを返す", () => {
			const result = parseArgs([]);
			expect(result).toBeNull();
		});

		test("回数が数値でない場合はnullを返す", () => {
			const result = parseArgs(["https://example.com", "abc", "60"]);
			expect(result).toBeNull();
		});

		test("間隔が数値でない場合はnullを返す", () => {
			const result = parseArgs(["https://example.com", "5", "abc"]);
			expect(result).toBeNull();
		});

		test("回数が0以下の場合はnullを返す", () => {
			expect(parseArgs(["https://example.com", "0", "60"])).toBeNull();
			expect(parseArgs(["https://example.com", "-1", "60"])).toBeNull();
		});

		test("間隔が負の場合はnullを返す", () => {
			expect(parseArgs(["https://example.com", "5", "-1"])).toBeNull();
		});

		test("間隔が0の場合は有効", () => {
			const result = parseArgs(["https://example.com", "5", "0"]);
			expect(result).not.toBeNull();
			expect(result!.interval).toBe(0);
		});

		test("プロファイル名に無効な文字が含まれる場合はnullを返す", () => {
			// シェルインジェクションを防ぐため、特殊文字を含むプロファイル名は拒否
			expect(
				parseArgs(["https://example.com", "5", "60", "--profile=; rm -rf /"]),
			).toBeNull();
			expect(
				parseArgs([
					"https://example.com",
					"5",
					"60",
					"--profile=test$(whoami)",
				]),
			).toBeNull();
			expect(
				parseArgs(["https://example.com", "5", "60", "--profile=test`id`"]),
			).toBeNull();
		});

		test("有効なプロファイル名は許可される", () => {
			// 英数字、スペース、ハイフン、アンダースコアは許可
			const result1 = parseArgs([
				"https://example.com",
				"5",
				"60",
				"--profile=Profile 1",
			]);
			expect(result1).not.toBeNull();
			expect(result1!.chromeProfile).toBe("Profile 1");

			const result2 = parseArgs([
				"https://example.com",
				"5",
				"60",
				"--profile=Test_Profile-1",
			]);
			expect(result2).not.toBeNull();
			expect(result2!.chromeProfile).toBe("Test_Profile-1");
		});
	});

	describe("sanitizeUrl", () => {
		test("URLからファイル名用の文字列を生成する", () => {
			expect(sanitizeUrl("https://example.com")).toBe("example.com");
			expect(sanitizeUrl("http://example.com/path")).toBe("example.com_path");
			expect(sanitizeUrl("https://example.com/path?query=1")).toBe(
				"example.com_path_query_1",
			);
		});

		test("特殊文字をアンダースコアに置換する", () => {
			expect(sanitizeUrl("https://example.com/日本語")).toBe("example.com");
		});
	});

	describe("getTimestamp", () => {
		test("タイムスタンプ形式の文字列を返す", () => {
			const timestamp = getTimestamp();
			// YYYYMMDD_HHMMSS形式
			expect(timestamp).toMatch(/^\d{8}_\d{6}$/);
		});
	});
});
