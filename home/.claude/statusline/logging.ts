// ============================================================================
// Phase 2.1 & 3.1: Debug Level Control & Logging
// ============================================================================

/**
 * デバッグレベルの種類
 * @typedef {("off" | "basic" | "verbose" | "error" | "warning")} DebugLevel
 * - "off": デバッグ出力を表示しない
 * - "basic": 基本的なデバッグメッセージのみ表示
 * - "verbose": すべてのデバッグメッセージを表示（詳細情報を含む）
 * - "error": エラーメッセージのみ表示（重大な問題）
 * - "warning": 警告メッセージを表示（注意が必要）
 */
export type DebugLevel = "off" | "basic" | "verbose" | "error" | "warning";

/**
 * 環境変数または文字列からデバッグレベルを検証・正規化する
 *
 * @param {string | undefined} value - 検証対象のデバッグレベル文字列
 * @returns {DebugLevel} 検証済みの正規化されたデバッグレベル
 *
 * @example
 * validateDebugLevel("VERBOSE") // => "verbose"
 * validateDebugLevel("  BASIC  ") // => "basic"
 * validateDebugLevel("invalid") // => "off"
 * validateDebugLevel(undefined) // => "off"
 */
export function validateDebugLevel(value: string | undefined): DebugLevel {
	const validLevels: DebugLevel[] = ["off", "basic", "verbose", "error", "warning"];
	const level = (value || "off").trim().toLowerCase();
	return validLevels.includes(level as DebugLevel) ? (level as DebugLevel) : "off";
}

/**
 * Phase 2A: 環境変数の安全なアクセス
 * 環境変数 STATUSLINE_DEBUG から安全にデバッグレベルを取得
 * 環境変数が undefined または空文字の場合は "off" をデフォルト値とする
 *
 * @returns {DebugLevel} 検証済みのデバッグレベル
 * @remarks
 * - process.env.STATUSLINE_DEBUG への直接アクセスを集約
 * - 暗黙的な undefined の処理を明示的に実行
 * - デフォルト値を "off" に統一
 * - Phase 3: 不正な値が設定された場合は警告を出力
 */
function getDebugLevel(): DebugLevel {
	// Phase 2A: null coalescing で undefined を "off" に置換
	// これにより、process.env.STATUSLINE_DEBUG が undefined でも安全に処理可能
	const envValue = process.env.STATUSLINE_DEBUG ?? "off";

	// Phase 3: 不正な値の検出と警告
	const validLevels = ["off", "basic", "verbose", "error", "warning"];
	if (envValue !== "off" && !validLevels.includes(envValue.toLowerCase())) {
		console.error(
			`[WARN] Invalid STATUSLINE_DEBUG value: "${envValue}". Valid values: ${validLevels.join(", ")}. Falling back to "off".`,
		);
	}

	return validateDebugLevel(envValue);
}

/**
 * 現在のデバッグレベル（環境変数 STATUSLINE_DEBUG から決定）
 * @type {DebugLevel}
 */
export const DEBUG_LEVEL: DebugLevel = getDebugLevel();

/**
 * ログレベル優先度マップ
 * 数値が小さいほど高い優先度（重要度が高い）
 * @type {Record<DebugLevel, number>}
 */
const LEVEL_PRIORITY: Record<DebugLevel, number> = {
	off: 0,
	error: 1,
	warning: 2,
	basic: 3,
	verbose: 4,
};

/**
 * レベル制御を有効にしたデバッグ出力を実行
 *
 * 出力内容はDEBUG_LEVEL設定に従う：
 * - "off": 出力しない
 * - "basic": basic レベルのメッセージのみ出力（error、warning は常に出力）
 * - "verbose": すべてのメッセージ（basic、verbose、error、warning）を出力
 * - "error": エラーメッセージのみ出力
 * - "warning": 警告とエラーメッセージを出力（basic、verbose は除外）
 *
 * @param {string} message - 出力するデバッグメッセージ
 * @param {DebugLevel} [level="basic"] - メッセージレベル
 * @returns {void}
 *
 * @example
 * debug("Starting operation"); // "basic" レベルで出力
 * debug("Detailed info", "verbose"); // "verbose" レベルで出力
 * debug("Error occurred", "error"); // "error" レベルで出力
 */
export function debug(message: string, level: DebugLevel = "basic"): void {
	if (DEBUG_LEVEL === "off") return;

	const currentPriority = LEVEL_PRIORITY[DEBUG_LEVEL];
	const messagePriority = LEVEL_PRIORITY[level];

	// 優先度が高い（数値が小さい）メッセージのみ出力
	if (messagePriority > currentPriority) return;

	console.error(`[DEBUG] ${message}`);
}
