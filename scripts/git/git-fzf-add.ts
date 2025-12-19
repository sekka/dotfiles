#!/usr/bin/env bun
/**
 * git-fzf-add
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

import { $ } from "bun";

/**
 * gitリポジトリ内かどうかを確認
 */
export async function isGitRepository(): Promise<boolean> {
  const result = await $`git rev-parse --git-dir`.quiet().nothrow();
  return result.exitCode === 0;
}

/**
 * 変更されたファイルの一覧を取得
 */
export async function getChangedFiles(): Promise<string[]> {
  const result = await $`git diff -z --name-only --diff-filter=ACMRU`
    .quiet()
    .nothrow();

  if (result.exitCode !== 0 || !result.stdout.length) {
    return [];
  }

  return result.stdout
    .toString()
    .split("\0")
    .filter((f) => f.length > 0);
}

/**
 * fzfでファイルを選択
 */
export async function selectFilesWithFzf(files: string[]): Promise<string[]> {
  if (files.length === 0) {
    return [];
  }

  // NUL区切りで入力を渡す
  const input = files.join("\0");

  const result =
    await $`echo -n ${input} | fzf --read0 --print0 --multi \
    --preview "git diff --color=always {} 2>/dev/null || cat {}" \
    --preview-window=right:60%:wrap \
    --header "Select files to add (Tab: multi-select, Ctrl-d: diff)" \
    --bind "ctrl-d:execute(git diff --color=always {} | less -R)"`
      .quiet()
      .nothrow();

  if (result.exitCode !== 0 || !result.stdout.length) {
    return [];
  }

  return result.stdout
    .toString()
    .split("\0")
    .filter((f) => f.length > 0);
}

/**
 * ファイルをgit addでステージング
 */
export async function stageFiles(files: string[]): Promise<boolean> {
  if (files.length === 0) {
    return false;
  }

  const result = await $`git add ${files}`.quiet().nothrow();
  return result.exitCode === 0;
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
    selectedFiles.forEach((f) => console.log(`  ${f}`));
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
