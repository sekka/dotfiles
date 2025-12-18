#!/usr/bin/env bun
/**
 * GitHub IssueからGit worktreeを作成する
 *
 * 指定したGitHub IssueからWorktreeを作成する。
 * Claudeを使用してIssueの内容から説明的なブランチ名を生成する。
 * Claudeが利用できない場合はタイトルベースの命名にフォールバックする。
 *
 * 使用方法:
 *   issue-worktree-create <Issue番号> [Issue番号2 ...]
 *
 * 例:
 *   issue-worktree-create 123
 *   issue-worktree-create 123 456 789
 *
 * 依存関係:
 *   - gh (GitHub CLI)（必須）
 *   - jq（不要 - TypeScript版では使用しない）
 *   - claude (Anthropic CLI)（オプション、ブランチ名生成に使用）
 *   - repo-setup（オプション、worktree作成後のセットアップに使用）
 *
 * 参考:
 *   https://zenn.dev/genda_jp/articles/2025-12-07-manage-git-worktree-with-ghq
 */

import { $ } from "bun";
import { existsSync } from "node:fs";
import { basename, dirname } from "node:path";

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
 * Issue番号が有効かどうか確認する
 * @param issueNumber - Issue番号
 * @returns 有効な場合はtrue
 */
export function isValidIssueNumber(issueNumber: string): boolean {
  return /^\d+$/.test(issueNumber);
}

/**
 * GitHub IssueのJSONを取得する
 * @param issueNumber - Issue番号
 * @returns IssueのJSON、失敗した場合はnull
 */
export async function fetchIssueJson(
  issueNumber: string
): Promise<{ title: string; body: string; comments: string[] } | null> {
  try {
    const result = await $`gh issue view ${issueNumber} --json title,body,comments`
      .quiet()
      .nothrow();

    if (result.exitCode !== 0) {
      return null;
    }

    const json = JSON.parse(result.text());
    return {
      title: json.title || "",
      body: json.body || "",
      comments: (json.comments || []).map((c: { body: string }) => c.body || ""),
    };
  } catch {
    return null;
  }
}

/**
 * Claudeを使用してブランチ名のスラッグを生成する
 * @param title - Issueタイトル
 * @param body - Issue本文
 * @param comments - コメント（最初の2000文字まで）
 * @returns 生成されたスラッグ、失敗した場合はnull
 */
export async function generateBranchSlug(
  title: string,
  body: string,
  comments: string
): Promise<string | null> {
  // claudeコマンドが存在するか確認
  const claudeCheck = await $`command -v claude`.quiet().nothrow();
  if (claudeCheck.exitCode !== 0) {
    return null;
  }

  const prompt = `Generate a short English slug (kebab-case) for a Git branch name from the following issue.
- Maximum 5 words
- Lowercase and hyphens only
- Remove special characters
- Start with a verb if possible

Return ONLY the slug (no explanation).

---
Issue title: ${title}
---
Issue body:
${body}
---
Issue comments:
${comments.slice(0, 2000)}
---`;

  try {
    const result = await $`claude --print ${prompt}`.quiet().nothrow();
    if (result.exitCode === 0) {
      return result.text().trim();
    }
  } catch {
    // Claude実行に失敗
  }
  return null;
}

/**
 * Issue用のworktreeを作成する
 * @param issueNumber - Issue番号
 * @returns 成功した場合はtrue
 */
export async function createIssueWorktree(issueNumber: string): Promise<boolean> {
  console.log(`=== Issue #${issueNumber} を処理中 ===`);

  // Issue情報を取得
  console.log("-> Issue情報を取得中...");
  const issueJson = await fetchIssueJson(issueNumber);

  if (!issueJson) {
    console.error(`エラー: Issue #${issueNumber} の取得に失敗しました。`);
    return false;
  }

  if (!issueJson.title) {
    console.error(`エラー: Issue #${issueNumber} にタイトルがありません。`);
    return false;
  }

  // ブランチ名を生成
  console.log("-> ブランチ名を生成中...");
  let branchName: string;

  const slug = await generateBranchSlug(
    issueJson.title,
    issueJson.body,
    issueJson.comments.join("\n")
  );

  if (slug) {
    branchName = `issue-${issueNumber}-${slug}`;
  } else {
    console.log("  (フォールバック: Issue番号のみを使用)");
    branchName = `issue-${issueNumber}`;
  }
  console.log(`* ブランチ名: ${branchName}`);

  // リポジトリ名を取得
  const repoRoot = await $`git rev-parse --show-toplevel`.text();
  const repoName = basename(repoRoot.trim());
  const parentDir = dirname(repoRoot.trim());
  const worktreePath = `${parentDir}/${repoName}-${branchName}`;

  // 既存のworktreeを確認
  if (existsSync(worktreePath)) {
    console.log(`* Worktreeは既に存在します: ${worktreePath}`);
    console.log(`* ブランチ: ${branchName}`);
    return true;
  }

  // リモートブランチが存在するか確認
  const remoteBranchCheck =
    await $`git show-ref --verify --quiet refs/remotes/origin/${branchName}`.nothrow();

  if (remoteBranchCheck.exitCode === 0) {
    // リモートブランチが存在する場合
    const result = await $`git worktree add ${worktreePath} ${branchName}`.nothrow();
    if (result.exitCode !== 0) {
      console.error("エラー: worktreeの作成に失敗しました");
      console.error(result.stderr.toString());
      return false;
    }
    console.log(`* Worktreeを作成しました: ${worktreePath}`);
  } else {
    // 新しいブランチを作成
    const result = await $`git worktree add -b ${branchName} ${worktreePath}`.nothrow();
    if (result.exitCode !== 0) {
      console.error("エラー: worktreeの作成に失敗しました");
      console.error(result.stderr.toString());
      return false;
    }
    console.log(`* Worktreeを作成しました: ${worktreePath}`);
    console.log(`* ローカルブランチを作成しました: ${branchName}`);
  }

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
  console.error("使用方法: issue-worktree-create <Issue番号> [Issue番号2 ...]");
  console.error("");
  console.error("例:");
  console.error("  issue-worktree-create 123");
  console.error("  issue-worktree-create 123 456 789");
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

  // 依存関係チェック（TypeScript版ではjqは不要）
  if (!(await checkDependencies(["gh", "git"]))) {
    return 1;
  }

  // リモートをフェッチ
  console.log("-> リモートをフェッチ中...");
  await $`git fetch origin`.quiet().nothrow();
  console.log("");

  // 各Issue番号を処理
  for (const issueNumber of args) {
    if (!isValidIssueNumber(issueNumber)) {
      console.error(`警告: '${issueNumber}' は有効なIssue番号ではありません。スキップします。`);
      console.log("");
      continue;
    }

    await createIssueWorktree(issueNumber);
    console.log("");
  }

  console.log("* すべてのIssue worktreeの準備が完了しました。");
  return 0;
}

// スクリプトとして直接実行された場合
if (import.meta.main) {
  const exitCode = await main();
  process.exit(exitCode);
}
