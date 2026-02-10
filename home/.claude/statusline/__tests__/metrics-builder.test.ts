#!/usr/bin/env bun

// Phase 4-1: Comprehensive tests for metrics-builder.ts module (Strategy pattern)
import { describe, it, expect } from "bun:test";

import {
	SessionMetricsBuilder,
	TokenMetricsBuilder,
	LimitMetricsBuilder,
	CostMetricsBuilder,
	WeeklyMetricsBuilder,
	MetricsLineBuilder,
	type MetricsData,
	getMetricsLineBuilder,
	setMetricsLineBuilder,
} from "../metrics-builder.ts";
import { DEFAULT_CONFIG, type StatuslineConfig } from "../config.ts";

// ============================================================================
// Test Data Fixtures
// ============================================================================

const mockConfig: StatuslineConfig = DEFAULT_CONFIG;

const mockMetricsData: MetricsData = {
	usageLimits: {
		five_hour: { utilization: 45, resets_at: "2025-12-31T10:00:00Z" },
		seven_day: { utilization: 60, resets_at: "2026-01-06T00:00:00Z" },
	},
	todayCost: 1.25,
	contextTokens: 45000,
	contextPercentage: 22.5,
	contextWindowSize: 200000,
	sessionTimeDisplay: "2m 30s",
	costDisplay: "$0.15",
};

// ============================================================================
// SessionMetricsBuilder Tests
// ============================================================================

describe("SessionMetricsBuilder", () => {
	const builder = new SessionMetricsBuilder();

	it("should not build when showElapsedTime is false", () => {
		const config: StatuslineConfig = {
			...mockConfig,
			session: { ...mockConfig.session, showElapsedTime: false },
		};
		expect(builder.shouldBuild(config)).toBe(false);
	});

	it("should build when showElapsedTime is true", () => {
		const config: StatuslineConfig = {
			...mockConfig,
			session: { ...mockConfig.session, showElapsedTime: true, showInFirstLine: false },
		};
		expect(builder.shouldBuild(config)).toBe(true);
	});

	it("should return null when sessionTimeDisplay is empty", async () => {
		const config: StatuslineConfig = {
			...mockConfig,
			session: { ...mockConfig.session, showElapsedTime: true, showInFirstLine: false },
		};
		const data = { ...mockMetricsData, sessionTimeDisplay: "" };
		const result = await builder.build(config, data);
		expect(result).toBe(null);
	});

	it("should build session metrics with time and cost", async () => {
		const config: StatuslineConfig = {
			...mockConfig,
			session: { ...mockConfig.session, showElapsedTime: true },
		};
		const result = await builder.build(config, mockMetricsData);
		expect(result).toContain("S:");
		expect(result).toContain("2m 30s");
		expect(result).toContain("$0.15");
	});
});

// ============================================================================
// TokenMetricsBuilder Tests
// ============================================================================

describe("TokenMetricsBuilder", () => {
	const builder = new TokenMetricsBuilder();

	it("should not build when showContextUsage is false", () => {
		const config: StatuslineConfig = { ...mockConfig, tokens: { showContextUsage: false } };
		expect(builder.shouldBuild(config)).toBe(false);
	});

	it("should build when showContextUsage is true", () => {
		const config: StatuslineConfig = { ...mockConfig, tokens: { showContextUsage: true } };
		expect(builder.shouldBuild(config)).toBe(true);
	});

	it("should build token metrics with percentage and counts", async () => {
		const config: StatuslineConfig = { ...mockConfig, tokens: { showContextUsage: true } };
		const result = await builder.build(config, mockMetricsData);
		expect(result).toContain("T:");
		expect(result).toContain("22"); // percentage
		expect(result).toContain("45"); // token count (45K)
	});
});

// ============================================================================
// LimitMetricsBuilder Tests
// ============================================================================

describe("LimitMetricsBuilder", () => {
	const builder = new LimitMetricsBuilder();

	it("should not build when showFiveHour is false", () => {
		const config: StatuslineConfig = {
			...mockConfig,
			rateLimits: { ...mockConfig.rateLimits, showFiveHour: false },
		};
		expect(builder.shouldBuild(config)).toBe(false);
	});

	it("should build when showFiveHour is true", () => {
		const config: StatuslineConfig = {
			...mockConfig,
			rateLimits: { ...mockConfig.rateLimits, showFiveHour: true },
		};
		expect(builder.shouldBuild(config)).toBe(true);
	});

	it("should return null when five_hour is null", async () => {
		const config: StatuslineConfig = {
			...mockConfig,
			rateLimits: { ...mockConfig.rateLimits, showFiveHour: true },
		};
		const data = {
			...mockMetricsData,
			usageLimits: { ...mockMetricsData.usageLimits, five_hour: null },
		};
		const result = await builder.build(config, data);
		expect(result).toBe(null);
	});

	it("should build limit metrics with utilization", async () => {
		const config: StatuslineConfig = {
			...mockConfig,
			rateLimits: { ...mockConfig.rateLimits, showFiveHour: true },
		};
		const result = await builder.build(config, mockMetricsData);
		expect(result).toContain("L:");
		expect(result).toContain("45"); // utilization percentage
	});

	it("should include reset date and time when available", async () => {
		const config: StatuslineConfig = {
			...mockConfig,
			rateLimits: { ...mockConfig.rateLimits, showFiveHour: true },
		};
		const result = await builder.build(config, mockMetricsData);
		expect(result).toContain("(");
		expect(result).toContain(")");
	});
});

// ============================================================================
// CostMetricsBuilder Tests
// ============================================================================

