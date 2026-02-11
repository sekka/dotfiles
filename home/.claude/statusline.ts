#!/usr/bin/env bun

/**
 * Claude Code ステータスライン表示エントリーポイント
 * 標準入力から HookInput を受け取り、複数行のステータスラインを出力します。
 *
 * このメインスクリプトは以下を行います：
 * 1. CLI ツールから HookInput をJSON で受け取る
 * 2. Git 状態、トークン使用量、コストなどを非同期で取得
 * 3. ステータスラインを構築・整形
 * 4. セッションコストを保存（キャッシュ用）
 *
 * @remarks
 * - TypeScript + Bun で実装（高速実行用）
 * - 複数行出力：第1行（モデル・ディレクトリ・Git）+ メトリクス行
 * - エラー時は最小限のフォールバック出力を行う
 *
 * @see HookInput ホック入力データ型
 * @see StatuslineConfig ステータスライン設定
 */

// Utilities
import { HookInput, type StatuslineConfig, type UsageLimits } from "./statusline/utils.ts";
import { colors } from "./statusline/colors.ts";
import { debug } from "./statusline/logging.ts";

// Git operations
import { getGitStatus } from "./statusline/git.ts";

// Token calculations and formatting
import { getContextTokens, formatElapsedTime, getSessionElapsedTime, getCompactCount } from "./statusline/context.ts";

// Caching and cost tracking
import {
	loadConfigCached,
	getCachedUsageLimits,
	getTodayCost,
	saveSessionCost,
} from "./statusline/cache.ts";

// Metrics builder strategy pattern
import {
	MetricsLineBuilder,
	type MetricsData,
	getMetricsLineBuilder,
} from "./statusline/metrics-builder.ts";

// ============================================================================
// Main Statusline Builder
// ============================================================================

/**
 * ステータスラインの第1行を構築
 * モデル名、ディレクトリ、Git 情報、セッション情報、セッション ID を含みます。
 * 形式：[モデル] 📁 [ディレクトリ名] 🌿 [Git情報] [S: セッション時間 コスト] [セッションID]
 *
 * @param {string} model - AI モデル名（例："Claude 3.5 Sonnet"）
 * @param {string} dirName - 現在のディレクトリ名（フルパスの最後の部分）
 * @param {string} gitPart - Git 情報（ブランチ + ahead/behind + diffStats）、なければ空文字列
 * @param {string} sessionId - セッション ID（ユニーク識別子）
 * @param {string} sessionTimeDisplay - セッション経過時間の表示文字列（例：「2m 30s」）、なければ空文字列
 * @param {string} costDisplay - セッションコストの表示文字列（例：「$0.05」）、なければ空文字列
 * @param {StatuslineConfig} config - ステータスライン設定（showSessionId フラグ）
 * @returns {string} フォーマット済みの第1行（ANSI カラー付き）
 *
 * @remarks
 * - モデル名はシアン色で表示
 * - ディレクトリとセッション ID はグレー色で表示
 * - config.session.showSessionId が false の場合、セッション ID は表示されない
 * - config.session.showInFirstLine が true の場合、セッション情報（時間とコスト）は git 情報の後に表示
 * - Git 情報がない場合は 🌿 のセクション全体が表示されない
 *
 * @example
 * const line = buildFirstLine(
 *   "Claude 3.5 Sonnet",
 *   "statusline",
 *   "feature ↑5",
 *   "abc123xyz",
 *   "1m 30s",
 *   "$0.05",
 *   { session: { showSessionId: true, showInFirstLine: true } }
 * );
 */
function buildFirstLine(
	model: string,
	dirName: string,
	gitPart: string,
	sessionId: string,
	sessionTimeDisplay: string,
	costDisplay: string,
	inputTokens: number,
	outputTokens: number,
	compactCount: number,
	config: StatuslineConfig,
): string {
	let result = `${colors.cyan(model)} P: ${colors.gray(dirName)}${gitPart ? ` B: ${gitPart}` : ""}`;

	// Add IO info (input/output tokens and compact count)
	if (config.tokens.showInputOutput || config.tokens.showCompactCount) {
		const ioParts: string[] = [];

		if (config.tokens.showInputOutput) {
			const inStr = (inputTokens / 1000).toFixed(1);
			const outStr = (outputTokens / 1000).toFixed(1);
			ioParts.push(`${colors.gray("I:")}${colors.white(inStr)}${colors.gray("K")} ${colors.gray("O:")}${colors.white(outStr)}${colors.gray("K")}`);
		}

		if (config.tokens.showCompactCount) {
			ioParts.push(`${colors.gray("C:")}${colors.white(compactCount.toString())}`);
		}

		if (ioParts.length > 0) {
			result += ` ${colors.gray("IO:")} ${ioParts.join(" ")}`;
		}
	}

	// Add session info (time and cost) if configured to show in first line
	if (config.session.showInFirstLine && sessionTimeDisplay) {
		result += ` ${colors.gray("S:")} ${colors.white(sessionTimeDisplay)} ${costDisplay}`;
	}

	if (config.session.showSessionId) {
		result += ` ${colors.gray(sessionId)}`;
	}
	return result;
}

