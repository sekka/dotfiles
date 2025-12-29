import { debug } from "../debug.ts";

/**
 * Phase 4.4: Unified Error Handling
 */
export enum ErrorCategory {
	PERMISSION_DENIED = "PERMISSION_DENIED",
	NOT_FOUND = "NOT_FOUND",
	TIMEOUT = "TIMEOUT",
	JSON_PARSE = "JSON_PARSE",
	NETWORK = "NETWORK",
	UNKNOWN = "UNKNOWN",
}

/**
 * Phase 4.4: エラーを分類する
 * Node.js のエラーコードを優先して判定し、メッセージベースのフォールバックを使用
 */
export function categorizeError(e: unknown): ErrorCategory {
	const errorMsg = e instanceof Error ? e.message : String(e);
	const code = (e as NodeJS.ErrnoException).code;

	// コードベースの判定を優先
	if (code === "EACCES") return ErrorCategory.PERMISSION_DENIED;
	if (code === "ENOENT") return ErrorCategory.NOT_FOUND;

	// メッセージベースのフォールバック
	if (errorMsg.includes("timeout") || errorMsg.includes("TimeoutError")) {
		return ErrorCategory.TIMEOUT;
	}
	if (errorMsg.includes("JSON") || errorMsg.includes("parse")) {
		return ErrorCategory.JSON_PARSE;
	}
	if (errorMsg.includes("fetch") || errorMsg.includes("Network")) {
		return ErrorCategory.NETWORK;
	}

	return ErrorCategory.UNKNOWN;
}

/**
 * Phase 4.4: エラーを分類してログ出力する
 * エラー種別に応じて適切なログレベルで出力
 */
export function logCategorizedError(e: unknown, context: string): void {
	const category = categorizeError(e);
	const errorMsg = e instanceof Error ? e.message : String(e);

	switch (category) {
		case ErrorCategory.PERMISSION_DENIED:
			console.error(`[ERROR] ${context}: Permission denied - ${errorMsg}`);
			break;
		case ErrorCategory.NOT_FOUND:
			debug(`${context}: File not found - ${errorMsg}`, "verbose");
			break;
		case ErrorCategory.TIMEOUT:
			console.error(`[ERROR] ${context}: Operation timed out - ${errorMsg}`);
			break;
		case ErrorCategory.JSON_PARSE:
			console.error(`[ERROR] ${context}: JSON parsing failed - ${errorMsg}`);
			break;
		case ErrorCategory.NETWORK:
			console.error(`[ERROR] ${context}: Network error - ${errorMsg}`);
			break;
		default:
			console.error(`[ERROR] ${context}: ${errorMsg}`);
	}
}
