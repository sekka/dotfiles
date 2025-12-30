// ============================================================================
// Phase 3.1: Validation Module (Extracted from utils.ts)
// ============================================================================

import type { StatuslineConfig } from "./config.ts";

/**
 * デバッグログ出力用にオブジェクトのセンシティブ情報をマスキングする
 *
 * 指定されたオブジェクトを再帰的に走査して、センシティブなキーを検出し、
 * その値を "***REDACTED***" に置換する。キー名の比較は大文字小文字を区別しない。
 *
 * @param {unknown} obj - マスキング対象のオブジェクト
 * @returns {unknown} マスキング済みのオブジェクト
 *
 * @example
 * const data = {
 *   user: "john",
 *   token: "secret-token",
 *   password: "my-password"
 * };
 * sanitizeForLogging(data);
 * // => { user: "john", token: "***REDACTED***", password: "***REDACTED***" }
 *
 * @remarks
 * マスキングされるキー（大文字小文字を区別しない）：
 * - token, accesstoken, password, secret, refreshtoken
 */
export function sanitizeForLogging(obj: unknown): unknown {
	const sensitiveKeys = new Set(["token", "accesstoken", "password", "secret", "refreshtoken"]);

	// 配列を明示的に処理
	if (Array.isArray(obj)) {
		return obj.map((item) => sanitizeForLogging(item));
	}

	// オブジェクトを処理
	if (typeof obj === "object" && obj !== null) {
		const sanitized: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(obj)) {
			if (sensitiveKeys.has(key.toLowerCase())) {
				sanitized[key] = "***REDACTED***";
			} else if (value !== null && typeof value === "object") {
				sanitized[key] = sanitizeForLogging(value);
			} else {
				sanitized[key] = value;
			}
		}
		return sanitized;
	}

	return obj;
}

// ============================================================================
// API レスポンス検証関数
// ============================================================================

/**
 * UsageLimits オブジェクトの型ガード関数
 *
 * API レスポンスから取得した不明な型のオブジェクトを検証し、
 * UsageLimits 型として安全に使用できるかを判定する。
 * 利用率は 0〜100% の範囲である必要がある。
 *
 * @param {unknown} data - 検証対象のデータ
 * @returns {boolean} data が有効な UsageLimits オブジェクトであれば true
 *
 * @example
 * const data = JSON.parse(apiResponse);
 * if (isValidUsageLimits(data)) {
 *   // data は UsageLimits 型として安全に使用可能
 *   console.log(data.five_hour.utilization);
 * }
 */
export function isValidUsageLimits(data: unknown): data is {
	five_hour: { utilization: number; resets_at: string | null } | null;
	seven_day: { utilization: number; resets_at: string | null } | null;
} {
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

/**
 * StatuslineConfig オブジェクトの型ガード関数
 *
 * 不明な型のオブジェクトを検証し、StatuslineConfig（部分的）型として
 * 安全に使用できるかを判定する。部分的な設定を許容し、
 * 各フィールドはデフォルト値とマージされる。
 *
 * @param {unknown} data - 検証対象のデータ
 * @returns {boolean} data が有効な StatuslineConfig（部分）オブジェクトであれば true
 *
 * @example
 * const config = JSON.parse(configFile);
 * if (isValidStatuslineConfig(config)) {
 *   // config は StatuslineConfig として安全に使用可能
 *   const merged = { ...DEFAULT_CONFIG, ...config };
 * }
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