/**
 * ステータスラインのメトリクス行を構築（ストラテジーパターン実装）
 * トークン、コスト、レート制限などのメトリクスを構築します。
 * 実際の構築は MetricsLineBuilder（ストラテジーパターン）に委譲します。
 *
 * @async
 * @param {StatuslineConfig} config - ステータスライン設定（どのメトリクスを表示するか）
 * @param {number} contextTokens - 使用済みコンテキストトークン数
 * @param {number} contextPercentage - コンテキストウィンドウ使用率（0-100）
 * @param {UsageLimits|null} usageLimits - API レート制限情報（オプション）
 * @param {number} todayCost - 本日のコスト合計（USD）
 * @param {string} sessionTimeDisplay - セッション経過時間（フォーマット済み HH:MM:SS）
 * @param {string} costDisplay - セッションコスト（フォーマット済み "$X.XX"）
 * @param {HookInput} data - ホック入力（contextWindowSize など）
 * @returns {Promise<string>} フォーマット済みのメトリクス行（ANSI カラー付き）
 *
 * @remarks
 * - MetricsLineBuilder は依存性注入パターンで提供
 * - 複数のメトリクスビルダーが存在し、builder.build() が適切なものを選択
 * - 設定に応じて表示するメトリクスを動的に選択
 * - メトリクスの順序：S（セッション） T（トークン） L（レート） D（日次） W（週間）
 *
 * @example
 * const metricsLine = await buildMetricsLine(
 *   config,
 *   15000,  // tokens
 *   75,     // percentage
 *   usageLimits,
 *   0.05,   // today's cost
 *   "1:23:45",  // session time
 *   "$0.02",    // session cost
 *   data
 * );
 */
async function buildMetricsLine(
	config: StatuslineConfig,
	contextTokens: number,
	contextPercentage: number,
	usageLimits: UsageLimits | null,
	todayCost: number,
	sessionTimeDisplay: string,
	costDisplay: string,
	inputTokens: number,
	outputTokens: number,
	compactCount: number,
	data: HookInput,
): Promise<string> {
	// Prepare data for metrics builders
	const metricsData: MetricsData = {
		usageLimits,
		todayCost,
		contextTokens,
		contextPercentage,
		contextWindowSize: data.context_window?.context_window_size || 200000,
		sessionTimeDisplay,
		costDisplay,
		inputTokens,
		outputTokens,
		compactCount,
	};

	// Use strategy pattern builder to construct metrics line
	const builder = getMetricsLineBuilder();
	return builder.build(config, metricsData);
}

/**
 * 完全なステータスラインを構築
 * HookInput から全メタデータを抽出し、複数行のステータスラインを生成します。
 * 第1行：モデル・ディレクトリ・Git、メトリクス行：トークン・コスト・レート制限
 *
 * @async
 * @param {HookInput} data - CLI から提供されるホック入力データ
 * @returns {Promise<string>} 完全なステータスライン文字列（複数行、ANSI カラー付き）
 *
 * @remarks
 * 処理フロー：
 * 1. 設定をロード（キャッシュから）
 * 2. モデル名とディレクトリ名を抽出
 * 3. 以下を並列実行：
 *    - Git ステータス取得
 *    - コンテキストトークン計算
 *    - キャッシュされたレート制限取得
 *    - 本日のコスト取得
 * 4. Git パートをフォーマット（config に従って）
 * 5. コスト・期間をフォーマット
 * 6. セッション経過時間取得（利用可能な場合）
 * 7. 第1行とメトリクス行を構築
 * 8. 複数行を結合して返却
 *
 * @example
 * const statusline = await buildStatusline(hookInput);
 * // returns:
 * // Claude 3.5 Sonnet 📁 statusline 🌿 feature ↑5 +3 -1 abc123xyz
 * // S 1:23:45  T 75% (75K/100K) [████░░░░░░]  L 45%  D $0.05  W 60%
 */
