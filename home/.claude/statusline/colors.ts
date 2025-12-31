// ============================================================================
// Color Helpers (using chalk for ANSI color handling)
// ============================================================================

import chalk from "chalk";

/**
 * カラー関数のコレクション
 * chalkライブラリを使用して、ターミナル出力用カラー表示を提供します。
 *
 * @typedef {Object} colors
 * @property {Function} reset - 色をリセット（スタイル無し）
 * @property {Function} gray - グレー色
 * @property {Function} red - 赤色
 * @property {Function} green - 緑色
 * @property {Function} yellow - 黄色
 * @property {Function} cyan - シアン色
 * @property {Function} white - 白色
 * @property {Function} dimWhite - 暗い白色
 * @property {Function} lightGray - 薄いグレー色
 * @property {Function} peach - ピーチ色
 * @property {Function} darkOrange - ダークオレンジ色
 * @property {Function} orange - オレンジ色
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
 * // カスタム色を使用した表示
 * console.log(colors.peach("Cost: $1.23"));
 */
export const colors = {
	reset: (s: string) => s,
	gray: chalk.gray,
	red: chalk.red,
	green: chalk.green,
	yellow: chalk.yellow,
	cyan: chalk.cyan,
	white: chalk.white,
	dimWhite: chalk.dim,
	lightGray: chalk.gray,
	peach: chalk.hex("#FF9966"),
	darkOrange: chalk.hex("#FF6600"),
	orange: chalk.hex("#FF8C00"),
};
