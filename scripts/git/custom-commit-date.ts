#!/usr/bin/env bun
/**
 * カスタム著者日時でGitコミットを作成する
 *
 * 指定した著者日時でコミットを作成できる。
 * デフォルトではコミッター日時も著者日時と同じ値に設定される。
 *
 * 使用方法:
 *   custom-commit-date [--committer-date-now] "YYYY-MM-DD HH:MM:SS" "コミットメッセージ"
 *
 * オプション:
 *   --committer-date-now  コミッター日時を現在時刻にする
 *
 * 引数:
 *   $1: 著者日時（"YYYY-MM-DD HH:MM:SS" 形式）
 *   $2: コミットメッセージ
 *
 * 例:
 *   # 著者日時とコミッター日時を同じにする
 *   custom-commit-date "2023-01-01 12:30:00" "feat: 新機能を追加"
 *
 *   # コミッター日時を現在時刻にする
 *   custom-commit-date --committer-date-now "2023-01-01 12:30:00" "feat: 新機能を追加"
 */

import { $ } from "bun";

/**
 * 引数をパースして結果を返す
 * @param args - コマンドライン引数
 * @returns パース結果、または無効な引数の場合はnull
 */
export function parseArgs(args: string[]): {
	committerDateNow: boolean;
	date: string;
	message: string;
} | null {
	if (args.length === 0) {
		return null;
	}

	if (args[0] === "--committer-date-now") {
		// --committer-date-now モード: 3引数必要
		if (args.length !== 3) {
			return null;
		}
		return {
			committerDateNow: true,
			date: args[1],
			message: args[2],
		};
	} else {
		// 通常モード: 2引数必要
		if (args.length !== 2) {
			return null;
		}
		return {
			committerDateNow: false,
			date: args[0],
			message: args[1],
		};
	}
}

/**
 * 使用方法を表示する
 */
export function showUsage(): void {
	const scriptName = "custom-commit-date";
	console.error(
		`使用方法: ${scriptName} [--committer-date-now] "日時" "メッセージ"`,
	);
	console.error("");
	console.error("例:");
	console.error("  # 著者日時とコミッター日時を同じにする:");
	console.error(`  ${scriptName} "2023-01-01 12:30:00" "feat: 新機能を追加"`);
	console.error("");
	console.error("  # コミッター日時を現在時刻にする:");
	console.error(
		`  ${scriptName} --committer-date-now "2023-01-01 12:30:00" "feat: 新機能を追加"`,
	);
}

/**
 * カスタム日時でコミットを実行する
 * @param date - 著者日時
 * @param message - コミットメッセージ
 * @param committerDateNow - コミッター日時を現在時刻にするかどうか
 * @returns 成功した場合はtrue
 */
export async function commitWithDate(
	date: string,
	message: string,
	committerDateNow: boolean,
): Promise<boolean> {
	try {
		// 環境変数を設定
		const env: Record<string, string> = {
			...(process.env as Record<string, string>),
			GIT_AUTHOR_DATE: date,
		};

		// committerDateNow が false の場合のみコミッター日時を設定
		if (!committerDateNow) {
			env.GIT_COMMITTER_DATE = date;
		}

		// 情報を表示
		if (committerDateNow) {
			console.log(
				`著者日時を '${date}' に、コミッター日時を現在時刻に設定します。`,
			);
		} else {
			console.log(`著者日時とコミッター日時を '${date}' に設定します。`);
		}

		const result = await $`git commit -m ${message}`.env(env).nothrow();

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

	const success = await commitWithDate(
		parsed.date,
		parsed.message,
		parsed.committerDateNow,
	);
	return success ? 0 : 1;
}

// スクリプトとして直接実行された場合
if (import.meta.main) {
	const exitCode = await main();
	process.exit(exitCode);
}
