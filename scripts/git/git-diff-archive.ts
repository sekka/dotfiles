#!/usr/bin/env bun
/**
 * git-diff-archive
 *
 * 指定したコミット間の差分ファイルをzipアーカイブとして出力する
 *
 * Usage:
 *   git-diff-archive.ts              # 最新コミットの変更をアーカイブ
 *   git-diff-archive.ts 3            # 直近3コミットの変更をアーカイブ
 *   git-diff-archive.ts abc123       # abc123からHEADまでの変更をアーカイブ
 *   git-diff-archive.ts HEAD abc123  # abc123からHEADまでの変更をアーカイブ
 */

import { $ } from "bun";

/**
 * gitリポジトリ内かどうかを確認
 */
export async function isGitRepository(): Promise<boolean> {
	const result = await $`git rev-parse --git-dir`.quiet().nothrow();
	return result.exitCode === 0;
}

/**
 * 引数を解析して差分取得のためのパラメータを返す
 */
export function parseArgs(args: string[]): {
	headRef: string;
	fromRef: string;
} {
	if (args.length === 0) {
		// 引数なし: 直近1コミット
		return { headRef: "HEAD", fromRef: "HEAD~1" };
	}

	if (args.length === 1) {
		const arg = args[0];
		// 数値の場合はHEAD~Nとして扱う
		if (/^\d+$/.test(arg)) {
			return { headRef: "HEAD", fromRef: `HEAD~${arg}` };
		}
		// それ以外はコミットハッシュとして扱う
		return { headRef: "HEAD", fromRef: arg };
	}

	// 2つの引数: args[0]がHEAD、args[1]がFROM
	return { headRef: args[0], fromRef: args[1] };
}

/**
 * 差分ファイル一覧を取得
 * -z フラグを使用してNUL区切りで取得し、スペースを含むファイル名に対応
 */
export async function getDiffFiles(
	fromRef: string,
	toRef: string,
): Promise<string[]> {
	const result =
		await $`git diff --diff-filter=d --name-only -z ${fromRef} ${toRef}`
			.quiet()
			.nothrow();

	if (result.exitCode !== 0 || !result.stdout.length) {
		return [];
	}

	// NUL区切り（\0）で分割
	return result.stdout
		.toString()
		.split("\0")
		.filter((f) => f.length > 0);
}

/**
 * アーカイブを作成
 */
export async function createArchive(
	headRef: string,
	files: string[],
	outputPath: string = "archive.zip",
): Promise<boolean> {
	if (files.length === 0) {
		return false;
	}

	const result =
		await $`git archive --format=zip --prefix=root/ ${headRef} ${files} -o ${outputPath}`
			.quiet()
			.nothrow();

	return result.exitCode === 0;
}

/**
 * メイン処理
 */
export async function main(args: string[]): Promise<number> {
	if (!(await isGitRepository())) {
		console.error("Not a git repository");
		return 1;
	}

	const { headRef, fromRef } = parseArgs(args);
	const files = await getDiffFiles(fromRef, headRef);

	if (files.length === 0) {
		console.log("No files to archive");
		return 1;
	}

	const success = await createArchive(headRef, files);
	if (success) {
		console.log(`Created archive.zip with ${files.length} files`);
		return 0;
	} else {
		console.error("Failed to create archive");
		return 1;
	}
}

if (import.meta.main) {
	const args = process.argv.slice(2);
	const exitCode = await main(args);
	process.exit(exitCode);
}
