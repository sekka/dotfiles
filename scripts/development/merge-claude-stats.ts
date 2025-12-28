#!/usr/bin/env bun

/**
 * Claude Code Statistics Merger
 *
 * 複数マシンのClaude Code統計をマージして統合レポートを生成
 * iCloud Drive内のファイルを自動検出し、ワンコマンドで統計をマージ可能
 *
 * 使用方法:
 *   # iCloud内の全統計を自動マージ
 *   bun ~/dotfiles/scripts/development/merge-claude-stats.ts --auto-discover-icloud
 *
 *   # 複数ファイルを手動指定
 *   bun ~/dotfiles/scripts/development/merge-claude-stats.ts \
 *     --input ~/stats1.json \
 *     --input ~/stats2.json \
 *     --machine-name "MacBook" \
 *     --machine-name "iMac"
 *
 * mise統合:
 *   mise run llm-claude-merge-stats-icloud
 *   mise run ccmi
 */

import { existsSync } from "node:fs";
import { readdir as readdirAsync } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import {
	type CliArgs,
	type DailyActivity,
	type DailyModelToken,
	type LongestSession,
	type MachineStats,
	type MergedStats,
	type ModelUsage,
	type StatsCache,
	StatsCacheSchema,
	MergedStatsSchema,
} from "./types/claude-stats";

// ============================================================================
// Configuration
// ============================================================================

const ICLOUD_STATS_DIR = join(
	homedir(),
	"Library/Mobile Documents/com~apple~CloudDocs/ClaudeCodeStats",
);

// ============================================================================
// Logging Utilities
// ============================================================================

type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

/**
 * デバッグロギング用のユーティリティ
 * 環境変数 DEBUG=1 または --verbose フラグで有効化
 */
class Logger {
	private static verbose = false;

	static setVerbose(enabled: boolean): void {
		Logger.verbose = enabled;
	}

	static isVerbose(): boolean {
		return Logger.verbose || process.env.DEBUG === "1";
	}

	private static getTimestamp(): string {
		return new Date().toISOString();
	}

	private static formatMessage(level: LogLevel, message: string): string {
		const timestamp = Logger.getTimestamp();
		return `[${timestamp}] [${level}] ${message}`;
	}

	static debug(message: string, ...args: unknown[]): void {
		if (Logger.isVerbose()) {
			console.debug(Logger.formatMessage("DEBUG", message), ...args);
		}
	}

	static info(message: string, ...args: unknown[]): void {
		console.log(Logger.formatMessage("INFO", message), ...args);
	}

	static warn(message: string, ...args: unknown[]): void {
		console.warn(Logger.formatMessage("WARN", message), ...args);
	}

	static error(message: string, ...args: unknown[]): void {
		console.error(Logger.formatMessage("ERROR", message), ...args);
	}
}

// ============================================================================
// File Loading Functions
// ============================================================================

/**
 * stats-cache.jsonファイルを読み込み、バリデーション
 */
async function loadStatsCache(filePath: string): Promise<StatsCache | null> {
	Logger.debug(`Loading stats file: ${filePath}`);
	try {
		const file = Bun.file(filePath);

		// ファイル存在確認
		if (!(await file.exists())) {
			Logger.warn(`File not found: ${filePath}`);
			return null;
		}

		Logger.debug(`Reading JSON content from: ${filePath}`);
		// JSON読み込み
		const content = await file.json();

		Logger.debug(`Validating stats data with Zod schema: ${filePath}`);
		// Zodスキーマでバリデーション
		const validated = StatsCacheSchema.parse(content);

		Logger.debug(
			`Successfully loaded stats: ${filePath} (${validated.totalSessions} sessions, ${validated.totalMessages} messages)`,
		);
		return validated;
	} catch (error) {
		Logger.error(`Failed to parse ${filePath}: ${error}`);
		if (error instanceof Error) {
			Logger.error(`Error details: ${error.message}`);
		}
		return null;
	}
}

/**
 * iCloud Drive内のClaude Code統計ファイルを自動検出
 */
async function discoverICloudStats(): Promise<Array<{ path: string; machineName: string }>> {
	if (!existsSync(ICLOUD_STATS_DIR)) {
		console.warn("⚠️  iCloud stats directory not found");
		return [];
	}

	try {
		const files = await readdirAsync(ICLOUD_STATS_DIR);
		const statsFiles = files
			.filter((f) => f.startsWith("stats-") && f.endsWith(".json"))
			.map((f) => ({
				path: join(ICLOUD_STATS_DIR, f),
				machineName: f.replace("stats-", "").replace(".json", ""),
			}));

		return statsFiles;
	} catch (error) {
		console.error("❌ Failed to read iCloud directory");
		return [];
	}
}

