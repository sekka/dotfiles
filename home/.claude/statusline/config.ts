// ============================================================================
// Phase 3.1: Configuration Module (Extracted from utils.ts)
// ============================================================================

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * ステータスライン表示設定インターフェース
 * このインターフェースはステータスラインの各セクションの表示/非表示を制御します。
 * 部分的な設定が提供される場合は、DEFAULT_CONFIG とマージされて使用されます。
 *
 * @typedef {Object} StatuslineConfig
 * @property {Object} git - Git関連情報の表示設定
 * @property {boolean} git.showBranch - Git ブランチ名を表示するかどうか
 * @property {boolean} git.showAheadBehind - 上流ブランチとの ahead/behind を表示するかどうか
 * @property {boolean} git.showDiffStats - 変更統計（+行数/-行数）を表示するかどうか
 * @property {boolean} git.alwaysShowMain - main/master ブランチでも ahead/behind を表示するかどうか
 * @property {Object} rateLimits - API レート制限表示設定
 * @property {boolean} rateLimits.showFiveHour - 5時間ウィンドウのレート制限を表示するかどうか
 * @property {boolean} rateLimits.showWeekly - 週間ウィンドウのレート制限を表示するかどうか
 * @property {boolean} rateLimits.showPeriodCost - 請求期間のコスト制限（例：$119）を表示するかどうか
 * @property {Object} costs - コスト表示設定
 * @property {boolean} costs.showDailyCost - 日次コストを表示するかどうか
 * @property {boolean} costs.showSessionCost - セッションコストを表示するかどうか
 * @property {Object} tokens - トークン使用量表示設定
 * @property {boolean} tokens.showContextUsage - コンテキストウィンドウの使用率パーセンテージを表示するかどうか
 * @property {Object} session - セッション情報表示設定
 * @property {boolean} session.showSessionId - セッション ID を表示するかどうか
 * @property {boolean} session.showElapsedTime - セッション開始からの経過時間を表示するかどうか
 * @property {Object} display - 表示形式の設定
 * @property {boolean} display.showSeparators - メトリクス間の区切り文字を表示するかどうか
 *
 * @example
 * // 最小限の設定上書き（他はデフォルト値を使用）
 * const customConfig = {
 *   git: { showBranch: false }
 * };
 * // DEFAULT_CONFIG とマージされて、git.showBranch のみが false に、他は DEFAULT_CONFIG の値を使用
 *
 * @example
 * // コスト表示を無効化
 * const noCostConfig = {
 *   costs: { showDailyCost: false, showSessionCost: false }
 * };
 */
export interface StatuslineConfig {
	git: {
		showBranch: boolean; // ブランチ名表示
		showAheadBehind: boolean; // ahead/behind表示
		showDiffStats: boolean; // 差分統計（+/-）表示
		alwaysShowMain: boolean; // main/masterでもahead/behind表示
	};
	rateLimits: {
		showFiveHour: boolean; // 5時間レート制限表示
		showWeekly: boolean; // 週間レート制限表示
		showPeriodCost: boolean; // 期間コスト（$119）表示
	};
	costs: {
		showDailyCost: boolean; // 日次コスト表示
		showSessionCost: boolean; // セッションコスト表示
	};
	tokens: {
		showContextUsage: boolean; // コンテキスト使用率表示
	};
	session: {
		showSessionId: boolean; // セッションID表示
		showElapsedTime: boolean; // 経過時間表示
	};
	display: {
		showSeparators: boolean; // メトリクス間の区切り表示
	};
}

// ============================================================================
// Default Configuration
// ============================================================================

/**
 * デフォルトステータスライン設定
 * ステータスラインのすべてのセクションを有効にした推奨設定です。
 * この設定をベースにして、ユーザーが特定のセクションを無効化することで、
 * 表示をカスタマイズできます。
 *
 * @type {StatuslineConfig}
 *
 * @property {Object} git - Git セクションを完全に有効
 * @property {Object} rateLimits - レート制限表示を完全に有効
 * @property {Object} costs - コスト表示を完全に有効
 * @property {Object} tokens - トークン使用率表示を有効
 * @property {Object} session - セッションID表示を有効、経過時間は無効
 * @property {Object} display - メトリクス間の区切りを無効（モダンな見た目）
 *
 * @remarks
 * すべてのフラグが明示的に設定されているため、新しい設定オプションが追加される
 * 場合は、DEFAULT_CONFIG にも新しいフラグを追加する必要があります。
 *
 * @example
 * // ユーザー設定を DEFAULT_CONFIG と マージ
 * const userConfig = { git: { showBranch: false } };
 * const finalConfig = { ...DEFAULT_CONFIG, ...userConfig };
 * // finalConfig.git.showBranch === false
 * // finalConfig.git.showAheadBehind === true (DEFAULT_CONFIG から)
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
