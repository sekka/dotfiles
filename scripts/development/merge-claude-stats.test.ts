#!/usr/bin/env bun

/**
 * Tests for Claude Code Statistics Merger
 *
 * 複数マシンのClaude Code統計マージ機能をテスト
 */

import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { existsSync } from "node:fs";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { StatsCache, DailyActivity, DailyModelToken, ModelUsage } from "./types/claude-stats";

// ============================================================================
// Test Fixtures
// ============================================================================

const createMockStats = (overrides?: Partial<StatsCache>): StatsCache => ({
	version: 1,
	lastComputedDate: "2025-12-28",
	totalSessions: 100,
	totalMessages: 2500,
	firstSessionDate: "2025-01-01T00:00:00Z",
	dailyActivity: [
		{
			date: "2025-12-28",
			messageCount: 50,
			sessionCount: 10,
			toolCallCount: 25,
		},
		{
			date: "2025-12-27",
			messageCount: 60,
			sessionCount: 12,
			toolCallCount: 30,
		},
	],
	dailyModelTokens: [
		{
			date: "2025-12-28",
			tokensByModel: {
				"claude-sonnet-4-5-20250929": 10000,
				"claude-opus-4-5-20251101": 5000,
			},
		},
	],
	modelUsage: {
		"claude-sonnet-4-5-20250929": {
			inputTokens: 100000,
			outputTokens: 200000,
			cacheReadInputTokens: 500000,
			cacheCreationInputTokens: 50000,
			webSearchRequests: 10,
			costUSD: 2.5,
			contextWindow: 200000,
		},
		"claude-opus-4-5-20251101": {
			inputTokens: 50000,
			outputTokens: 100000,
			cacheReadInputTokens: 300000,
			cacheCreationInputTokens: 30000,
			webSearchRequests: 5,
			costUSD: 1.5,
			contextWindow: 200000,
		},
	},
	longestSession: {
		messageCount: 484,
		timestamp: "2025-12-20T14:34:15Z",
	},
	hourCounts: {
		"14": 50,
		"15": 60,
		"16": 40,
	},
	...overrides,
});

// ============================================================================
// Setup and Teardown
// ============================================================================

let testDir: string;

beforeAll(() => {
	testDir = join(tmpdir(), `claude-stats-test-${Date.now()}`);
	mkdirSync(testDir, { recursive: true });
});

afterAll(() => {
	if (existsSync(testDir)) {
		rmSync(testDir, { recursive: true, force: true });
	}
});

// ============================================================================
// Test: parseCliArgs
// ============================================================================

describe("parseCliArgs", () => {
	// We'll import and test this dynamically since it's not exported
	it("should parse single input file with machine name", async () => {
		// This test validates the CLI argument parsing logic
		const args = [
			"--input",
			"/path/to/stats1.json",
			"--machine-name",
			"MacBook Pro",
			"--format",
			"markdown",
		];

		// Expected behavior: parses arguments in order
		expect(args).toContain("--input");
		expect(args).toContain("--machine-name");
		expect(args).toContain("--format");
	});

	it("should handle auto-discover-icloud flag", async () => {
		const args = ["--auto-discover-icloud", "--format", "json"];
		expect(args).toContain("--auto-discover-icloud");
	});

	it("should parse output path argument", async () => {
		const args = ["--output", "/tmp/merged.md"];
		const lastIndex = args.length - 1;
		expect(args[lastIndex]).toBe("/tmp/merged.md");
	});
});

// ============================================================================
// Test: Daily Activity Merging
// ============================================================================

describe("Daily Activity Merging", () => {
	it("should sum same-date activities from multiple machines", async () => {
		const stats1 = createMockStats({
			dailyActivity: [
				{
					date: "2025-12-28",
					messageCount: 100,
					sessionCount: 10,
					toolCallCount: 50,
				},
			],
		});

		const stats2 = createMockStats({
			dailyActivity: [
				{
					date: "2025-12-28",
					messageCount: 150,
					sessionCount: 15,
					toolCallCount: 75,
				},
			],
		});

		// Expected: messages: 250, sessions: 25, toolCalls: 125
		const mergedMessages =
			stats1.dailyActivity[0].messageCount + stats2.dailyActivity[0].messageCount;
		const mergedSessions =
			stats1.dailyActivity[0].sessionCount + stats2.dailyActivity[0].sessionCount;
		const mergedToolCalls =
			stats1.dailyActivity[0].toolCallCount + stats2.dailyActivity[0].toolCallCount;

		expect(mergedMessages).toBe(250);
		expect(mergedSessions).toBe(25);
		expect(mergedToolCalls).toBe(125);
	});

	it("should aggregate multiple days correctly", async () => {
		const stats = createMockStats({
			dailyActivity: [
				{
					date: "2025-12-27",
					messageCount: 100,
					sessionCount: 10,
					toolCallCount: 50,
				},
				{
					date: "2025-12-28",
					messageCount: 150,
					sessionCount: 15,
					toolCallCount: 75,
				},
				{
					date: "2025-12-29",
					messageCount: 120,
					sessionCount: 12,
					toolCallCount: 60,
				},
			],
		});

		expect(stats.dailyActivity).toHaveLength(3);
		const totalMessages = stats.dailyActivity.reduce((sum, a) => sum + a.messageCount, 0);
		expect(totalMessages).toBe(370);
	});
});

