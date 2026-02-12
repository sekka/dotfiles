// ============================================================================
// Phase 3-3: Metrics Builder Strategy Pattern
// ============================================================================

import type { StatuslineConfig } from "./config.ts";
import type { UsageLimits } from "./utils.ts";
import { colors } from "./colors.ts";
import { label, LABEL_KEYS, type LabelKey } from "./labels.ts";
import { debug } from "./logging.ts";
import { formatBrailleProgressBar, formatResetTime, formatResetDateOnly } from "./context.ts";
import { getPeriodCost } from "./cache.ts";

/**
 * Strategy パターンの基本インターフェース
 *
 * ステータスライン上に表示するメトリクスを構築するための戦略を定義する。
 * 異なるメトリクスタイプ（Session、Token、Limit、Cost、Weekly）を
 * 同じインターフェースで処理可能にする。
 * これにより、新しいメトリクスタイプの追加時に既存コードを変更する必要がない。
 */
export interface MetricsBuilder {
	/**
	 * メトリクスの内部ID（例: "session", "token", "limit", "daily", "weekly", "weekly_sonnet"）
	 * lineBreakBefore 設定でこのメトリクスの前に改行を挿入する際に使用する
	 * 表示ラベルが変更されても、この内部IDは変更されないため、設定の互換性が保たれる
	 */
	label: LabelKey;

	/**
	 * 現在の設定に基づいて、このメトリクスを表示すべきかどうかを判定する
	 *
	 * @param {StatuslineConfig} config - ステータスライン設定
	 * @returns {boolean} メトリクスを構築すべきであれば true
	 */
	shouldBuild(config: StatuslineConfig): boolean;

	/**
	 * 設定とデータからメトリクス表示文字列を構築する
	 *
	 * @param {StatuslineConfig} config - ステータスライン設定
	 * @param {MetricsData} data - メトリクス構築に必要なデータ
	 * @returns {Promise<string | null>} 構築されたメトリクス文字列。データが不足している場合は null
	 */
	build(config: StatuslineConfig, data: MetricsData): Promise<string | null>;
}

/**
 * メトリクス構築に必要な全データを保有するオブジェクト
 *
 * 各メトリクスビルダーがメトリクスを構築する際に必要な情報を
 * 一つのオブジェクトに集約して渡すことで、引数の変化に強いコードにする。
 */
export interface MetricsData {
	/** API から取得した 5 時間および 7 日間のレート制限情報 */
	usageLimits: UsageLimits | null;
	/** 本日までの累計使用料金（ドル） */
	todayCost: number;
	/** 現在のセッションで使用しているコンテキストトークン数 */
	contextTokens: number;
	/** コンテキスト使用率（パーセンテージ）*/
	contextPercentage: number;
	/** コンテキストウィンドウの合計サイズ（トークン） */
	contextWindowSize: number;
	/** セッション経過時間の表示文字列（例：「2m 30s」） */
	sessionTimeDisplay: string;
	/** 現在のセッションコスト表示文字列（例：「$0.15」） */
	costDisplay: string;
	/** 入力トークン数 */
	inputTokens: number;
	/** 出力トークン数 */
	outputTokens: number;
	/** コンパクト実行回数 */
	compactCount: number;
}

// ============================================================================
// Session Metrics Builder (S)
// ============================================================================

/**
 * セッション時間とコストのメトリクスを構築する
 *
 * ステータスラインの "S: 時間 コスト" セクションを担当する。
 * セッションの経過時間と、セッション中のコストを表示する。
 * `config.session.showElapsedTime` が有効な場合のみ表示される。
 *
 * 出力形式: `S: 2m 30s $0.15`
 */
export class SessionMetricsBuilder implements MetricsBuilder {
	label = LABEL_KEYS.SESSION;

	shouldBuild(config: StatuslineConfig): boolean {
		// S を第1行に表示する場合はメトリクス行に表示しない
		if (config.session.showInFirstLine && config.session.showElapsedTime) {
			return false;
		}
		return config.session.showElapsedTime;
	}

	/**
	 * セッション時間とコストのメトリクス文字列を構築する
	 *
	 * @param {StatuslineConfig} _ - ステータスライン設定（使用しない）
	 * @param {MetricsData} data - メトリクスデータ
	 * @returns {Promise<string | null>} フォーマットされた文字列、またはデータがない場合は null
	 */
	async build(_: StatuslineConfig, data: MetricsData): Promise<string | null> {
		if (!data.sessionTimeDisplay) {
			return null;
		}

		return `${label("SES")}${colors.white(data.sessionTimeDisplay)} ${data.costDisplay}`;
	}
}

