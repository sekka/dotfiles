#!/usr/bin/env bun
/**
 * 特定のコミットの日時を書き換える
 *
 * git filter-branchを使用して、特定のコミットの著者日時とコミッター日時を書き換える。
 *
 * ⚠️ 警告: このスクリプトはGit履歴を書き換えます。慎重に使用してください。
 *
 * 使用方法:
 *   rewrite-commit-date [--committer-date-now] <コミットハッシュ> "新しい日時"
 *
 * オプション:
 *   --committer-date-now  コミッター日時を現在時刻にし、著者日時のみ指定した日時にする
 *
 * 例:
 *   # 著者日時とコミッター日時を同じにする
 *   rewrite-commit-date 1a2b3c4d "2024-01-01 10:30:00"
 *
 *   # 著者日時のみ設定し、コミッター日時は現在時刻にする
 *   rewrite-commit-date --committer-date-now 1a2b3c4d "2024-01-01 10:30:00"
 *
 * 注意:
 *   - 作業ディレクトリがクリーンである必要があります
 *   - 実行前にリポジトリのバックアップを強く推奨します
 *   - すべてのブランチとタグの履歴が書き換えられます
 */

import { $ } from "bun";
import * as readline from "node:readline";

/**
 * 引数をパースして結果を返す
 * @param args - コマンドライン引数
 * @returns パース結果、または無効な引数の場合はnull
 */
export function parseArgs(args: string[]): {
  committerDateNow: boolean;
  commitHash: string;
  newDate: string;
} | null {
  if (args.length === 0) {
    return null;
  }

  if (args[0] === "--committer-date-now") {
    if (args.length !== 3) {
      return null;
    }
    return {
      committerDateNow: true,
      commitHash: args[1],
      newDate: args[2],
    };
  } else {
    if (args.length !== 2) {
      return null;
    }
    return {
      committerDateNow: false,
      commitHash: args[0],
      newDate: args[1],
    };
  }
}

/**
 * 使用方法を表示する
 */
export function showUsage(): void {
  const scriptName = "rewrite-commit-date";
  console.error(`使用方法: ${scriptName} [--committer-date-now] <コミットハッシュ> "新しい日時"`);
  console.error("");
  console.error("例:");
  console.error("  # 著者日時とコミッター日時を同じにする");
  console.error(`  ${scriptName} 1a2b3c4d "2024-01-01 10:30:00"`);
  console.error("");
  console.error("  # 著者日時のみ設定し、コミッター日時は現在時刻にする");
  console.error(`  ${scriptName} --committer-date-now 1a2b3c4d "2024-01-01 10:30:00"`);
}

/**
 * 作業ディレクトリがクリーンかどうか確認する
 * @returns クリーンな場合はtrue
 */
export async function isWorkingDirectoryClean(): Promise<boolean> {
  const result = await $`git status --porcelain`.quiet();
  return result.text().trim() === "";
}

/**
 * コミットハッシュを完全な形式に解決する
 * @param shortHash - 短いハッシュ
 * @returns 完全なハッシュ、失敗した場合はnull
 */
export async function resolveCommitHash(shortHash: string): Promise<string | null> {
  const result = await $`git rev-parse ${shortHash}`.quiet().nothrow();
  if (result.exitCode === 0) {
    return result.text().trim();
  }
  return null;
}

/**
 * ユーザーに確認を求める
 * @param message - 確認メッセージ
 * @returns 続行する場合はtrue
 */
export async function confirmAction(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y");
    });
  });
}

/**
 * コミットの日時を書き換える
 * @param targetCommit - 対象のコミットハッシュ
 * @param newDate - 新しい日時
 * @param committerDateNow - コミッター日時を現在時刻にするかどうか
 * @returns 成功した場合はtrue
 */
export async function rewriteCommitDate(
  targetCommit: string,
  newDate: string,
  committerDateNow: boolean
): Promise<boolean> {
  // 現在時刻を取得（RFC 2822形式）
  const nowDate = new Date().toUTCString();

  // 環境フィルタを構築
  let envFilter: string;
  if (committerDateNow) {
    envFilter = `
if [ "\\$GIT_COMMIT" = "${targetCommit}" ]; then
    export GIT_AUTHOR_DATE='${newDate}';
    export GIT_COMMITTER_DATE='${nowDate}';
fi
`;
  } else {
    envFilter = `
if [ "\\$GIT_COMMIT" = "${targetCommit}" ]; then
    export GIT_AUTHOR_DATE='${newDate}';
    export GIT_COMMITTER_DATE='${newDate}';
fi
`;
  }

  // git filter-branchを実行
  const result =
    await $`git filter-branch --force --env-filter ${envFilter} --tag-name-filter cat -- --all`.nothrow();

  if (result.exitCode !== 0) {
    console.error("エラー: git filter-branch に失敗しました");
    console.error(result.stderr.toString());
    return false;
  }

  return true;
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

  // 作業ディレクトリがクリーンか確認
  if (!(await isWorkingDirectoryClean())) {
    console.error(
      "エラー: 作業ディレクトリがクリーンではありません。変更をコミットまたはスタッシュしてください。"
    );
    return 1;
  }

  // コミットハッシュを解決
  const fullHash = await resolveCommitHash(parsed.commitHash);
  if (!fullHash) {
    console.error(`エラー: コミット '${parsed.commitHash}' が見つかりません。`);
    return 1;
  }

  // 警告を表示
  console.log("⚠️  警告: 'git filter-branch' による履歴書き換え");
  console.log("すべてのブランチとタグの履歴が書き換えられます。");
  console.log("この操作は破壊的です。事前にリポジトリのバックアップを強く推奨します。");

  // 確認を求める
  const confirmed = await confirmAction("続行しますか？");
  if (!confirmed) {
    console.log("中止しました。");
    return 1;
  }

  // 実行
  const success = await rewriteCommitDate(fullHash, parsed.newDate, parsed.committerDateNow);

  if (!success) {
    return 1;
  }

  console.log("");
  console.log("✅ 'git filter-branch' が完了しました。");
  console.log("コミット履歴が書き換えられました。");
  console.log("'git log' で変更を確認してください。");
  console.log("");
  console.log("問題なければ、Gitが作成したバックアップを以下のコマンドで削除できます:");
  console.log(
    "git for-each-ref --format='%(refname)' refs/original/ | xargs -n 1 git update-ref -d"
  );

  return 0;
}

// スクリプトとして直接実行された場合
if (import.meta.main) {
  const exitCode = await main();
  process.exit(exitCode);
}
