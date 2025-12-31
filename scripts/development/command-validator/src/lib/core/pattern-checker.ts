/**
 * パターン検出モジュール
 * 危険なコマンドパターンとコマンド分類による検出
 */

import { SECURITY_RULES } from "../security-rules";
import type { ValidationResult } from "../types";

/**
 * コマンドをパース して正規化
 * @param command - パースするコマンド
 * @returns 正規化されたコマンド情報
 */
function parseCommand(command: string): {
	normalizedCmd: string;
	mainCommand: string;
	cmdParts: string[];
} {
	const normalizedCmd = command.trim().toLowerCase();
	const cmdParts = normalizedCmd.split(/\s+/);
	const mainCommand = cmdParts[0].split("/").pop() || "";

	return { normalizedCmd, mainCommand, cmdParts };
}

/**
 * 危険なパターンをチェック
 * @param command - チェックするコマンド
 * @returns 違反が見つかった場合はValidationResult、見つからなければnull
 */
export function checkDangerousPatterns(command: string): ValidationResult | null {
	for (const pattern of SECURITY_RULES.DANGEROUS_PATTERNS) {
		if (pattern.test(command)) {
			return {
				isValid: false,
				severity: "CRITICAL",
				violations: [`Dangerous pattern detected: ${pattern.source}`],
				sanitizedCommand: command,
			};
		}
	}
	return null;
}

/**
 * コマンド分類による検出（CRITICAL/PRIVILEGE/NETWORK/SYSTEM）
 * @param command - チェックするコマンド
 * @returns 違反が見つかった場合はValidationResult、見つからなければnull
 */
export function checkCommandClassification(command: string): ValidationResult | null {
	const { mainCommand } = parseCommand(command);

	// ホワイトリスト：source と python は許可（後で値を返す実装）
	if (mainCommand === "source" || mainCommand === "python") {
		return null;
	}

	if (SECURITY_RULES.CRITICAL_COMMANDS.includes(mainCommand)) {
		return {
			isValid: false,
			severity: "CRITICAL",
			violations: [`Critical dangerous command: ${mainCommand}`],
			sanitizedCommand: command,
		};
	}

	if (SECURITY_RULES.PRIVILEGE_COMMANDS.includes(mainCommand)) {
		return {
			isValid: false,
			severity: "HIGH",
			violations: [`Privilege escalation command: ${mainCommand}`],
			sanitizedCommand: command,
		};
	}

	if (SECURITY_RULES.NETWORK_COMMANDS.includes(mainCommand)) {
		return {
			isValid: false,
			severity: "HIGH",
			violations: [`Network/remote access command: ${mainCommand}`],
			sanitizedCommand: command,
		};
	}

	if (SECURITY_RULES.SYSTEM_COMMANDS.includes(mainCommand)) {
		return {
			isValid: false,
			severity: "HIGH",
			violations: [`System manipulation command: ${mainCommand}`],
			sanitizedCommand: command,
		};
	}

	return null;
}

/**
 * 一連のパターン検出を実行
 * @param command - 検出対象のコマンド
 * @returns 最初に見つかった違反、またはnull（全て合格）
 */
export function runPatternCheck(command: string): ValidationResult | null {
	// 順序が重要：パターン → コマンド分類
	let result = checkDangerousPatterns(command);
	if (result) return result;

	result = checkCommandClassification(command);
	if (result) return result;

	return null;
}

/**
 * メインコマンドを取得
 * （validator.tsで頻繁に使用されるため公開）
 * @param command - コマンド文字列
 * @returns メインコマンド名
 */
export function getMainCommand(command: string): string {
	const { mainCommand } = parseCommand(command);
	return mainCommand;
}
