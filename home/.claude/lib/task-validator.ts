/**
 * APEX メソドロジーのタスク検証エンジン
 * Zodベースの型安全なバリデーション
 */

import { z } from 'zod';
import matter from 'gray-matter';
import type {
	TaskFile,
	TaskPhase,
} from './task-schema';
import {
	TaskSchema,
	VALID_PHASE_TRANSITIONS,
} from './task-schema';

// ============================================================================
// 型定義
// ============================================================================

/**
 * バリデーション結果型
 * Zod safeParse() の戻り値
 */
export type ValidationResult = ReturnType<typeof TaskSchema.safeParse>;

/**
 * バリデーションエラー型
 * Zod エラー情報を簡潔に変換
 */
export interface ValidationError {
	field: string;
	message: string;
	value?: unknown;
}

// ============================================================================
// バリデータクラス
// ============================================================================

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
	 * if (result.success) {
	 *   console.log("Task data:", result.data);
	 * } else {
	 *   console.error("Validation errors:", result.error);
	 * }
	 * ```
	 */
	validate(taskContent: string): ValidationResult {
		try {
			const parsed = parseTaskMarkdown(taskContent);
			return TaskSchema.safeParse(parsed);
		} catch (error) {
			// Parse errors are returned as failed validation
			const message = error instanceof Error ? error.message : String(error);
			console.error('Task parsing error:', message);

			// フォールバック：empty object で Zod validation を実行
			// これにより、required fields のエラーが返される
			return TaskSchema.safeParse({});
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
		return VALID_PHASE_TRANSITIONS[currentPhase]?.includes(nextPhase) ?? false;
	}
}

// ============================================================================
// Markdown パース（Gray-Matter を使用）
// ============================================================================

/**
 * Markdownタスクファイルを解析する
 * Gray-Matterでfrontmatterを抽出し、セクションから追加データを抽出
 *
 * @internal
 */
function parseTaskMarkdown(content: string): Record<string, unknown> {
	// Gray-Matterでfrontmatterを解析
	const { data, content: markdown } = matter(content);

	// デフォルト値
	const result: Record<string, unknown> = {
		dependencies: [],
		context: { files: [], patterns: [] },
		success_criteria: [],
		...data,
	};

	// Markdownセクションを解析
	const lines = markdown.split('\n');
	let currentSection = '';

	for (const currentLine of lines) {
		const line = currentLine.trim();
		if (!line) continue;

		// セクションヘッダー検出
		if (line.startsWith('## ')) {
			currentSection = line
				.substring(3)
				.toLowerCase()
				.replace(/\s+/g, '_')
				.replace(/[^a-z0-9_]/g, '');
			continue;
		}

		// セクション別の処理
		if (currentSection === 'dependencies' && line.startsWith('- ')) {
			const dep = line.substring(2).trim();
			if (dep) {
				(result['dependencies'] as string[]).push(dep);
			}
		} else if (currentSection === 'success_criteria' && line.startsWith('- ')) {
			const criterion = line.substring(2).trim();
			if (criterion) {
				(result['success_criteria'] as string[]).push(criterion);
			}
		} else if (currentSection === 'context' && (line.startsWith('- ') || line.includes('**Files:**'))) {
			const file = line.replace(/^\*\*Files:\*\*\s*/, '').replace(/^- /, '').trim();
			if (file) {
				((result['context'] as any)['files'] as string[]).push(file);
			}
		} else if (line.startsWith('# ')) {
			// タイトル抽出
			result['title'] = line.substring(2).trim();
		}
	}

	return result;
}

// ============================================================================
// 便利関数
// ============================================================================

/**
 * タスク検証の便利関数
 * 単純なユースケース向けのヘルパー
 *
 * @example
 * ```ts
 * const result = validateTask(fileContent);
 * if (result.success) {
 *   console.log(result.data);
 * }
 * ```
 */
export function validateTask(content: string): ValidationResult {
	const validator = new TaskValidator();
	return validator.validate(content);
}

/**
 * フェーズ遷移の便利関数
 *
 * @example
 * ```ts
 * if (isValidTransition('analyze', 'plan')) {
 *   // フェーズ遷移OK
 * }
 * ```
 */
export function isValidTransition(
	currentPhase: TaskPhase,
	nextPhase: TaskPhase,
): boolean {
	const validator = new TaskValidator();
	return validator.validatePhaseTransition(currentPhase, nextPhase);
}
