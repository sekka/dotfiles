/**
 * APEX メソドロジーのタスク検証エンジン
 * TypeScript組み込み型のみで実装 - 外部依存なし
 */

import type {
	TaskFile,
	TaskPhase,
	TaskStatus,
	ValidationResult,
	ValidationError,
	VALID_PHASE_TRANSITIONS,
	VALID_STATUSES,
	VALID_PHASES,
} from "./task-schema";

/**
 * APEX タスクの検証と解析を行うクラス
 * Markdown形式のタスクファイルを解析し、型安全な検証を実施する
 */
export class TaskValidator {
	/**
	 * タスクファイル内容を検証する
	 * Markdown形式のタスクファイルを解析し、スキーマに準拠しているかチェック
	 *
	 * @param taskContent - タスクファイルのMarkdown内容
	 * @returns 検証結果（成功時はデータ付き、失敗時はエラー配列）
	 *
	 * @example
	 * ```ts
	 * const validator = new TaskValidator();
	 * const result = validator.validate(fileContent);
	 * if (result.valid) {
	 *   console.log("Task data:", result.data);
	 * } else {
	 *   console.error("Validation errors:", result.errors);
	 * }
	 * ```
	 */
	validate(taskContent: string): ValidationResult {
		const errors: ValidationError[] = [];

		try {
			const parsed = parseTaskMarkdown(taskContent);

			// 必須フィールド検証
			if (!parsed["title"] || typeof parsed["title"] !== "string") {
				errors.push({
					field: "title",
					message: "Title is required and must be a string",
				});
			} else if ((parsed["title"] as string).length > 100) {
				errors.push({
					field: "title",
					message: "Title must be 100 characters or less",
					value: parsed["title"],
				});
			}

			// Phase検証
			if (!parsed["phase"] || typeof parsed["phase"] !== "string") {
				errors.push({
					field: "phase",
					message: "Phase is required",
				});
			} else if (!this.isValidPhase(parsed["phase"])) {
				errors.push({
					field: "phase",
					message: `Phase must be one of: analyze, plan, execute, examine`,
					value: parsed["phase"],
				});
			}

			// Status検証
			if (!parsed["status"] || typeof parsed["status"] !== "string") {
				errors.push({
					field: "status",
					message: "Status is required",
				});
			} else if (!this.isValidStatus(parsed["status"])) {
				errors.push({
					field: "status",
					message: `Status must be one of: pending, in-progress, completed, blocked`,
					value: parsed["status"],
				});
			}

			// 配列フィールド検証
			if (!Array.isArray(parsed["dependencies"])) {
				errors.push({
					field: "dependencies",
					message: "Dependencies must be an array",
				});
			}

			if (!Array.isArray(parsed["success_criteria"])) {
				errors.push({
					field: "success_criteria",
					message: "Success criteria must be an array",
				});
			}

			// Problem と Solution 検証
			if (!parsed["problem"] || typeof parsed["problem"] !== "string") {
				errors.push({
					field: "problem",
					message: "Problem description is required",
				});
			}

			if (!parsed["solution"] || typeof parsed["solution"] !== "string") {
				errors.push({
					field: "solution",
					message: "Solution description is required",
				});
			}

			// Context 検証
			const context = parsed["context"];
			if (
				!context ||
				typeof context !== "object" ||
				!Array.isArray((context as Record<string, unknown>)["files"]) ||
				!Array.isArray((context as Record<string, unknown>)["patterns"])
			) {
				errors.push({
					field: "context",
					message: "Context must have files and patterns arrays",
				});
			}

			// 日時フィールド検証
			if (!parsed["created_at"] || !this.isValidISO8601(parsed["created_at"])) {
				errors.push({
					field: "created_at",
					message: "Must be valid ISO 8601 datetime",
					value: parsed["created_at"],
				});
			}

			if (!parsed["updated_at"] || !this.isValidISO8601(parsed["updated_at"])) {
				errors.push({
					field: "updated_at",
					message: "Must be valid ISO 8601 datetime",
					value: parsed["updated_at"],
				});
			}

			if (errors.length > 0) {
				return { valid: false, errors };
			}

			return {
				valid: true,
				errors: [],
				data: parsed as unknown as TaskFile,
			};
		} catch (error) {
			return {
				valid: false,
				errors: [
					{
						field: "parse",
						message: `Failed to parse task file: ${error instanceof Error ? error.message : String(error)}`,
					},
				],
			};
		}
	}