// ============================================================================
// Data Merging Functions
// ============================================================================

/**
 * 日次アクティビティをマージ
 */
function mergeDailyActivity(
	statsArray: Array<{ stats: StatsCache; machineName: string; filePath: string }>,
): Map<string, DailyActivity> {
	const dailyActivityMap = new Map<string, DailyActivity>();

	for (const { stats } of statsArray) {
		for (const activity of stats.dailyActivity) {
			const existing = dailyActivityMap.get(activity.date);
			if (existing) {
				existing.messageCount += activity.messageCount;
				existing.sessionCount += activity.sessionCount;
				existing.toolCallCount += activity.toolCallCount;
			} else {
				dailyActivityMap.set(activity.date, { ...activity });
			}
		}
	}

	return dailyActivityMap;
}

/**
 * 日次モデル別トークンをマージ
 */
function mergeDailyModelTokens(
	statsArray: Array<{ stats: StatsCache; machineName: string; filePath: string }>,
): Map<string, DailyModelToken> {
	const dailyModelTokenMap = new Map<string, DailyModelToken>();

	for (const { stats } of statsArray) {
		for (const token of stats.dailyModelTokens) {
			const existing = dailyModelTokenMap.get(token.date);
			if (existing) {
				// 同じモデルのトークンを足す、新しいモデルは追加
				for (const [modelId, count] of Object.entries(token.tokensByModel)) {
					existing.tokensByModel[modelId] = (existing.tokensByModel[modelId] || 0) + count;
				}
			} else {
				dailyModelTokenMap.set(token.date, {
					...token,
					tokensByModel: { ...token.tokensByModel },
				});
			}
		}
	}

	return dailyModelTokenMap;
}

/**
 * モデル別使用量をマージ
 */
function mergeModelUsage(
	statsArray: Array<{ stats: StatsCache; machineName: string; filePath: string }>,
): Map<string, ModelUsage> {
	const modelUsageMap = new Map<string, ModelUsage>();

	for (const { stats } of statsArray) {
		for (const [modelId, usage] of Object.entries(stats.modelUsage)) {
			const existing = modelUsageMap.get(modelId);
			if (existing) {
				existing.inputTokens += usage.inputTokens;
				existing.outputTokens += usage.outputTokens;
				existing.cacheReadInputTokens += usage.cacheReadInputTokens;
				existing.cacheCreationInputTokens += usage.cacheCreationInputTokens;
				existing.webSearchRequests += usage.webSearchRequests;
				existing.costUSD += usage.costUSD;
				// contextWindowは最大値を取る
				existing.contextWindow = Math.max(existing.contextWindow, usage.contextWindow);
			} else {
				modelUsageMap.set(modelId, { ...usage });
			}
		}
	}

	return modelUsageMap;
}

/**
 * 時間別カウントをマージ
 */
function mergeHourCounts(
	statsArray: Array<{ stats: StatsCache; machineName: string; filePath: string }>,
): Map<string, number> {
	const hourCountsMap = new Map<string, number>();

	for (const { stats } of statsArray) {
		for (const [hour, count] of Object.entries(stats.hourCounts)) {
			hourCountsMap.set(hour, (hourCountsMap.get(hour) || 0) + count);
		}
	}

	return hourCountsMap;
}

/**
 * 最長セッションを特定（メッセージ数で比較）
 */
function findLongestSession(
	statsArray: Array<{ stats: StatsCache; machineName: string; filePath: string }>,
): LongestSession {
	let longestSession: LongestSession = statsArray[0].stats.longestSession;
	for (const { stats } of statsArray) {
		if (stats.longestSession.messageCount > longestSession.messageCount) {
			longestSession = stats.longestSession;
		}
	}
	return longestSession;
}

/**
 * 日付範囲を特定
 */
function determineDateRange(dailyActivityMap: Map<string, DailyActivity>): {
	earliestSessionDate: string;
	latestSessionDate: string;
} {
	const allDates = Array.from(dailyActivityMap.keys());
	const earliestSessionDate = allDates.length > 0 ? allDates[0] : new Date().toISOString();
	const latestSessionDate =
		allDates.length > 0 ? allDates[allDates.length - 1] : new Date().toISOString();

	return { earliestSessionDate, latestSessionDate };
}

/**
 * 集計統計を計算
 */
