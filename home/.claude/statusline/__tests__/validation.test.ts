#!/usr/bin/env bun

// Phase 4-1: Comprehensive tests for validation.ts module
import { describe, it, expect } from "bun:test";

import { isValidUsageLimits, isValidStatuslineConfig, sanitizeForLogging } from "../validation.ts";

// ============================================================================
// isValidUsageLimits Tests
// ============================================================================

describe("isValidUsageLimits", () => {
	it("should accept any object as valid", () => {
		const validLimits = {
			five_hour: { utilization: 50, resets_at: "2025-12-31T00:00:00Z" },
			seven_day: { utilization: 75, resets_at: "2026-01-06T00:00:00Z" },
		};

		expect(isValidUsageLimits(validLimits)).toBe(true);
	});

	it("should accept empty object", () => {
		expect(isValidUsageLimits({})).toBe(true);
	});

	it("should accept object with any properties", () => {
		const limits = {
			five_hour: null,
			seven_day: null,
			seven_day_sonnet: null,
			seven_day_opus: null,
		};

		expect(isValidUsageLimits(limits)).toBe(true);
	});

	it("should reject non-object input", () => {
		expect(isValidUsageLimits(null)).toBe(false);
		expect(isValidUsageLimits("invalid")).toBe(false);
		expect(isValidUsageLimits(123)).toBe(false);
		expect(isValidUsageLimits(undefined)).toBe(false);
	});
});

// ============================================================================
// isValidStatuslineConfig Tests
// ============================================================================

describe("isValidStatuslineConfig", () => {
	it("should accept valid complete config", () => {
		const validConfig = {
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

		expect(isValidStatuslineConfig(validConfig)).toBe(true);
	});

	it("should accept partial config with subset of fields", () => {
		const partialConfig = {
			git: {
				showBranch: true,
			},
			costs: {
				showDailyCost: false,
			},
		};

		expect(isValidStatuslineConfig(partialConfig)).toBe(true);
	});

	it("should accept empty object as valid partial config", () => {
		expect(isValidStatuslineConfig({})).toBe(true);
	});

	it("should accept any object", () => {
		expect(isValidStatuslineConfig({ git: "invalid" })).toBe(true);
		expect(isValidStatuslineConfig({ git: null })).toBe(true);
		expect(isValidStatuslineConfig({ rateLimits: 123 })).toBe(true);
	});

	it("should reject non-object input", () => {
		expect(isValidStatuslineConfig(null)).toBe(false);
		expect(isValidStatuslineConfig("invalid")).toBe(false);
		expect(isValidStatuslineConfig(123)).toBe(false);
		expect(isValidStatuslineConfig(undefined)).toBe(false);
	});
});

// ============================================================================
// sanitizeForLogging Tests
// ============================================================================

describe("sanitizeForLogging", () => {
	it("should mask token fields", () => {
		const data = {
			token: "secret-token-123",
			apiKey: "key-456",
		};

		const sanitized = sanitizeForLogging(data) as Record<string, unknown>;
		expect(sanitized.token).toBe("***REDACTED***");
		expect(sanitized.apiKey).toBe("key-456"); // Not in sensitive list
	});

	it("should mask password fields case-insensitively", () => {
		const data = {
			password: "my-password",
			PASSWORD: "MY-PASSWORD",
			Password: "My-Password",
		};

		const sanitized = sanitizeForLogging(data) as Record<string, unknown>;
		expect(sanitized.password).toBe("***REDACTED***");
		expect(sanitized.PASSWORD).toBe("***REDACTED***");
		expect(sanitized.Password).toBe("***REDACTED***");
	});

	it("should recursively sanitize nested objects", () => {
		const data = {
			user: {
				name: "John",
				credentials: {
					token: "secret",
					username: "john",
				},
			},
		};

		const sanitized = sanitizeForLogging(data) as any;
		expect(sanitized.user.name).toBe("John");
		// credentials キー自体がセンシティブキーとしてマスキングされる
		expect(sanitized.user.credentials).toBe("***REDACTED***");
	});

	it("should handle arrays", () => {
		const data = [{ token: "secret1" }, { token: "secret2", name: "item2" }];

		const sanitized = sanitizeForLogging(data) as any;
		expect(Array.isArray(sanitized)).toBe(true);
		expect(sanitized[0].token).toBe("***REDACTED***");
		expect(sanitized[1].token).toBe("***REDACTED***");
		expect(sanitized[1].name).toBe("item2");
	});

	it("should return primitives unchanged", () => {
		expect(sanitizeForLogging("string")).toBe("string");
		expect(sanitizeForLogging(123)).toBe(123);
		expect(sanitizeForLogging(true)).toBe(true);
		expect(sanitizeForLogging(null)).toBe(null);
	});

	it("should mask all sensitive keys", () => {
		const data = {
			token: "token",
			accesstoken: "accesstoken",
			password: "password",
			secret: "secret",
			refreshtoken: "refreshtoken",
		};

		const sanitized = sanitizeForLogging(data) as Record<string, unknown>;
		Object.values(sanitized).forEach((value) => {
			expect(value).toBe("***REDACTED***");
		});
	});
});
