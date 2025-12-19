#!/usr/bin/env bun
/**
 * カスタム日時でGitコミットを作成する
 *
 * 使用方法:
 *   custom-commit "日時" "コミットメッセージ"
 *   custom-commit "著者日時" "コミッター日時" "コミットメッセージ"
 *
 * 例:
 *   custom-commit "2024-01-01 10:00:00" "feat: 新機能を追加"
 *   custom-commit "2024-01-01 10:00:00" "2024-01-01 10:05:00" "feat: 新機能を追加"
 *
 * 注意:
 *   - 1つの日時を指定した場合、著者日時とコミッター日時の両方に使用される
 *   - タイムゾーンを省略した場合、+0900（東京）がデフォルトで使用される
 *   - このスクリプトを実行する前に `git add` でファイルをステージングすること
 */

import { $ } from "bun";

// デフォルトのタイムゾーン（東京）
const DEFAULT_TIMEZONE = "+0900";

/**
 * 日付文字列にタイムゾーンが含まれていない場合、東京のタイムゾーンを追加する
 * @param dateStr - 日付文字列
 * @returns タイムゾーン付きの日付文字列
 */
export function appendTokyoTimezone(dateStr: string): string {
  // タイムゾーンのパターン: +HHMM または -HHMM
  const timezonePattern = /[+-]\d{4}$/;

  if (timezonePattern.test(dateStr)) {
    return dateStr;
  }

  return `${dateStr} ${DEFAULT_TIMEZONE}`;
}

/**
 * 引数をパースして、著者日時、コミッター日時、コミットメッセージを返す
 * @param args - コマンドライン引数
 * @returns パース結果、または無効な引数の場合はnull
 */
export function parseArgs(
  args: string[]
): { authorDate: string; committerDate: string; message: string } | null {
  if (args.length === 2) {
    // 2引数: 日時 メッセージ
    const date = appendTokyoTimezone(args[0]);
    return {
      authorDate: date,
      committerDate: date,
      message: args[1],
    };
  } else if (args.length === 3) {
    // 3引数: 著者日時 コミッター日時 メッセージ
    return {
      authorDate: appendTokyoTimezone(args[0]),
      committerDate: appendTokyoTimezone(args[1]),
      message: args[2],
    };
  }

  return null;
}

/**
 * 使用方法を表示する
 */
export function showUsage(): void {
  const scriptName = "custom-commit";
  console.error(`使用方法: ${scriptName} "日時" "コミットメッセージ"`);
  console.error(`    または: ${scriptName} "著者日時" "コミッター日時" "コミットメッセージ"`);
  console.error("");
  console.error("例:");
  console.error(`  ${scriptName} "2024-01-01 10:00:00" "feat: 新機能を追加"`);
  console.error(
    `  ${scriptName} "2024-01-01 10:00:00" "2024-01-01 10:05:00" "feat: 新機能を追加"`
  );
  console.error("");
  console.error("注意:");
  console.error("  - タイムゾーン省略時は +0900（東京）が自動付与されます");
  console.error("  - 事前に git add でファイルをステージングしてください");
}

/**
 * カスタム日時でコミットを実行する
 * @param authorDate - 著者日時
 * @param committerDate - コミッター日時
 * @param message - コミットメッセージ
 * @returns 成功した場合はtrue
 */
export async function commitWithCustomDate(
  authorDate: string,
  committerDate: string,
  message: string
): Promise<boolean> {
  try {
    // 環境変数を設定してコミット
    const result = await $`git commit -m ${message}`
      .env({
        ...process.env,
        GIT_AUTHOR_DATE: authorDate,
        GIT_COMMITTER_DATE: committerDate,
      })
      .nothrow();

    if (result.exitCode !== 0) {
      console.error("エラー: git commit に失敗しました");
      console.error(result.stderr.toString());
      return false;
    }

    return true;
  } catch (error) {
    console.error("エラー:", error);
    return false;
  }
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

  const success = await commitWithCustomDate(
    parsed.authorDate,
    parsed.committerDate,
    parsed.message
  );

  return success ? 0 : 1;
}

// スクリプトとして直接実行された場合
if (import.meta.main) {
  const exitCode = await main();
  process.exit(exitCode);
}
