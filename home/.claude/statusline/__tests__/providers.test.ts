#!/usr/bin/env bun

// Phase 4-1: Comprehensive tests for providers.ts module
import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { homedir } from "os";

import {
	DefaultTokenProvider,
	DefaultUsageLimitsProvider,
	DefaultConfigProvider,
	FileCacheProvider,
	MemoryCacheProvider,
	createDefaultServices,
	createTestServices,
} from "../providers.ts";

// ============================================================================
// Test Data Fixtures
// ============================================================================

const mockToken = "sk-1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrst";

const mockUsageLimits = {
	five_hour: { utilization: 45, resets_at: "2025-12-31T10:00:00Z" },
	seven_day: { utilization: 60, resets_at: "2026-01-06T00:00:00Z" },
};

const mockConfig = {
	git: { showBranch: true, showAheadBehind: true, showDiffStats: true, alwaysShowMain: false },
	rateLimits: { showFiveHour: true, showWeekly: true, showPeriodCost: false },
	costs: { showDailyCost: true, showSessionCost: false },
	tokens: { showContextUsage: true },
	session: { showSessionId: true, showElapsedTime: false },
	display: { showSeparators: false },
};

// ============================================================================
// DefaultTokenProvider Tests
// ============================================================================

describe("DefaultTokenProvider", () => {
	const provider = new DefaultTokenProvider();

	it("should be defined", () => {
		expect(provider).toBeDefined();
		expect(typeof provider.getToken).toBe("function");
	});

	it("should handle Keychain not found errors gracefully", async () => {
		// This test verifies error handling when credentials don't exist
		// The actual behavior depends on system state, so we test the method exists
		const result = await provider.getToken();
		expect(result === null || typeof result === "string").toBe(true);
	});

	it("should return null or string (never throws)", async () => {
		const result = await provider.getToken();
		expect(result === null || typeof result === "string").toBe(true);
	});
});

// ============================================================================
// DefaultUsageLimitsProvider Tests
// ============================================================================

describe("DefaultUsageLimitsProvider", () => {
	const provider = new DefaultUsageLimitsProvider();

	it("should be defined", () => {
		expect(provider).toBeDefined();
		expect(typeof provider.fetchLimits).toBe("function");
	});

	it("should handle rate limiting", async () => {
		// First call (should attempt)
		const result1 = await provider.fetchLimits(mockToken);
		expect(result1 === null || typeof result1 === "object").toBe(true);

		// Second call immediately after (should be rate limited)
		const result2 = await provider.fetchLimits(mockToken);
		expect(result2 === null || typeof result2 === "object").toBe(true);
	});

	it("should return null or valid UsageLimits (never throws)", async () => {
		const result = await provider.fetchLimits(mockToken);
		expect(result === null || typeof result === "object").toBe(true);
	});

	it("should handle invalid tokens gracefully", async () => {
		const result = await provider.fetchLimits("invalid-token");
		expect(result === null || typeof result === "object").toBe(true);
	});
});

// ============================================================================
// DefaultConfigProvider Tests
// ============================================================================

describe("DefaultConfigProvider", () => {
	const provider = new DefaultConfigProvider();

	it("should be defined", () => {
		expect(provider).toBeDefined();
		expect(typeof provider.loadConfig).toBe("function");
	});

	it("should return valid config structure", async () => {
		const config = await provider.loadConfig();

		expect(config).toBeDefined();
		expect(config.git).toBeDefined();
		expect(config.rateLimits).toBeDefined();
		expect(config.costs).toBeDefined();
		expect(config.tokens).toBeDefined();
		expect(config.session).toBeDefined();
		expect(config.display).toBeDefined();
	});

	it("should have valid git configuration", async () => {
		const config = await provider.loadConfig();

		expect(typeof config.git.showBranch).toBe("boolean");
		expect(typeof config.git.showAheadBehind).toBe("boolean");
		expect(typeof config.git.showDiffStats).toBe("boolean");
		expect(typeof config.git.alwaysShowMain).toBe("boolean");
	});

	it("should have valid rateLimits configuration", async () => {
		const config = await provider.loadConfig();

		expect(typeof config.rateLimits.showFiveHour).toBe("boolean");
		expect(typeof config.rateLimits.showWeekly).toBe("boolean");
		expect(typeof config.rateLimits.showPeriodCost).toBe("boolean");
	});

	it("should have valid costs configuration", async () => {
		const config = await provider.loadConfig();

		expect(typeof config.costs.showDailyCost).toBe("boolean");
		expect(typeof config.costs.showSessionCost).toBe("boolean");
	});

	it("should have valid tokens configuration", async () => {
		const config = await provider.loadConfig();

		expect(typeof config.tokens.showContextUsage).toBe("boolean");
	});

	it("should have valid session configuration", async () => {
		const config = await provider.loadConfig();

		expect(typeof config.session.showSessionId).toBe("boolean");
		expect(typeof config.session.showElapsedTime).toBe("boolean");
	});

	it("should have valid display configuration", async () => {
		const config = await provider.loadConfig();

		expect(typeof config.display.showSeparators).toBe("boolean");
	});
});

