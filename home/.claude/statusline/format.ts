// ============================================================================
// Formatting & Display (colors, labels, logging)
// ============================================================================

import { Chalk } from "chalk";
import pino from "pino";

// ============================================================================
// Color Helpers
// ============================================================================

/** 環境変数とターミナル機能から色レベルを決定 */
function getColorLevel(): 0 | 1 | 2 | 3 {
	// NO_COLOR 環境変数が設定されている場合は色を無効化
	// https://no-color.org/
	if (process.env.NO_COLOR !== undefined) {
		return 0;
	}

	// FORCE_COLOR 環境変数で明示的に指定
	// https://force-color.org/
	const forceColor = process.env.FORCE_COLOR;
	if (forceColor === "0" || forceColor === "false") return 0;
	if (forceColor === "1" || forceColor === "true") return 1;
	if (forceColor === "2" || forceColor === "256") return 2;
	if (forceColor === "3" || forceColor === "16m") return 3;

	// デフォルト: Claude Code hook 環境でも色を有効化
	// TTY 判定に関わらず色を有効化（hook は TTY ではないが色が必要）
	return 3;
}

let cachedChalk: Chalk | null = null;
let cachedColorLevel: 0 | 1 | 2 | 3 | null = null;

function getChalk(): Chalk {
	const currentLevel = getColorLevel();
	// キャッシュの有効性チェック：色レベルが変わらなければ再利用
	if (cachedChalk !== null && cachedColorLevel === currentLevel) {
		return cachedChalk;
	}
	// 新しいインスタンスを作成してキャッシュを更新
	cachedColorLevel = currentLevel;
	cachedChalk = new Chalk({ level: currentLevel });
	return cachedChalk;
}

/** Chalk インスタンスキャッシュをリセット（テスト用） */
export function resetChalkCache(): void {
	cachedChalk = null;
	cachedColorLevel = null;
}

export const colors = {
	gray: (s: string) => getChalk().gray(s),
	cyan: (s: string) => getChalk().cyan(s),
	white: (s: string) => getChalk().white(s),
	dimWhite: (s: string) => getChalk().dim.white(s),
	lightGray: (s: string) => getChalk().whiteBright(s),
	yellow: (s: string) => getChalk().yellow(s),
	green: (s: string) => getChalk().green(s),
	red: (s: string) => getChalk().redBright(s),
	orange: (s: string) => getChalk().ansi256(208)(s),
} as const;

// ============================================================================
// Label Helpers
// ============================================================================

/** 内部ラベルID（設定ファイルで使用） */
export const LABEL_KEYS = {
	PROJECT: "project",
	BRANCH: "branch",
	SESSION: "session",
	TOKEN: "token",
	IO: "io",
	INPUT: "input",
	OUTPUT: "output",
	COMPACT: "compact",
	LIMIT: "limit",
	DAILY: "daily",
	WEEKLY: "weekly",
	WEEKLY_SONNET: "weekly_sonnet",
} as const;

export type LabelKey = typeof LABEL_KEYS[keyof typeof LABEL_KEYS];

/** grayカラー適用済みのラベルを返す */
export function label(key: string): string {
	return colors.gray(key + ":");
}

// ============================================================================
// Pino構造化ロギング
// ============================================================================

/** STATUSLINE_DEBUG 環境変数からPinoログレベルをマップ */
function getLogLevel(): string {
	const debugLevel = (process.env.STATUSLINE_DEBUG ?? "off").toLowerCase();
	const levelMap: Record<string, string> = {
		off: "silent",
		error: "error",
		warning: "warn",
		basic: "info",
		verbose: "debug",
	};
	return levelMap[debugLevel] ?? "silent";
}

/** Pinoロガーインスタンス */
export const logger = pino(
	{
		level: getLogLevel(),
		timestamp: pino.stdTimeFunctions.isoTime,
	},
	process.env.NODE_ENV === "development"
		? pino.transport({
				target: "pino-pretty",
				options: {
					colorize: true,
					ignore: "pid,hostname",
					singleLine: false,
				},
			})
		: undefined,
);

/**
 * Zod互換のバリデーション型（後方互換性）
 * @deprecated logger.info(), logger.error() 等を直接使用してください
 */
export type DebugLevel = "off" | "basic" | "verbose" | "error" | "warning";

/**
 * 後方互換性: 既存コードで使用されていたdebug()関数の互換実装
 * @deprecated logger.info(), logger.error(), logger.debug() 等を直接使用してください
 */
