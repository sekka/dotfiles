#!/usr/bin/env bun

/**
 * 画像をWebP形式に変換する
 *
 * カレントディレクトリ内のPNG・JPG画像をWebP形式に変換する。
 * PNG画像はロスレス圧縮、JPG画像は品質90%で圧縮される。
 *
 * 使用方法:
 *   convert-img2webp
 *
 * 変換オプション:
 *   PNG: ロスレス圧縮、ICCプロファイル保持
 *   JPG: 品質90%、ICCプロファイル保持、シャープYUV処理
 *
 * 依存関係:
 *   - cwebp（brew install webp）
 */

import { basename, dirname, join } from "node:path";
import { $, Glob } from "bun";

/** 同時実行数の上限（リソース枯渇防止） */
const CONCURRENCY_LIMIT = 5;

/**
 * 同時実行数を制限して並列処理を行う
 */
async function processWithLimit<T>(
	items: T[],
	fn: (item: T) => Promise<boolean>,
): Promise<boolean[]> {
	const results: boolean[] = [];
	for (let i = 0; i < items.length; i += CONCURRENCY_LIMIT) {
		const chunk = items.slice(i, i + CONCURRENCY_LIMIT);
		const chunkResults = await Promise.all(chunk.map(fn));
		results.push(...chunkResults);
	}
	return results;
}

/**
 * 画像ファイルの拡張子を取得する
 */
export function getImageExtension(file: string): ".png" | ".jpg" | null {
	const lower = file.toLowerCase();
	if (lower.endsWith(".png")) {
		return ".png";
	}
	if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
		return ".jpg";
	}
	return null;
}

/**
 * 拡張子に応じたcwebpオプションを取得する
 */
export function getCwebpOptions(ext: ".png" | ".jpg"): string[] {
	if (ext === ".png") {
		// PNGはロスレス圧縮
		return ["-lossless", "-metadata", "icc"];
	}
	// JPGは品質90%で圧縮
	return ["-q", "90", "-metadata", "icc", "-sharp_yuv"];
}

/**
 * 単一の画像ファイルをWebPに変換する
 */
export async function convertToWebp(imageFile: string): Promise<boolean> {
	const ext = getImageExtension(imageFile);
	if (!ext) {
		console.error(`スキップ: サポートされていない形式: ${imageFile}`);
		return false;
	}

	console.log(`変換中: ${imageFile}`);

	const dir = dirname(imageFile);
	// 拡張子を除いたベース名を取得（.jpeg対応）
	const base = basename(imageFile).replace(/\.(png|jpe?g)$/i, "");
	const outputPath = join(dir, `${base}.webp`);
	const options = getCwebpOptions(ext);

	const result = await $`cwebp ${imageFile} ${options} -o ${outputPath}`
		.quiet()
		.nothrow();

	if (result.exitCode === 0) {
		console.log(`完了: ${outputPath}`);
		return true;
	} else {
		console.error(`エラー: ${imageFile} の変換に失敗しました`);
		return false;
	}
}

/**
 * メイン関数
 */
export async function main(): Promise<number> {
	// カレントディレクトリのPNG・JPGファイルを検索（大文字・小文字両対応）
	const glob = new Glob("**/*.{png,PNG,jpg,JPG,jpeg,JPEG}");
	const imageFiles: string[] = [];

	for await (const file of glob.scan(".")) {
		imageFiles.push(file);
	}

	if (imageFiles.length === 0) {
		console.log("画像ファイルが見つかりませんでした。");
		return 0;
	}

	console.log(`${imageFiles.length}個の画像ファイルを処理します。`);
	console.log("");

	// 並列処理で変換を実行（同時実行数制限付き）
	const results = await processWithLimit(imageFiles, convertToWebp);
	const successCount = results.filter(Boolean).length;

	console.log("");
	console.log(`処理完了: ${successCount}/${imageFiles.length} ファイル成功`);

	return successCount === imageFiles.length ? 0 : 1;
}

// スクリプトとして直接実行された場合
if (import.meta.main) {
	const exitCode = await main();
	process.exit(exitCode);
}
