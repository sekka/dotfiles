/**
 * Git commit message validation logic
 *
 * 検証項目:
 * 1. 最初の行の長さ制限
 */

export interface ValidationResult {
	valid: boolean;
	errors: string[];
}

/**
 * コミットメッセージを検証
 *
 * @param message - 検証対象のコミットメッセージ
 * @returns 検証結果
 */
export function validateCommitMessage(message: string): ValidationResult {
	const errors: string[] = [];

	if (!message || message.length === 0) {
		errors.push("コミットメッセージが空です");
		return { valid: false, errors };
	}

	// 最初の行の長さ制限（Gitコンベンション）
	// コメント行と空行を除外して最初の実質的な行を取得
	const lines = message.split("\n");
	const firstLine = lines.find((line) => line.trim() && !line.trim().startsWith("#")) || "";
	const maxFirstLineLength = 72;

	// Unicodeコードポイント数で計算（絵文字を正しく数える）
	const titleLength = Array.from(firstLine).length;

	if (titleLength > maxFirstLineLength) {
		// タイトルのプレビュー表示（100文字まで）
		const preview = firstLine.length > 100 ? firstLine.slice(0, 97) + "..." : firstLine;
		const excess = titleLength - maxFirstLineLength;
		errors.push(
			`コミットタイトルが長すぎます（${titleLength}文字 / 推奨${maxFirstLineLength}文字以下）\n` +
				`  タイトル: "${preview}"\n` +
				`  削減が必要: ${excess}文字`,
		);
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

// CLI entry point for git hooks
if (import.meta.main) {
	const commitMsgFile = Bun.argv[2];

	if (!commitMsgFile) {
		console.error("❌ エラー: コミットメッセージファイルが指定されていません");
		process.exit(1);
	}

	const message = await Bun.file(commitMsgFile).text();
	const result = validateCommitMessage(message);

	if (!result.valid) {
		result.errors.forEach((error) => console.error(`❌ ${error}`));
		process.exit(1);
	}

	process.exit(0);
}
