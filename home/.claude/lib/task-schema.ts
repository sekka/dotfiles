/**
 * APEX メソドロジーのタスク管理 - Zodスキーマ定義
 * 型安全性とランタイム検証を実現
 */

import { z } from 'zod';

// ============================================================================
// スキーマ定義
// ============================================================================

/**
 * タスクフェーズのスキーマ
 * APEX メソドロジーの4段階: analyze → plan → execute → examine
 */
export const TaskPhaseEnum = z.enum(['analyze', 'plan', 'execute', 'examine']);
export type TaskPhase = z.infer<typeof TaskPhaseEnum>;

/**
 * タスクステータスのスキーマ
 */
export const TaskStatusEnum = z.enum(['pending', 'in-progress', 'completed', 'blocked']);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

/**
 * ISO 8601日時文字列のカスタム検証
 * gray-matter が YAML の unquoted ISO 8601 を Date オブジェクトに自動変換することに対応
 * 文字列と Date オブジェクトの両方を受け入れ、内部的に ISO 文字列に統一する
 */
const ISO8601DateTime = z.union([
	z.string().datetime(),
	z.date().transform(d => d.toISOString())
]).describe('ISO 8601形式の日時文字列または Date オブジェクト');

/**
 * コンテキストオブジェクトのスキーマ
 */
export const ContextSchema = z.object({
	files: z.array(z.string()).describe('関連ファイルのパスリスト'),
	patterns: z.array(z.string()).describe('参照すべきコードパターン'),
});

/**
 * タスクファイルの完全なスキーマ定義
 */
export const TaskSchema = z.object({
	title: z.string().max(100).describe('タスク標題 (100文字以下)'),
	phase: TaskPhaseEnum.describe('タスクが属するAPEXフェーズ'),
	status: TaskStatusEnum.describe('タスクの現在ステータス'),
	problem: z.string().min(1).describe('解決すべき問題の説明'),
	solution: z.string().min(1).describe('提案する解決策の説明'),
	dependencies: z.array(z.string()).default([]).describe('依存するタスク'),
	context: ContextSchema.default({ files: [], patterns: [] }).describe('タスク実行コンテキスト'),
	success_criteria: z.array(z.string()).default([]).describe('タスク完了の成功基準'),
	created_at: ISO8601DateTime.describe('タスク作成日時 (ISO 8601形式)'),
	updated_at: ISO8601DateTime.describe('タスク更新日時 (ISO 8601形式)'),
});

export type TaskFile = z.infer<typeof TaskSchema>;

/**
 * フェーズ遷移の妥当性判定
 * APEX メソドロジーの流れに沿った遷移のみを許可
 */
export const VALID_PHASE_TRANSITIONS: Record<TaskPhase, TaskPhase[]> = {
	analyze: ['plan'],
	plan: ['execute'],
	execute: ['examine'],
	examine: [],
};

/**
 * 許可されたステータス
 */
export const VALID_STATUSES: TaskStatus[] = ['pending', 'in-progress', 'completed', 'blocked'];

/**
 * 許可されたフェーズ
 */
export const VALID_PHASES: TaskPhase[] = ['analyze', 'plan', 'execute', 'examine'];
