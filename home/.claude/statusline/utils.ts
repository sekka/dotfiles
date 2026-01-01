// Phase 3.1: Core Types Only (Implementation moved to specific modules)
// ============================================================================
// Backward compatibility re-exports for existing imports
// ============================================================================

export { type DebugLevel, DEBUG_LEVEL, debug, validateDebugLevel } from "./logging.ts";
export { colors } from "./colors.ts";
export { DEFAULT_CONFIG, type StatuslineConfig } from "./config.ts";
export { sanitizeForLogging, isValidUsageLimits, isValidStatuslineConfig } from "./validation.ts";
export { logError } from "./security.ts";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Claude Code ステータスライン表示フックの入力データ型
 * CLI ツールから提供されるメタデータと使用統計を含みます。
 *
 * @typedef {Object} HookInput
 * @property {Object} model - 現在使用中の AI モデル情報
 * @property {string} model.display_name - モデルの表示名（例："Claude 3.5 Sonnet"）
 * @property {Object} workspace - ワークスペース情報
 * @property {string} workspace.current_dir - 現在のワーキングディレクトリ
 * @property {string} [cwd] - オプション：ワーキングディレクトリ（workspace.current_dir の別表記）
 * @property {string} session_id - セッション識別子（ユニーク）
 * @property {Object} cost - 使用コスト情報
 * @property {number} cost.total_cost_usd - 合計コスト（米国ドル）
 * @property {number} cost.total_duration_ms - セッション継続時間（ミリ秒）
 * @property {Object} [context_window] - コンテキストウィンドウ使用情報（オプション）
 * @property {number} context_window.context_window_size - コンテキストウィンドウサイズ（トークン数）
 * @property {Object|null} context_window.current_usage - 現在のトークン使用状況
 * @property {number} context_window.current_usage.input_tokens - 入力トークン数
 * @property {number} context_window.current_usage.output_tokens - 出力トークン数
 * @property {number} context_window.current_usage.cache_creation_input_tokens - キャッシュ作成時の入力トークン
 * @property {number} context_window.current_usage.cache_read_input_tokens - キャッシュ読み込み時の入力トークン
 * @property {string} [transcript_path] - オプション：トランスクリプトファイルへのパス
 */
export interface HookInput {
	model: { display_name: string };
	workspace: { current_dir: string };
	cwd?: string;
	session_id: string;
	cost: {
		total_cost_usd: number;
		total_duration_ms: number;
	};
	context_window?: {
		context_window_size: number;
		current_usage: {
			input_tokens: number;
			output_tokens: number;
			cache_creation_input_tokens: number;
			cache_read_input_tokens: number;
		} | null;
	};
	transcript_path?: string;
}

/**
 * Git リポジトリの現在のステータス情報
 * 枝、変更統計、上流との同期状態を含みます。
 *
 * @typedef {Object} GitStatus
 * @property {string} branch - 現在のブランチ名（Git リポジトリでない場合は空文字列）
 * @property {boolean} hasChanges - リポジトリに変更があるかどうか（ahead/behind または diff stats が存在）
 * @property {string|null} aheadBehind - 上流ブランチとの前後関係（ANSI カラー付き）
 *                                       形式：↑X（先行）、↓X（遅延）、↑X↓Y（両方）、または null
 * @property {string|null} diffStats - 変更統計（ANSI カラー付き）
 *                                     形式："+X -Y"（緑色の +、赤色の -）、または null
 *
 * @example
 * // ブランチ feature で 5 コミット先行、3 行追加、1 行削除
 * const status = {
 *   branch: "feature",
 *   hasChanges: true,
 *   aheadBehind: "\x1b[33m↑5\x1b[0m",
 *   diffStats: "\x1b[32m+3\x1b[0m \x1b[31m-1\x1b[0m"
 * };
 */
export interface GitStatus {
	branch: string;
	hasChanges: boolean;
	aheadBehind: string | null;
	diffStats: string | null;
}

