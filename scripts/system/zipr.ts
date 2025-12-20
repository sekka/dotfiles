#!/usr/bin/env bun

/**
 * ディレクトリをZIP圧縮する
 *
 * 指定したディレクトリを再帰的にZIPファイルに圧縮する。
 *
 * 使用方法:
 *   zipr <ディレクトリ>
 *
 * 例:
 *   zipr my-folder
 *   # -> my-folder.zip が作成される
 */

import { existsSync, statSync } from "node:fs";
import { $ } from "bun";

/**
 * 引数をパースする
 */
export function parseArgs(args: string[]): string | null {
	if (args.length !== 1) {
		return null;
	}
	return args[0];
}

/**
 * ディレクトリをZIP圧縮する
 */
export async function zipDirectory(dir: string): Promise<boolean> {
	// ディレクトリの存在確認
	if (!existsSync(dir)) {
		console.error(`エラー: ディレクトリが見つかりません: ${dir}`);
		return false;
	}

	if (!statSync(dir).isDirectory()) {
		console.error(`エラー: ディレクトリではありません: ${dir}`);
		return false;
	}

	const outputZip = `${dir}.zip`;
	console.log(dir);

	const result = await $`zip -r ${outputZip} ${dir}`.nothrow();

	if (result.exitCode !== 0) {
		console.error("エラー: ZIP圧縮に失敗しました");
		return false;
	}

	return true;
}

/**
 * 使用方法を表示する
 */
export function showUsage(): void {
	console.error("使用方法: zipr <ディレクトリ>");
	console.error("");
	console.error("例:");
	console.error("  zipr my-folder");
	console.error("  # -> my-folder.zip が作成される");
}

/**
 * メイン関数
 */
export async function main(): Promise<number> {
	const args = process.argv.slice(2);
	const dir = parseArgs(args);

	if (!dir) {
		showUsage();
		return 1;
	}

	const success = await zipDirectory(dir);
	return success ? 0 : 1;
}

// スクリプトとして直接実行された場合
if (import.meta.main) {
	const exitCode = await main();
	process.exit(exitCode);
}
