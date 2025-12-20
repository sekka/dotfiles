#!/usr/bin/env bun

/**
 * HLS/m3u8ストリームをMP4に変換する
 *
 * カレントディレクトリ内のすべてのm3u8ファイルをMP4に変換する。
 * HLS（HTTP Live Streaming）形式の動画をローカル再生可能なMP4に変換する際に使用。
 *
 * 使用方法:
 *   convert-m3u8ts2mp4
 *
 * 変換オプション:
 *   - faststart: ストリーミング再生用にメタデータを先頭に配置
 *   - コーデックコピー: 再エンコードなしで高速変換
 *   - AAC ADTSからASCへの変換
 *
 * 依存関係:
 *   - ffmpeg（brew install ffmpeg）
 *
 * 参考:
 *   https://shotaste.com/blog/convert-hls/
 */

import { existsSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { $, Glob } from "bun";

/**
 * 単一のm3u8ファイルをMP4に変換する
 */
export async function convertM3u8ToMp4(m3u8File: string): Promise<boolean> {
	// ファイルの存在確認
	if (!existsSync(m3u8File)) {
		console.error(`エラー: ファイルが見つかりません: ${m3u8File}`);
		return false;
	}

	console.log(`変換中: ${m3u8File}`);

	const dir = dirname(m3u8File);
	const base = basename(m3u8File, ".m3u8");
	const outputPath = join(dir, `${base}.mp4`);

	// ffmpegで変換
	// -nostdin: 標準入力を読み込まない（バッチ処理用）
	// -movflags faststart: ストリーミング再生用にメタデータを先頭に移動
	// -c copy: コーデックコピー（再エンコードなし）
	// -bsf:a aac_adtstoasc: AAC ADTSをASCに変換（MP4互換性のため）
	const result =
		await $`ffmpeg -nostdin -i ${m3u8File} -movflags faststart -c copy -bsf:a aac_adtstoasc ${outputPath}`
			.quiet()
			.nothrow();

	if (result.exitCode === 0) {
		console.log(`完了: ${outputPath}`);
		return true;
	} else {
		console.error(`エラー: ${m3u8File} の変換に失敗しました`);
		return false;
	}
}

/**
 * メイン関数
 */
export async function main(): Promise<number> {
	// カレントディレクトリのm3u8ファイルを検索
	const glob = new Glob("**/*.m3u8");
	const m3u8Files: string[] = [];

	for await (const file of glob.scan(".")) {
		m3u8Files.push(file);
	}

	if (m3u8Files.length === 0) {
		console.log("m3u8ファイルが見つかりませんでした。");
		return 0;
	}

	console.log(`${m3u8Files.length}個のm3u8ファイルを処理します。`);
	console.log("");

	let successCount = 0;
	for (const file of m3u8Files) {
		const success = await convertM3u8ToMp4(file);
		if (success) {
			successCount++;
		}
	}

	console.log("");
	console.log(`処理完了: ${successCount}/${m3u8Files.length} ファイル成功`);

	return successCount === m3u8Files.length ? 0 : 1;
}

// スクリプトとして直接実行された場合
if (import.meta.main) {
	const exitCode = await main();
	process.exit(exitCode);
}
