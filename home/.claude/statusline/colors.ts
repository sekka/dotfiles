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

/**
 * Chalk インスタンスキャッシュをリセット（テスト用）
 *
 * テスト中に環境変数（NO_COLOR, FORCE_COLOR）を動的に変更する場合、
 * キャッシュされた Chalk インスタンスが古い色レベルのままになるため、
 * このメソッドを呼び出してキャッシュを破棄する必要があります。
 *
 * 【設計意図】
 * - 本番環境：環境変数は起動時に固定されるため、キャッシュが常に有効
 * - テスト環境：環境変数を動的に変更するため、明示的なリセットが必要
 * - 環境変数が変わった場合は自動的に新しいインスタンスを作成（色レベル比較）
 *
 * @example
 * // テストで環境変数を変更する前に必ず呼び出す
 * afterEach(() => {
 *   delete process.env.FORCE_COLOR;
 *   resetChalkCache(); // ← 重要：キャッシュをリセット
 * });
 */
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
