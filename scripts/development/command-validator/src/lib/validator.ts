import { SAFE_COMMANDS } from "./security-rules";
import type { ValidationResult } from "./types";
import { runBasicValidation } from "./core/basic-validation";
import { runPatternCheck, getMainCommand } from "./core/pattern-checker";
import { runPathProtectionCheck } from "./core/path-protection";
import {
	splitCommandChain,
	hasAndOperator,
	hasOrOperator,
	hasSemicolonOperator,
} from "./core/command-parser";

export class CommandValidator {
	validate(command: string, toolName = "Unknown"): ValidationResult {
		const result: ValidationResult = {
			isValid: true,
			severity: "LOW",
			violations: [],
			sanitizedCommand: command,
		};

		// 段階1: 基本検証（形式、長さ、エンコード）
		let checkResult = runBasicValidation(command);
		if (checkResult) {
			result.isValid = false;
			result.severity = checkResult.severity;
			result.violations = checkResult.violations;
			return result;
		}

		const mainCommand = getMainCommand(command);

		// ホワイトリスト：source と python は許可
		if (mainCommand === "source" || mainCommand === "python") {
			return result;
		}

		// 段階2: パターン検出（危険なパターン、コマンド分類）
		checkResult = runPatternCheck(command);
		if (checkResult) {
			result.isValid = false;
			result.severity = checkResult.severity;
			result.violations = checkResult.violations;
		}

		// 段階3: パス保護（rm -rf安全性、保護パス）
		checkResult = runPathProtectionCheck(command);
		if (checkResult) {
			result.isValid = false;
			result.severity = checkResult.severity;
			result.violations.push(...checkResult.violations);
		}

		// ホワイトリスト確認：SAFE_COMMANDS で違反がなければ許可
		if (SAFE_COMMANDS.includes(mainCommand) && result.violations.length === 0) {
			return result;
		}

		// 段階4: コマンドチェーン検証（&&, ||, ;）
		if (hasAndOperator(command)) {
			const chainedCommands = splitCommandChain(command);
			let allSafe = true;
			for (const chainedCmd of chainedCommands) {
				const trimmedCmd = chainedCmd.trim();
				const chainMainCommand = getMainCommand(trimmedCmd);

				if (
					chainMainCommand === "source" ||
					chainMainCommand === "python" ||
					SAFE_COMMANDS.includes(chainMainCommand)
				) {
					continue;
				}

				const chainResult = this.validateSingleCommand(trimmedCmd, toolName);
				if (!chainResult.isValid) {
					result.isValid = false;
					result.severity = chainResult.severity;
					result.violations.push(
						`Chained command violation: ${trimmedCmd} - ${chainResult.violations.join(", ")}`,
					);
					allSafe = false;
				}
			}
			if (allSafe) {
				return result;
			}
		}

		if (hasOrOperator(command) || hasSemicolonOperator(command)) {
			const chainedCommands = splitCommandChain(command);
			for (const chainedCmd of chainedCommands) {
				const chainResult = this.validateSingleCommand(chainedCmd.trim(), toolName);
				if (!chainResult.isValid) {
					result.isValid = false;
					result.severity = chainResult.severity;
					result.violations.push(
						`Chained command violation: ${chainedCmd.trim()} - ${chainResult.violations.join(", ")}`,
					);
				}
			}
			return result;
		}

		return result;
	}

	validateSingleCommand(command: string, _toolName = "Unknown"): ValidationResult {
		const result: ValidationResult = {
			isValid: true,
			severity: "LOW",
			violations: [],
			sanitizedCommand: command,
		};

		// 段階1: 基本検証
		let checkResult = runBasicValidation(command);
		if (checkResult) {
			result.isValid = false;
			result.severity = checkResult.severity;
			result.violations = checkResult.violations;
			return result;
		}

		const mainCommand = getMainCommand(command);

		// ホワイトリスト：source と python は許可
		if (mainCommand === "source" || mainCommand === "python") {
			return result;
		}

		// 段階2: パターン検出
		checkResult = runPatternCheck(command);
		if (checkResult) {
			result.isValid = false;
			result.severity = checkResult.severity;
			result.violations = checkResult.violations;
		}

		// 段階3: パス保護
		checkResult = runPathProtectionCheck(command);
		if (checkResult) {
			result.isValid = false;
			result.severity = checkResult.severity;
			result.violations.push(...checkResult.violations);
		}

		// ホワイトリスト確認
		if (SAFE_COMMANDS.includes(mainCommand) && result.violations.length === 0) {
			return result;
		}

		return result;
	}

	/**
	 * POSIX シェルエスケープ
	 * 単一引用符でラップし、内部のシングルクォートをエスケープ
	 *
	 * @param arg - エスケープする文字列
	 * @returns エスケープされた文字列
	 *
	 * @example
	 * shellEscape("hello'world") // => 'hello'"'"'world'
	 * shellEscape("test") // => 'test'
	 */
	shellEscape(arg: string): string {
		return "'" + arg.replace(/'/g, "'\\''") + "'";
	}

	/**
	 * 安全なコマンド実行文字列の生成
	 * パラメータ化されたコマンドを構築（インジェクション対策）
	 *
	 * @param cmd - コマンド名
	 * @param args - コマンド引数の配列
	 * @returns シェルエスケープされた安全なコマンド文字列
	 *
	 * @example
	 * buildSafeCommand("echo", ["hello", "world's"]) // => echo 'hello' 'world'"'"'s'
	 */
	buildSafeCommand(cmd: string, args: string[]): string {
		const escapedArgs = args.map((arg) => this.shellEscape(arg));
		return escapedArgs.length > 0 ? `${cmd} ${escapedArgs.join(" ")}` : cmd;
	}
}