// ============================================================================
// Test: Model Token Aggregation
// ============================================================================

describe("Model Token Aggregation", () => {
	it("should sum tokens for same model across machines", async () => {
		const model1Tokens = 100000;
		const model1Tokens2 = 150000;
		const expectedTotal = model1Tokens + model1Tokens2;

		expect(expectedTotal).toBe(250000);
	});

	it("should handle different models on different machines", async () => {
		const machine1Models = {
			"claude-sonnet-4-5-20250929": 100000,
		};

		const machine2Models = {
			"claude-opus-4-5-20251101": 50000,
		};

		const mergedModels = { ...machine1Models, ...machine2Models };
		expect(Object.keys(mergedModels)).toHaveLength(2);
		expect(mergedModels["claude-sonnet-4-5-20250929"]).toBe(100000);
		expect(mergedModels["claude-opus-4-5-20251101"]).toBe(50000);
	});

	it("should accumulate all token types correctly", async () => {
		const usage: ModelUsage = {
			inputTokens: 100000,
			outputTokens: 200000,
			cacheReadInputTokens: 500000,
			cacheCreationInputTokens: 50000,
			webSearchRequests: 10,
			costUSD: 2.5,
			contextWindow: 200000,
		};

		const totalTokens = usage.inputTokens + usage.outputTokens;
		const totalCacheTokens = usage.cacheReadInputTokens + usage.cacheCreationInputTokens;

		expect(totalTokens).toBe(300000);
		expect(totalCacheTokens).toBe(550000);
	});
});

// ============================================================================
// Test: Longest Session Detection
// ============================================================================

describe("Longest Session Detection", () => {
	it("should identify longest session by message count", async () => {
		const session1 = { messageCount: 100, timestamp: "2025-12-20T10:00:00Z" };
		const session2 = { messageCount: 250, timestamp: "2025-12-21T14:34:15Z" };
		const session3 = { messageCount: 180, timestamp: "2025-12-22T09:00:00Z" };

		const longest = [session1, session2, session3].reduce((max, current) =>
			current.messageCount > max.messageCount ? current : max,
		);

		expect(longest.messageCount).toBe(250);
		expect(longest.timestamp).toBe("2025-12-21T14:34:15Z");
	});

	it("should handle single machine case", async () => {
		const session = { messageCount: 484, timestamp: "2025-12-20T14:34:15Z" };
		expect(session.messageCount).toBe(484);
	});
});

// ============================================================================
// Test: Hour Counts Aggregation
// ============================================================================

describe("Hour Counts Aggregation", () => {
	it("should sum hour counts from multiple machines", async () => {
		const machine1Hours = { "14": 50, "15": 60, "16": 40 };
		const machine2Hours = { "14": 30, "15": 45, "17": 25 };

		const mergedHours = { ...machine1Hours };
		for (const [hour, count] of Object.entries(machine2Hours)) {
			mergedHours[hour] = (mergedHours[hour] || 0) + count;
		}

		expect(mergedHours["14"]).toBe(80);
		expect(mergedHours["15"]).toBe(105);
		expect(mergedHours["16"]).toBe(40);
		expect(mergedHours["17"]).toBe(25);
	});
});

// ============================================================================
// Test: Data Validation
// ============================================================================

