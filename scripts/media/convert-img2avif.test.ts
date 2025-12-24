import { describe, expect, test } from "bun:test";
import { getAvifencOptions, getImageExtension } from "./convert-img2avif";

describe("convert-img2avif", () => {
	describe("getImageExtension", () => {
		test("PNGファイルの場合は.pngを返す", () => {
			expect(getImageExtension("image.png")).toBe(".png");
			expect(getImageExtension("IMAGE.PNG")).toBe(".png");
			expect(getImageExtension("path/to/image.png")).toBe(".png");
		});

		test("JPGファイルの場合は.jpgを返す", () => {
			expect(getImageExtension("image.jpg")).toBe(".jpg");
			expect(getImageExtension("IMAGE.JPG")).toBe(".jpg");
			expect(getImageExtension("path/to/image.jpg")).toBe(".jpg");
		});

		test("JPEGファイルの場合は.jpgを返す", () => {
			expect(getImageExtension("image.jpeg")).toBe(".jpg");
			expect(getImageExtension("IMAGE.JPEG")).toBe(".jpg");
		});

		test("サポートされていない形式の場合はnullを返す", () => {
			expect(getImageExtension("image.gif")).toBeNull();
			expect(getImageExtension("image.webp")).toBeNull();
			expect(getImageExtension("image.avif")).toBeNull();
			expect(getImageExtension("image.bmp")).toBeNull();
			expect(getImageExtension("document.pdf")).toBeNull();
		});
	});

	describe("getAvifencOptions", () => {
		test("PNG/JPG共に品質80の非可逆圧縮オプションを返す", () => {
			// ファイルサイズ削減を優先し、全て非可逆圧縮
			for (const ext of [".png", ".jpg"] as const) {
				const options = getAvifencOptions(ext);
				expect(options).toContain("-q");
				expect(options).toContain("80");
				expect(options).toContain("-s");
				expect(options).toContain("6");
				expect(options).not.toContain("--lossless");
			}
		});
	});

	// 注意: 実際のAVIF変換テストはavifencコマンドが必要なため、
	// ここではユーティリティ関数のテストのみ実施
});