/**
 * トランスクリプト JSON エントリの型定義
 * 各行は JSON 形式のこのインターフェースに従う必要があります。
 *
 * @typedef {Object} TranscriptEntry
 * @property {string} [type] - エントリの種類（"user"、"assistant" など）
 * @property {Object} [message] - メッセージペイロード
 * @property {Object} [message.usage] - トークン使用統計
 * @property {number} [message.usage.input_tokens] - 入力トークン数
 * @property {number} [message.usage.output_tokens] - 出力トークン数
 * @property {number} [message.usage.cache_creation_input_tokens] - キャッシュ作成時の入力トークン
 * @property {number} [message.usage.cache_read_input_tokens] - キャッシュ読み込み時の入力トークン
 * @property {string} [timestamp] - エントリのタイムスタンプ（ISO 8601 形式）
 *
 * @remarks
 * - calculateTokensFromTranscript() で最後の assistant エントリを検索して使用
 * - 最後の assistant エントリのトークン使用量が合計として使用される
 * - JSON パースエラーは無視される（破損した行をスキップ）
 */
export interface TranscriptEntry {
	type?: string;
	message?: {
		usage?: {
			input_tokens?: number;
			output_tokens?: number;
			cache_creation_input_tokens?: number;
			cache_read_input_tokens?: number;
		};
	};
	timestamp?: string;
}

// ============================================================================
// API Response Types (Phase 3-2: DI support)
// ============================================================================

/**
 * Claude API のレート制限情報
 * 5時間と7日間（週間）の利用率を含みます。
 * モデル別の制限情報（Sonnet, Opus）もサポートしています。
 *
 * @typedef {Object} UsageLimits
 * @property {Object|null} five_hour - 5時間ウィンドウのレート制限情報
 * @property {number} five_hour.utilization - 利用率パーセンテージ（0-100）
 * @property {string|null} five_hour.resets_at - ISO 8601 形式のリセット時刻、不明な場合は null
 * @property {Object|null} seven_day - 7日間（週間）ウィンドウのレート制限情報（全モデル合計）
 * @property {number} seven_day.utilization - 利用率パーセンテージ（0-100）
 * @property {string|null} seven_day.resets_at - ISO 8601 形式のリセット時刻、不明な場合は null
 * @property {Object|null} seven_day_sonnet - 7日間ウィンドウのSonnet専用レート制限情報
 * @property {number} seven_day_sonnet.utilization - 利用率パーセンテージ（0-100）
 * @property {string|null} seven_day_sonnet.resets_at - ISO 8601 形式のリセット時刻、不明な場合は null
 * @property {Object|null} seven_day_opus - 7日間ウィンドウのOpus専用レート制限情報
 * @property {number} seven_day_opus.utilization - 利用率パーセンテージ（0-100）
 * @property {string|null} seven_day_opus.resets_at - ISO 8601 形式のリセット時刻、不明な場合は null
 *
 * @remarks
 * - フィールドが null の場合、その制限情報は利用不可
 * - utilization が 100 に達するとレート制限がかかる
 * - resets_at が null の場合、リセット時刻は不明またはクエリできない状態
 * - モデル別フィールドはサブスクリプションやプランによって提供されない場合がある
 *
 * @example
 * const limits = {
 *   five_hour: { utilization: 45, resets_at: "2025-01-01T12:00:00Z" },
 *   seven_day: { utilization: 60, resets_at: "2025-01-06T00:00:00Z" },
 *   seven_day_sonnet: { utilization: 75, resets_at: "2025-01-06T00:00:00Z" },
 *   seven_day_opus: null
 * };
 */
export interface UsageLimits {
	five_hour: { utilization: number; resets_at: string | null } | null;
	seven_day: { utilization: number; resets_at: string | null } | null;
	seven_day_sonnet: { utilization: number; resets_at: string | null } | null;
	seven_day_opus: { utilization: number; resets_at: string | null } | null;
}

/**
 * キャッシュされたレート制限情報
 * キャッシュのタイムスタンプを含む UsageLimits をラップします。
 *
 * @typedef {Object} CachedUsageLimits
 * @property {UsageLimits} data - レート制限データ
 * @property {number} timestamp - キャッシュ作成時刻（ミリ秒単位の Unix タイムスタンプ）
 *
 * @remarks
 * - キャッシュライフタイムはキャッシュ実装によって決定される
 * - timestamp から経過時間を計算してキャッシュの有効性を判定可能
 * - 依存性注入パターンで複数のキャッシュプロバイダーをサポート
 *
 * @example
 * const cached = {
 *   data: {
 *     five_hour: { utilization: 45, resets_at: "2025-01-01T12:00:00Z" },
 *     seven_day: { utilization: 60, resets_at: "2025-01-06T00:00:00Z" }
 *   },
 *   timestamp: 1735689600000
 * };
 */
export interface CachedUsageLimits {
	data: UsageLimits;
	timestamp: number;
}