function calculateAggregatedTotals(
	statsArray: Array<{ stats: StatsCache; machineName: string; filePath: string }>,
	dailyActivityMap: Map<string, DailyActivity>,
): {
	totalSessions: number;
	totalMessages: number;
	totalToolCalls: number;
} {
	const totalSessions = statsArray.reduce((sum, { stats }) => sum + stats.totalSessions, 0);
	const totalMessages = statsArray.reduce((sum, { stats }) => sum + stats.totalMessages, 0);
	const totalToolCalls = Array.from(dailyActivityMap.values()).reduce(
		(sum, a) => sum + a.toolCallCount,
		0,
	);

	return { totalSessions, totalMessages, totalToolCalls };
}

/**
 * マシン別統計を構築
 */
function buildMachineStats(
	statsArray: Array<{ stats: StatsCache; machineName: string; filePath: string }>,
): MachineStats[] {
	return statsArray.map(({ stats, machineName, filePath }) => ({
		machineName,
		filePath,
		lastComputedDate: stats.lastComputedDate,
		totalSessions: stats.totalSessions,
		totalMessages: stats.totalMessages,
		firstSessionDate: stats.firstSessionDate,
	}));
}

/**
 * 統計データをマージ（オーケストレーション関数）
 */
function mergeStats(
	statsArray: Array<{ stats: StatsCache; machineName: string; filePath: string }>,
): MergedStats {
	if (statsArray.length === 0) {
		throw new Error("No valid stats files to merge");
	}

	// 各種データをマージ
	const dailyActivityMap = mergeDailyActivity(statsArray);
	const dailyModelTokenMap = mergeDailyModelTokens(statsArray);
	const modelUsageMap = mergeModelUsage(statsArray);
	const hourCountsMap = mergeHourCounts(statsArray);
	const longestSession = findLongestSession(statsArray);
	const { earliestSessionDate, latestSessionDate } = determineDateRange(dailyActivityMap);
	const { totalSessions, totalMessages, totalToolCalls } = calculateAggregatedTotals(
		statsArray,
		dailyActivityMap,
	);
	const machineStats = buildMachineStats(statsArray);

	// 結果を組み立て
	const merged: MergedStats = {
		generatedAt: new Date().toISOString(),
		totalMachines: statsArray.length,
		machineStats,
		aggregated: {
			totalSessions,
			totalMessages,
			totalToolCalls,
			modelUsage: Object.fromEntries(modelUsageMap),
			dailyActivity: Array.from(dailyActivityMap.values()).sort((a, b) =>
				a.date.localeCompare(b.date),
			),
			dailyModelTokens: Array.from(dailyModelTokenMap.values()).sort((a, b) =>
				a.date.localeCompare(b.date),
			),
			longestSession,
			earliestSessionDate,
			latestSessionDate,
			hourCounts: Object.fromEntries(hourCountsMap),
		},
	};

	return merged;
}

// ============================================================================
// Output Formatters
// ============================================================================

/**
 * HTMLエスケープヘルパー関数
 */
