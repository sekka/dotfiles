// ============================================================================
// Color Helpers (using chalk for ANSI color handling)
// ============================================================================

import chalk from "chalk";

/**
 * カラー関数のコレクション
 * chalkライブラリを使用して、ターミナル出力用カラー表示を提供します。
 *
 * @typedef {Object} colors
 * @property {Function} reset - 色をリセット（ANSI reset付き）
 * @property {Function} gray - グレー色（ANSI bright black #90）
 * @property {Function} red - 赤色（ANSI bright red #91）
 * @property {Function} green - 緑色（ANSI #32）
 * @property {Function} yellow - 黄色（ANSI #33）
 * @property {Function} cyan - シアン色（ANSI #36）
 * @property {Function} white - 白色（ANSI #37）
 * @property {Function} dimWhite - 白色（ANSI #37、デフォルトフォアグラウンドリセット）
 * @property {Function} lightGray - 明るい白色（ANSI bright white #97）
 * @property {Function} peach - ピーチ色（256色パレット #216）
 * @property {Function} darkOrange - ダークオレンジ色（256色パレット #202）
 * @property {Function} orange - オレンジ色（256色パレット #208）
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

// chalkインスタンスを作成し、強制的に色を有効にする
const chalkWithColor = new chalk.constructor({ level: 3 });

export const colors = {
	reset: chalkWithColor.reset,
	gray: chalkWithColor.gray,
	red: chalkWithColor.redBright,
	green: chalkWithColor.green,
	yellow: chalkWithColor.yellow,
	cyan: chalkWithColor.cyan,
	white: chalkWithColor.white,
	dimWhite: chalkWithColor.white,
	lightGray: chalkWithColor.whiteBright,
	peach: chalkWithColor.hex("#FF9966"),
	darkOrange: chalkWithColor.hex("#FF6600"),
	orange: chalkWithColor.hex("#FF8C00"),
};
