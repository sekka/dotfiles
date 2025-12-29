// ============================================================================
// ANSI Color Helpers (no external dependencies)
// ============================================================================

/**
 * ANSI カラー関数のコレクション
 * 各関数は指定されたテキストを対応するANSIエスケープコードでラップします。
 * 外部依存関係がないシンプルな実装で、ターミナル出力用カラー表示を提供します。
 *
 * @typedef {Object} colors
 * @property {Function} reset - ANSI色をリセット（通常の白色）
 * @property {Function} gray - グレー色（#90 ANSIコード）
 * @property {Function} red - 赤色（明るい赤 #91）
 * @property {Function} green - 緑色（#32）
 * @property {Function} yellow - 黄色（#33）
 * @property {Function} cyan - シアン色（#36）
 * @property {Function} white - 白色（#37）
 * @property {Function} dimWhite - 暗い白色（#37 with #39）
 * @property {Function} lightGray - 薄いグレー色（#97）
 * @property {Function} peach - ピーチ色（256色 #216）
 * @property {Function} darkOrange - ダークオレンジ色（256色 #202）
 * @property {Function} orange - オレンジ色（256色 #208）
 *
 * @example
 * // ステータスラインのエラー表示
 * console.log(colors.red("Error: Permission denied"));
 *
 * @example
 * // 成功メッセージ表示
 * console.log(colors.green("✓ Session complete"));
 *
 * @example
 * // 256色パレットを使用した特別な色
 * console.log(colors.peach("Cost: $1.23"));
 */
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
	orange: (s: string) => `\x1b[38;5;208m${s}\x1b[0m`,
};
