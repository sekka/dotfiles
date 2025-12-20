#!/usr/bin/env bun
/**
 * npm-scripts
 *
 * package.jsonのscriptsセクションからスクリプト名を一覧表示する
 *
 * Usage:
 *   npm-scripts.ts                    # カレントディレクトリのpackage.jsonを読む
 *   npm run $(npm-scripts.ts | fzf)   # fzfで選択して実行
 */

import { existsSync } from "node:fs";

const PACKAGE_JSON_PATH = "package.json";

/**
 * package.jsonが存在するか確認
 */
export function packageJsonExists(): boolean {
	return existsSync(PACKAGE_JSON_PATH);
}

/**
 * package.jsonからscriptsを取得
 */
export async function getScripts(): Promise<string[]> {
	try {
		const file = Bun.file(PACKAGE_JSON_PATH);
		const content = await file.json();

		if (!content.scripts || typeof content.scripts !== "object") {
			return [];
		}

		return Object.keys(content.scripts).sort();
	} catch {
		return [];
	}
}

/**
 * メイン処理
 */
export async function main(): Promise<number> {
	if (!packageJsonExists()) {
		console.error("Error: package.json not found in current directory");
		return 1;
	}

	const scripts = await getScripts();
	if (scripts.length === 0) {
		console.error("Error: No scripts found in package.json");
		return 1;
	}

	// 各スクリプト名を出力
	for (const script of scripts) {
		console.log(script);
	}

	return 0;
}

if (import.meta.main) {
	const exitCode = await main();
	process.exit(exitCode);
}