export function debug(message: string, level: DebugLevel = "basic"): void {
	switch (level) {
		case "error":
			logger.error(message);
			break;
		case "warning":
			logger.warn(message);
			break;
		case "verbose":
			logger.debug(message);
			break;
		case "basic":
		default:
			logger.info(message);
			break;
		case "off":
			break;
	}
}

/**
 * デバッグレベルのバリデーション（後方互換性）
 * @deprecated logger.info(), logger.error() 等を直接使用してください
 */
export function validateDebugLevel(value: string | undefined): DebugLevel {
	const normalized = (value ?? "off").toLowerCase().trim();
	const validLevels: DebugLevel[] = ["off", "basic", "verbose", "error", "warning"];
	return validLevels.includes(normalized as DebugLevel) ? (normalized as DebugLevel) : "off";
}

/**
 * グローバルデバッグレベル定数（後方互換性）
 * @deprecated logger.level を直接参照してください
 */
export const DEBUG_LEVEL: DebugLevel = validateDebugLevel(process.env.STATUSLINE_DEBUG);

/** エラーオブジェクトから文字列メッセージを抽出 */
export function errorMessage(e: unknown): string {
	return e instanceof Error ? e.message : String(e);
}

// ============================================================================
// Format Helpers (moved from context.ts in Phase B3)
// ============================================================================

/** トークン数をK（千）単位でフォーマット */
export function formatTokensK(tokens: number): string {
	return (tokens / 1000).toFixed(1);
}

/** コスト値（USD）を数値文字列にフォーマット */
export function formatCostValue(cost: number): string {
	if (cost >= 0.01) {
		return cost.toFixed(2);
	}
	if (cost > 0) {
		return cost.toFixed(3);
	}
	return "0.00";
}


/** ミリ秒を HH:MM:SS または MM:SS 形式にフォーマット */
export function formatElapsedTime(ms: number): string {
	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	if (hours > 0) {
		return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
	}
	return `${minutes}:${String(seconds).padStart(2, "0")}`;
}


/** パーセンテージをブレイル文字プログレスバーにフォーマット */
export function formatBrailleProgressBar(percentage: number, length = 10): string {
	const brailleChars = ["⣀", "⣄", "⣤", "⣦", "⣶", "⣷", "⣿"];
	const totalSteps = length * (brailleChars.length - 1);
	const currentStep = Math.round((percentage / 100) * totalSteps);

	const fullBlocks = Math.floor(currentStep / (brailleChars.length - 1));
	const partialIndex = currentStep % (brailleChars.length - 1);
	const emptyBlocks = length - fullBlocks - (partialIndex > 0 ? 1 : 0);

	const fullPart = "⣿".repeat(fullBlocks);
	const partialPart = partialIndex > 0 ? brailleChars[partialIndex] : "";
	const emptyPart = "⣀".repeat(emptyBlocks);

	// Progressive color: 0-50% gray, 51-70% yellow, 71-90% orange, 91-100% red
	let colorFn = colors.gray;
	if (percentage > 50 && percentage <= 70) {
		colorFn = colors.yellow;
	} else if (percentage > 70 && percentage <= 90) {
		colorFn = colors.orange;
	} else if (percentage > 90) {
		colorFn = colors.red;
	}

	return colorFn(`${fullPart}${partialPart}${emptyPart}`);
}

/** リセット時刻までの相対時間をコンパクトにフォーマット */
export function formatResetTime(resetsAt: string): string {
	const resetDate = new Date(resetsAt);
	const diffMs = resetDate.getTime() - Date.now();

	if (diffMs <= 0) return "now";

	const hours = Math.floor(diffMs / 3600000);
	const minutes = Math.floor((diffMs % 3600000) / 60000);
	const days = Math.floor(hours / 24);
	const remainingHours = hours % 24;

	if (days > 0) return `${days}d${remainingHours}h`;
	if (hours > 0) return `${hours}h${minutes}m`;
	return `${minutes}m`;
}

/** リセット時刻を日時形式でフォーマット（JST） */
// Phase 1.4: Locale unification to ja-JP
export function formatResetDateOnly(resetsAt: string): string {
	const resetDate = new Date(resetsAt);
	const now = new Date();

	// Format time as HH:MM JST
	const jstTimeStr = resetDate.toLocaleString("ja-JP", {
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "Asia/Tokyo",
		hour12: false,
	});

	// Check if same day (JST)
	const jstDateStr = resetDate.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });
	const nowJstDateStr = now.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });

	if (jstDateStr === nowJstDateStr) {
		return jstTimeStr;
	}

	// Different day: show "12/30 13:00" format (JST)
	const monthNum = resetDate
		.toLocaleDateString("ja-JP", {
			month: "numeric",
			timeZone: "Asia/Tokyo",
		})
		.replace(/月/g, "");
	const day = resetDate
		.toLocaleDateString("ja-JP", { day: "numeric", timeZone: "Asia/Tokyo" })
		.replace(/日/g, "");
	return `${monthNum}/${day} ${jstTimeStr}`;
}