// ============================================================================
// Token Metrics Builder (T)
// ============================================================================

/**
 * トークン使用率のメトリクスビルダー
 */
export class TokenMetricsBuilder implements MetricsBuilder {
	label = LABEL_KEYS.TOKEN;

	shouldBuild(config: StatuslineConfig): boolean {
		return config.tokens.showContextUsage;
	}

	async build(_: StatuslineConfig, data: MetricsData): Promise<string | null> {
		const bar = formatBrailleProgressBar(data.contextPercentage, 5);
		const contextTokenStr = (data.contextTokens / 1000).toFixed(1);
		const contextSizeStr = (data.contextWindowSize / 1000).toFixed(1);

		return `${label("TOK")}${bar} ${colors.white(data.contextPercentage.toString())}${colors.gray("%")} ${colors.white(contextTokenStr)}${colors.gray("K")}${colors.gray("/")}${colors.gray(contextSizeStr)}${colors.gray("K")}`;
	}
}

// ============================================================================
// I/O Metrics Builder (IO)
// ============================================================================

/**
 * 入力/出力トークンと圧縮回数のメトリクスビルダー
 *
 * ステータスラインの "IO: I:72.4K O:24.2K C:3" セクションを担当する。
 * 累積入力トークン、累積出力トークン、圧縮実行回数を表示する。
 * 設定により、I/Oのみ、圧縮回数のみ、または両方を表示できる。
 *
 * 出力形式: `IO: I:72.4K O:24.2K C:3`
 */
export class IOMetricsBuilder implements MetricsBuilder {
	label = LABEL_KEYS.IO;

	shouldBuild(config: StatuslineConfig): boolean {
		// IO を第1行に表示する場合はメトリクス行に表示しない
		if (config.session.showInFirstLine && (config.tokens.showInputOutput || config.tokens.showCompactCount)) {
			return false;
		}
		return config.tokens.showInputOutput || config.tokens.showCompactCount;
	}

	async build(config: StatuslineConfig, data: MetricsData): Promise<string | null> {
		const parts: string[] = [];

		if (config.tokens.showInputOutput) {
			const inStr = (data.inputTokens / 1000).toFixed(1);
			const outStr = (data.outputTokens / 1000).toFixed(1);
			parts.push(`${label("IN")}${colors.white(inStr)}${colors.gray("K")} ${label("OUT")}${colors.white(outStr)}${colors.gray("K")}`);
		}

		if (config.tokens.showCompactCount) {
			parts.push(`${label("CMP")}${colors.white(data.compactCount.toString())}`);
		}

		return parts.length > 0 ? parts.join(" ") : null;
	}
}

// ============================================================================
// 5-Hour Rate Limit Builder (L)
// ============================================================================

/**
 * 5時間レート制限のメトリクスビルダー
 */
export class LimitMetricsBuilder implements MetricsBuilder {
	label = LABEL_KEYS.LIMIT;

	shouldBuild(config: StatuslineConfig): boolean {
		return config.rateLimits.showFiveHour;
	}

	async build(config: StatuslineConfig, data: MetricsData): Promise<string | null> {
		if (!data.usageLimits?.five_hour) {
			return null;
		}

		const fiveHour = data.usageLimits.five_hour;
		const bar = formatBrailleProgressBar(fiveHour.utilization, 5);

		// Get period cost with error handling
		let periodCost = 0;
		if (fiveHour.resets_at) {
			try {
				periodCost = await getPeriodCost(fiveHour.resets_at);
			} catch (error) {
				debug(
					`Failed to fetch period cost: ${error instanceof Error ? error.message : String(error)}`,
					"error",
				);
				periodCost = 0; // Default to 0 on error
			}
		}

		// Add cost display if >= $0.01 (respects showPeriodCost config)
		const costDisplayFiveHour =
			config.rateLimits.showPeriodCost && periodCost >= 0.01
				? `${colors.gray("$")}${colors.white(periodCost.toFixed(2))} `
				: "";

		let limitsPart = `${label("LMT")}${costDisplayFiveHour}${bar} ${colors.lightGray(fiveHour.utilization.toString())}${colors.gray("%")}`;

		if (fiveHour.resets_at) {
			const resetDate = formatResetDateOnly(fiveHour.resets_at);
			const timeLeft = formatResetTime(fiveHour.resets_at);
			limitsPart += ` ${colors.gray(`(${resetDate}|${timeLeft})`)}`;
		}

		return limitsPart;
	}
}