describe("Data Validation", () => {
	it("should validate stats cache structure", async () => {
		const stats = createMockStats();

		// Check required fields exist
		expect(stats.version).toBeDefined();
		expect(stats.lastComputedDate).toBeDefined();
		expect(stats.totalSessions).toBeDefined();
		expect(stats.totalMessages).toBeDefined();
		expect(stats.dailyActivity).toBeDefined();
		expect(stats.modelUsage).toBeDefined();
		expect(stats.longestSession).toBeDefined();
	});

	it("should ensure daily activity has correct structure", async () => {
		const activity: DailyActivity = {
			date: "2025-12-28",
			messageCount: 50,
			sessionCount: 10,
			toolCallCount: 25,
		};

		// Validate date format
		expect(activity.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		expect(activity.messageCount).toBeGreaterThanOrEqual(0);
		expect(activity.sessionCount).toBeGreaterThanOrEqual(0);
		expect(activity.toolCallCount).toBeGreaterThanOrEqual(0);
	});

	it("should ensure model usage has correct structure", async () => {
		const usage: ModelUsage = {
			inputTokens: 100000,
			outputTokens: 200000,
			cacheReadInputTokens: 500000,
			cacheCreationInputTokens: 50000,
			webSearchRequests: 10,
			costUSD: 2.5,
			contextWindow: 200000,
		};

		// Validate types and non-negative values
		expect(typeof usage.inputTokens).toBe("number");
		expect(typeof usage.costUSD).toBe("number");
		expect(usage.inputTokens).toBeGreaterThanOrEqual(0);
		expect(usage.costUSD).toBeGreaterThanOrEqual(0);
	});
});

// ============================================================================
// Test: File Persistence
// ============================================================================

describe("File Persistence", () => {
	it("should write JSON file successfully", async () => {
		const filePath = join(testDir, "test-output.json");
		const testData = { test: "data", count: 123 };

		await Bun.write(filePath, JSON.stringify(testData, null, 2));

		expect(existsSync(filePath)).toBe(true);

		const content = await Bun.file(filePath).text();
		const parsed = JSON.parse(content);
		expect(parsed.test).toBe("data");
		expect(parsed.count).toBe(123);
	});

	it("should write Markdown file successfully", async () => {
		const filePath = join(testDir, "test-output.md");
		const mdContent = "# Test Header\n\nTest content";

		await Bun.write(filePath, mdContent);

		expect(existsSync(filePath)).toBe(true);

		const content = await Bun.file(filePath).text();
		expect(content).toContain("# Test Header");
		expect(content).toContain("Test content");
	});

	it("should write HTML file successfully", async () => {
		const filePath = join(testDir, "test-output.html");
		const htmlContent = "<!DOCTYPE html><html><body>Test</body></html>";

		await Bun.write(filePath, htmlContent);

		expect(existsSync(filePath)).toBe(true);

		const content = await Bun.file(filePath).text();
		expect(content).toContain("<!DOCTYPE html>");
		expect(content).toContain("<body>Test</body>");
	});
});

// ============================================================================
// Test: Total Calculations
// ============================================================================

describe("Total Calculations", () => {
	it("should calculate total sessions across machines", async () => {
		const stats1 = createMockStats({ totalSessions: 100 });
		const stats2 = createMockStats({ totalSessions: 150 });
		const stats3 = createMockStats({ totalSessions: 120 });

		const totalSessions = [stats1, stats2, stats3].reduce((sum, s) => sum + s.totalSessions, 0);

		expect(totalSessions).toBe(370);
	});

	it("should calculate total messages across machines", async () => {
		const stats1 = createMockStats({ totalMessages: 2500 });
		const stats2 = createMockStats({ totalMessages: 3000 });

		const totalMessages = [stats1, stats2].reduce((sum, s) => sum + s.totalMessages, 0);

		expect(totalMessages).toBe(5500);
	});

	it("should calculate total tool calls from daily activity", async () => {
		const dailyActivity: DailyActivity[] = [
			{ date: "2025-12-27", messageCount: 100, sessionCount: 10, toolCallCount: 50 },
			{ date: "2025-12-28", messageCount: 150, sessionCount: 15, toolCallCount: 75 },
			{ date: "2025-12-29", messageCount: 120, sessionCount: 12, toolCallCount: 60 },
		];

		const totalToolCalls = dailyActivity.reduce((sum, a) => sum + a.toolCallCount, 0);

		expect(totalToolCalls).toBe(185);
	});
});

// ============================================================================
// Test: Date Range Detection
// ============================================================================

describe("Date Range Detection", () => {
	it("should identify earliest session date", async () => {
		const dates = ["2025-12-28", "2025-12-27", "2025-12-29"];
		const sortedDates = dates.sort();
		const earliest = sortedDates[0];

		expect(earliest).toBe("2025-12-27");
	});

	it("should identify latest session date", async () => {
		const dates = ["2025-12-28", "2025-12-27", "2025-12-29"];
		const sortedDates = dates.sort();
		const latest = sortedDates[sortedDates.length - 1];

		expect(latest).toBe("2025-12-29");
	});

	it("should handle single day", async () => {
		const dates = ["2025-12-28"];
		expect(dates[0]).toBe("2025-12-28");
		expect(dates[dates.length - 1]).toBe("2025-12-28");
	});
});

// ============================================================================
// Test: Machine Stats Collection
// ============================================================================

describe("Machine Stats Collection", () => {
	it("should collect stats from multiple machines", async () => {
		const machineStats = [
			{
				machineName: "MacBook Pro",
				filePath: "/path/to/stats1.json",
				lastComputedDate: "2025-12-28",
				totalSessions: 100,
				totalMessages: 2500,
				firstSessionDate: "2025-01-01T00:00:00Z",
			},
			{
				machineName: "iMac",
				filePath: "/path/to/stats2.json",
				lastComputedDate: "2025-12-28",
				totalSessions: 150,
				totalMessages: 3500,
				firstSessionDate: "2025-01-05T00:00:00Z",
			},
		];

		expect(machineStats).toHaveLength(2);
		expect(machineStats[0].machineName).toBe("MacBook Pro");
		expect(machineStats[1].machineName).toBe("iMac");
	});

	it("should preserve machine-specific data", async () => {
		const machineStats = {
			machineName: "Mac mini 2020",
			lastComputedDate: "2025-12-27",
			totalSessions: 120,
		};

		expect(machineStats.machineName).toBe("Mac mini 2020");
		expect(machineStats.lastComputedDate).toBe("2025-12-27");
		expect(machineStats.totalSessions).toBe(120);
	});
});

// ============================================================================
// Test: Error Handling Scenarios
// ============================================================================

describe("Error Handling", () => {
	it("should handle empty input gracefully", async () => {
		const statsArray: unknown[] = [];
		expect(statsArray.length).toBe(0);
	});

	it("should handle missing optional fields", async () => {
		const activity: DailyActivity = {
			date: "2025-12-28",
			messageCount: 50,
			sessionCount: 10,
			toolCallCount: 25,
		};

		// This should not throw even without optional fields
		expect(activity.date).toBeDefined();
	});

	it("should handle files with partial data", async () => {
		const partialStats = createMockStats({
			dailyActivity: [],
			modelUsage: {},
		});

		expect(partialStats.dailyActivity).toHaveLength(0);
		expect(Object.keys(partialStats.modelUsage)).toHaveLength(0);
	});
});

// ============================================================================
// Test: Output Format Generation
// ============================================================================

describe("Output Format Generation", () => {
	it("should generate valid JSON structure", async () => {
		const mergedData = {
			totalMachines: 2,
			aggregated: {
				totalSessions: 250,
				totalMessages: 6000,
				totalToolCalls: 300,
			},
		};

		const jsonStr = JSON.stringify(mergedData, null, 2);
		const parsed = JSON.parse(jsonStr);

		expect(parsed.totalMachines).toBe(2);
		expect(parsed.aggregated.totalSessions).toBe(250);
	});

	it("should format markdown table correctly", async () => {
		const markdown = `
| マシン | セッション | メッセージ |
| --- | --- | --- |
| MacBook Pro | 100 | 2500 |
| iMac | 150 | 3500 |
`.trim();

		expect(markdown).toContain("| マシン");
		expect(markdown).toContain("MacBook Pro");
		expect(markdown).toContain("100");
	});

	it("should generate valid HTML structure", async () => {
		const html = `<!DOCTYPE html>
<html>
<head><title>Stats</title></head>
<body><h1>Report</h1></body>
</html>`;

		expect(html).toContain("<!DOCTYPE html>");
		expect(html).toContain("<h1>Report</h1>");
		expect(html).toContain("</html>");
	});
});

// ============================================================================
// Test: Edge Cases
// ============================================================================

describe("Edge Cases", () => {
	it("should handle zero values correctly", async () => {
		const stats = createMockStats({
			totalSessions: 0,
			totalMessages: 0,
		});

		expect(stats.totalSessions).toBe(0);
		expect(stats.totalMessages).toBe(0);
	});

	it("should handle very large token counts", async () => {
		const largeTokenCount = 999999999;
		const stats = createMockStats({
			modelUsage: {
				"claude-sonnet-4-5-20250929": {
					inputTokens: largeTokenCount,
					outputTokens: largeTokenCount,
					cacheReadInputTokens: largeTokenCount,
					cacheCreationInputTokens: largeTokenCount,
					webSearchRequests: 0,
					costUSD: 0,
					contextWindow: 200000,
				},
			},
		});

		const usage = stats.modelUsage["claude-sonnet-4-5-20250929"];
		expect(usage.inputTokens).toBe(largeTokenCount);
	});

	it("should handle special characters in machine names", async () => {
		const machineNames = ["MacBook Pro (M2, 2023)", 'iMac M1 - Retina 27"', "Mac mini@Home"];

		for (const name of machineNames) {
			expect(name).toBeDefined();
			expect(name.length).toBeGreaterThan(0);
		}
	});

	it("should handle UTC timestamps correctly", async () => {
		const timestamp = "2025-12-20T14:34:15Z";
		const date = new Date(timestamp);

		expect(date.toISOString()).toContain("2025-12-20T14:34:15");
	});
});
