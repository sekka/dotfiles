// ============================================================================
// Pino構造化ロギング（手動実装から置き換え）
// ============================================================================

import pino from "pino";

/**
 * STATUSLINE_DEBUG 環境変数からPinoログレベルをマップ
 * - "off" → "silent"
 * - "error" → "error"
 * - "warning" → "warn"
 * - "basic" → "info"
 * - "verbose" → "debug"
 */
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

/**
 * Pinoロガーインスタンス
 * 開発環境ではpino-prettyで人間が読める形式で出力
 * 本番環境ではJSON形式で出力
 */
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