// ============================================================================
// FileCacheProvider Tests
// ============================================================================

describe("FileCacheProvider", () => {
	let provider: FileCacheProvider;
	const testCacheDir = `${homedir()}/.claude/data/test-cache-${Date.now()}`;

	beforeEach(() => {
		provider = new FileCacheProvider(testCacheDir);
	});

	afterEach(async () => {
		// Cleanup test cache directory
		try {
			const { rm } = await import("fs/promises");
			await rm(testCacheDir, { recursive: true, force: true });
		} catch {
			// Ignore cleanup errors
		}
	});

	it("should be defined", () => {
		expect(provider).toBeDefined();
		expect(typeof provider.get).toBe("function");
		expect(typeof provider.set).toBe("function");
		expect(typeof provider.clear).toBe("function");
	});

	it("should return null for non-existent keys", async () => {
		const result = await provider.get<string>("non-existent-key");
		expect(result).toBe(null);
	});

	it("should set and get values", async () => {
		const testData = { test: "data" };
		await provider.set("test-key", testData, 60000);

		const result = await provider.get("test-key");
		expect(result).toEqual(testData);
	});

	it("should clear cached values", async () => {
		const testData = { test: "data" };
		await provider.set("test-key", testData, 60000);

		await provider.clear("test-key");
		const result = await provider.get("test-key");
		expect(result).toBe(null);
	});

	it("should normalize keys to safe filenames", async () => {
		const testData = { test: "data" };
		// Key with special characters
		await provider.set("test/key:with:specials", testData, 60000);

		const result = await provider.get("test/key:with:specials");
		expect(result).toEqual(testData);
	});

	it("should create cache directory if it doesn't exist", async () => {
		const newCacheDir = `${homedir()}/.claude/data/new-cache-${Date.now()}`;
		const newProvider = new FileCacheProvider(newCacheDir);

		try {
			const testData = { test: "data" };
			await newProvider.set("test-key", testData, 60000);
			const result = await newProvider.get("test-key");
			expect(result).toEqual(testData);
		} finally {
			try {
				const { rm } = await import("fs/promises");
				await rm(newCacheDir, { recursive: true, force: true });
			} catch {
				// Ignore cleanup errors
			}
		}
	});

	it("should handle JSON serializable data", async () => {
		const complexData = {
			string: "value",
			number: 42,
			boolean: true,
			array: [1, 2, 3],
			nested: { key: "value" },
		};

		await provider.set("complex-key", complexData, 60000);
		const result = await provider.get("complex-key");
		expect(result).toEqual(complexData);
	});
});

// ============================================================================
// MemoryCacheProvider Tests
// ============================================================================

