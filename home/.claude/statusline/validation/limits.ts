import type { UsageLimits } from "../types.ts";

/**
 * API レスポンス検証関数
 * UsageLimits の型が正しいかチェック
 */
export function isValidUsageLimits(data: unknown): data is UsageLimits {
	if (typeof data !== "object" || data === null) return false;
	const obj = data as Record<string, unknown>;

	// five_hour のチェック
	if (obj.five_hour !== null && obj.five_hour !== undefined) {
		if (typeof obj.five_hour !== "object" || obj.five_hour === null) return false;
		const fh = obj.five_hour as Record<string, unknown>;
		if (typeof fh.utilization !== "number" || fh.utilization < 0 || fh.utilization > 100)
			return false;
		if (fh.resets_at !== null && typeof fh.resets_at !== "string") return false;
	}

	// seven_day のチェック
	if (obj.seven_day !== null && obj.seven_day !== undefined) {
		if (typeof obj.seven_day !== "object" || obj.seven_day === null) return false;
		const sd = obj.seven_day as Record<string, unknown>;
		if (typeof sd.utilization !== "number" || sd.utilization < 0 || sd.utilization > 100)
			return false;
		if (sd.resets_at !== null && typeof sd.resets_at !== "string") return false;
	}

	return true;
}
