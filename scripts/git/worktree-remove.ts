#!/usr/bin/env bun
/**
 * Git worktreeを削除する
 *
 * 指定したパスのworktreeを安全に削除する。
 * 通常のリポジトリは削除対象外（worktreeのみ削除可能）。
 *
 * 使用方法:
 *   worktree-remove <パス> [パス2 ...]
 *
 * パス形式:
 *   - ghqパス: github.com/org/project-issue-123（ghqが必要）
 *   - 絶対パス: /home/user/projects/repo-issue-123
 *   - 相対パス: ../repo-issue-123
 *
 * 依存関係:
 *   - git（必須）
 *   - ghq（ghqスタイルのパスを使用する場合のみ）
 *
 * 参考:
 *   https://zenn.dev/genda_jp/articles/2025-12-07-manage-git-worktree-with-ghq
 */

import { $ } from "bun";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * ghqのルートディレクトリを取得する
 * @returns ghqのルートパス、取得できない場合はnull
 */
export async function getGhqRoot(): Promise<string | null> {
  try {
    const result = await $`ghq root`.quiet().nothrow();
    if (result.exitCode === 0) {
      return result.text().trim();
    }
  } catch {
    // ghqがインストールされていない場合
  }
  return null;
}

/**
 * パスを解決する（ghqパス、絶対パス、相対パスをサポート）
 * @param input - 入力パス
 * @returns 解決された絶対パス
 */
export async function resolvePath(input: string): Promise<string> {
  // 絶対パス
  if (input.startsWith("/")) {
    return input;
  }

  // 相対パス（. または .. で始まる）
  if (input.startsWith(".")) {
    return resolve(input);
  }

  // ghqスタイルのパス（例: github.com/org/repo）
  const ghqRoot = await getGhqRoot();
  if (ghqRoot) {
    return `${ghqRoot}/${input}`;
  }

  // フォールバック: カレントディレクトリからの相対パスとして扱う
  return resolve(input);
}

/**
 * .gitファイルからメインリポジトリのパスを取得する
 * @param worktreePath - worktreeのパス
 * @returns メインリポジトリのパス、取得できない場合はnull
 */
export function getMainRepoPath(worktreePath: string): string | null {
  const gitFilePath = `${worktreePath}/.git`;
  try {
    const content = readFileSync(gitFilePath, "utf-8");
    // gitdir: /path/to/main/.git/worktrees/branch-name の形式
    const match = content.match(/gitdir:\s*(.+)/);
    if (match) {
      // .git/worktrees/... の部分を削除してメインリポジトリのパスを取得
      const gitDir = match[1].trim();
      return gitDir.replace(/\/.git\/worktrees\/.*$/, "");
    }
  } catch {
    // ファイルが読めない場合
  }
  return null;
}

/**
 * worktreeを削除する
 * @param path - 削除するworktreeのパス
 * @returns 成功した場合はtrue
 */
export async function removeWorktree(path: string): Promise<boolean> {
  // ディレクトリが存在するか確認
  if (!existsSync(path)) {
    console.error(`  警告: ディレクトリが存在しません: ${path}`);
    return false;
  }

  // .gitファイルの存在を確認（worktreeの判定）
  const gitFilePath = `${path}/.git`;
  if (!existsSync(gitFilePath)) {
    console.error(`  警告: Gitリポジトリではありません: ${path}`);
    return false;
  }

  // .gitがファイルかディレクトリかを確認
  const gitFileContent = await Bun.file(gitFilePath).text().catch(() => "");
  if (!gitFileContent.startsWith("gitdir:")) {
    console.error(`  警告: worktreeではありません（通常のリポジトリ）: ${path}`);
    return false;
  }

  // メインリポジトリのパスを取得
  const mainRepo = getMainRepoPath(path);
  if (!mainRepo) {
    console.error(`  エラー: メインリポジトリを特定できません: ${path}`);
    return false;
  }

  console.log("  -> worktreeを削除中...");

  // git worktree remove を実行
  const result = await $`git -C ${mainRepo} worktree remove --force ${path}`.nothrow();

  if (result.exitCode !== 0) {
    console.error(`  エラー: worktreeの削除に失敗しました`);
    console.error(result.stderr.toString());
    return false;
  }

  console.log(`  * 削除完了: ${path}`);
  return true;
}

/**
 * 使用方法を表示する
 */
export function showUsage(): void {
  console.error("使用方法: worktree-remove <パス> [パス2 ...]");
  console.error("");
  console.error("パス形式:");
  console.error("  ghqパス:  github.com/org/project-issue-123");
  console.error("  絶対パス: /home/user/projects/repo-issue-123");
  console.error("  相対パス: ../repo-issue-123");
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

  // gitコマンドの存在確認
  const gitCheck = await $`command -v git`.quiet().nothrow();
  if (gitCheck.exitCode !== 0) {
    console.error("エラー: gitコマンドが見つかりません。インストールしてください。");
    return 1;
  }

  // 各パスを処理
  for (const repo of args) {
    const repoPath = await resolvePath(repo);
    console.log(`処理中: ${repo}`);

    await removeWorktree(repoPath);
    console.log("");
  }

  console.log("* 完了しました。");
  return 0;
}

// スクリプトとして直接実行された場合
if (import.meta.main) {
  const exitCode = await main();
  process.exit(exitCode);
}
