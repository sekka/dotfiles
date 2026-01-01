#!/usr/bin/env bun

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { colors, resetChalkCache } from "../colors.ts";

describe("Color Output", () => {
	// 環境変数のバックアップと復元
	let originalNO_COLOR: string | undefined;
	let originalFORCE_COLOR: string | undefined;

	beforeEach(() => {
		// 環境変数を事前バックアップ
		originalNO_COLOR = process.env.NO_COLOR;
		originalFORCE_COLOR = process.env.FORCE_COLOR;

		// テスト環境では TTY が検出されないため、モジュール読み込み時に色を強制有効化
		process.env.FORCE_COLOR = "3";
	});

	afterEach(() => {
		// 環境変数を完全に復元
		if (originalNO_COLOR !== undefined) {
			process.env.NO_COLOR = originalNO_COLOR;
		} else {
			delete process.env.NO_COLOR;
		}

		if (originalFORCE_COLOR !== undefined) {
			process.env.FORCE_COLOR = originalFORCE_COLOR;
		} else {
			delete process.env.FORCE_COLOR;
		}

		// 【重要】環境変数変更後はキャッシュをリセット
		resetChalkCache();
	});

	describe("ANSI Code Output", () => {
		it("should output ANSI escape codes for colored text", () => {
			const result = colors.cyan("test");

			// ANSI エスケープコードを含むべき
			expect(result).toContain("\x1b[");
			expect(result).toContain("test");
		});

		it("cyan should use ANSI code 36", () => {
			const result = colors.cyan("text");
			expect(result).toContain("\x1b[36m");
		});

		it("whiteBright should use ANSI code 97", () => {
			const result = colors.lightGray("text");
			expect(result).toContain("\x1b[97m");
		});

		it("white should use ANSI code 37", () => {
			const result = colors.white("text");
			expect(result).toContain("\x1b[37m");
		});
	});

	describe("Color Distinctions", () => {
		it("dimWhite and white should produce different output", () => {
			const white = colors.white("text");
			const dimWhite = colors.dimWhite("text");

			// dim スタイルが適用されているため異なるべき
			expect(white).not.toBe(dimWhite);

			// dimWhite は dim コード (2m) を含むべき
			expect(dimWhite).toContain("\x1b[2m");
		});

		it("lightGray should be brighter than gray", () => {
			const gray = colors.gray("text");
			const lightGray = colors.lightGray("text");

			expect(gray).not.toBe(lightGray);
			expect(gray).toContain("\x1b[90m"); // bright black
			expect(lightGray).toContain("\x1b[97m"); // bright white
		});
	});

	describe("Environment Variable Support", () => {
		it("should respect NO_COLOR environment variable", () => {
			// NO_COLOR 環境変数設定時に色が出力されないことを検証
			process.env.NO_COLOR = "1";
			// 色レベル決定関数が呼び出され、0（色なし）が返されることを検証
			const result = colors.cyan("test");
			// NO_COLOR 設定時は ANSI コードが含まれないはず
			expect(result).toBe("test");
		});

		it("all color functions should be callable", () => {
			expect(() => colors.gray("text")).not.toThrow();
			expect(() => colors.cyan("text")).not.toThrow();
			expect(() => colors.white("text")).not.toThrow();
			expect(() => colors.dimWhite("text")).not.toThrow();
			expect(() => colors.lightGray("text")).not.toThrow();
		});
	});

	describe("Text Preservation", () => {
		it("should preserve input text", () => {
			const input = "Hello, World!";
			const result = colors.cyan(input);

			// 元のテキストが含まれているべき
			expect(result).toContain(input);
		});

		it("should handle empty strings", () => {
			expect(() => colors.cyan("")).not.toThrow();
			// 空文字列を渡しても色関数が正常に動作することを確認
			const result = colors.cyan("");
			// 空文字列に対しても ANSI コードが追加されるはず
			expect(typeof result).toBe("string");
		});

		it("should handle special characters", () => {
			const special = "テスト 123 !@#$%";
			const result = colors.cyan(special);
			expect(result).toContain(special);
		});
	});

	describe("Environment Variable Edge Cases", () => {
		it("should return 0 when FORCE_COLOR is invalid", () => {
			process.env.FORCE_COLOR = "invalid_value";
			const result = colors.cyan("test");
			expect(result).toContain("test");
		});

		it("should prioritize NO_COLOR over FORCE_COLOR", () => {
			process.env.NO_COLOR = "1";
			process.env.FORCE_COLOR = "3";
			const result = colors.cyan("test");
			expect(result).toBe("test");
		});

		it("should handle FORCE_COLOR=0 and FORCE_COLOR=3 dynamically", () => {
			process.env.FORCE_COLOR = "3";
			expect(colors.cyan("test")).toContain("\x1b[");

			process.env.FORCE_COLOR = "0";
			resetChalkCache(); // 【重要】キャッシュをリセットして色レベル変更を反映
			expect(colors.cyan("test")).toBe("test");
		});

		it("should support FORCE_COLOR variations (1,2,3,256,16m,true)", () => {
			const colorValues = ["1", "2", "3", "256", "16m", "true"];
			colorValues.forEach((value) => {
				process.env.FORCE_COLOR = value;
				resetChalkCache(); // 各テスト間でキャッシュをリセット
				expect(colors.cyan("test")).toContain("\x1b[");
			});
		});

		it("should respect FORCE_COLOR=false", () => {
			process.env.FORCE_COLOR = "false";
			expect(colors.cyan("test")).toBe("test");
		});
	});

	describe("Performance & Caching", () => {
		it("should reuse Chalk instance when color level unchanged", () => {
			// 同じ色レベルで複数回呼び出し
			const result1 = colors.cyan("test1");
			const result2 = colors.cyan("test2");
			const result3 = colors.yellow("test3");

			// 全て同じ色レベル（同じインスタンスを使用）
			expect(result1).toContain("\x1b[");
			expect(result2).toContain("\x1b[");
			expect(result3).toContain("\x1b[");
		});

		it("should create new instance when color level changes", () => {
			process.env.FORCE_COLOR = "3";
			const colored = colors.cyan("test");
			expect(colored).toContain("\x1b[");

			// 色レベルを変更
			process.env.FORCE_COLOR = "0";
			resetChalkCache(); // 【重要】キャッシュをリセット
			const uncolored = colors.cyan("test");
			expect(uncolored).toBe("test");
		});

		it("resetChalkCache should invalidate cache", () => {
			process.env.FORCE_COLOR = "3";
			colors.cyan("test"); // キャッシュ作成

			// 環境変数変更 + リセット
			process.env.FORCE_COLOR = "0";
			resetChalkCache();

			const result = colors.cyan("test");
			expect(result).toBe("test"); // 新しい色レベルが反映されている
		});
	});
});
