#!/usr/bin/env bun

/**
 * ディレクトリ比較スクリプト
 *
 * 2つのディレクトリを比較し、ファイルの差分を検出する。
 * ハッシュ値を使用してファイル内容の同一性を確認する。
 *
 * 使用方法:
 *   compare-dirs [-a sha256|md5] <dir1> <dir2>
 *
 * オプション:
 *   -a  ハッシュアルゴリズム（デフォルト: sha256）
 *
 * 例:
 *   compare-dirs ./dir1 ./dir2
 *   compare-dirs -a md5 ./dir1 ./dir2
 */

import { existsSync, statSync } from "node:fs";
import { readdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

type HashAlgorithm = "sha256" | "md5";

/**
 * 引数をパースする
 */
export function parseArgs(
	args: string[],
): { algo: HashAlgorithm; dir1: string; dir2: string } | null {
	let algo: HashAlgorithm = "sha256";
	const remaining = [...args];

	// -a オプションの解析
	const aIndex = remaining.indexOf("-a");
	if (aIndex !== -1) {
		const algoArg = remaining[aIndex + 1];
		if (algoArg === "sha256" || algoArg === "md5") {
			algo = algoArg;
			remaining.splice(aIndex, 2);
		} else {
			console.error(`サポートされていないアルゴリズム: ${algoArg}`);
			return null;
		}
	}

	if (remaining.length !== 2) {
		return null;
	}

	return { algo, dir1: remaining[0], dir2: remaining[1] };
}

/**
 * ディレクトリ内のすべてのファイルを再帰的に取得する
 */
export async function getAllFiles(dir: string, base: string = ""): Promise<string[]> {
	const files: string[] = [];
	const entries = await readdir(dir, { withFileTypes: true });

	for (const entry of entries) {
		const relativePath = base ? `${base}/${entry.name}` : entry.name;
		const fullPath = join(dir, entry.name);

		if (entry.isDirectory()) {
			const subFiles = await getAllFiles(fullPath, relativePath);
			files.push(...subFiles);
		} else if (entry.isFile()) {
			files.push(relativePath);
		}
	}

	return files.sort();
}

/**
 * ファイルのハッシュ値を計算する
 */
export async function hashFile(filePath: string, algo: HashAlgorithm): Promise<string> {
	const file = Bun.file(filePath);
	const content = await file.arrayBuffer();

	const hasher = new Bun.CryptoHasher(algo);
	hasher.update(new Uint8Array(content));
	return hasher.digest("hex");
}

/**
 * ファイルサイズを取得する
 */
export async function getFileSize(filePath: string): Promise<number> {
	const stats = await stat(filePath);
	return stats.size;
}

/**
 * タイムスタンプを生成する
 */
function getTimestamp(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	const hour = String(now.getHours()).padStart(2, "0");
	const min = String(now.getMinutes()).padStart(2, "0");
	const sec = String(now.getSeconds()).padStart(2, "0");
	return `${year}${month}${day}_${hour}${min}${sec}`;
}

/**
 * 使用方法を表示する
 */
export function showUsage(): void {
	console.error("使用方法: compare-dirs [-a sha256|md5] <dir1> <dir2>");
	console.error("");
	console.error("オプション:");
	console.error("  -a  ハッシュアルゴリズム（デフォルト: sha256）");
	console.error("");
	console.error("例:");
	console.error("  compare-dirs ./dir1 ./dir2");
	console.error("  compare-dirs -a md5 ./dir1 ./dir2");
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

	const { algo, dir1, dir2 } = parsed;

	// ディレクトリの存在確認
	if (!existsSync(dir1) || !statSync(dir1).isDirectory()) {
		console.error(`ディレクトリではありません: ${dir1}`);
		return 2;
	}
	if (!existsSync(dir2) || !statSync(dir2).isDirectory()) {
		console.error(`ディレクトリではありません: ${dir2}`);
		return 2;
	}

	// 出力ファイル
	const timestamp = getTimestamp();
	const outFile = `./compare_result_${timestamp}.txt`;

	const output: string[] = [];
	const log = (msg: string) => {
		console.log(msg);
		output.push(msg);
	};

	log("===== ディレクトリ比較結果 =====");
	log(`Dir1 : ${dir1}`);
	log(`Dir2 : ${dir2}`);
	log(`Algo : ${algo}`);
	log(`Time : ${new Date().toLocaleString("ja-JP")}`);
	log("================================");

	// ファイル一覧を取得
	const files1 = await getAllFiles(dir1);
	const files2 = await getAllFiles(dir2);

	const set1 = new Set(files1);
	const set2 = new Set(files2);

	// dir1のみに存在するファイル
	const onlyInDir1 = files1.filter((f) => !set2.has(f));
	// dir2のみに存在するファイル
	const onlyInDir2 = files2.filter((f) => !set1.has(f));
	// 両方に存在するファイル
	const common = files1.filter((f) => set2.has(f));

	let diffFound = false;

	if (onlyInDir1.length > 0) {
		diffFound = true;
		log("");
		log("➖ dir1にのみ存在");
		log("----------------------");
		for (const f of onlyInDir1) {
			log(f);
		}
	}

	if (onlyInDir2.length > 0) {
		diffFound = true;
		log("");
		log("➕ dir2にのみ存在");
		log("----------------------");
		for (const f of onlyInDir2) {
			log(f);
		}
	}

	// 共通ファイルの比較
	log("");
	log("🔍 共通ファイルをチェック中...");

	for (const rel of common) {
		const f1 = join(dir1, rel);
		const f2 = join(dir2, rel);

		try {
			const s1 = await getFileSize(f1);
			const s2 = await getFileSize(f2);

			if (s1 !== s2) {
				log(`🟡 DIFF(size) : ${rel}  (${s1} vs ${s2} bytes)`);
				diffFound = true;
				continue;
			}

			const h1 = await hashFile(f1, algo);
			const h2 = await hashFile(f2, algo);

			if (h1 === h2) {
				log(`✅ SAME        : ${rel}`);
			} else {
				log(`🟡 DIFF(hash) : ${rel}`);
				log(`    ${h1}`);
				log(`    ${h2}`);
				diffFound = true;
			}
		} catch (_error) {
			log(`⚠️  エラー: ${rel} の比較に失敗しました`);
			diffFound = true;
		}
	}

	log("");
	if (!diffFound) {
		log("🎉 完全一致：ファイル構成と内容が同一です。");
	} else {
		log("⚠️  差分あり：詳細は上記を確認してください。");
	}

	// 結果をファイルに保存
	await writeFile(outFile, output.join("\n"));
	log("");
	log(`結果を保存しました: ${outFile}`);

	return diffFound ? 1 : 0;
}

// スクリプトとして直接実行された場合
if (import.meta.main) {
	const exitCode = await main();
	process.exit(exitCode);
}
