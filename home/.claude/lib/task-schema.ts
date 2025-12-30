/**
 * APEX メソドロジーのタスク管理型定義
 * TypeScript組み込み型のみで型安全性を実現（外部依存なし）
 */

/** タスクのフェーズ型 */
export type TaskPhase = 'analyze' | 'plan' | 'execute' | 'examine';

/** タスクのステータス型 */
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'blocked';

/**
 * タスクファイルのインターフェース
 * .claude/tasks/<task-folder>/tasks/task-*.md ファイルの構造を定義
 */
export interface TaskFile {
	/** タスク標題 (100文字以下) */
	title: string;

	/** タスクが属するAPEXフェーズ */
	phase: TaskPhase;

	/** タスクの現在ステータス */
	status: TaskStatus;

	/** 解決すべき問題の説明 */
	problem: string;

	/** 提案する解決策の説明 */
	solution: string;

	/** 依存するタスク (Task #Nの形式) */
	dependencies: string[];

	/** タスクの実行コンテキスト */
	context: {
		/** 関連ファイルのパスリスト (src/auth.ts:42 の形式) */
		files: string[];

		/** 参照すべきコードパターン */
		patterns: string[];
	};

	/** タスク完了の成功基準 */
	success_criteria: string[];

	/** タスク作成日時 (ISO 8601形式) */
	created_at: string;

	/** タスク更新日時 (ISO 8601形式) */
	updated_at: string;
}

/**
 * バリデーションエラーの詳細情報
 */
export interface ValidationError {
	/** エラーが発生したフィールド名 */
	field: string;

	/** エラーメッセージ */
	message: string;

	/** エラーが発生した値（デバッグ用） */
	value?: unknown;
}

/**
 * バリデーション結果
 */
export interface ValidationResult {
	/** バリデーション成功の可否 */
	valid: boolean;

	/** 検出されたエラー配列（エラーがない場合は空配列） */
	errors: ValidationError[];

	/** パースされたタスクデータ（valid=trueの場合のみ） */
	data?: TaskFile;
}

/**
 * フェーズ遷移の妥当性判定
 * APEXメソドロジーの流れに沿った遷移のみを許可
 * analyze → plan → execute → examine → (終了)
 */
export const VALID_PHASE_TRANSITIONS: Record<TaskPhase, TaskPhase[]> = {
	analyze: ['plan'],
	plan: ['execute'],
	execute: ['examine'],
	examine: [], // 最終フェーズ
};

/**
 * 許可されたステータス
 */
export const VALID_STATUSES: TaskStatus[] = ['pending', 'in-progress', 'completed', 'blocked'];

/**
 * 許可されたフェーズ
 */
export const VALID_PHASES: TaskPhase[] = ['analyze', 'plan', 'execute', 'examine'];
