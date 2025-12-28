#!/usr/bin/env bun

/**
 * ZIP内の画像をPDFに変換する
 *
 * ZIPファイルを解凍し、中の画像ファイルを1つのPDFに変換する。
 * 画像ファイルのみが含まれていることを前提とする。
 *
 * 使用方法:
 *   zip2pdf <zipファイル>
 *
 * 例:
 *   zip2pdf manga.zip
 *
 * 依存関係:
 *   - unzip
 *   - ImageMagick（convert コマンド）
 */

import { existsSync } from "node:fs";
import { basename, dirname, join } from "node:path";
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
 * ZIPファイルを解凍してPDFに変換する
 */
export async function convertZipToPdf(zipFile: string): Promise<boolean> {
	// ファイルの存在確認
	if (!existsSync(zipFile)) {
		console.error(`エラー: ファイルが見つかりません: ${zipFile}`);
		return false;
	}

	const dir = dirname(zipFile);
	const zipName = basename(zipFile);
	const folderName = zipName.replace(/\.zip$/i, "");
	const folderPath = join(dir, folderName);
	const outputPdf = join(dir, `${folderName}.pdf`);

	// ZIPを解凍
	console.log(`解凍中: ${zipFile}`);
	const unzipResult = await $`unzip -d ${folderPath} ${zipFile}`.quiet().nothrow();

	if (unzipResult.exitCode !== 0) {
		console.error("エラー: 解凍に失敗しました");
		return false;
	}

	// PDFに変換
	console.log(`PDF変換中: ${folderPath}`);
	const convertResult = await $`convert ${folderPath}/* ${outputPdf}`.quiet().nothrow();

	if (convertResult.exitCode !== 0) {
		console.error("エラー: PDF変換に失敗しました");
		return false;
	}

	console.log(`完了: ${outputPdf}`);

	// 注意: 解凍したフォルダは削除しない（元のスクリプトと同じ動作）
	// 必要なら手動で削除するか、以下のコメントを外す
	// await $`rm -rf ${folderPath}`.quiet();

	return true;
}

/**
 * 使用方法を表示する
 */
export function showUsage(): void {
	console.error("使用方法: zip2pdf <zipファイル>");
	console.error("");
	console.error("例:");
	console.error("  zip2pdf manga.zip");
	console.error("");
	console.error("注意:");
	console.error("  - ZIPファイル内は画像ファイルのみを想定しています");
	console.error("  - ImageMagickのconvertコマンドが必要です");
}

/**
 * メイン関数
 */
export async function main(): Promise<number> {
	const args = process.argv.slice(2);
	const zipFile = parseArgs(args);

	if (!zipFile) {
		showUsage();
		return 1;
	}

	const success = await convertZipToPdf(zipFile);
	return success ? 0 : 1;
}

// スクリプトとして直接実行された場合
if (import.meta.main) {
	const exitCode = await main();
	process.exit(exitCode);
}
