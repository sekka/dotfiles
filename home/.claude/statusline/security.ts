// ============================================================================
// Phase 3.1: Simplified Security Module
// ============================================================================

import { debug } from "./logging.ts";

/**
 * エラーをログ出力する（簡潔版）
 *
 * @param {unknown} e - ログ出力するエラー
 * @param {string} context - エラーの発生コンテキスト
 * @returns {void}
 */
export function logError(e: unknown, context: string): void {
	const errorMsg = e instanceof Error ? e.message : String(e);
	debug(`${context}: ${errorMsg}`, "verbose");
}
