import type { StatuslineConfig } from "../types.ts";

/**
 * StatuslineConfig 検証関数
 * ユーザーから読み込んだ設定ファイルが正しい構造かチェック
 */
export function isValidStatuslineConfig(data: unknown): data is Partial<StatuslineConfig> {
	if (typeof data !== "object" || data === null) return false;
	const obj = data as Record<string, unknown>;

	// git セクション
	if (obj.git !== undefined) {
		if (typeof obj.git !== "object" || obj.git === null) return false;
		const git = obj.git as Record<string, unknown>;
		if (git.showBranch !== undefined && typeof git.showBranch !== "boolean") return false;
		if (git.showAheadBehind !== undefined && typeof git.showAheadBehind !== "boolean") return false;
		if (git.showDiffStats !== undefined && typeof git.showDiffStats !== "boolean") return false;
		if (git.alwaysShowMain !== undefined && typeof git.alwaysShowMain !== "boolean") return false;
	}

	// rateLimits セクション
	if (obj.rateLimits !== undefined) {
		if (typeof obj.rateLimits !== "object" || obj.rateLimits === null) return false;
		const rl = obj.rateLimits as Record<string, unknown>;
		if (rl.showFiveHour !== undefined && typeof rl.showFiveHour !== "boolean") return false;
		if (rl.showWeekly !== undefined && typeof rl.showWeekly !== "boolean") return false;
		if (rl.showPeriodCost !== undefined && typeof rl.showPeriodCost !== "boolean") return false;
	}

	// costs セクション
	if (obj.costs !== undefined) {
		if (typeof obj.costs !== "object" || obj.costs === null) return false;
		const costs = obj.costs as Record<string, unknown>;
		if (costs.showDailyCost !== undefined && typeof costs.showDailyCost !== "boolean") return false;
		if (costs.showSessionCost !== undefined && typeof costs.showSessionCost !== "boolean")
			return false;
	}

	// tokens セクション
	if (obj.tokens !== undefined) {
		if (typeof obj.tokens !== "object" || obj.tokens === null) return false;
		const tokens = obj.tokens as Record<string, unknown>;
		if (tokens.showContextUsage !== undefined && typeof tokens.showContextUsage !== "boolean")
			return false;
	}

	// session セクション
	if (obj.session !== undefined) {
		if (typeof obj.session !== "object" || obj.session === null) return false;
		const session = obj.session as Record<string, unknown>;
		if (session.showSessionId !== undefined && typeof session.showSessionId !== "boolean")
			return false;
		if (session.showElapsedTime !== undefined && typeof session.showElapsedTime !== "boolean")
			return false;
	}

	// display セクション
	if (obj.display !== undefined) {
		if (typeof obj.display !== "object" || obj.display === null) return false;
		const display = obj.display as Record<string, unknown>;
		if (display.showSeparators !== undefined && typeof display.showSeparators !== "boolean")
			return false;
	}

	return true;
}
