#!/usr/bin/env bun

// Phase 3.3: Simplified tests for cache.ts module
import { describe, it, expect, beforeEach } from "bun:test";

import { loadConfigCached, LRUCache } from "../cache.ts";

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
// SimpleCache Tests (Phase 3.3: Simplified)
// ============================================================================

describe("SimpleCache", () => {
	let cache: LRUCache<number>;

	beforeEach(() => {
		cache = new LRUCache<number>({ ttl: 1000 }); // 1 second TTL for testing
	});

	// Basic Functionality Tests
	it("should be defined and initialized with correct defaults", () => {
		const defaultCache = new LRUCache<string>();
		expect(defaultCache).toBeDefined();
		expect(defaultCache.size()).toBe(0);
	});

	it("should set and get values", () => {
		cache.set("key1", 100);
		expect(cache.get("key1")).toBe(100);
	});

	it("should return null for missing keys", () => {
		expect(cache.get("nonexistent")).toBe(null);
	});

	it("should overwrite existing values", () => {
		cache.set("key1", 100);
		cache.set("key1", 200);
		expect(cache.get("key1")).toBe(200);
	});

	// TTL Expiration Tests
	it("should remove expired entries on get", async () => {
		cache.set("key1", 100);
		expect(cache.get("key1")).toBe(100);

		// Wait for TTL to expire (1 second)
		await new Promise((resolve) => setTimeout(resolve, 1100));

		// Entry should be expired
		expect(cache.get("key1")).toBe(null);
	});

	it("should handle has() with expired entries", async () => {
		cache.set("key1", 100);
		expect(cache.has("key1")).toBe(true);

		await new Promise((resolve) => setTimeout(resolve, 1100));

		expect(cache.has("key1")).toBe(false);
	});

	it("should handle has() with valid entries", () => {
		cache.set("key1", 100);
		expect(cache.has("key1")).toBe(true);
		expect(cache.has("key2")).toBe(false);
	});

	// Size and Keys Tests
	it("should return correct size", () => {
		expect(cache.size()).toBe(0);

		cache.set("key1", 1);
		expect(cache.size()).toBe(1);

		cache.set("key2", 2);
		expect(cache.size()).toBe(2);

		cache.set("key3", 3);
		expect(cache.size()).toBe(3);

		cache.set("key4", 4);
		expect(cache.size()).toBe(4);
	});

	it("should return correct keys list", () => {
		cache.set("key1", 1);
		cache.set("key2", 2);
		cache.set("key3", 3);

		const keys = cache.keys();
		expect(keys.length).toBe(3);
		expect(keys).toContain("key1");
		expect(keys).toContain("key2");
		expect(keys).toContain("key3");
	});

	// Clear Operation Tests
	it("should clear all entries", () => {
		cache.set("key1", 1);
		cache.set("key2", 2);
		cache.set("key3", 3);

		expect(cache.size()).toBe(3);

		cache.clear();

		expect(cache.size()).toBe(0);
		expect(cache.has("key1")).toBe(false);
		expect(cache.has("key2")).toBe(false);
		expect(cache.has("key3")).toBe(false);
	});

	// Type Safety Tests
	it("should maintain type safety with different types", () => {
		const stringCache = new LRUCache<string>();
		stringCache.set("key1", "value1");
		const value = stringCache.get("key1");
		expect(typeof value === "string" || value === null).toBe(true);

		const objCache = new LRUCache<{ count: number; name: string }>();
		const obj = { count: 5, name: "test" };
		objCache.set("obj1", obj);
		const retrieved = objCache.get("obj1");
		if (retrieved) {
			expect(retrieved.count).toBe(5);
			expect(retrieved.name).toBe("test");
		}
	});

	// Edge Cases Tests
	it("should handle empty cache gracefully", () => {
		expect(cache.size()).toBe(0);
		expect(cache.keys().length).toBe(0);
		expect(cache.get("any")).toBe(null);
		expect(cache.has("any")).toBe(false);
	});

	it("should handle single entry operations", () => {
		cache.set("single", 42);
		expect(cache.size()).toBe(1);
		expect(cache.get("single")).toBe(42);
		expect(cache.has("single")).toBe(true);
		expect(cache.keys().length).toBe(1);

		cache.clear();
		expect(cache.size()).toBe(0);
	});

	it("should handle multiple sets on same key", () => {
		for (let i = 0; i < 10; i++) {
			cache.set("same-key", i);
		}
		expect(cache.size()).toBe(1);
		expect(cache.get("same-key")).toBe(9); // Last value
	});

	it("should handle numeric keys as strings", () => {
		cache.set("123", 1);
		cache.set("456", 2);
		expect(cache.get("123")).toBe(1);
		expect(cache.get("456")).toBe(2);
	});

	// Token Counting Use Case Tests
	it("should work for token counting use case", () => {
		const tokenCache = new LRUCache<number>({ ttl: 3600000 }); // 1 hour

		// Simulate token count caching
		tokenCache.set("session-1", 1500);
		tokenCache.set("session-2", 2300);
		tokenCache.set("session-3", 1800);

		expect(tokenCache.get("session-1")).toBe(1500);
		expect(tokenCache.get("session-2")).toBe(2300);
		expect(tokenCache.get("session-3")).toBe(1800);

		expect(tokenCache.size()).toBe(3);
	});
});
