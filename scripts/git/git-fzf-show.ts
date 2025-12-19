#!/usr/bin/env bun
/**
 * git-fzf-show
 *
 * Gitコミットログをfzfで閲覧・選択する
 *
 * Usage:
 *   git-fzf-show.ts           # コミット一覧を表示
 *   git-fzf-show.ts --all     # 全ブランチのコミットを表示
 *
 * Keys:
 *   Enter   - 選択したコミットの詳細を表示
 *   Ctrl+S  - ソート切り替え
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
 * コミットログを取得
 */
export async function getCommitLog(args: string[] = []): Promise<string> {
  const result =
    await $`git log --graph --color=always --format="%C(auto)%h%d %s %C(black)%C(bold)%cr" ${args}`
      .quiet()
      .nothrow();

  if (result.exitCode !== 0) {
    return "";
  }

  return result.stdout.toString();
}

/**
 * fzfでコミットを選択して詳細表示
 */
export async function showCommitsWithFzf(logOutput: string): Promise<void> {
  if (!logOutput) {
    console.log("No commits found");
    return;
  }

  // fzfでコミットを選択し、詳細を表示
  await $`echo ${logOutput} | fzf --ansi \
    --no-sort \
    --reverse \
    --tiebreak=index \
    --bind=ctrl-s:toggle-sort \
    --bind "ctrl-m:execute:
      (grep -o '[a-f0-9]\\{7\\}' | head -1 |
      xargs -I % sh -c 'git show --color=always % | less -R') << 'FZF-EOF'
      {}
FZF-EOF"`.nothrow();
}

/**
 * メイン処理
 */
export async function main(args: string[]): Promise<number> {
  if (!(await isGitRepository())) {
    console.error("Not a git repository");
    return 1;
  }

  const logOutput = await getCommitLog(args);
  await showCommitsWithFzf(logOutput);

  return 0;
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const exitCode = await main(args);
  process.exit(exitCode);
}