// ============================================================================
// Daily Cost Builder (D)
// ============================================================================

/**
 * 日次コストのメトリクスビルダー
 */
export class CostMetricsBuilder implements MetricsBuilder {
	label = LABEL_KEYS.DAILY;

	shouldBuild(config: StatuslineConfig): boolean {
		return config.costs.showDailyCost;
	}

	async build(_: StatuslineConfig, data: MetricsData): Promise<string | null> {
		if (data.todayCost < 0.01) {
			return null;
		}

		return `${label("DAY")}${colors.gray("$")}${colors.white(data.todayCost.toFixed(1))}`;
	}
}

// ============================================================================
// Weekly Rate Limit Builder (W)
// ============================================================================

/**
 * 週間レート制限のメトリクスビルダー
 */
export class WeeklyMetricsBuilder implements MetricsBuilder {
	label = LABEL_KEYS.WEEKLY;

	shouldBuild(config: StatuslineConfig): boolean {
		return config.rateLimits.showWeekly;
	}

	async build(_: StatuslineConfig, data: MetricsData): Promise<string | null> {
		if (!data.usageLimits?.seven_day) {
			return null;
		}

		const sevenDay = data.usageLimits.seven_day;
		const bar = formatBrailleProgressBar(sevenDay.utilization, 5);
		let weeklyPart = `${label("WK")}${bar} ${colors.lightGray(sevenDay.utilization.toString())}${colors.gray("%")}`;

		if (sevenDay.resets_at) {
			const resetDate = formatResetDateOnly(sevenDay.resets_at);
			const timeLeft = formatResetTime(sevenDay.resets_at);
			weeklyPart += ` ${colors.gray(`(${resetDate}|${timeLeft})`)}`;
		}

		return weeklyPart;
	}
}

// ============================================================================
// Sonnet Weekly Rate Limit Builder (WS)
// ============================================================================

/**
 * Sonnet専用の週間レート制限メトリクスビルダー
 * 他のモデル（OpusやHaikuなど）と区別されたSonnetの使用量を表示する
 */
export class SonnetWeeklyMetricsBuilder implements MetricsBuilder {
	label = LABEL_KEYS.WEEKLY_SONNET;

	shouldBuild(config: StatuslineConfig): boolean {
		return config.rateLimits.showSonnetWeekly;
	}

	async build(_: StatuslineConfig, data: MetricsData): Promise<string | null> {
		if (!data.usageLimits?.seven_day_sonnet) {
			return null;
		}

		const sevenDaySonnet = data.usageLimits.seven_day_sonnet;
		const bar = formatBrailleProgressBar(sevenDaySonnet.utilization, 5);
		let sonnetWeeklyPart = `${label("WKS")}${bar} ${colors.lightGray(sevenDaySonnet.utilization.toString())}${colors.gray("%")}`;

		if (sevenDaySonnet.resets_at) {
			const resetDate = formatResetDateOnly(sevenDaySonnet.resets_at);
			const timeLeft = formatResetTime(sevenDaySonnet.resets_at);
			sonnetWeeklyPart += ` ${colors.gray(`(${resetDate}|${timeLeft})`)}`;
		}

		return sonnetWeeklyPart;
	}
}

// ============================================================================
// Metrics Line Builder (Orchestrator)
// ============================================================================

/**
 * メトリクス構築の orchestrator パターン実装
 *
 * Strategy パターンで実装した複数のメトリクスビルダーを
 * 一つにまとめて管理し、ステータスライン全体のメトリクス行を構築する。
 *
 * 動作：
 * 1. 各ビルダーに対して `shouldBuild()` を呼び出し、表示すべきか確認
 * 2. 表示すべきビルダーについて `build()` を呼び出してメトリクスを取得
 * 3. 取得したメトリクスを特定の順序（S → T → L → D → W → WS）で連結
 * 4. 必要に応じてセパレータ（・）を挿入
 *
 * このアーキテクチャにより、新しいメトリクスタイプを追加する際は
 * 新しいビルダークラスを実装するだけで済み、
 * orchestrator 自体の変更は不要になる。
 */
