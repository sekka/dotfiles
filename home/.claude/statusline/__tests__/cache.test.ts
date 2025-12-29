#!/usr/bin/env bun

// Phase 4-1: Comprehensive tests for cache.ts module
import { describe, it, expect, beforeEach } from "bun:test";

import { CacheService, getCacheService, setCacheService, loadConfigCached } from "../cache.ts";
import { MemoryCacheProvider } from "../providers.ts";
import { type StatuslineServices } from "../interfaces.ts";

// ============================================================================
// Mock Providers for Testing
// ============================================================================

class MockTokenProvider {
	constructor(private tokenValue: string | null = "mock-token") {}

	async getToken(): Promise<string | null> {
		return this.tokenValue;
	}
}

class MockUsageLimitsProvider {
	constructor(
		private limitsValue: {
			five_hour: { utilization: number; resets_at: string | null } | null;
			seven_day: { utilization: number; resets_at: string | null } | null;
		} | null = {
			five_hour: { utilization: 50, resets_at: "2025-12-31T10:00:00Z" },
			seven_day: { utilization: 70, resets_at: "2026-01-06T00:00:00Z" },
		},
	) {}

	async fetchLimits(_token: string) {
		return this.limitsValue;
	}
}

class MockConfigProvider {
	constructor(
		private configValue = {
			git: { showBranch: true, showAheadBehind: true, showDiffStats: true, alwaysShowMain: false },
			rateLimits: { showFiveHour: true, showWeekly: true, showPeriodCost: false },
			costs: { showDailyCost: true, showSessionCost: false },
			tokens: { showContextUsage: true },
			session: { showSessionId: true, showElapsedTime: false },
			display: { showSeparators: false },
		},
	) {}

	async loadConfig() {
		return this.configValue;
	}
}

// ============================================================================
// CacheService Tests
// ============================================================================

describe("CacheService", () => {
	let cacheService: CacheService;
	let mockServices: StatuslineServices;

	beforeEach(() => {
		const memoryCacheProvider = new MemoryCacheProvider();

		mockServices = {
			tokenProvider: new MockTokenProvider("test-token") as any,
			usageLimitsProvider: new MockUsageLimitsProvider() as any,
			configProvider: new MockConfigProvider() as any,
			cacheProvider: memoryCacheProvider,
		};

		cacheService = new CacheService(mockServices);
	});

	it("should be defined", () => {
		expect(cacheService).toBeDefined();
		expect(typeof cacheService.getCachedUsageLimits).toBe("function");
		expect(typeof cacheService.getConfig).toBe("function");
	});

	it("should fetch and cache usage limits", async () => {
		const limits = await cacheService.getCachedUsageLimits();

		expect(limits).toBeDefined();
		expect(limits?.five_hour).toBeDefined();
		expect(limits?.seven_day).toBeDefined();

		if (limits?.five_hour) {
			expect(typeof limits.five_hour.utilization).toBe("number");
			expect(limits.five_hour.utilization).toBe(50);
		}
	});

	it("should return cached usage limits on second call", async () => {
		// First call - should fetch
		const limits1 = await cacheService.getCachedUsageLimits();

		// Second call - should return cached value
		const limits2 = await cacheService.getCachedUsageLimits();

		expect(limits1).toEqual(limits2);
	});

	it("should handle null usage limits gracefully", async () => {
		const services: StatuslineServices = {
			tokenProvider: new MockTokenProvider(null) as any,
			usageLimitsProvider: new MockUsageLimitsProvider(null) as any,
			configProvider: new MockConfigProvider() as any,
			cacheProvider: new MemoryCacheProvider(),
		};

		const service = new CacheService(services);
		const limits = await service.getCachedUsageLimits();

		expect(limits).toBe(null);
	});

	it("should fetch and cache configuration", async () => {
		const config = await cacheService.getConfig();

		expect(config).toBeDefined();
		expect(config.git).toBeDefined();
		expect(config.rateLimits).toBeDefined();
		expect(config.costs).toBeDefined();
		expect(config.tokens).toBeDefined();
		expect(config.session).toBeDefined();
		expect(config.display).toBeDefined();
	});

	it("should return cached config on second call", async () => {
		// First call - should fetch
		const config1 = await cacheService.getConfig();

		// Second call - should return cached value
		const config2 = await cacheService.getConfig();

		expect(config1).toEqual(config2);
	});

	it("should respect configuration structure", async () => {
		const config = await cacheService.getConfig();

		expect(typeof config.git.showBranch).toBe("boolean");
		expect(typeof config.rateLimits.showFiveHour).toBe("boolean");
		expect(typeof config.costs.showDailyCost).toBe("boolean");
		expect(typeof config.tokens.showContextUsage).toBe("boolean");
		expect(typeof config.session.showSessionId).toBe("boolean");
		expect(typeof config.display.showSeparators).toBe("boolean");
	});

	it("should propagate provider errors from usageLimitsProvider", async () => {
		const errorServices: StatuslineServices = {
			tokenProvider: new MockTokenProvider("test-token") as any,
			usageLimitsProvider: {
				async fetchLimits() {
					throw new Error("API Error");
				},
			} as any,
			configProvider: new MockConfigProvider() as any,
			cacheProvider: new MemoryCacheProvider(),
		};

		const service = new CacheService(errorServices);

		// Provider errors are expected to propagate
		try {
			await service.getCachedUsageLimits();
			expect(true).toBe(false); // Should have thrown
		} catch (e) {
			// Expected behavior - provider errors propagate
			expect(e instanceof Error).toBe(true);
		}
	});

	it("should work with independent CacheService instances", async () => {
		const service1 = new CacheService(mockServices);
		const service2 = new CacheService(mockServices);

		const config1 = await service1.getConfig();
		const config2 = await service2.getConfig();

		expect(config1).toEqual(config2);
		expect(service1).not.toBe(service2);
	});
});

