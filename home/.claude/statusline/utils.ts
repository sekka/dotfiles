// ============================================================================
// Phase 2.1 & 3.1: Debug Level Control
// ============================================================================

export type DebugLevel = "off" | "basic" | "verbose";

// Phase 3.1: DEBUG_LEVEL enum 検証の実装
export function validateDebugLevel(value: string | undefined): DebugLevel {
	const validLevels: DebugLevel[] = ["off", "basic", "verbose"];
	const level = (value || "off").toLowerCase();
	return validLevels.includes(level as DebugLevel) ? (level as DebugLevel) : "off";
}

export const DEBUG_LEVEL: DebugLevel = validateDebugLevel(process.env.STATUSLINE_DEBUG);

export function debug(message: string, level: "basic" | "verbose" = "basic"): void {
	if (DEBUG_LEVEL === "off") return;
	if (DEBUG_LEVEL === "basic" && level === "verbose") return;
	console.error(`[DEBUG] ${message}`);
}

// ============================================================================
// Type Definitions
// ============================================================================

export interface HookInput {
	model: { display_name: string };
	workspace: { current_dir: string };
	cwd?: string;
	session_id: string;
	cost: {
		total_cost_usd: number;
		total_duration_ms: number;
	};
	context_window?: {
		context_window_size: number;
		current_usage: {
			input_tokens: number;
			output_tokens: number;
			cache_creation_input_tokens: number;
			cache_read_input_tokens: number;
		} | null;
	};
	transcript_path?: string;
}

export interface GitStatus {
	branch: string;
	hasChanges: boolean;
	aheadBehind: string | null;
	diffStats: string | null;
}

export interface TranscriptEntry {
	type?: string;
	message?: {
		usage?: {
			input_tokens?: number;
			output_tokens?: number;
			cache_creation_input_tokens?: number;
			cache_read_input_tokens?: number;
		};
	};
	timestamp?: string;
}

export interface StatuslineConfig {
	git: {
		showBranch: boolean; // ブランチ名表示
		showAheadBehind: boolean; // ahead/behind表示
		showDiffStats: boolean; // 差分統計（+/-）表示
		alwaysShowMain: boolean; // main/masterでもahead/behind表示
	};
	rateLimits: {
		showFiveHour: boolean; // 5時間レート制限表示
		showWeekly: boolean; // 週間レート制限表示
		showPeriodCost: boolean; // 期間コスト（$119）表示
	};
	costs: {
		showDailyCost: boolean; // 日次コスト表示
		showSessionCost: boolean; // セッションコスト表示
	};
	tokens: {
		showContextUsage: boolean; // コンテキスト使用率表示
	};
	session: {
		showSessionId: boolean; // セッションID表示
		showElapsedTime: boolean; // 経過時間表示
	};
	display: {
		showSeparators: boolean; // メトリクス間の区切り表示
	};
}

// ============================================================================
// ANSI Color Helpers (no external dependencies)
// ============================================================================

export const colors = {
	reset: (s: string) => `${s}\x1b[0m`,
	gray: (s: string) => `\x1b[90m${s}\x1b[0m`,
	red: (s: string) => `\x1b[91m${s}\x1b[0m`,
	green: (s: string) => `\x1b[32m${s}\x1b[0m`,
	yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
	cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
	white: (s: string) => `\x1b[37m${s}\x1b[0m`,
	dimWhite: (s: string) => `\x1b[37m${s}\x1b[39m`,
	lightGray: (s: string) => `\x1b[97m${s}\x1b[0m`,
	peach: (s: string) => `\x1b[38;5;216m${s}\x1b[0m`,
	darkOrange: (s: string) => `\x1b[38;5;202m${s}\x1b[0m`,
};

// ============================================================================
// Configuration
// ============================================================================

export const DEFAULT_CONFIG: StatuslineConfig = {
	git: {
		showBranch: true,
		showAheadBehind: true,
		showDiffStats: true,
		alwaysShowMain: false,
	},
	rateLimits: {
		showFiveHour: true,
		showWeekly: true,
		showPeriodCost: true,
	},
	costs: {
		showDailyCost: true,
		showSessionCost: true,
	},
	tokens: {
		showContextUsage: true,
	},
	session: {
		showSessionId: true,
		showElapsedTime: false,
	},
	display: {
		showSeparators: false,
	},
};

// ============================================================================
// Validation Helpers
// ============================================================================

// Phase 3.4: sanitizeForLogging() の型混合解決
// デバッグログ用のセンシティブ情報をマスキングする関数
export function sanitizeForLogging(obj: unknown): unknown {
	const sensitiveKeys = new Set([
		"token",
		"accesstoken",
		"password",
		"secret",
		"refreshtoken",
		"credentials",
	]);

	// Phase 3.4: 配列を明示的に処理
	if (Array.isArray(obj)) {
		return obj.map((item) => sanitizeForLogging(item));
	}

	// Phase 3.4: オブジェクトを処理
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
// Phase 4.1: Security Module
// ============================================================================

import { realpath } from "fs/promises";

export class SecurityValidator {
	/**
	 * パストラバーサル攻撃を防ぐためにファイルパスを検証
	 */
	static async validatePath(
		baseDir: string,
		filePath: string,
	): Promise<{ isValid: boolean; resolvedPath?: string }> {
		try {
			const resolvedBase = await realpath(baseDir);
			const resolvedPath = await realpath(filePath);

			if (!resolvedPath.startsWith(resolvedBase)) {
				console.error(`[SECURITY] Path traversal attempt: ${filePath}`);
				return { isValid: false };
			}

			return { isValid: true, resolvedPath };
		} catch (e) {
			const errorMsg = e instanceof Error ? e.message : String(e);
			debug(`Path validation failed: ${errorMsg}`, "verbose");
			return { isValid: false };
		}
	}

	/**
	 * ファイルサイズ制限チェック
	 */
	static validateFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
		return size <= maxSize;
	}

	/**
	 * バイナリファイル拡張子チェック
	 */
	static isBinaryExtension(filePath: string): boolean {
		const BINARY_EXTENSIONS = new Set([
			".png",
			".jpg",
			".jpeg",
			".gif",
			".bmp",
			".ico",
			".mp4",
			".mov",
			".avi",
			".mkv",
			".zip",
			".tar",
			".gz",
			".7z",
			".bin",
			".so",
			".dylib",
			".dll",
			".pdf",
			".doc",
			".docx",
		]);

		const ext = filePath.toLowerCase();
		const dotIndex = ext.lastIndexOf(".");
		if (dotIndex === -1) return false;

		return BINARY_EXTENSIONS.has(ext.substring(dotIndex));
	}
}

// ============================================================================
// Phase 4.4: Unified Error Handling
// ============================================================================

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

// API レスポンス検証関数
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

// StatuslineConfig 検証関数
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