function escapeHtml(unsafe: string): string {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

/**
 * JSON形式で出力
 */
async function outputJSON(stats: MergedStats, outputPath: string): Promise<void> {
	const output = JSON.stringify(stats, null, 2);
	await Bun.write(outputPath, output);
	console.log(`✅ JSON output: ${outputPath}`);
}

/**
 * StatsCache形式に変換（ccusage/cc-wrapped互換）
 */
const STATS_CACHE_VERSION = 1;

function convertToStatsCache(merged: MergedStats): StatsCache {
	// 日付フォーマット変換ヘルパー
	const toDateOnly = (dateStr: string): string => {
		return dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
	};

	// ISO日時への変換ヘルパー
	const ensureISODateTime = (dateStr: string): string => {
		return dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00.000Z`;
	};

	// longestSessionのフォールバック
	const longestSession = merged.aggregated.longestSession || {
		sessionId: undefined,
		messageCount: 0,
		duration: 0,
		timestamp: new Date().toISOString(),
	};

	return {
		version: STATS_CACHE_VERSION,
		lastComputedDate: toDateOnly(merged.aggregated.latestSessionDate),
		dailyActivity: merged.aggregated.dailyActivity,
		dailyModelTokens: merged.aggregated.dailyModelTokens,
		modelUsage: merged.aggregated.modelUsage,
		totalSessions: merged.aggregated.totalSessions,
		totalMessages: merged.aggregated.totalMessages,
		longestSession,
		firstSessionDate: ensureISODateTime(merged.aggregated.earliestSessionDate),
		hourCounts: merged.aggregated.hourCounts,
	};
}

/**
 * StatsCache形式で出力（ccusage/cc-wrapped互換）
 */
async function outputStatsCache(stats: MergedStats, outputPath: string): Promise<void> {
	const statsCache = convertToStatsCache(stats);

	// Zodバリデーション
	StatsCacheSchema.parse(statsCache);

	// JSON出力
	const output = JSON.stringify(statsCache, null, 2);

	// アトミックファイル書き込み（一時ファイル→リネーム）
	const tmpPath = `${outputPath}.tmp`;
	await Bun.write(tmpPath, output);

	// 一時ファイルを本来の名前に変更
	const { rename } = await import("node:fs/promises");
	await rename(tmpPath, outputPath);

	console.log(`✅ StatsCache output: ${outputPath}`);
}

/**
 * Markdown形式で出力
 */
async function outputMarkdown(stats: MergedStats, outputPath: string): Promise<void> {
	const lines: string[] = [];

	// ヘッダー
	lines.push("# Claude Code 使用統計サマリー\n");
	lines.push(`生成日時: ${new Date(stats.generatedAt).toLocaleString("ja-JP")}\n`);

	// 全体統計
	lines.push(`## 全体統計（${stats.totalMachines}マシン合計）\n`);
	lines.push(`- **総セッション数**: ${stats.aggregated.totalSessions.toLocaleString()}`);
	lines.push(`- **総メッセージ数**: ${stats.aggregated.totalMessages.toLocaleString()}`);
	lines.push(`- **総ツール呼び出し数**: ${stats.aggregated.totalToolCalls.toLocaleString()}\n`);

	// マシン別内訳
	lines.push("## マシン別内訳\n");
	lines.push("| マシン | セッション | メッセージ | 最終更新日 |");
	lines.push("| --- | --- | --- | --- |");
	for (const machine of stats.machineStats) {
		lines.push(
			`| ${machine.machineName} | ${machine.totalSessions.toLocaleString()} | ${machine.totalMessages.toLocaleString()} | ${machine.lastComputedDate} |`,
		);
	}
	lines.push("");

	// モデル別トークン使用量
	if (Object.keys(stats.aggregated.modelUsage).length > 0) {
		lines.push("## モデル別トークン使用量\n");
		for (const [modelId, usage] of Object.entries(stats.aggregated.modelUsage)) {
			const displayName = formatModelName(modelId);
			lines.push(`### ${displayName}\n`);
			lines.push(`- **Input Tokens**: ${usage.inputTokens.toLocaleString()}`);
			lines.push(`- **Output Tokens**: ${usage.outputTokens.toLocaleString()}`);
			lines.push(`- **Cache Read**: ${usage.cacheReadInputTokens.toLocaleString()}`);
			lines.push(`- **Cache Creation**: ${usage.cacheCreationInputTokens.toLocaleString()}`);
			lines.push("");
		}
	}

	// 期間情報
	lines.push("## 期間情報\n");
	lines.push(`- **初回セッション**: ${formatISODate(stats.aggregated.earliestSessionDate)}`);
	lines.push(`- **最新セッション**: ${formatISODate(stats.aggregated.latestSessionDate)}`);
	lines.push("");

	// 最長セッション
	lines.push("## 最長セッション\n");
	lines.push(
		`- **メッセージ数**: ${stats.aggregated.longestSession.messageCount.toLocaleString()}`,
	);
	if (stats.aggregated.longestSession.timestamp) {
		lines.push(`- **実行日時**: ${formatISODate(stats.aggregated.longestSession.timestamp)}`);
	}
	lines.push("");

	const output = lines.join("\n");
	await Bun.write(outputPath, output);
	console.log(`✅ Markdown output: ${outputPath}`);
}

/**
 * HTML形式で出力
 */
async function outputHTML(stats: MergedStats, outputPath: string): Promise<void> {
	const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Claude Code 使用統計</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
      color: #333;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #242424;
      border-bottom: 3px solid #007AFF;
      padding-bottom: 10px;
    }
    h2 {
      color: #555;
      margin-top: 30px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    .stat-card {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #007AFF;
    }
    .stat-label {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #007AFF;
      margin-top: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #f0f0f0;
      font-weight: 600;
    }
    .timestamp {
      font-size: 12px;
      color: #999;
      margin-top: 20px;
      text-align: right;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Claude Code 使用統計サマリー</h1>
    <p class="timestamp">生成日時: ${new Date(stats.generatedAt).toLocaleString("ja-JP")}</p>

    <h2>全体統計 (${stats.totalMachines}マシン)</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">総セッション数</div>
        <div class="stat-value">${stats.aggregated.totalSessions.toLocaleString()}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">総メッセージ数</div>
        <div class="stat-value">${stats.aggregated.totalMessages.toLocaleString()}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">総ツール呼び出し</div>
        <div class="stat-value">${stats.aggregated.totalToolCalls.toLocaleString()}</div>
      </div>
    </div>

    <h2>マシン別内訳</h2>
    <table>
      <tr>
        <th>マシン</th>
        <th>セッション</th>
        <th>メッセージ</th>
        <th>最終更新</th>
      </tr>
      ${stats.machineStats
				.map(
					(m) => `
      <tr>
        <td>${escapeHtml(m.machineName)}</td>
        <td>${m.totalSessions.toLocaleString()}</td>
        <td>${m.totalMessages.toLocaleString()}</td>
        <td>${escapeHtml(m.lastComputedDate)}</td>
      </tr>
      `,
				)
				.join("")}
    </table>
  </div>
</body>
</html>`;

	await Bun.write(outputPath, html);
	console.log(`✅ HTML output: ${outputPath}`);
}

// ============================================================================
// CLI Argument Parsing
// ============================================================================

/**
 * CLI引数をパース
 */
function parseCliArgs(args: string[]): CliArgs {
	const parsed: CliArgs = {
		format: "markdown",
		inputFiles: [],
		machineNames: [],
	};

	for (let i = 0; i < args.length; i++) {
		switch (args[i]) {
			case "--input":
				if (i + 1 < args.length) {
					parsed.inputFiles?.push(args[++i]);
				}
				break;
			case "--machine-name":
				if (i + 1 < args.length) {
					parsed.machineNames?.push(args[++i]);
				}
				break;
			case "--format":
				if (i + 1 < args.length) {
					const fmt = args[++i];
					if (fmt === "json" || fmt === "markdown" || fmt === "html" || fmt === "stats-cache") {
						parsed.format = fmt as "json" | "markdown" | "html" | "stats-cache";
					}
				}
				break;
			case "--output":
				if (i + 1 < args.length) {
					parsed.outputPath = args[++i];
				}
				break;
			case "--auto-discover-icloud":
				parsed.autoDiscoverICloud = true;
				break;
			case "--verbose":
			case "-v":
				parsed.verbose = true;
				break;
		}
	}

	return parsed;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * モデル名をフォーマット
 */
function formatModelName(modelId: string): string {
	// claude-opus-4-5-20251101 → Claude Opus 4.5
	const parts = modelId.split("-");
	const name = parts[1];
	const version = parts[2];

	return `Claude ${name.charAt(0).toUpperCase() + name.slice(1)} ${version}`;
}

/**
 * ISO日時をローカル形式にフォーマット
 */
function formatISODate(isoString: string): string {
	try {
		return new Date(isoString).toLocaleString("ja-JP");
	} catch {
		return isoString;
	}
}

/**
 * ヘルプを表示
 */
function showHelp(): void {
	console.log(`
Claude Code Statistics Merger

使用方法:
  bun ~/dotfiles/scripts/development/merge-claude-stats.ts [オプション]

オプション:
  --input <path>              入力ファイル（複数指定可能）
  --machine-name <name>       マシン名（--inputと同順序）
  --format <format>           出力形式: json, markdown, html, stats-cache (デフォルト: markdown)
  --output <path>             出力ファイルパス
  --auto-discover-icloud      iCloud Drive内のファイルを自動検出
  --verbose, -v               詳細なデバッグログを出力
  --help                      このヘルプを表示
  -h                          このヘルプを表示

例:
  # iCloud内の全統計を自動マージ
  bun ~/dotfiles/scripts/development/merge-claude-stats.ts --auto-discover-icloud

  # stats-cache形式で出力（ccusage/cc-wrapped用）
  bun ~/dotfiles/scripts/development/merge-claude-stats.ts \\
    --auto-discover-icloud \\
    --format stats-cache

  # 複数ファイルを手動指定
  bun ~/dotfiles/scripts/development/merge-claude-stats.ts \\
    --input ~/stats1.json \\
    --input ~/stats2.json \\
    --machine-name "MacBook" \\
    --machine-name "iMac" \\
    --format markdown \\
    --output merged.md

  # mise経由で実行
  mise run llm-claude-merge-stats-icloud
  mise run ccmi
`);
}

// ============================================================================
// Main Function
// ============================================================================

async function main(): Promise<void> {
	const args = process.argv.slice(2);

	// ヘルプ表示
	if (args.includes("--help") || args.includes("-h")) {
		showHelp();
		return;
	}

	// 引数をパース
	const cliArgs = parseCliArgs(args);

	// デバッグモード設定
	if (cliArgs.verbose) {
		Logger.setVerbose(true);
		Logger.debug("Verbose mode enabled");
		Logger.debug(`CLI Args: ${JSON.stringify(cliArgs, null, 2)}`);
	}

	// ファイルを収集
	let filesToProcess: Array<{ path: string; machineName: string }> = [];

	if (cliArgs.autoDiscoverICloud) {
		console.log("🔍 Discovering stats files in iCloud Drive...");
		Logger.debug(`iCloud Stats Directory: ${ICLOUD_STATS_DIR}`);
		const discovered = await discoverICloudStats();

		if (discovered.length === 0) {
			console.error("❌ No stats files found in iCloud Drive");
			process.exit(1);
		}

		filesToProcess = discovered;
		console.log(`   Found ${discovered.length} file(s)`);
	} else if (cliArgs.inputFiles && cliArgs.inputFiles.length > 0) {
		// 手動指定されたファイル
		filesToProcess = cliArgs.inputFiles.map((path, index) => ({
			path,
			machineName:
				cliArgs.machineNames && cliArgs.machineNames[index]
					? cliArgs.machineNames[index]
					: `Machine${index + 1}`,
		}));
	} else {
		console.error("❌ No input files specified");
		console.error("   Use --input or --auto-discover-icloud");
		showHelp();
		process.exit(1);
	}

	// ファイルを並列読み込み
	console.log("\n📂 Loading files...");
	const statsPromises = filesToProcess.map((file) => loadStatsCache(file.path));
	const statsSettledResults = await Promise.allSettled(statsPromises);

	const statsArray: Array<{
		stats: StatsCache;
		machineName: string;
		filePath: string;
	}> = [];

	for (let index = 0; index < statsSettledResults.length; index++) {
		const result = statsSettledResults[index];
		const file = filesToProcess[index];

		if (result.status === "fulfilled" && result.value !== null) {
			statsArray.push({
				stats: result.value,
				machineName: file.machineName,
				filePath: file.path,
			});
			console.log(`   ✅ ${file.machineName}`);
		} else if (result.status === "rejected") {
			console.warn(`   ⚠️  ${file.machineName}: Failed to load - ${result.reason}`);
		} else {
			console.warn(`   ⚠️  ${file.machineName}: Invalid stats file`);
		}
	}

	if (statsArray.length === 0) {
		console.error("❌ No valid stats files loaded");
		process.exit(1);
	}

	if (statsArray.length < filesToProcess.length) {
		const failedCount = filesToProcess.length - statsArray.length;
		console.warn(
			`\n⚠️  Loaded ${statsArray.length}/${filesToProcess.length} files (${failedCount} failed)`,
		);
	}

	// マージ
	console.log("\n🔄 Merging statistics...");
	let merged: MergedStats;
	try {
		merged = mergeStats(statsArray);
		console.log("   ✅ Merge complete");
	} catch (error) {
		console.error("❌ Merge failed:");
		if (error instanceof Error) {
			console.error(`   ${error.message}`);
		}
		process.exit(1);
	}

	// バリデーション
	try {
		MergedStatsSchema.parse(merged);
	} catch (error) {
		console.error("❌ Validation failed:");
		if (error instanceof Error) {
			console.error(`   ${error.message}`);
		}
		process.exit(1);
	}

	// 出力
	console.log("\n💾 Generating output...");
	const outputPath =
		cliArgs.outputPath ||
		(() => {
			switch (cliArgs.format) {
				case "stats-cache":
					return join(homedir(), ".claude", "stats-cache-merged.json");
				case "json":
					return "./claude-stats-merged.json";
				case "html":
					return "./claude-stats-merged.html";
				default:
					return "./claude-stats-merged.md";
			}
		})();

	try {
		switch (cliArgs.format) {
			case "json":
				await outputJSON(merged, outputPath);
				break;
			case "markdown":
				await outputMarkdown(merged, outputPath);
				break;
			case "html":
				await outputHTML(merged, outputPath);
				break;
			case "stats-cache":
				await outputStatsCache(merged, outputPath);
				break;
		}
		console.log(`\n✨ Successfully completed!`);
	} catch (error) {
		console.error("❌ Output failed:");
		if (error instanceof Error) {
			console.error(`   ${error.message}`);
		}
		process.exit(1);
	}
}

// ============================================================================
// Edge Case Tests
// ============================================================================

/**
 * エッジケーステストスイート
 * stats-cache出力機能の堅牢性を検証
 */
function runEdgeCaseTests(): void {
	console.log("\n🧪 Running edge case tests...\n");
	let passed = 0;
	let failed = 0;

	// Generate a valid UUID for testing
	const generateUUID = () =>
		`${Math.random().toString(16).slice(2, 10)}-${Math.random().toString(16).slice(2, 6)}-${Math.random().toString(16).slice(2, 6)}-${Math.random().toString(16).slice(2, 6)}-${Math.random().toString(16).slice(2, 14)}`;

	// Test 1: Empty dailyActivity
	try {
		const merged: MergedStats = {
			generatedAt: new Date().toISOString(),
			totalMachines: 1,
			machineStats: [
				{
					machineName: "test-machine",
					filePath: "/tmp/test.json",
					lastComputedDate: "2025-12-28",
					totalSessions: 0,
					totalMessages: 0,
					firstSessionDate: "2025-12-28T00:00:00.000Z",
				},
			],
			aggregated: {
				totalSessions: 0,
				totalMessages: 0,
				totalToolCalls: 0,
				modelUsage: {},
				dailyActivity: [],
				dailyModelTokens: [],
				longestSession: {
					sessionId: undefined,
					messageCount: 0,
					duration: 0,
					timestamp: new Date().toISOString(),
				},
				earliestSessionDate: "2025-12-28",
				latestSessionDate: "2025-12-28",
				hourCounts: {},
			},
		};

		const statsCache = convertToStatsCache(merged);
		StatsCacheSchema.parse(statsCache);
		console.log("✅ Test 1: Empty dailyActivity - PASSED");
		passed++;
	} catch (error) {
		console.error(
			`❌ Test 1: Empty dailyActivity - FAILED: ${error instanceof Error ? error.message : String(error)}`,
		);
		failed++;
	}

	// Test 2: Mixed date formats
	try {
		const merged: MergedStats = {
			generatedAt: new Date().toISOString(),
			totalMachines: 1,
			machineStats: [
				{
					machineName: "test-machine",
					filePath: "/tmp/test.json",
					lastComputedDate: "2025-12-28",
					totalSessions: 10,
					totalMessages: 100,
					firstSessionDate: "2025-12-01T00:00:00.000Z",
				},
			],
			aggregated: {
				totalSessions: 10,
				totalMessages: 100,
				totalToolCalls: 50,
				modelUsage: {
					"claude-sonnet-4-5-20250929": {
						inputTokens: 1000,
						outputTokens: 2000,
						cacheReadInputTokens: 3000,
						cacheCreationInputTokens: 500,
						webSearchRequests: 0,
						costUSD: 0,
						contextWindow: 0,
					},
				},
				dailyActivity: [
					{
						date: "2025-12-28",
						messageCount: 100,
						sessionCount: 10,
						toolCallCount: 50,
					},
				],
				dailyModelTokens: [
					{
						date: "2025-12-28",
						tokensByModel: {
							"claude-sonnet-4-5-20250929": 3500,
						},
					},
				],
				longestSession: {
					sessionId: generateUUID(),
					messageCount: 25,
					duration: 3600000,
					timestamp: "2025-12-28T12:00:00.000Z",
				},
				earliestSessionDate: "2025-12-01", // Date format only
				latestSessionDate: "2025-12-28T15:30:00.000Z", // ISO datetime
				hourCounts: {
					"12": 5,
					"13": 3,
					"14": 2,
				},
			},
		};

		const statsCache = convertToStatsCache(merged);
		StatsCacheSchema.parse(statsCache);

		// Verify date transformations
		if (!statsCache.lastComputedDate.includes("T")) {
			console.log("✅ Test 2: Mixed date formats - PASSED");
			passed++;
		} else {
			throw new Error("lastComputedDate should not contain ISO format");
		}
	} catch (error) {
		console.error(
			`❌ Test 2: Mixed date formats - FAILED: ${error instanceof Error ? error.message : String(error)}`,
		);
		failed++;
	}

	// Test 3: Missing longestSession (null)
	try {
		const merged: MergedStats = {
			generatedAt: new Date().toISOString(),
			totalMachines: 1,
			machineStats: [
				{
					machineName: "test-machine",
					filePath: "/tmp/test.json",
					lastComputedDate: "2025-12-28",
					totalSessions: 0,
					totalMessages: 0,
					firstSessionDate: "2025-12-28T00:00:00.000Z",
				},
			],
			aggregated: {
				totalSessions: 0,
				totalMessages: 0,
				totalToolCalls: 0,
				modelUsage: {},
				dailyActivity: [],
				dailyModelTokens: [],
				longestSession: null as any, // Simulating missing data
				earliestSessionDate: "2025-12-28",
				latestSessionDate: "2025-12-28",
				hourCounts: {},
			},
		};

		const statsCache = convertToStatsCache(merged);
		StatsCacheSchema.parse(statsCache);

		// Verify fallback values
		if (
			statsCache.longestSession.messageCount === 0 &&
			statsCache.longestSession.sessionId === undefined
		) {
			console.log("✅ Test 3: Missing longestSession fallback - PASSED");
			passed++;
		} else {
			throw new Error("Fallback values not applied correctly");
		}
	} catch (error) {
		console.error(
			`❌ Test 3: Missing longestSession fallback - FAILED: ${error instanceof Error ? error.message : String(error)}`,
		);
		failed++;
	}

	// Test 4: No model usage data
	try {
		const merged: MergedStats = {
			generatedAt: new Date().toISOString(),
			totalMachines: 1,
			machineStats: [
				{
					machineName: "test-machine",
					filePath: "/tmp/test.json",
					lastComputedDate: "2025-12-28",
					totalSessions: 5,
					totalMessages: 50,
					firstSessionDate: "2025-12-28T00:00:00.000Z",
				},
			],
			aggregated: {
				totalSessions: 5,
				totalMessages: 50,
				totalToolCalls: 25,
				modelUsage: {}, // Empty!
				dailyActivity: [
					{
						date: "2025-12-28",
						messageCount: 50,
						sessionCount: 5,
						toolCallCount: 25,
					},
				],
				dailyModelTokens: [],
				longestSession: {
					sessionId: generateUUID(),
					messageCount: 15,
					duration: 1800000,
					timestamp: new Date().toISOString(),
				},
				earliestSessionDate: "2025-12-28",
				latestSessionDate: "2025-12-28",
				hourCounts: {},
			},
		};

		const statsCache = convertToStatsCache(merged);
		StatsCacheSchema.parse(statsCache);
		console.log("✅ Test 4: No model usage data - PASSED");
		passed++;
	} catch (error) {
		console.error(
			`❌ Test 4: No model usage data - FAILED: ${error instanceof Error ? error.message : String(error)}`,
		);
		failed++;
	}

	// Test 5: Special characters in machine name (for HTML escaping validation)
	try {
		const specialChars = '<script>alert("xss")</script>&"\'';
		const escaped = escapeHtml(specialChars);

		if (escaped.includes("&lt;") && escaped.includes("&gt;") && escaped.includes("&quot;")) {
			console.log("✅ Test 5: HTML escaping - PASSED");
			passed++;
		} else {
			throw new Error("HTML entities not properly escaped");
		}
	} catch (error) {
		console.error(
			`❌ Test 5: HTML escaping - FAILED: ${error instanceof Error ? error.message : String(error)}`,
		);
		failed++;
	}

	// Test 6: Large session count values
	try {
		const merged: MergedStats = {
			generatedAt: new Date().toISOString(),
			totalMachines: 1,
			machineStats: [
				{
					machineName: "test-machine",
					filePath: "/tmp/test.json",
					lastComputedDate: "2025-12-28",
					totalSessions: 10000,
					totalMessages: 500000,
					firstSessionDate: "2025-01-01T00:00:00.000Z",
				},
			],
			aggregated: {
				totalSessions: 10000,
				totalMessages: 500000,
				totalToolCalls: 250000,
				modelUsage: {
					"claude-opus-4-5-20251101": {
						inputTokens: 100000000,
						outputTokens: 200000000,
						cacheReadInputTokens: 1000000000,
						cacheCreationInputTokens: 50000000,
						webSearchRequests: 1000,
						costUSD: 100.5,
						contextWindow: 0,
					},
				},
				dailyActivity: [
					{
						date: "2025-12-28",
						messageCount: 500000,
						sessionCount: 10000,
						toolCallCount: 250000,
					},
				],
				dailyModelTokens: [
					{
						date: "2025-12-28",
						tokensByModel: {
							"claude-opus-4-5-20251101": 1300000000,
						},
					},
				],
				longestSession: {
					sessionId: generateUUID(),
					messageCount: 100000,
					duration: 86400000,
					timestamp: new Date().toISOString(),
				},
				earliestSessionDate: "2025-01-01",
				latestSessionDate: "2025-12-28",
				hourCounts: {
					"0": 100,
					"12": 500,
					"23": 100,
				},
			},
		};

		const statsCache = convertToStatsCache(merged);
		StatsCacheSchema.parse(statsCache);
		console.log("✅ Test 6: Large numeric values - PASSED");
		passed++;
	} catch (error) {
		console.error(
			`❌ Test 6: Large numeric values - FAILED: ${error instanceof Error ? error.message : String(error)}`,
		);
		failed++;
	}

	// Summary
	console.log("\n" + "=".repeat(60));
	console.log(`Test Results: ${passed} passed, ${failed} failed (Total: ${passed + failed})`);
	console.log("=".repeat(60));

	if (failed > 0) {
		process.exit(1);
	}
}

// Entry point
if (import.meta.main) {
	// Check if running in test mode
	const args = Bun.argv;
	if (args.includes("--test-edge-cases")) {
		runEdgeCaseTests();
	} else {
		main().catch(console.error);
	}
}
