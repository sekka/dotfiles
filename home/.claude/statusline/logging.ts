// ============================================================================
// Phase 2.1 & 3.1: Debug Level Control & Logging
// ============================================================================

/**
 * デバッグレベルの種類
 * @typedef {("off" | "basic" | "verbose")} DebugLevel
 * - "off": デバッグ出力を表示しない
 * - "basic": 基本的なデバッグメッセージのみ表示
 * - "verbose": すべてのデバッグメッセージを表示（詳細情報を含む）
 */
export type DebugLevel = "off" | "basic" | "verbose";

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
	const validLevels: DebugLevel[] = ["off", "basic", "verbose"];
	const level = (value || "off").trim().toLowerCase();
	return validLevels.includes(level as DebugLevel) ? (level as DebugLevel) : "off";
}

/**
 * 現在のデバッグレベル（環境変数 STATUSLINE_DEBUG から決定）
 * @type {DebugLevel}
 */
export const DEBUG_LEVEL: DebugLevel = validateDebugLevel(process.env.STATUSLINE_DEBUG);

/**
 * レベル制御を有効にしたデバッグ出力を実行
 *
 * 出力内容はDEBUG_LEVEL設定に従う：
 * - "off": 出力しない
 * - "basic": basic レベルのメッセージのみ出力
 * - "verbose": すべてのメッセージ（basic と verbose）を出力
 *
 * @param {string} message - 出力するデバッグメッセージ
 * @param {"basic" | "verbose"} [level="basic"] - メッセージレベル
 * @returns {void}
 *
 * @example
 * debug("Starting operation"); // "basic" レベルで出力
 * debug("Detailed info", "verbose"); // "verbose" レベルで出力
 * debug("Error occurred", "basic"); // "basic" レベルで出力
 */
export function debug(message: string, level: "basic" | "verbose" = "basic"): void {
	if (DEBUG_LEVEL === "off") return;
	if (DEBUG_LEVEL === "basic" && level === "verbose") return;
	console.error(`[DEBUG] ${message}`);
}