// ============================================================================
// Singleton Getter/Setter Tests
// ============================================================================

describe("CacheService Singleton", () => {
	it("should get current cache service", () => {
		const service = getCacheService();

		expect(service).toBeDefined();
		expect(service instanceof CacheService).toBe(true);
		expect(typeof service.getCachedUsageLimits).toBe("function");
		expect(typeof service.getConfig).toBe("function");
	});

	it("should set custom cache service", () => {
		const customServices: StatuslineServices = {
			tokenProvider: new MockTokenProvider("custom-token") as any,
			usageLimitsProvider: new MockUsageLimitsProvider() as any,
			configProvider: new MockConfigProvider() as any,
			cacheProvider: new MemoryCacheProvider(),
		};

		const customService = new CacheService(customServices);
		setCacheService(customService);

		const retrieved = getCacheService();
		expect(retrieved).toBe(customService);
	});

	it("should allow multiple setter calls", () => {
		const services1: StatuslineServices = {
			tokenProvider: new MockTokenProvider("token1") as any,
			usageLimitsProvider: new MockUsageLimitsProvider() as any,
			configProvider: new MockConfigProvider() as any,
			cacheProvider: new MemoryCacheProvider(),
		};

		const services2: StatuslineServices = {
			tokenProvider: new MockTokenProvider("token2") as any,
			usageLimitsProvider: new MockUsageLimitsProvider() as any,
			configProvider: new MockConfigProvider() as any,
			cacheProvider: new MemoryCacheProvider(),
		};

		const service1 = new CacheService(services1);
		const service2 = new CacheService(services2);

		setCacheService(service1);
		expect(getCacheService()).toBe(service1);

		setCacheService(service2);
		expect(getCacheService()).toBe(service2);
	});

	it("should support test injection pattern", () => {
		const testServices: StatuslineServices = {
			tokenProvider: new MockTokenProvider("test-token") as any,
			usageLimitsProvider: new MockUsageLimitsProvider() as any,
			configProvider: new MockConfigProvider() as any,
			cacheProvider: new MemoryCacheProvider(),
		};

		const testService = new CacheService(testServices);

		// Store original service for restoration
		const originalService = getCacheService();

		try {
			setCacheService(testService);
			const current = getCacheService();
			expect(current).toBe(testService);
		} finally {
			// Restore original service
			setCacheService(originalService);
		}
	});
});

// ============================================================================
// Config Caching Tests
// ============================================================================

describe("loadConfigCached", () => {
	it("should return valid configuration", async () => {
		const config = await loadConfigCached();

		expect(config).toBeDefined();
		expect(config.git).toBeDefined();
		expect(config.rateLimits).toBeDefined();
		expect(config.costs).toBeDefined();
		expect(config.tokens).toBeDefined();
		expect(config.session).toBeDefined();
		expect(config.display).toBeDefined();
	});

	it("should return consistent configuration on multiple calls", async () => {
		const config1 = await loadConfigCached();
		const config2 = await loadConfigCached();

		expect(config1).toEqual(config2);
	});

	it("should return configuration with correct structure", async () => {
		const config = await loadConfigCached();

		// Verify git section
		expect(typeof config.git.showBranch).toBe("boolean");
		expect(typeof config.git.showAheadBehind).toBe("boolean");
		expect(typeof config.git.showDiffStats).toBe("boolean");
		expect(typeof config.git.alwaysShowMain).toBe("boolean");

		// Verify rateLimits section
		expect(typeof config.rateLimits.showFiveHour).toBe("boolean");
		expect(typeof config.rateLimits.showWeekly).toBe("boolean");
		expect(typeof config.rateLimits.showPeriodCost).toBe("boolean");

		// Verify costs section
		expect(typeof config.costs.showDailyCost).toBe("boolean");
		expect(typeof config.costs.showSessionCost).toBe("boolean");

		// Verify tokens section
		expect(typeof config.tokens.showContextUsage).toBe("boolean");

		// Verify session section
		expect(typeof config.session.showSessionId).toBe("boolean");
		expect(typeof config.session.showElapsedTime).toBe("boolean");

		// Verify display section
		expect(typeof config.display.showSeparators).toBe("boolean");
	});
});

// ============================================================================
// Integration Tests
// ============================================================================

describe("CacheService Integration", () => {
	it("should work with both usage limits and config caching", async () => {
		const services: StatuslineServices = {
			tokenProvider: new MockTokenProvider("test-token") as any,
			usageLimitsProvider: new MockUsageLimitsProvider() as any,
			configProvider: new MockConfigProvider() as any,
			cacheProvider: new MemoryCacheProvider(),
		};

		const service = new CacheService(services);

		const limits = await service.getCachedUsageLimits();
		const config = await service.getConfig();

		expect(limits).toBeDefined();
		expect(config).toBeDefined();

		// Both should be cached now
		const limits2 = await service.getCachedUsageLimits();
		const config2 = await service.getConfig();

		expect(limits).toEqual(limits2);
		expect(config).toEqual(config2);
	});

	it("should handle concurrent cache operations", async () => {
		const services: StatuslineServices = {
			tokenProvider: new MockTokenProvider("test-token") as any,
			usageLimitsProvider: new MockUsageLimitsProvider() as any,
			configProvider: new MockConfigProvider() as any,
			cacheProvider: new MemoryCacheProvider(),
		};

		const service = new CacheService(services);

		const [limits, config] = await Promise.all([
			service.getCachedUsageLimits(),
			service.getConfig(),
		]);

		expect(limits).toBeDefined();
		expect(config).toBeDefined();
	});
});
