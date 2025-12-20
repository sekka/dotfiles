#!/usr/bin/env bun
/**
 * Git差分ファイルをZIPにエクスポートする
 *
 * 指定したコミット間の差分ファイルをZIPアーカイブとして出力する。
 *
 * 使用方法:
 *   export-diff-zip <コミット1> [コミット2]
 *
 * 引数:
 *   コミット1のみ: HEADとコミット1間の差分をエクスポート
 *   コミット1と2: コミット1とコミット2間の差分をエクスポート
 *
 * 例:
 *   export-diff-zip HEAD~3           # 最近3コミットの差分
 *   export-diff-zip abc123           # HEADとabc123間の差分
 *   export-diff-zip abc123 def456    # abc123とdef456間の差分
 *
 * 出力:
 *   archive.zip
 */

import { $ } from "bun";

/**
 * 引数をパースする
 */
export function parseArgs(
	args: string[],
): { ref1: string; ref2: string } | null {
	if (args.length === 0 || args.length > 2) {
		return null;
	}

	if (args.length === 1) {
		return { ref1: "HEAD", ref2: args[0] };
	}

	return { ref1: args[0], ref2: args[1] };
}

/**
 * 差分ファイルを取得する
 */
export async function getDiffFiles(
	ref1: string,
	ref2: string,
): Promise<string[]> {
	const result = await $`git diff --name-only ${ref1} ${ref2}`
		.quiet()
		.nothrow();

	if (result.exitCode !== 0) {
		return [];
	}

	return result
		.text()
		.trim()
		.split("\n")
		.filter((f) => f.length > 0);
}

/**
 * 差分ファイルをZIPアーカイブとして出力する
 */
export async function exportDiffZip(
	ref1: string,
	ref2: string,
): Promise<boolean> {
	// 差分ファイルを取得
	const files = await getDiffFiles(ref1, ref2);

	if (files.length === 0) {
		console.log("差分ファイルがありません。");
		return true;
	}

	console.log(`${files.length}個のファイルをアーカイブします。`);

	// git archiveでZIP作成
	const result =
		await $`git archive --format=zip --prefix=archive/ ${ref1} ${files} -o archive.zip`.nothrow();

	if (result.exitCode !== 0) {
		console.error("エラー: アーカイブの作成に失敗しました");
		console.error(result.stderr.toString());
		return false;
	}

	console.log("archive.zip を作成しました。");
	return true;
}

/**
 * 使用方法を表示する
 */
export function showUsage(): void {
	console.error("使用方法: export-diff-zip <コミット1> [コミット2]");
	console.error("");
	console.error("例:");
	console.error("  export-diff-zip HEAD~3           # 最近3コミットの差分");
	console.error("  export-diff-zip abc123           # HEADとabc123間の差分");
	console.error("  export-diff-zip abc123 def456    # abc123とdef456間の差分");
}

/**
 * メイン関数
 */
export async function main(): Promise<number> {
	const args = process.argv.slice(2);
	const parsed = parseArgs(args);

	if (!parsed) {
		showUsage();
		return 1;
	}

	const success = await exportDiffZip(parsed.ref1, parsed.ref2);
	return success ? 0 : 1;
}

// スクリプトとして直接実行された場合
if (import.meta.main) {
	const exitCode = await main();
	process.exit(exitCode);
}
