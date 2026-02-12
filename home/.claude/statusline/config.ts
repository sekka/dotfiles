// ============================================================================
// Configuration Types and Defaults
// ============================================================================

import { LABEL_KEYS, type LabelKey } from "./labels.ts";

// ============================================================================
// 型定義
// ============================================================================

/**
 * Claude Code ステータスライン表示フックの入力データ型
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
		total_input_tokens?: number;
		total_output_tokens?: number;
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
 * トランスクリプト JSON エントリの型定義
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

/**
 * ステータスライン表示設定インターフェース
 * このインターフェースはステータスラインの各セクションの表示/非表示を制御します。
 */
export interface StatuslineConfig {
	git: {
		showBranch: boolean;
		showAheadBehind: boolean;
		showDiffStats: boolean;
		alwaysShowMain: boolean;
	};
	rateLimits: {
		showFiveHour: boolean;
		showWeekly: boolean;
		showSonnetWeekly: boolean;
		showPeriodCost: boolean;
	};
	costs: {
		showDailyCost: boolean;
		showSessionCost: boolean;
	};
	tokens: {
		showContextUsage: boolean;
		showInputOutput: boolean;
		showCompactCount: boolean;
	};
	session: {
		showSessionId: boolean;
		showElapsedTime: boolean;
		showInFirstLine: boolean;
	};
	display: {
		showSeparators: boolean;
		lineBreakBefore?: string[];
	};
}

// ============================================================================
// デフォルト設定
// ============================================================================

/**
 * デフォルトステータスライン設定
 * ステータスラインのすべてのセクションを有効にした推奨設定です。
 */
export const DEFAULT_CONFIG: StatuslineConfig = {
	git: {
		showBranch: true,
		showAheadBehind: true,
		showDiffStats: true,
		alwaysShowMain: false,
	},
	rateLimits: {
		showFiveHour: true,
		showWeekly: true,
		showSonnetWeekly: true,
		showPeriodCost: true,
	},
	costs: {
		showDailyCost: true,
		showSessionCost: true,
	},
	tokens: {
		showContextUsage: true,
		showInputOutput: true,
		showCompactCount: true,
	},
	session: {
		showSessionId: true,
		showElapsedTime: false,
		showInFirstLine: true,
	},
	display: {
		showSeparators: false,
		lineBreakBefore: [],
	},
};

// ============================================================================
// 後方互換性マッピング
// ============================================================================

/**
 * 旧ラベル名 → 内部IDのマッピング
 *
 * ラベル形式が変更されても、既存の設定ファイルが壊れないように、
 * 旧ラベル名を自動的に内部IDに変換します。
 */
const LEGACY_LABEL_MAP: Record<string, LabelKey> = {
	"P": LABEL_KEYS.PROJECT,
	"B": LABEL_KEYS.BRANCH,
	"S": LABEL_KEYS.SESSION,
	"T": LABEL_KEYS.TOKEN,
	"I": LABEL_KEYS.INPUT,
	"O": LABEL_KEYS.OUTPUT,
	"C": LABEL_KEYS.COMPACT,
	"IO": LABEL_KEYS.IO,
	"L": LABEL_KEYS.LIMIT,
	"D": LABEL_KEYS.DAILY,
	"W": LABEL_KEYS.WEEKLY,
	"WS": LABEL_KEYS.WEEKLY_SONNET,
	// 新しい表示ラベル（PRJ, BR, SES など）も受け付ける
	"PRJ": LABEL_KEYS.PROJECT,
	"BR": LABEL_KEYS.BRANCH,
	"SES": LABEL_KEYS.SESSION,
	"TK": LABEL_KEYS.TOKEN,
	"IN": LABEL_KEYS.INPUT,
	"OUT": LABEL_KEYS.OUTPUT,
	"CMP": LABEL_KEYS.COMPACT,
	"LMT": LABEL_KEYS.LIMIT,
	"DAY": LABEL_KEYS.DAILY,
	"WK": LABEL_KEYS.WEEKLY,
	"WKS": LABEL_KEYS.WEEKLY_SONNET,
};

/**
 * lineBreakBefore 配列の各要素を内部IDに正規化する
 *
 * @param labels - 設定ファイルから読み込んだラベル配列
 * @returns 内部IDに変換された配列
 */
function normalizeLabelKeys(labels: string[] | undefined): string[] {
	if (!labels) {
		return [];
	}

	return labels.map(label => {
		// 既に内部IDの場合はそのまま返す
		if (Object.values(LABEL_KEYS).includes(label as LabelKey)) {
			return label;
		}
		// 旧ラベルまたは表示ラベルの場合は内部IDに変換
		return LEGACY_LABEL_MAP[label] || label;
	});
}

// Note: cosmiconfig-based configuration loading has been removed.
// Configuration is now loaded via cache.ts loadConfigCached() function.
