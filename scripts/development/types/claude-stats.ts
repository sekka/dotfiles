/**
 * Claude Code Statistics Type Definitions
 *
 * 複数マシンのClaude Code使用統計をマージするための型定義とバリデーションスキーマ
 * stats-cache.jsonの構造を定義し、Zodによるランタイムバリデーションに対応
 */

import { z } from "zod";

// ============================================================================
// TypeScript Type Definitions
// ============================================================================

/**
 * 日次アクティビティ
 */
export interface DailyActivity {
	date: string; // ISO date format: "2025-11-19"
	messageCount: number;
	sessionCount: number;
	toolCallCount: number;
}

/**
 * 日次モデル別トークン使用量
 */
export interface DailyModelToken {
	date: string; // ISO date format: "2025-11-19"
	tokensByModel: Record<string, number>;
}

/**
 * モデル使用統計
 */
export interface ModelUsage {
	inputTokens: number;
	outputTokens: number;
	cacheReadInputTokens: number;
	cacheCreationInputTokens: number;
	webSearchRequests: number;
	costUSD: number;
	contextWindow: number;
}

/**
 * 最長セッション情報
 */
export interface LongestSession {
	sessionId: string;
	messageCount: number;
	duration?: number;
	timestamp?: string;
}

/**
 * Claude Code統計キャッシュ（stats-cache.json）
 */
export interface StatsCache {
	version: number;
	lastComputedDate: string; // ISO date format: "2025-12-27"
	dailyActivity: DailyActivity[];
	dailyModelTokens: DailyModelToken[];
	modelUsage: Record<string, ModelUsage>;
	totalSessions: number;
	totalMessages: number;
	longestSession: LongestSession;
	firstSessionDate: string; // ISO timestamp
	hourCounts: Record<string, number>;
}

/**
 * マシン別統計
 */
export interface MachineStats {
	machineName: string;
	filePath: string;
	lastComputedDate: string;
	totalSessions: number;
	totalMessages: number;
	firstSessionDate: string;
}

/**
 * マージされた統計結果
 */
export interface AggregatedStats {
	totalSessions: number;
	totalMessages: number;
	totalToolCalls: number;
	modelUsage: Record<string, ModelUsage>;
	dailyActivity: DailyActivity[];
	dailyModelTokens: DailyModelToken[];
	longestSession: LongestSession;
	earliestSessionDate: string;
	latestSessionDate: string;
	hourCounts: Record<string, number>;
}

/**
 * マージ結果全体
 */
export interface MergedStats {
	generatedAt: string; // ISO timestamp
	totalMachines: number;
	machineStats: MachineStats[];
	aggregated: AggregatedStats;
}

/**
 * CLI引数解析結果
 */
export interface CliArgs {
	inputFiles?: string[];
	machineNames?: string[];
	format: "json" | "markdown" | "html";
	outputPath?: string;
	autoDiscoverICloud?: boolean;
}

// ============================================================================
// Zod Schema Definitions for Runtime Validation
// ============================================================================

export const DailyActivitySchema = z.object({
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
	messageCount: z.number().int().nonnegative(),
	sessionCount: z.number().int().nonnegative(),
	toolCallCount: z.number().int().nonnegative(),
});

export const DailyModelTokenSchema = z.object({
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
	tokensByModel: z.record(z.string(), z.number().int().nonnegative()),
});

export const ModelUsageSchema = z.object({
	inputTokens: z.number().int().nonnegative(),
	outputTokens: z.number().int().nonnegative(),
	cacheReadInputTokens: z.number().int().nonnegative(),
	cacheCreationInputTokens: z.number().int().nonnegative(),
	webSearchRequests: z.number().int().nonnegative(),
	costUSD: z.number().nonnegative(),
	contextWindow: z.number().int().nonnegative(),
});

export const LongestSessionSchema = z.object({
	sessionId: z.string().uuid().optional(),
	messageCount: z.number().int().nonnegative(),
	duration: z.number().int().nonnegative().optional(),
	timestamp: z.string().datetime().optional(),
});

export const StatsCacheSchema = z.object({
	version: z.number().int(),
	lastComputedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
	dailyActivity: z.array(DailyActivitySchema),
	dailyModelTokens: z.array(DailyModelTokenSchema),
	modelUsage: z.record(z.string(), ModelUsageSchema),
	totalSessions: z.number().int().nonnegative(),
	totalMessages: z.number().int().nonnegative(),
	longestSession: LongestSessionSchema,
	firstSessionDate: z.string().datetime(),
	hourCounts: z.record(z.string(), z.number().int().nonnegative()),
});

export const MachineStatsSchema = z.object({
	machineName: z.string().min(1),
	filePath: z.string().min(1),
	lastComputedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	totalSessions: z.number().int().nonnegative(),
	totalMessages: z.number().int().nonnegative(),
	firstSessionDate: z.string().datetime(),
});

export const AggregatedStatsSchema = z.object({
	totalSessions: z.number().int().nonnegative(),
	totalMessages: z.number().int().nonnegative(),
	totalToolCalls: z.number().int().nonnegative(),
	modelUsage: z.record(z.string(), ModelUsageSchema),
	dailyActivity: z.array(DailyActivitySchema),
	dailyModelTokens: z.array(DailyModelTokenSchema),
	longestSession: LongestSessionSchema,
	earliestSessionDate: z.string(),
	latestSessionDate: z.string(),
	hourCounts: z.record(z.string(), z.number().int().nonnegative()),
});

export const MergedStatsSchema = z.object({
	generatedAt: z.string().datetime(),
	totalMachines: z.number().int().positive(),
	machineStats: z.array(MachineStatsSchema),
	aggregated: AggregatedStatsSchema,
});

export const CliArgsSchema = z.object({
	inputFiles: z.array(z.string()).optional(),
	machineNames: z.array(z.string()).optional(),
	format: z.enum(["json", "markdown", "html"]).default("markdown"),
	outputPath: z.string().optional(),
	autoDiscoverICloud: z.boolean().optional().default(false),
});

// ============================================================================
// Type Exports (Zod infer)
// ============================================================================

export type StatsCacheType = z.infer<typeof StatsCacheSchema>;
export type MergedStatsType = z.infer<typeof MergedStatsSchema>;
export type CliArgsType = z.infer<typeof CliArgsSchema>;
