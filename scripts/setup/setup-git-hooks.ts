#!/usr/bin/env bun
/**
 * Git hooksセットアップスクリプト
 *
 * .githooks/ ディレクトリ内のhookファイルを .git/hooks/ にコピーする。
 * コピー後、実行権限を自動的に付与する。
 *
 * 使用方法:
 *   setup-git-hooks
 *
 * 前提条件:
 *   - Gitリポジトリのルートディレクトリで実行すること
 *   - .githooks/ ディレクトリが存在すること
 */

import { existsSync, readdirSync, statSync } from "node:fs";
import { chmod, copyFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

// カラー出力用
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const NC = "\x1b[0m"; // No Color

/**
 * .gitディレクトリが存在するか確認する
 */
export function isGitRepository(): boolean {
	return existsSync(".git");
}

/**
 * .githooksディレクトリが存在するか確認する
 */
export function hasGithooksDir(): boolean {
	return existsSync(".githooks");
}

/**
 * .githooksディレクトリ内のhookファイルを取得する
 */
export function getHookFiles(): string[] {
	const githooksDir = ".githooks";

	if (!existsSync(githooksDir)) {
		return [];
	}

	const entries = readdirSync(githooksDir);
	return entries.filter((entry) => {
		const fullPath = join(githooksDir, entry);
		return statSync(fullPath).isFile();
	});
}

/**
 * hookファイルをコピーして実行権限を付与する
 */
export async function copyHook(hookName: string): Promise<boolean> {
	const source = join(".githooks", hookName);
	const target = join(".git/hooks", hookName);

	try {
		await copyFile(source, target);
		await chmod(target, 0o755);
		return true;
	} catch (_error) {
		console.error(`${RED}❌ コピー失敗: ${hookName}${NC}`);
		return false;
	}
}

/**
 * メイン関数
 */
export async function main(): Promise<number> {
	console.log("🔧 Git hooks をセットアップしています...");

	// .git ディレクトリの存在確認
	if (!isGitRepository()) {
		console.error(
			`${RED}❌ .git ディレクトリが見つかりません。Gitリポジトリのルートで実行してください。${NC}`,
		);
		return 1;
	}

	// .githooks ディレクトリの存在確認
	if (!hasGithooksDir()) {
		console.error(`${RED}❌ .githooks ディレクトリが見つかりません。${NC}`);
		return 1;
	}

	// .git/hooks ディレクトリの作成
	const hooksDir = ".git/hooks";
	if (!existsSync(hooksDir)) {
		await mkdir(hooksDir, { recursive: true });
	}

	// hookファイルの取得とコピー
	const hookFiles = getHookFiles();
	let copied = 0;

	for (const hook of hookFiles) {
		const success = await copyHook(hook);
		if (success) {
			console.log(`${GREEN}✅ コピー完了: ${hook}${NC}`);
			copied++;
		}
	}

	console.log("");
	console.log(
		`${GREEN}📊 Git hooks セットアップ完了: ${copied}個のhookがコピーされました${NC}`,
	);
	console.log(
		`${YELLOW}💡 これで commit前に自動的にlint/formatチェックが実行されます${NC}`,
	);

	return 0;
}

// スクリプトとして直接実行された場合
if (import.meta.main) {
	const exitCode = await main();
	process.exit(exitCode);
}
