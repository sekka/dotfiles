#!/usr/bin/env bun

/**
 * GitHub Pull RequestからGit worktreeを作成する
 *
 * 指定したPRのブランチをチェックアウトしてコードレビュー用のworktreeを作成する。
 *
 * 使用方法:
 *   pr-worktree-create <PR番号> [PR番号2 ...]
 *
 * 例:
 *   pr-worktree-create 123
 *   pr-worktree-create 123 456 789
 *
 * 依存関係:
 *   - gh (GitHub CLI)（必須）
 *   - git（必須）
 *   - repo-setup（オプション、worktree作成後のセットアップに使用）
 *
 * 参考:
 *   https://zenn.dev/genda_jp/articles/2025-12-07-manage-git-worktree-with-ghq
 */

import { existsSync } from "node:fs";
import { basename, dirname } from "node:path";
import { $ } from "bun";

/**
 * 必要なコマンドが存在するか確認する
 * @param commands - 確認するコマンドのリスト
 * @returns すべて存在する場合はtrue
 */
export async function checkDependencies(commands: string[]): Promise<boolean> {
	for (const cmd of commands) {
		const result = await $`command -v ${cmd}`.quiet().nothrow();
		if (result.exitCode !== 0) {
			console.error(`エラー: ${cmd} コマンドが見つかりません。インストールしてください。`);
			return false;
		}
	}
	return true;
}

/**
 * PR番号が有効かどうか確認する
 * @param prNumber - PR番号
 * @returns 有効な場合はtrue
 */
export function isValidPrNumber(prNumber: string): boolean {
	return /^\d+$/.test(prNumber);
}

/**
 * PRのブランチ名を取得する
 * @param prNumber - PR番号
 * @returns ブランチ名、失敗した場合はnull
 */
export async function getPrBranchName(prNumber: string): Promise<string | null> {
	try {
		const result = await $`gh pr view ${prNumber} --json headRefName --jq .headRefName`
			.quiet()
			.nothrow();

		if (result.exitCode === 0) {
			const branch = result.text().trim();
			return branch || null;
		}
	} catch {
		// 取得に失敗
	}
	return null;
}

/**
 * PR用のworktreeを作成する
 * @param prNumber - PR番号
 * @returns 成功した場合はtrue
 */
export async function createPrWorktree(prNumber: string): Promise<boolean> {
	console.log(`=== PR #${prNumber} を処理中 ===`);

	// PRのブランチ名を取得
	console.log(`-> PR #${prNumber} の情報を取得中...`);
	const prBranch = await getPrBranchName(prNumber);

	if (!prBranch) {
		console.error(`エラー: PR #${prNumber} のブランチ名を取得できませんでした。`);
		console.error("PRが存在するか、アクセス権があるか確認してください。");
		return false;
	}

	console.log(`* PR #${prNumber} のブランチ: ${prBranch}`);

	// リポジトリ名を取得
	const repoRoot = await $`git rev-parse --show-toplevel`.text();
	const repoName = basename(repoRoot.trim());
	const parentDir = dirname(repoRoot.trim());
	const worktreePath = `${parentDir}/${repoName}-pr-${prNumber}`;

	// 既存のworktreeを確認
	if (existsSync(worktreePath)) {
		console.log(`* Worktreeは既に存在します: ${worktreePath}`);
		const currentBranch = await $`git -C ${worktreePath} branch --show-current`.text();
		console.log(`* ブランチ: ${currentBranch.trim()}`);
		return true;
	}

	// リモートブランチが存在するか確認
	const remoteBranchCheck =
		await $`git show-ref --verify --quiet refs/remotes/origin/${prBranch}`.nothrow();

	if (remoteBranchCheck.exitCode !== 0) {
		console.error(`エラー: リモートブランチ 'origin/${prBranch}' が見つかりません。`);
		return false;
	}

	// worktreeを作成
	console.log("-> Worktreeを作成中...");
	let result = await $`git worktree add ${worktreePath} origin/${prBranch}`.nothrow();

	if (result.exitCode !== 0) {
		console.error("エラー: worktreeの作成に失敗しました");
		console.error(result.stderr.toString());
		return false;
	}

	// ローカルブランチを作成してチェックアウト
	result = await $`git -C ${worktreePath} checkout -b ${prBranch} origin/${prBranch}`.nothrow();

	if (result.exitCode !== 0) {
		// すでにブランチが存在する場合はチェックアウトのみ
		await $`git -C ${worktreePath} checkout ${prBranch}`.nothrow();
	}

	console.log(`* Worktreeを作成しました: ${worktreePath}`);

	// repo-setupが存在する場合は実行
	const repoSetupCheck = await $`command -v repo-setup`.quiet().nothrow();
	if (repoSetupCheck.exitCode === 0) {
		console.log("-> repo-setupを実行中...");
		await $`cd ${worktreePath} && repo-setup`.quiet().nothrow();
	}

	return true;
}

/**
 * 使用方法を表示する
 */
export function showUsage(): void {
	console.error("使用方法: pr-worktree-create <PR番号> [PR番号2 ...]");
	console.error("");
	console.error("例:");
	console.error("  pr-worktree-create 123");
	console.error("  pr-worktree-create 123 456 789");
}

/**
 * メイン関数
 */
export async function main(): Promise<number> {
	const args = process.argv.slice(2);

	// 引数チェック
	if (args.length === 0) {
		showUsage();
		return 1;
	}

	// 依存関係チェック
	if (!(await checkDependencies(["gh", "git"]))) {
		return 1;
	}

	// リモートをフェッチ
	console.log("-> リモートをフェッチ中...");
	await $`git fetch origin`.quiet().nothrow();
	console.log("");

	// 各PR番号を処理
	for (const prNumber of args) {
		if (!isValidPrNumber(prNumber)) {
			console.error(`警告: '${prNumber}' は有効なPR番号ではありません。スキップします。`);
			console.log("");
			continue;
		}

		await createPrWorktree(prNumber);
		console.log("");
	}

	console.log("* すべてのPRレビュー用worktreeの準備が完了しました。");
	return 0;
}

// スクリプトとして直接実行された場合
if (import.meta.main) {
	const exitCode = await main();
	process.exit(exitCode);
}