	/**
	 * フェーズ遷移の妥当性を検証する
	 * APEX メソドロジーの流れ: analyze → plan → execute → examine
	 * 逆方向や飛び越しは許さない
	 *
	 * @param currentPhase - 現在のフェーズ
	 * @param nextPhase - 遷移先のフェーズ
	 * @returns 遷移が妥当な場合 true、そうでない場合 false
	 *
	 * @example
	 * ```ts
	 * validator.validatePhaseTransition('analyze', 'plan');  // true
	 * validator.validatePhaseTransition('analyze', 'execute'); // false (飛び越し)
	 * validator.validatePhaseTransition('plan', 'analyze');  // false (逆方向)
	 * ```
	 */
	validatePhaseTransition(currentPhase: TaskPhase, nextPhase: TaskPhase): boolean {
		const validTransitions: Record<TaskPhase, TaskPhase[]> = {
			analyze: ["plan"],
			plan: ["execute"],
			execute: ["examine"],
			examine: [],
		};
		return validTransitions[currentPhase]?.includes(nextPhase) ?? false;
	}

	/**
	 * フェーズが有効かどうかをチェック
	 * @internal
	 */
	private isValidPhase(phase: unknown): phase is TaskPhase {
		return (
			typeof phase === "string" &&
			["analyze", "plan", "execute", "examine"].includes(phase)
		);
	}

	/**
	 * ステータスが有効かどうかをチェック
	 * @internal
	 */
	private isValidStatus(status: unknown): status is TaskStatus {
		return (
			typeof status === "string" &&
			["pending", "in-progress", "completed", "blocked"].includes(status)
		);
	}

	/**
	 * ISO 8601形式の日時文字列を検証する
	 * @internal
	 */
	private isValidISO8601(dateString: unknown): boolean {
		if (typeof dateString !== "string") {
			return false;
		}
		try {
			const date = new Date(dateString);
			return !isNaN(date.getTime()) && date.toISOString() === dateString;
		} catch {
			return false;
		}
	}
}

/**
 * Markdownタスクファイルを解析する
 * Frontmatterとセクションから構造化データを抽出
 *
 * @internal
 */
function parseTaskMarkdown(content: string): Record<string, unknown> {
	const lines = content.split("\n");
	const result: Record<string, unknown> = {
		dependencies: [],
		context: { files: [], patterns: [] },
		success_criteria: [],
	};

	let currentSection = "";
	let inFrontmatter = false;
	let frontmatterCount = 0;

	for (let i = 0; i < lines.length; i++) {
		const currentLine = lines[i];
		if (!currentLine) continue;
		const line = currentLine.trim();

		// Frontmatter処理
		if (line === "---") {
			frontmatterCount++;
			if (frontmatterCount === 1) {
				inFrontmatter = true;
			} else if (frontmatterCount === 2) {
				inFrontmatter = false;
			}
			continue;
		}

		if (inFrontmatter && frontmatterCount === 1) {
			const [key, ...valueParts] = line.split(":");
			const value = valueParts.join(":").trim();
			if (key && value) {
				const trimmedKey = key.trim();
				// 単純な値解析
				if (value === "true") {
					result[trimmedKey] = true;
				} else if (value === "false") {
					result[trimmedKey] = false;
				} else {
					result[trimmedKey] = value;
				}
			}
			continue;
		}

		// セクションヘッダー検出
		if (line.startsWith("## ")) {
			currentSection = line
				.substring(3)
				.toLowerCase()
				.replace(/\s+/g, "_")
				.replace(/[^a-z0-9_]/g, "");
			continue;
		}

		// セクション内容処理
		if (currentSection === "dependencies" && line.startsWith("- ")) {
			const dep = line.substring(2).trim();
			if (dep && Array.isArray(result["dependencies"])) {
				(result["dependencies"] as string[]).push(dep);
			}
		}

		if (currentSection === "context") {
			if (line.startsWith("**Files:**") || line.startsWith("- ")) {
				const file = line.replace(/^\*\*Files:\*\*\s*/, "").replace(/^- /, "").trim();
				const ctx = result["context"];
				if (
					file &&
					ctx &&
					typeof ctx === "object" &&
					Array.isArray((ctx as Record<string, unknown>)["files"])
				) {
					((ctx as Record<string, unknown>)["files"] as string[]).push(file);
				}
			}
		}

		if (currentSection === "success_criteria" && line.startsWith("- ")) {
			const criterion = line.substring(2).trim();
			if (criterion && Array.isArray(result["success_criteria"])) {
				(result["success_criteria"] as string[]).push(criterion);
			}
		}

		// タイトル抽出
		if (line.startsWith("# ")) {
			result["title"] = line.substring(2).trim();
		}
	}

	return result;
}

/**
 * タスク検証の便利関数
 * 単純なユースケース向けのヘルパー
 */
export function validateTask(content: string): ValidationResult {
	const validator = new TaskValidator();
	return validator.validate(content);
}

/**
 * フェーズ遷移の便利関数
 */
export function isValidTransition(
	currentPhase: TaskPhase,
	nextPhase: TaskPhase,
): boolean {
	const validator = new TaskValidator();
	return validator.validatePhaseTransition(currentPhase, nextPhase);
}