// ============================================================================
// Phase C: Common Rendering Functions (moved from metrics-builder.ts)
// ============================================================================

/**
 * StatuslineConfig インターフェース（api.ts からのインポート回避のため前方宣言）
 */
interface StatuslineConfig {
	display: {
		showSeparators: boolean;
		lineBreakBefore?: string[];
	};
	rateLimits: {
		showPeriodCost: boolean;
	};
}

/** I/O メトリクス（入力/出力トークン・圧縮回数）を描画 */
export function renderIO(
	config: { showInputOutput: boolean; showCompactCount: boolean },
	data: { inputTokens: number; outputTokens: number; compactCount: number },
): string | null {
	const parts: string[] = [];

	if (config.showInputOutput) {
		const inStr = formatTokensK(data.inputTokens);
		const outStr = formatTokensK(data.outputTokens);
		parts.push(`${label("IN")}${colors.white(inStr)}${colors.gray("K")} ${label("OUT")}${colors.white(outStr)}${colors.gray("K")}`);
	}

	if (config.showCompactCount) {
		parts.push(`${label("CMP")}${colors.white(data.compactCount.toString())}`);
	}

	return parts.length > 0 ? parts.join(" ") : null;
}

/** セッション時間を描画 */
export function renderSession(data: { sessionTimeDisplay: string; costDisplay: string }): string | null {
	if (!data.sessionTimeDisplay) {
		return null;
	}

	return `${label("SES")}${colors.white(data.sessionTimeDisplay)} ${data.costDisplay}`;
}

/** トークン使用状況を描画 */
export function renderToken(data: { contextPercentage: number; contextTokens: number; contextWindowSize: number }): string {
	const bar = formatBrailleProgressBar(data.contextPercentage, 5);
	const contextTokenStr = formatTokensK(data.contextTokens);
	const contextSizeStr = formatTokensK(data.contextWindowSize);

	return `${label("TK")}${bar} ${colors.white(data.contextPercentage.toString())}${colors.gray("%")} ${colors.white(contextTokenStr)}${colors.gray("K")}${colors.gray("/")}${colors.gray(contextSizeStr)}${colors.gray("K")}`;
}

/** 日次コストを描画 */
export function renderDailyCost(data: { todayCost: number }): string | null {
	if (data.todayCost < 0.01) {
		return null;
	}

	return `${label("DAY")}${colors.gray("$")}${colors.white(formatCostValue(data.todayCost))}`;
}

/** レート制限メトリクスを描画 */
export function renderRateLimit(
	labelDisplay: string,
	limit: { utilization: number; resets_at: string | null } | null,
	periodCost: number | null,
	config: StatuslineConfig,
): string | null {
	if (!limit) {
		return null;
	}

	const bar = formatBrailleProgressBar(limit.utilization, 5);
	let result = `${label(labelDisplay)}${bar} ${colors.lightGray(limit.utilization.toString())}${colors.gray("%")}`;

	if (limit.resets_at) {
		const resetDate = formatResetDateOnly(limit.resets_at);
		const timeLeft = formatResetTime(limit.resets_at);
		result += ` ${colors.gray(`(${resetDate}|${timeLeft})`)}`;
	}

	// Add period cost if enabled and provided
	if (periodCost !== null && config.rateLimits.showPeriodCost && periodCost >= 0.01) {
		result += ` ${colors.gray("$")}${colors.white(formatCostValue(periodCost))}`;
	}

	return result;
}

/** メトリクスパーツを区切り文字と改行で結合 */
export function joinWithSeparators(
	parts: Array<{ label: string; text: string }>,
	config: StatuslineConfig,
): string {
	if (parts.length === 0) {
		return "";
	}

	const result: string[] = [];
	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];
		if (i === 0) {
			result.push(part.text);
		} else {
			// lineBreakBefore 設定に基づいて改行挿入
			if (config.display.lineBreakBefore?.includes(part.label)) {
				result.push('\n' + part.text);
			} else {
				// 通常のセパレータを挿入
				const separator = config.display.showSeparators ? ` ${colors.gray("・")} ` : " ";
				result.push(separator + part.text);
			}
		}
	}

	return result.join('');
}