async function buildStatusline(data: HookInput): Promise<string> {
	// Phase 4.3: Load configuration (with caching)
	const config = await loadConfigCached();

	const model = data.model?.display_name || "Unknown";
	const currentDir = data.workspace?.current_dir || data.cwd || ".";
	const dirName = currentDir.split("/").pop() || currentDir;

	// Phase 1.1: Parallel execution of independent async operations
	const [gitStatus, contextInfo, usageLimits, todayCost] = await Promise.all([
		getGitStatus(currentDir, config),
		getContextTokens(data),
		getCachedUsageLimits(),
		getTodayCost(),
	]);

	const { tokens: contextTokens, percentage, inputTokens, outputTokens } = contextInfo;

	// Build git part with config
	let gitPart = "";
	if (config.git.showBranch && gitStatus.branch) {
		gitPart = colors.gray(gitStatus.branch);

		if (gitStatus.hasChanges) {
			const changes: string[] = [];

			if (config.git.showAheadBehind && gitStatus.aheadBehind) {
				changes.push(gitStatus.aheadBehind);
			}

			if (config.git.showDiffStats && gitStatus.diffStats) {
				changes.push(gitStatus.diffStats);
			}

			if (changes.length > 0) {
				gitPart += " " + changes.join(" ");
			}
		}
	}

	// Get cost and duration
	const costNum =
		data.cost.total_cost_usd >= 1
			? data.cost.total_cost_usd.toFixed(2)
			: data.cost.total_cost_usd >= 0.01
				? data.cost.total_cost_usd.toFixed(2)
				: data.cost.total_cost_usd.toFixed(3);
	const costDisplay = `${colors.gray("$")}${colors.white(costNum)}`;
	const durationDisplay = formatElapsedTime(data.cost.total_duration_ms);

	// Get session time if available
	let sessionTimeDisplay = "";
	if (data.session_id && data.transcript_path) {
		sessionTimeDisplay = await getSessionElapsedTime(data.transcript_path);
	}

	// Get compact count
	const compactCount = data.session_id ? getCompactCount(data.session_id) : 0;

	debug(`usageLimits: ${JSON.stringify(usageLimits)}`, "basic");

	// Build status lines
	const firstLine = buildFirstLine(
		model,
		dirName,
		gitPart,
		data.session_id,
		sessionTimeDisplay,
		costDisplay,
		inputTokens,
		outputTokens,
		compactCount,
		config,
	);
	const metricsLine = await buildMetricsLine(
		config,
		contextTokens,
		percentage,
		usageLimits,
		todayCost,
		sessionTimeDisplay,
		costDisplay,
		inputTokens,
		outputTokens,
		compactCount,
		data,
	);

	return metricsLine ? `${firstLine}\n${metricsLine}` : firstLine;
}

// ============================================================================
// Main Entry Point
// ============================================================================

/**
 * メインエントリーポイント
 * 標準入力から HookInput JSON を読み込み、ステータスラインを構築・出力します。
 * 実装がクラッシュした場合は最小限のフォールバック出力を行います。
 *
 * @async
 * @returns {Promise<void>}
 *
 * 処理フロー：
 * 1. stdin から JSON データを読み込み
 * 2. セッションコストがある場合は保存（キャッシュ用）
 * 3. buildStatusline() でステータスラインを構築
 * 4. 結果を stdout に出力
 * 5. エラー発生時は "[Claude Code]" のみ出力（fail-safe）
 *
 * @remarks
 * - stdin 読み込みは Bun.stdin.json() で行う
 * - 非同期処理なので await が必要
 * - エラーハンドリング：標準出力に最小限のフォールバック
 * - セッション保存：session_id と total_cost_usd が必須
 *
 * @example
 * // CLI から呼び出し：
 * // echo '{"model":{"display_name":"Claude"},...}' | ./statusline.ts
 */
async function main() {
	try {
		const data: HookInput = await Bun.stdin.json();

		// Save session cost if available (Phase 3)
		if (data.session_id && data.cost.total_cost_usd > 0) {
			await saveSessionCost(data.session_id, data.cost.total_cost_usd);
		}

		const statusLine = await buildStatusline(data);
		console.log(statusLine);
	} catch (error) {
		// Fallback on error
		console.log("[Claude Code]");
	}
}

await main();
