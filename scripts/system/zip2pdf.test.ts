import { describe, expect, test } from "bun:test";
import { parseArgs } from "./zip2pdf";

describe("zip2pdf", () => {
	describe("parseArgs", () => {
		test("ZIPファイルを指定した場合", () => {
			const result = parseArgs(["manga.zip"]);
			expect(result).toBe("manga.zip");
		});

		test("パス付きZIPファイルを指定した場合", () => {
			const result = parseArgs(["/path/to/manga.zip"]);
			expect(result).toBe("/path/to/manga.zip");
		});

		test("引数なしの場合はnullを返す", () => {
			const result = parseArgs([]);
			expect(result).toBeNull();
		});

		test("引数が2つ以上の場合はnullを返す", () => {
			const result = parseArgs(["file1.zip", "file2.zip"]);
			expect(result).toBeNull();
		});
	});

	// 注意: 実際のPDF変換テストはunzipとImageMagick（convert）が必要なため、
	// ここではparseArgsのテストのみ実施
});
