/**
 * npm-scripts.ts のテスト
 */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { getScripts, packageJsonExists } from "./npm-scripts";
import { createTempDir, cleanupTempDir } from "../__tests__/test-helpers";

describe("npm-scripts", () => {
	let tempDir: string;
	let originalCwd: string;

	beforeAll(async () => {
		originalCwd = process.cwd();
		tempDir = await createTempDir("npm-scripts-test-");
		process.chdir(tempDir);
	});

	afterAll(async () => {
		process.chdir(originalCwd);
		await cleanupTempDir(tempDir);
	});

	beforeEach(async () => {
		// テスト間でpackage.jsonをクリーンアップ
		try {
			await rm(join(tempDir, "package.json"));
		} catch {
			// ファイルが存在しない場合は無視
		}
	});

	describe("packageJsonExists", () => {
		it("package.jsonがない場合はfalseを返す", () => {
			const result = packageJsonExists();
			expect(result).toBe(false);
		});

		it("package.jsonがある場合はtrueを返す", async () => {
			await writeFile(join(tempDir, "package.json"), "{}");
			const result = packageJsonExists();
			expect(result).toBe(true);
		});
	});

	describe("getScripts", () => {
		it("scriptsがない場合は空配列を返す", async () => {
			await writeFile(join(tempDir, "package.json"), "{}");
			const scripts = await getScripts();
			expect(scripts).toEqual([]);
		});

		it("scriptsを取得できる", async () => {
			const packageJson = {
				scripts: {
					test: "bun test",
					build: "bun build",
					dev: "bun dev",
				},
			};
			await writeFile(join(tempDir, "package.json"), JSON.stringify(packageJson));

			const scripts = await getScripts();
			expect(scripts).toContain("test");
			expect(scripts).toContain("build");
			expect(scripts).toContain("dev");
		});

		it("scriptsはソートされて返される", async () => {
			const packageJson = {
				scripts: {
					zebra: "echo zebra",
					alpha: "echo alpha",
					beta: "echo beta",
				},
			};
			await writeFile(join(tempDir, "package.json"), JSON.stringify(packageJson));

			const scripts = await getScripts();
			expect(scripts).toEqual(["alpha", "beta", "zebra"]);
		});

		it("不正なJSONの場合は空配列を返す", async () => {
			await writeFile(join(tempDir, "package.json"), "{ invalid json }");
			const scripts = await getScripts();
			expect(scripts).toEqual([]);
		});
	});
});
