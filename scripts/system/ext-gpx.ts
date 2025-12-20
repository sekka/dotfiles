#!/usr/bin/env bun

/**
 * GoProからGPXデータを抽出する
 *
 * カレントディレクトリ内のすべてのMP4ファイルからGPXデータを抽出する。
 * gopro2gpxツールを使用してGPS情報を取り出す。
 *
 * 使用方法:
 *   ext-gpx
 *
 * 依存関係:
 *   - gopro2gpx（pip install gopro2gpx）
 */

import { basename, dirname, join } from "node:path";
import { $, Glob } from "bun";

/**
 * MP4ファイルからGPXを抽出する
 */
export async function extractGpx(mp4File: string): Promise<boolean> {
	console.log(`変換開始: ${mp4File}`);

	// 出力パスを生成（拡張子を除いたベース名）
	const dir = dirname(mp4File);
	const base = basename(mp4File, ".mp4");
	const outputPath = join(dir, base);

	// gopro2gpxは出力パスに自動的に.gpx拡張子を追加する
	const result = await $`gopro2gpx -s -vvv ${mp4File} ${outputPath}`
		.quiet()
		.nothrow();

	if (result.exitCode === 0) {
		console.log("完了");
		return true;
	} else {
		console.error(`エラー: ${mp4File} の変換に失敗しました`);
		return false;
	}
}

/**
 * メイン関数
 */
export async function main(): Promise<number> {
	// カレントディレクトリのMP4ファイルを検索
	const glob = new Glob("**/*.mp4");
	const mp4Files: string[] = [];

	for await (const file of glob.scan(".")) {
		mp4Files.push(file);
	}

	if (mp4Files.length === 0) {
		console.log("MP4ファイルが見つかりませんでした。");
		return 0;
	}

	console.log(`${mp4Files.length}個のMP4ファイルを処理します。`);
	console.log("");

	let successCount = 0;
	for (const file of mp4Files) {
		const success = await extractGpx(file);
		if (success) {
			successCount++;
		}
	}

	console.log("");
	console.log(`処理完了: ${successCount}/${mp4Files.length} ファイル成功`);

	return successCount === mp4Files.length ? 0 : 1;
}

// スクリプトとして直接実行された場合
if (import.meta.main) {
	const exitCode = await main();
	process.exit(exitCode);
}
