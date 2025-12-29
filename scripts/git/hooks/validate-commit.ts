#!/usr/bin/env bun
/**
 * Git commit message validator
 * Validates commit messages for CWE-78 injection patterns and AI signatures
 */

import { readFileSync } from "fs";
import { validateCommitMessage } from "../validate-commit-message";

// コマンドラインパラメータ取得
const commitMsgFile = process.argv[2];

if (!commitMsgFile) {
	console.error("❌ コミットメッセージファイルが指定されていません");
	process.exit(1);
}

try {
	// ファイル存在確認
	const message = readFileSync(commitMsgFile, "utf-8");

	// メッセージ検証
	const result = validateCommitMessage(message);

	if (!result.valid) {
		console.error("\x1b[0;31m❌ コミット検証エラー:\x1b[0m");
		result.errors.forEach((error, i) => {
			console.error(`\x1b[0;31m  ${i + 1}. ${error}\x1b[0m`);
		});
		console.error("");
		process.exit(1);
	}

	// 成功
	process.exit(0);
} catch (error) {
	console.error(`\x1b[0;31m❌ ファイル読み込みエラー: ${commitMsgFile}\x1b[0m`);
	if (error instanceof Error) {
		console.error(`\x1b[0;31m  ${error.message}\x1b[0m`);
	}
	process.exit(1);
}
