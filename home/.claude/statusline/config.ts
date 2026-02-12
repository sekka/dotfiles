// ============================================================================
// Cosmiconfig ベースの設定管理（deepmergeパッケージを使用）
// ============================================================================

import { cosmiconfig } from "cosmiconfig";
import type { CosmiconfigResult } from "cosmiconfig";
import merge from "deepmerge";
import { LABEL_KEYS, type LabelKey } from "./labels.ts";

// ============================================================================
// 型定義
// ============================================================================

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
	"TOK": LABEL_KEYS.TOKEN,
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

// ============================================================================
// 設定の読み込みと統合
// ============================================================================

/**
 * Cosmiconfigエクスプローラー
 * .statuslinerc.json, .statuslinerc.yaml, statuslinerc.js等を自動探索
 */
const explorer = cosmiconfig("statusline");

/**
 * ファイルベースの設定をDEFAULT_CONFIGとマージして返す
 */
async function loadConfig(): Promise<StatuslineConfig> {
	try {
		const result: CosmiconfigResult = await explorer.search();

		if (!result) {
			return DEFAULT_CONFIG;
		}

		// ファイルベースの設定とDEFAULT_CONFIGを再帰的にマージ
		const mergedConfig = merge(DEFAULT_CONFIG, result.config) as StatuslineConfig;

		// lineBreakBefore の値を内部IDに正規化（後方互換性のため）
		if (mergedConfig.display.lineBreakBefore) {
			mergedConfig.display.lineBreakBefore = normalizeLabelKeys(mergedConfig.display.lineBreakBefore);
		}

		return mergedConfig;
	} catch {
		// ファイル読み込み失敗時はデフォルト設定を返す
		return DEFAULT_CONFIG;
	}
}

/**
 * グローバル設定オブジェクト
 * 初期値はDEFAULT_CONFIG
 * loadConfig() で更新される
 */
let config: StatuslineConfig = DEFAULT_CONFIG;
let initialized = false;
let initPromise: Promise<void> | null = null;

/**
 * 設定を初期化（非同期）
 * アプリケーション起動時に一度だけ呼び出される
 * 複数回呼び出されても初期化は1回のみ実行
 */
export async function initializeConfig(): Promise<void> {
	// 既に初期化中の場合はそれを待つ
	if (initPromise) {
		return initPromise;
	}

	// 初期化開始
	initPromise = (async () => {
		config = await loadConfig();
		initialized = true;
	})();

	return initPromise;
}

/**
 * 現在の設定を取得
 * 同期的にアクセス可能（初期化後）
 * 初期化前に呼び出された場合はエラーを投げる
 */
export function getConfig(): StatuslineConfig {
	if (!initialized) {
		throw new Error("Configuration not initialized. Call initializeConfig() first.");
	}
	return config;
}

/**
 * 現在の設定を取得（フォールバック版）
 * 初期化前の場合はデフォルト設定を警告付きで返す
 */
export function getConfigSync(): StatuslineConfig {
	if (!initialized) {
		console.warn("Config not initialized, using default settings");
		return DEFAULT_CONFIG;
	}
	return config;
}
