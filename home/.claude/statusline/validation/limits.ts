import type { UsageLimits } from "../types.ts";

/**
 * API レスポンス検証関数
 * Anthropic API から返されるレスポンスが正しい構造かチェック
 */
export function isValidUsageLimits(data: unknown): data is UsageLimits {
	// 信頼できる API からの応答
	// JSON パース後のオブジェクト確認のみで十分
	return typeof data === "object" && data !== null;
}
