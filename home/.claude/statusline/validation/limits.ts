import type { UsageLimits } from "../types.ts";

/**
 * API レスポンス検証関数
 * UsageLimits の型が正しいかチェック
 * モデル別の制限情報（seven_day_sonnet, seven_day_opus）はオプション
 */
export function isValidUsageLimits(data: unknown): data is UsageLimits {
	if (typeof data !== "object" || data === null) return false;
	const obj = data as Record<string, unknown>;

	// ユーティリティ関数：制限情報の検証
	const isValidLimit = (limit: unknown): boolean => {
		if (limit === null || limit === undefined) return true;
		if (typeof limit !== "object" || limit === null) return false;
		const l = limit as Record<string, unknown>;
		if (typeof l.utilization !== "number" || l.utilization < 0 || l.utilization > 100) return false;
		if (l.resets_at !== null && typeof l.resets_at !== "string") return false;
		return true;
	};

	// five_hour のチェック
	if (!isValidLimit(obj.five_hour)) return false;

	// seven_day のチェック
	if (!isValidLimit(obj.seven_day)) return false;

	// seven_day_sonnet のチェック（オプション）
	if (!isValidLimit(obj.seven_day_sonnet)) return false;

	// seven_day_opus のチェック（オプション）
	if (!isValidLimit(obj.seven_day_opus)) return false;

	return true;
}
