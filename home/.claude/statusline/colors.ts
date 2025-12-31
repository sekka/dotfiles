// ============================================================================
// Color Helpers (using chalk for ANSI color handling)
// ============================================================================

import { Chalk } from "chalk";

/**
 * 環境変数とターミナル機能から適切な色レベルを決定します。
 *
 * 色レベルの決定順序：
 * 1. NO_COLOR 環境変数が設定されている場合は色を無効化（レベル0）
 * 2. FORCE_COLOR 環境変数で明示的に指定
 * 3. TTY でない場合（パイプ、リダイレクト等）は色なし
 * 4. デフォルト: TrueColor を有効化（最良の色表示）
 *
 * @returns {0 | 1 | 2 | 3} 色レベル
 *   - 0: 色なし
 *   - 1: 16色
 *   - 2: 256色
 *   - 3: TrueColor (16M色)
 *
 * @example
 * // NO_COLOR 環境変数で色を無効化
 * // NO_COLOR=1 bun statusline.ts
 *
 * @example
 * // FORCE_COLOR で色レベルを強制指定
 * // FORCE_COLOR=256 bun statusline.ts
 */
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

	// TTY でない場合（パイプ、リダイレクト等）は色なし
	// CI/CD 環境での自動検出に対応
	if (!process.stdout.isTTY) {
		return 0;
	}

	// デフォルト: TrueColor を有効化（最良の色表示）
	return 3;
}

/**
 * 環境変数の変更を反映させるため、Chalk インスタンスを動的に生成します
 * これにより、テスト環境での環境変数変更に対応します
 */
function getChalk(): Chalk {
	return new Chalk({ level: getColorLevel() });
}

/**
 * カラー関数の型定義
 */
type ColorFunction = (text: string) => string;

/**
 * カラー関数のマップ
 */
interface ColorMap {
	reset: ColorFunction;
	gray: ColorFunction;
	red: ColorFunction;
	green: ColorFunction;
	yellow: ColorFunction;
	cyan: ColorFunction;
	white: ColorFunction;
	dimWhite: ColorFunction;
	lightGray: ColorFunction;
	peach: ColorFunction;
	darkOrange: ColorFunction;
	orange: ColorFunction;
}

/**
 * カラー関数のコレクション
 *
 * chalkライブラリを使用して、ターミナル出力用カラー表示を提供します。
 * 環境変数により色出力の有効/無効を制御でき、CI/CD 環境に対応します。
 *
 * **環境変数:**
 * - `NO_COLOR`: 色出力を無効化（https://no-color.org/）
 * - `FORCE_COLOR`: 色レベルを強制指定
 *   - `0` または `false`: 色なし
 *   - `1` または `true`: 16色
 *   - `2` または `256`: 256色
 *   - `3` または `16m`: TrueColor (16M色)
 *
 * **ANSI コードマッピング:**
 * - `reset`: ANSI reset コード（`\x1b[0m`）
 * - `gray`: ANSI bright black（`\x1b[90m`）
 * - `red`: ANSI bright red（`\x1b[91m`）
 * - `green`: ANSI green（`\x1b[32m`）
 * - `yellow`: ANSI yellow（`\x1b[33m`）
 * - `cyan`: ANSI cyan（`\x1b[36m`）
 * - `white`: ANSI white（`\x1b[37m`）
 * - `dimWhite`: ANSI dim white（`\x1b[2m` + `\x1b[37m`）
 * - `lightGray`: ANSI bright white（`\x1b[97m`）
 * - `peach`: RGB #FF9966（トゥルーカラー）
 * - `darkOrange`: RGB #FF6600（トゥルーカラー）
 * - `orange`: RGB #FF8C00（トゥルーカラー）
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
 *
 * @example
 * // 環境変数で色を無効化
 * // $ NO_COLOR=1 bun statusline.ts
 * // [Claude Code]
 *
 * @example
 * // 環境変数で色を強制指定
 * // $ FORCE_COLOR=256 bun statusline.ts
 */
export const colors: ColorMap = {
	reset: (s: string) => getChalk().reset(s),
	gray: (s: string) => getChalk().gray(s),
	red: (s: string) => getChalk().redBright(s),
	green: (s: string) => getChalk().green(s),
	yellow: (s: string) => getChalk().yellow(s),
	cyan: (s: string) => getChalk().cyan(s),
	white: (s: string) => getChalk().white(s),
	dimWhite: (s: string) => getChalk().dim.white(s),
	lightGray: (s: string) => getChalk().whiteBright(s),
	peach: (s: string) => getChalk().hex("#FF9966")(s),
	darkOrange: (s: string) => getChalk().hex("#FF6600")(s),
	orange: (s: string) => getChalk().hex("#FF8C00")(s),
};