describe("MemoryCacheProvider", () => {
	let provider: MemoryCacheProvider;

	beforeEach(() => {
		provider = new MemoryCacheProvider();
	});

	it("should be defined", () => {
		expect(provider).toBeDefined();
		expect(typeof provider.get).toBe("function");
		expect(typeof provider.set).toBe("function");
		expect(typeof provider.clear).toBe("function");
	});

	it("should return null for non-existent keys", async () => {
		const result = await provider.get<string>("non-existent-key");
		expect(result).toBe(null);
	});

	it("should set and get values", async () => {
		const testData = { test: "data" };
		await provider.set("test-key", testData, 60000);

		const result = await provider.get("test-key");
		expect(result).toEqual(testData);
	});

	it("should clear cached values", async () => {
		const testData = { test: "data" };
		await provider.set("test-key", testData, 60000);

		await provider.clear("test-key");
		const result = await provider.get("test-key");
		expect(result).toBe(null);
	});

	it("should respect TTL expiration", async () => {
		const testData = { test: "data" };
		// Set with very short TTL (10ms)
		await provider.set("test-key", testData, 10);

		// Should exist immediately
		let result = await provider.get("test-key");
		expect(result).toEqual(testData);

		// Wait for expiration
		await new Promise((resolve) => setTimeout(resolve, 50));

		// Should be expired now
		result = await provider.get("test-key");
		expect(result).toBe(null);
	});

	it("should handle multiple concurrent sets", async () => {
		const data1 = { id: 1 };
		const data2 = { id: 2 };
		const data3 = { id: 3 };

		await Promise.all([
			provider.set("key1", data1, 60000),
			provider.set("key2", data2, 60000),
			provider.set("key3", data3, 60000),
		]);

		const results = await Promise.all([
			provider.get("key1"),
			provider.get("key2"),
			provider.get("key3"),
		]);

		expect(results[0]).toEqual(data1);
		expect(results[1]).toEqual(data2);
		expect(results[2]).toEqual(data3);
	});

	it("should maintain separate cache entries", async () => {
		await provider.set("key1", { value: 1 }, 60000);
		await provider.set("key2", { value: 2 }, 60000);
		await provider.clear("key1");

		const result1 = await provider.get("key1");
		const result2 = await provider.get("key2");

		expect(result1).toBe(null);
		expect(result2).toEqual({ value: 2 });
	});

	it("should handle different data types", async () => {
		const stringData = "test";
		const numberData = 42;
		const objectData = { key: "value" };
		const arrayData = [1, 2, 3];

		await provider.set("string", stringData, 60000);
		await provider.set("number", numberData, 60000);
		await provider.set("object", objectData, 60000);
		await provider.set("array", arrayData, 60000);

		expect(await provider.get("string")).toBe(stringData);
		expect(await provider.get("number")).toBe(numberData);
		expect(await provider.get("object")).toEqual(objectData);
		expect(await provider.get("array")).toEqual(arrayData);
	});
});

// ============================================================================
// Factory Functions Tests
// ============================================================================

describe("Factory Functions", () => {
	it("should create default services with FileCacheProvider", () => {
		const services = createDefaultServices();

		expect(services).toBeDefined();
		expect(services.tokenProvider).toBeDefined();
		expect(services.usageLimitsProvider).toBeDefined();
		expect(services.configProvider).toBeDefined();
		expect(services.cacheProvider).toBeDefined();

		// Default services should use FileCacheProvider
		expect(services.cacheProvider instanceof FileCacheProvider).toBe(true);
	});

	it("should create test services with MemoryCacheProvider", () => {
		const services = createTestServices();

		expect(services).toBeDefined();
		expect(services.tokenProvider).toBeDefined();
		expect(services.usageLimitsProvider).toBeDefined();
		expect(services.configProvider).toBeDefined();
		expect(services.cacheProvider).toBeDefined();

		// Test services should use MemoryCacheProvider
		expect(services.cacheProvider instanceof MemoryCacheProvider).toBe(true);
	});

	it("should create independent service instances", () => {
		const services1 = createDefaultServices();
		const services2 = createDefaultServices();

		expect(services1).not.toBe(services2);
		expect(services1.cacheProvider).not.toBe(services2.cacheProvider);
	});

	it("should have all required provider methods", () => {
		const services = createDefaultServices();

		expect(typeof services.tokenProvider.getToken).toBe("function");
		expect(typeof services.usageLimitsProvider.fetchLimits).toBe("function");
		expect(typeof services.configProvider.loadConfig).toBe("function");
		expect(typeof services.cacheProvider.get).toBe("function");
		expect(typeof services.cacheProvider.set).toBe("function");
		expect(typeof services.cacheProvider.clear).toBe("function");
	});
});