export class MetricsLineBuilder {
	private builders: MetricsBuilder[] = [
		new IOMetricsBuilder(),
		new SessionMetricsBuilder(),
		new TokenMetricsBuilder(),
		new LimitMetricsBuilder(),
		new CostMetricsBuilder(),
		new WeeklyMetricsBuilder(),
		new SonnetWeeklyMetricsBuilder(),
	];

	/**
	 * メトリクスビルダーのセットを置き換える（テスト用）
	 *
	 * テスト時にカスタムビルダーを注入する際に使用。
	 * デフォルトビルダーは復元されないため、必要に応じて手動で復元する。
	 *
	 * @param {MetricsBuilder[]} builders - 置き換え対象のビルダー配列
	 */
	setBuilders(builders: MetricsBuilder[]): void {
		this.builders = builders;
	}

	/**
	 * ステータスライン全体のメトリクス行を構築する
	 *
	 * 有効なメトリクスビルダーから得られたメトリクスを
	 * 指定された順序で連結して、ステータスラインの表示文字列を生成する。
	 *
	 * @param {StatuslineConfig} config - ステータスライン設定
	 * @param {MetricsData} data - メトリクスデータ
	 * @returns {Promise<string>} 組み立てられたメトリクス行文字列
	 *
	 * @example
	 * const builder = new MetricsLineBuilder();
	 * const line = await builder.build(config, metricsData);
	 * // => "S: 2m 30s $0.15 T: ▆ 22% 45K/200K L: ▇ 45% W: ▅ 60%"
	 */
	async build(config: StatuslineConfig, data: MetricsData): Promise<string> {
		const parts: string[] = [];

		// 各戦略でメトリクスを構築
		for (const builder of this.builders) {
			if (builder.shouldBuild(config)) {
				try {
					const part = await builder.build(config, data);
					if (part) {
						// lineBreakBefore 設定に基づいて改行挿入
						if (config.display.lineBreakBefore?.includes(builder.label) && parts.length > 0) {
							parts.push('\n' + part);
						} else {
							parts.push(part);
						}
					}
				} catch (error) {
					debug(
						`Metrics builder error for ${builder.constructor.name}: ${error instanceof Error ? error.message : String(error)}`,
						"error",
					);
					// Continue with next builder instead of failing entirely
				}
			}
		}

		// メトリクス行を組み立て
		if (parts.length === 0) {
			return "";
		}

		// セパレータの挿入処理
		const result: string[] = [];
		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			if (i === 0) {
				result.push(part);
			} else if (part.startsWith('\n')) {
				// 改行で始まる場合はセパレータなし
				result.push(part);
			} else {
				// 通常のセパレータを挿入
				const separator = config.display.showSeparators ? ` ${colors.gray("・")} ` : " ";
				result.push(separator + part);
			}
		}

		return result.join('');
	}
}

/**
 * グローバルに共有される MetricsLineBuilder インスタンス
 *
 * @type {MetricsLineBuilder}
 * @private
 */
let defaultMetricsLineBuilder = new MetricsLineBuilder();

/**
 * 現在の MetricsLineBuilder インスタンスを取得する
 *
 * シングルトンパターンを使用して、アプリケーション全体で
 * 同一の MetricsLineBuilder インスタンスを共有する。
 * テスト時には `setMetricsLineBuilder()` で置き換え可能。
 *
 * @returns {MetricsLineBuilder} 現在のMetricsLineBuilderインスタンス
 *
 * @example
 * const builder = getMetricsLineBuilder();
 * const metricsLine = await builder.build(config, data);
 */
export function getMetricsLineBuilder(): MetricsLineBuilder {
	return defaultMetricsLineBuilder;
}

/**
 * MetricsLineBuilder インスタンスを置き換える（主にテスト用）
 *
 * テスト時にカスタムビルダーを注入する際に使用。
 * 正常系テストではデフォルトビルダーを復元する必要がある。
 *
 * @param {MetricsLineBuilder} builder - 新しいMetricsLineBuilderインスタンス
 *
 * @example
 * const mockBuilder = new MetricsLineBuilder();
 * mockBuilder.setBuilders([new MockBuilder()]);
 * setMetricsLineBuilder(mockBuilder);
 *
 * // テスト実行...
 *
 * // デフォルトに復元
 * setMetricsLineBuilder(new MetricsLineBuilder());
 */
export function setMetricsLineBuilder(builder: MetricsLineBuilder): void {
	defaultMetricsLineBuilder = builder;
}
