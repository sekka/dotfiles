/**
 * Git commit message validation logic
 *
 * 検証項目:
 * 1. CWE-78: コマンドインジェクション検出
 * 2. AI署名の検出と拒否
 * 3. メッセージサイズ制限
 */

export interface ValidationResult {
	valid: boolean;
	errors: string[];
}

/**
 * CWE-78パターン: コマンドインジェクション検出
 * 改行後のシェルコマンドとサブプロセス構文をターゲット
 */
export const CWE78_PATTERNS = {
	// 既知の危険なシェルコマンド（改行直後）
	shellCommands:
		/\n\s*(echo|eval|exec|bash|sh|python|ruby|perl|source|curl|wget|nc|ncat|find|xargs|rm|cat|sed|awk)\s/,

	// コマンド置換構文（$(...) またはバックティック）
	commandSubstitution: /\$\([^)]*\)|`[^`]*`/,

	// コマンドチェーニング：メタキャラクタ + コマンド
	commandChaining: /\n\s*[;&|]+\s+(bash|sh|eval|exec|python|curl|wget|nc|echo|rm)/,

	// 危険な変数展開パターン（eval と $の組み合わせ）
	dangerousVarExpansion: /eval.*\$\{|\$\{.*\}/,
};

/**
 * AI署名パターン
 */
export const AI_SIGNATURE_PATTERN = /🤖 Generated with Claude Code|Co-Authored-By: Claude/;

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

	// 1. AI署名検出（優先度高）
	if (AI_SIGNATURE_PATTERN.test(message)) {
		errors.push("AI署名が含まれています。AI署名は自動的に削除して送信してください");
	}

	// 2. CWE-78検出：コマンド置換構文
	if (CWE78_PATTERNS.commandSubstitution.test(message)) {
		errors.push(
			"セキュリティ警告: コマンド置換構文（$(...) またはバックティック）が検出されました",
		);
	}

	// 3. CWE-78検出：危険なシェルコマンド（改行後）
	if (CWE78_PATTERNS.shellCommands.test(message)) {
		errors.push("セキュリティ警告: 改行後に危険なシェルコマンドが検出されました");
	}

	// 4. CWE-78検出：コマンドチェーニング（改行 + メタキャラクタ + コマンド）
	if (CWE78_PATTERNS.commandChaining.test(message)) {
		errors.push(
			"セキュリティ警告: コマンドチェーニング（&&、||、;、|の後の危険なコマンド）が検出されました",
		);
	}

	// 5. CWE-78検出：危険な変数展開（eval と ${}の組み合わせ）
	if (CWE78_PATTERNS.dangerousVarExpansion.test(message)) {
		errors.push(
			"セキュリティ警告: 危険な変数展開パターン（eval と ${}の組み合わせ）が検出されました",
		);
	}

	// 6. メッセージサイズ制限（DoS防止）
	const maxSize = 10000;
	if (message.length > maxSize) {
		errors.push(`コミットメッセージが長すぎます（${message.length}文字 / 最大${maxSize}文字）`);
	}

	// 7. 最初の行の長さ制限（Gitコンベンション）
	const lines = message.split("\n");
	const firstLine = lines[0];
	const maxFirstLineLength = 72;
	if (firstLine.length > maxFirstLineLength) {
		errors.push(
			`コミットタイトルが長すぎます（${firstLine.length}文字 / 推奨${maxFirstLineLength}文字以下）`,
		);
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

/**
 * コマンドインジェクションパターンの有無を高速判定
 */
export function hasCommandInjectionPattern(message: string): boolean {
	return (
		CWE78_PATTERNS.shellCommands.test(message) ||
		CWE78_PATTERNS.commandSubstitution.test(message) ||
		CWE78_PATTERNS.commandChaining.test(message)
	);
}

/**
 * AI署名の有無を判定
 */
export function hasAISignature(message: string): boolean {
	return AI_SIGNATURE_PATTERN.test(message);
}
