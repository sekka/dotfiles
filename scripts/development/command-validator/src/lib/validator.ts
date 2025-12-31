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
	/**
	 * 4段階バリデーションパイプラインの実行（段階1-3）
	 * 基本検証、パターン検出、パス保護を順次実行
	 *
	 * @param command - 検証するコマンド
	 * @returns 検証結果。段階1で失敗した場合は即座に結果を返す
	 */
	private runValidationPipeline(command: string): ValidationResult {
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
			result.violations.push(...checkResult.violations);
			// 重大度の更新：より重大な場合のみ更新
			if (this.shouldUpdateSeverity(result.severity, checkResult.severity)) {
				result.severity = checkResult.severity;
			}
		}

		// 段階3: パス保護（rm -rf安全性、保護パス）
		checkResult = runPathProtectionCheck(command);
		if (checkResult) {
			result.isValid = false;
			result.violations.push(...checkResult.violations);
			// 重大度の更新：より重大な場合のみ更新
			if (this.shouldUpdateSeverity(result.severity, checkResult.severity)) {
				result.severity = checkResult.severity;
			}
		}

		// ホワイトリスト確認：SAFE_COMMANDS で違反がなければ許可
		if (SAFE_COMMANDS.includes(mainCommand) && result.violations.length === 0) {
			return result;
		}

		return result;
	}

	validate(command: string, toolName = "Unknown"): ValidationResult {
		// 段階1-3の検証パイプラインを実行
		const result = this.runValidationPipeline(command);

		// 初期段階で失敗した場合はここで返す（段階1での失敗）
		if (!result.isValid && result.violations.length === 1) {
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

				const chainResult = this.runValidationPipeline(trimmedCmd);
				if (!chainResult.isValid) {
					result.isValid = false;
					if (this.shouldUpdateSeverity(result.severity, chainResult.severity)) {
						result.severity = chainResult.severity;
					}
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
				const chainResult = this.runValidationPipeline(chainedCmd.trim());
				if (!chainResult.isValid) {
					result.isValid = false;
					if (this.shouldUpdateSeverity(result.severity, chainResult.severity)) {
						result.severity = chainResult.severity;
					}
					result.violations.push(
						`Chained command violation: ${chainedCmd.trim()} - ${chainResult.violations.join(", ")}`,
					);
				}
			}
			return result;
		}

		return result;
	}

	/**
	 * 単一のコマンドを検証（チェーン処理なし）
	 * 段階1-3の検証パイプラインのみを実行
	 * チェーンコマンドの検証時に再帰的に使用されます
	 *
	 * @param command - 検証するコマンド
	 * @param _toolName - ツール名（未使用、互換性のため保持）
	 * @returns 検証結果
	 */
	validateSingleCommand(command: string, _toolName = "Unknown"): ValidationResult {
		return this.runValidationPipeline(command);
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

	/**
	 * 重大度の比較と更新判定
	 * より高い重大度の場合のみtrueを返す
	 *
	 * @param currentSeverity - 現在の重大度
	 * @param newSeverity - 新しい重大度
	 * @returns 新しい重大度がより高い場合true
	 */
	private shouldUpdateSeverity(
		currentSeverity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
		newSeverity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
	): boolean {
		const severityLevel = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
		return severityLevel[newSeverity] > severityLevel[currentSeverity];
	}
}
