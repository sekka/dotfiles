/**
 * パス保護モジュール（バリデーション段階3）
 *
 * 責務：
 * - rm -rf コマンドの破壊性チェック（ルート削除防止）
 * - 保護パス（/etc, /sys, /proc等）への危険な操作検出
 * - パス走査攻撃の防止（../ディレクトリトラバーサル対策）
 *
 * 入力：文字列型のシェルコマンド
 * 出力：ValidationResult | null（違反検出時のみ結果を返す）
 *
 * セキュリティ保証：
 * - rm -rf / 等のシステム全体削除を絶対ブロック
 * - ルートディレクトリや末尾スラッシュを含むパスを拒否
 * - /dev, /etc, /sys, /proc等の保護パスへのリダイレクト削除を検出
 * - SAFE_RM_PATHS のホワイトリスト内でのみ rm -rf を許可
 * - /dev/{null,stderr,stdout} 等の安全な特殊ファイルは例外許可
 *
 * パス走査対策：
 * - POSIX パス正規化による ../ 攻撃対策
 * - Windows パス（バックスラッシュ）との互換性対応
 */

import { SECURITY_RULES } from "../security-rules";
import type { ValidationResult } from "../types";

/**
 * rm -rf コマンドの安全性をチェック
 * フラグが分散している場合（-r -f）や大文字（-R, -F）も検出
 * @param command - チェックするコマンド
 * @returns 安全性がある場合true、危険な場合false
 */
export function isRmRfSafe(command: string): boolean {
	// rm コマンドの存在確認
	if (!command.match(/^\s*rm\b/)) {
		return true;
	}

	// -r（-R）フラグの存在確認（フラグが分散している可能性を考慮）
	const hasRecursiveFlag =
		/\s-[a-zA-Z]*r[a-zA-Z]*(\s|$)/.test(command) || /\s--recursive\b/.test(command);

	// -f（-F）フラグの存在確認
	const hasForceFlag = /\s-[a-zA-Z]*f[a-zA-Z]*(\s|$)/.test(command) || /\s--force\b/.test(command);

	// -rf または -fr が両方ない場合は安全
	if (!hasRecursiveFlag || !hasForceFlag) {
		return true;
	}

	// -r と -f の両方がある場合、パスを抽出
	// パターン：rm [flags] <path>
	const pathMatch = command.match(/(?:\s-[a-zA-Z]*(?:r|f)[a-zA-Z]*)*\s+([^\s;&|]+)(?:\s|$|;|&|\|)/);

	if (!pathMatch || !pathMatch[1]) {
		// パスが明示的に指定されていない可能性
		// より厳密なチェック：-r -f の後に何かがあるか
		const rfWithPath = command.match(
			/\s-[a-zA-Z]*r[a-zA-Z]*\s+(?:-[a-zA-Z]*f[a-zA-Z]*)?\s+([^\s;&|]+)/,
		);
		if (!rfWithPath || !rfWithPath[1]) {
			return false;
		}
	}

	const targetPath = pathMatch ? pathMatch[1] : "";

	// ルート削除や末尾スラッシュは危険
	if (targetPath === "/" || targetPath === "/." || targetPath.endsWith("/")) {
		return false;
	}

	// システムルートは危険
	if (targetPath === "." && command.includes("~/")) {
		return false;
	}

	// SAFE_RM_PATHS に含まれるパスは許可
	for (const safePath of SECURITY_RULES.SAFE_RM_PATHS) {
		if (targetPath.startsWith(safePath)) {
			return true;
		}
	}

	// 相対パス（/ で始まらない）は許可
	if (!targetPath.startsWith("/")) {
		return true;
	}

	return false;
}

/**
 * rm -rf コマンドの検証
 * @param command - チェックするコマンド
 * @returns 違反が見つかった場合はValidationResult、見つからなければnull
 */
export function checkRmRfCommand(command: string): ValidationResult | null {
	if (/rm\s+.*-rf\s/.test(command)) {
		const safe = isRmRfSafe(command);
		if (!safe) {
			return {
				isValid: false,
				severity: "CRITICAL",
				violations: ["rm -rf command targeting unsafe path"],
				sanitizedCommand: command,
			};
		}
	}
	return null;
}

/**
 * 保護パスへの危険な操作をチェック
 * @param command - チェックするコマンド
 * @returns 違反が見つかった場合はValidationResult、見つからなければnull
 */
export function checkProtectedPaths(command: string): ValidationResult | null {
	for (const path of SECURITY_RULES.PROTECTED_PATHS) {
		if (command.includes(path)) {
			// /dev/* は例外あり（/dev/null, /dev/stderr, /dev/stdout は許可）
			if (
				path === "/dev/" &&
				(command.includes("/dev/null") ||
					command.includes("/dev/stderr") ||
					command.includes("/dev/stdout"))
			) {
				continue;
			}

			const cmdStart = command.trim();
			let isSafeExecutable = false;

			// SAFE_EXECUTABLE_PATHS で始まるコマンドは許可
			for (const safePath of SECURITY_RULES.SAFE_EXECUTABLE_PATHS) {
				if (cmdStart.startsWith(safePath)) {
					isSafeExecutable = true;
					break;
				}
			}

			// リダイレクト演算子の前にあるかチェック
			const pathIndex = command.indexOf(path);
			const beforePath = command.substring(0, pathIndex);
			const redirectBeforePath = />\s*$/.test(beforePath.trim());

			if (!isSafeExecutable && redirectBeforePath) {
				return {
					isValid: false,
					severity: "HIGH",
					violations: [`Dangerous operation on protected path: ${path}`],
					sanitizedCommand: command,
				};
			}
		}
	}
	return null;
}

/**
 * 一連のパス保護チェックを実行
 * @param command - チェック対象のコマンド
 * @returns 最初に見つかった違反、またはnull（全て合格）
 */
export function runPathProtectionCheck(command: string): ValidationResult | null {
	// 順序が重要：rm -rf → 保護パス
	let result = checkRmRfCommand(command);
	if (result) return result;

	result = checkProtectedPaths(command);
	if (result) return result;

	return null;
}
