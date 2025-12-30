// ============================================================================
// Cosmiconfig ベースの設定管理（手動実装から置き換え）
// ============================================================================

import { cosmiconfig } from 'cosmiconfig';
import type { CosmiconfigResult } from 'cosmiconfig';

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
		showPeriodCost: boolean;
	};
	costs: {
		showDailyCost: boolean;
		showSessionCost: boolean;
	};
	tokens: {
		showContextUsage: boolean;
	};
	session: {
		showSessionId: boolean;
		showElapsedTime: boolean;
	};
	display: {
		showSeparators: boolean;
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
		showPeriodCost: true,
	},
	costs: {
		showDailyCost: true,
		showSessionCost: true,
	},
	tokens: {
		showContextUsage: true,
	},
	session: {
		showSessionId: true,
		showElapsedTime: false,
	},
	display: {
		showSeparators: false,
	},
};

// ============================================================================
// 設定の読み込みと統合
// ============================================================================

/**
 * Cosmiconfigエクスプローラー
 * .statuslinerc.json, .statuslinerc.yaml, statuslinerc.js等を自動探索
 */
const explorer = cosmiconfig('statusline');

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
		return deepMerge(DEFAULT_CONFIG, result.config);
	} catch {
		// ファイル読み込み失敗時はデフォルト設定を返す
		return DEFAULT_CONFIG;
	}
}

/**
 * オブジェクトの深いマージ
 * DEFAULTを基本に、userの値で上書き
 * ネストされたオブジェクトも正しくコピーされることを保証
 */
function deepMerge<T extends Record<string, any>>(
	defaultObj: T,
	userObj: Partial<T>
): T {
	const result = { ...defaultObj } as T;

	for (const key in userObj) {
		if (Object.prototype.hasOwnProperty.call(userObj, key)) {
			const userValue = userObj[key];
			const defaultValue = defaultObj[key];

			// ネストされたオブジェクト（配列以外）の場合は再帰的にマージ
			if (
				userValue &&
				typeof userValue === 'object' &&
				!Array.isArray(userValue) &&
				defaultValue &&
				typeof defaultValue === 'object' &&
				!Array.isArray(defaultValue)
			) {
				result[key] = deepMerge(defaultValue as any, userValue as any);
			} else if (userValue !== undefined) {
				result[key] = userValue as any;
			}
		}
	}

	return result;
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
		throw new Error(
			'Configuration not initialized. Call initializeConfig() first.'
		);
	}
	return config;
}

/**
 * 現在の設定を取得（フォールバック版）
 * 初期化前の場合はデフォルト設定を警告付きで返す
 */
export function getConfigSync(): StatuslineConfig {
	if (!initialized) {
		console.warn('Config not initialized, using default settings');
		return DEFAULT_CONFIG;
	}
	return config;
}
