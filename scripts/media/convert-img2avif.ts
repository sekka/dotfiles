#!/usr/bin/env bun

/**
 * 画像をAVIF形式に変換する
 *
 * カレントディレクトリ内のPNG・JPG画像をAVIF形式に変換する。
 * PNG画像はロスレス圧縮、JPG画像は品質80で圧縮される。
 *
 * 使用方法:
 *   convert-img2avif
 *
 * 変換オプション:
 *   PNG: ロスレス圧縮
 *   JPG: 品質80（CRF 18相当）、速度6（バランス重視）
 *
 * 依存関係:
 *   - avifenc（brew install libavif）
 */

import { basename, dirname, join } from "node:path";
import { $, Glob } from "bun";

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
 * 拡張子に応じたavifencオプションを取得する
 *
 * avifencオプション説明:
 *   -s, --speed: エンコード速度（0-10、0が最も遅いが高品質、デフォルト6）
 *   -q, --qcolor: 色の品質（0-100、100が最高品質）
 *   --min, --max: 品質範囲（0-63、0が最高品質）
 *   -l, --lossless: ロスレス圧縮
 */
export function getAvifencOptions(ext: ".png" | ".jpg"): string[] {
	if (ext === ".png") {
		// PNGはロスレス圧縮
		return ["--lossless"];
	}
	// JPGは品質80で圧縮（速度6でバランス重視）
	// -q 80 は内部的にmin/maxに変換される
	return ["-q", "80", "-s", "6"];
}

/**
 * 単一の画像ファイルをAVIFに変換する
 */
export async function convertToAvif(imageFile: string): Promise<boolean> {
	const ext = getImageExtension(imageFile);
	if (!ext) {
		console.error(`スキップ: サポートされていない形式: ${imageFile}`);
		return false;
	}

	console.log(`変換中: ${imageFile}`);

	const dir = dirname(imageFile);
	// 拡張子を除いたベース名を取得（.jpeg対応）
	const base = basename(imageFile).replace(/\.(png|jpe?g)$/i, "");
	const outputPath = join(dir, `${base}.avif`);
	const options = getAvifencOptions(ext);

	const result = await $`avifenc ${options} ${imageFile} ${outputPath}`
		.quiet()
		.nothrow();

	if (result.exitCode === 0) {
		console.log(`完了: ${outputPath}`);
		return true;
	}
	console.error(`エラー: ${imageFile} の変換に失敗しました`);
	return false;
}

/**
 * メイン関数
 */
export async function main(): Promise<number> {
	// avifencの存在確認
	const checkAvifenc = await $`command -v avifenc`.quiet().nothrow();
	if (checkAvifenc.exitCode !== 0) {
		console.error("エラー: avifencが見つかりません。");
		console.error("インストール: brew install libavif");
		return 1;
	}

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

	// 並列処理で変換を実行
	const results = await Promise.all(
		imageFiles.map((file) => convertToAvif(file)),
	);
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
