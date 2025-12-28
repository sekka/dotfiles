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
// File Loading Functions
// ============================================================================

/**
 * stats-cache.jsonファイルを読み込み、バリデーション
 */
async function loadStatsCache(filePath: string): Promise<StatsCache | null> {
	try {
		const file = Bun.file(filePath);

		// ファイル存在確認
		if (!(await file.exists())) {
			console.warn(`⚠️  File not found: ${filePath}`);
			return null;
		}

		// JSON読み込み
		const content = await file.json();

		// Zodスキーマでバリデーション
		const validated = StatsCacheSchema.parse(content);
		return validated;
	} catch (error) {
		console.error(`❌ Failed to parse ${filePath}`);
		if (error instanceof Error) {
			console.error(`   ${error.message}`);
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
 * 複数の統計データをマージ
 */
function mergeStats(
	statsArray: Array<{ stats: StatsCache; machineName: string; filePath: string }>,
): MergedStats {
	if (statsArray.length === 0) {
		throw new Error("No valid stats files to merge");
	}

	// 1. 日次アクティビティを日付でマージ
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

	// 2. 日次モデル別トークンをマージ
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

	// 3. モデル別使用量をマージ
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

	// 4. 時間別カウントをマージ
	const hourCountsMap = new Map<string, number>();

	for (const { stats } of statsArray) {
		for (const [hour, count] of Object.entries(stats.hourCounts)) {
			hourCountsMap.set(hour, (hourCountsMap.get(hour) || 0) + count);
		}
	}

	// 5. 最長セッション（メッセージ数で比較）
	let longestSession: LongestSession = statsArray[0].stats.longestSession;
	for (const { stats } of statsArray) {
		if (stats.longestSession.messageCount > longestSession.messageCount) {
			longestSession = stats.longestSession;
		}
	}

	// 6. 日付範囲を特定
	const allDates = Array.from(dailyActivityMap.keys());
	const earliestSessionDate = allDates.length > 0 ? allDates[0] : new Date().toISOString();
	const latestSessionDate =
		allDates.length > 0 ? allDates[allDates.length - 1] : new Date().toISOString();

	// 7. 集計統計
	const totalSessions = statsArray.reduce((sum, { stats }) => sum + stats.totalSessions, 0);
	const totalMessages = statsArray.reduce((sum, { stats }) => sum + stats.totalMessages, 0);
	const totalToolCalls = Array.from(dailyActivityMap.values()).reduce(
		(sum, a) => sum + a.toolCallCount,
		0,
	);

	// 8. マシン別統計
	const machineStats: MachineStats[] = statsArray.map(({ stats, machineName, filePath }) => ({
		machineName,
		filePath,
		lastComputedDate: stats.lastComputedDate,
		totalSessions: stats.totalSessions,
		totalMessages: stats.totalMessages,
		firstSessionDate: stats.firstSessionDate,
	}));

	// 9. 結果を組み立て
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
 * JSON形式で出力
 */
async function outputJSON(stats: MergedStats, outputPath: string): Promise<void> {
	const output = JSON.stringify(stats, null, 2);
	await Bun.write(outputPath, output);
	console.log(`✅ JSON output: ${outputPath}`);
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
        <td>${m.machineName}</td>
        <td>${m.totalSessions.toLocaleString()}</td>
        <td>${m.totalMessages.toLocaleString()}</td>
        <td>${m.lastComputedDate}</td>
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
					if (fmt === "json" || fmt === "markdown" || fmt === "html") {
						parsed.format = fmt;
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
  --format <format>           出力形式: json, markdown, html (デフォルト: markdown)
  --output <path>             出力ファイルパス
  --auto-discover-icloud      iCloud Drive内のファイルを自動検出
  --help                      このヘルプを表示
  -h                          このヘルプを表示

例:
  # iCloud内の全統計を自動マージ
  bun ~/dotfiles/scripts/development/merge-claude-stats.ts --auto-discover-icloud

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

	// ファイルを収集
	let filesToProcess: Array<{ path: string; machineName: string }> = [];

	if (cliArgs.autoDiscoverICloud) {
		console.log("🔍 Discovering stats files in iCloud Drive...");
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

	// ファイルを読み込み
	console.log("\n📂 Loading files...");
	const statsArray: Array<{
		stats: StatsCache;
		machineName: string;
		filePath: string;
	}> = [];

	for (const file of filesToProcess) {
		const stats = await loadStatsCache(file.path);
		if (stats) {
			statsArray.push({ stats, machineName: file.machineName, filePath: file.path });
			console.log(`   ✅ ${file.machineName}`);
		}
	}

	if (statsArray.length === 0) {
		console.error("❌ No valid stats files loaded");
		process.exit(1);
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
	const outputPath = cliArgs.outputPath || `./claude-stats-merged.${cliArgs.format}`;

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

// Entry point
if (import.meta.main) {
	main().catch(console.error);
}
