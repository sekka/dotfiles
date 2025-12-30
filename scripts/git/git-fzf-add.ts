#!/usr/bin/env bun
/**
 * git-fzf-add - Simple-Git + Execa版
 *
 * Gitの変更ファイルをfzfで選択してステージングする
 *
 * Usage:
 *   git-fzf-add.ts
 *
 * Keys:
 *   Tab     - 複数選択
 *   Ctrl+D  - 選択ファイルのdiffを表示
 */

import simpleGit from "simple-git";
import { execa } from "execa";

const git = simpleGit();

/**
 * gitリポジトリ内かどうかを確認
 */
export async function isGitRepository(): Promise<boolean> {
	try {
		await git.revparse(["--git-dir"]);
		return true;
	} catch {
		return false;
	}
}

/**
 * 変更されたファイルの一覧を取得
 */
export async function getChangedFiles(): Promise<string[]> {
	try {
		const diff = await git.diff(["--name-only", "--diff-filter=ACMRU"]);
		return diff.split("\n").filter((f) => f.length > 0);
	} catch {
		return [];
	}
}

/**
 * fzfでファイルを選択
 * Execa の input パラメータを直接使用して null byte を安全に処理
 */
export async function selectFilesWithFzf(files: string[]): Promise<string[]> {
	if (files.length === 0) {
		return [];
	}

	const input = files.join("\0");
	const fzfCmd = process.env.TMUX ? "fzf-tmux" : "fzf";
	const args = [
		...(process.env.TMUX ? ["-p", "90%,90%", "--"] : []),
		"--read0",
		"--print0",
		"--multi",
		"--preview",
		"git diff --color=always {} 2>/dev/null || cat {}",
		"--preview-window=right:60%:wrap",
		"--header",
		"Select files to add (Tab: multi-select, Ctrl-d: diff)",
		"--bind",
		"ctrl-d:execute(git diff --color=always {} | less -R)",
	];

	try {
		// Shell を経由せず、Execa の input パラメータを直接使用
		// これにより null byte を安全に処理でき、shell injection リスクが低減される
		const { stdout } = await execa(fzfCmd, args, {
			input: input,
			reject: false,
		});
		return stdout.split("\0").filter((f) => f.length > 0);
	} catch {
		return [];
	}
}

/**
 * ファイルをgit addでステージング
 */
export async function stageFiles(files: string[]): Promise<boolean> {
	if (files.length === 0) {
		return false;
	}

	try {
		await git.add(files);
		return true;
	} catch {
		return false;
	}
}

/**
 * メイン処理
 */
export async function main(): Promise<number> {
	// gitリポジトリ内かチェック
	if (!(await isGitRepository())) {
		console.error("Not a git repository");
		return 1;
	}

	// 変更ファイルを取得
	const changedFiles = await getChangedFiles();
	if (changedFiles.length === 0) {
		console.log("No changed files to stage");
		return 0;
	}

	// fzfで選択
	const selectedFiles = await selectFilesWithFzf(changedFiles);
	if (selectedFiles.length === 0) {
		return 0;
	}

	// git add実行
	const success = await stageFiles(selectedFiles);
	if (success) {
		console.log("Added files:");
		for (const f of selectedFiles) {
			console.log(`  ${f}`);
		}
		return 0;
	} else {
		console.error("Failed to stage files");
		return 1;
	}
}

// 直接実行された場合のみmainを実行
// import.meta.mainはBun固有の機能
if (import.meta.main) {
	const exitCode = await main();
	process.exit(exitCode);
}