describe("CostMetricsBuilder", () => {
	const builder = new CostMetricsBuilder();

	it("should not build when showDailyCost is false", () => {
		const config: StatuslineConfig = {
			...mockConfig,
			costs: { ...mockConfig.costs, showDailyCost: false },
		};
		expect(builder.shouldBuild(config)).toBe(false);
	});

	it("should build when showDailyCost is true", () => {
		const config: StatuslineConfig = {
			...mockConfig,
			costs: { ...mockConfig.costs, showDailyCost: true },
		};
		expect(builder.shouldBuild(config)).toBe(true);
	});

	it("should return null when cost is less than $0.01", async () => {
		const config: StatuslineConfig = {
			...mockConfig,
			costs: { ...mockConfig.costs, showDailyCost: true },
		};
		const data = { ...mockMetricsData, todayCost: 0.005 };
		const result = await builder.build(config, data);
		expect(result).toBe(null);
	});

	it("should build cost metrics when cost >= $0.01", async () => {
		const config: StatuslineConfig = {
			...mockConfig,
			costs: { ...mockConfig.costs, showDailyCost: true },
		};
		const result = await builder.build(config, mockMetricsData);
		expect(result).toContain("D:");
		expect(result).toContain("1.3"); // cost display (1.25 rounded to 1 decimal place)
	});
});

// ============================================================================
// WeeklyMetricsBuilder Tests
// ============================================================================

describe("WeeklyMetricsBuilder", () => {
	const builder = new WeeklyMetricsBuilder();

	it("should not build when showWeekly is false", () => {
		const config: StatuslineConfig = {
			...mockConfig,
			rateLimits: { ...mockConfig.rateLimits, showWeekly: false },
		};
		expect(builder.shouldBuild(config)).toBe(false);
	});

	it("should build when showWeekly is true", () => {
		const config: StatuslineConfig = {
			...mockConfig,
			rateLimits: { ...mockConfig.rateLimits, showWeekly: true },
		};
		expect(builder.shouldBuild(config)).toBe(true);
	});

	it("should return null when seven_day is null", async () => {
		const config: StatuslineConfig = {
			...mockConfig,
			rateLimits: { ...mockConfig.rateLimits, showWeekly: true },
		};
		const data = {
			...mockMetricsData,
			usageLimits: { ...mockMetricsData.usageLimits, seven_day: null },
		};
		const result = await builder.build(config, data);
		expect(result).toBe(null);
	});

	it("should build weekly metrics with utilization", async () => {
		const config: StatuslineConfig = {
			...mockConfig,
			rateLimits: { ...mockConfig.rateLimits, showWeekly: true },
		};
		const result = await builder.build(config, mockMetricsData);
		expect(result).toContain("W:");
		expect(result).toContain("60"); // utilization percentage
	});
});

// ============================================================================
// MetricsLineBuilder Tests (Orchestrator)
// ============================================================================

describe("MetricsLineBuilder", () => {
	it("should build empty string when no builders produce output", async () => {
		const config: StatuslineConfig = {
			...mockConfig,
			session: { ...mockConfig.session, showElapsedTime: false },
			tokens: { showContextUsage: false },
			rateLimits: { ...mockConfig.rateLimits, showFiveHour: false, showWeekly: false },
			costs: { ...mockConfig.costs, showDailyCost: false },
		};

		const builder = new MetricsLineBuilder();
		const result = await builder.build(config, mockMetricsData);
		expect(result).toBe("");
	});

	it("should build metrics line with all components enabled", async () => {
		const config: StatuslineConfig = {
			...mockConfig,
			session: { ...mockConfig.session, showElapsedTime: true },
			tokens: { showContextUsage: true },
			rateLimits: { ...mockConfig.rateLimits, showFiveHour: true, showWeekly: true },
			costs: { ...mockConfig.costs, showDailyCost: true },
			display: { showSeparators: false },
		};

		const builder = new MetricsLineBuilder();
		const result = await builder.build(config, mockMetricsData);

		expect(result).toContain("S:");
		expect(result).toContain("T:");
		expect(result).toContain("L:");
		expect(result).toContain("D:");
		expect(result).toContain("W:");
	});

	it("should use separator when showSeparators is true", async () => {
		const config: StatuslineConfig = {
			...mockConfig,
			session: { ...mockConfig.session, showElapsedTime: true },
			tokens: { showContextUsage: true },
			display: { showSeparators: true },
		};

		const builder = new MetricsLineBuilder();
		const result = await builder.build(config, mockMetricsData);

		expect(result).toContain("・");
	});

	it("should not use separator when showSeparators is false", async () => {
		const config: StatuslineConfig = {
			...mockConfig,
			session: { ...mockConfig.session, showElapsedTime: true },
			tokens: { showContextUsage: true },
			display: { showSeparators: false },
		};

		const builder = new MetricsLineBuilder();
		const result = await builder.build(config, mockMetricsData);

		expect(!result.includes("・")).toBe(true);
	});

	it("should allow custom builders to be set", async () => {
		class CustomBuilder {
			shouldBuild(): boolean {
				return true;
			}

			async build(): Promise<string | null> {
				return "CUSTOM";
			}
		}

		const builder = new MetricsLineBuilder();
		builder.setBuilders([new CustomBuilder() as any]);

		const result = await builder.build(mockConfig, mockMetricsData);
		expect(result).toBe("CUSTOM");
	});
});

// ============================================================================
// Singleton Tests
// ============================================================================

describe("MetricsLineBuilder Singleton", () => {
	it("should get default builder instance", () => {
		const builder = getMetricsLineBuilder();
		expect(builder).toBeDefined();
		expect(builder instanceof MetricsLineBuilder).toBe(true);
	});

	it("should allow setting custom builder instance", () => {
		const customBuilder = new MetricsLineBuilder();
		setMetricsLineBuilder(customBuilder);

		const retrieved = getMetricsLineBuilder();
		expect(retrieved).toBe(customBuilder);
	});
});
