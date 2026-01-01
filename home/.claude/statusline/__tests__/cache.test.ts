#!/usr/bin/env bun

// Phase 4-1: Comprehensive tests for cache.ts module
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
// LRUCache Tests (Phase 5-1: Performance Optimization)
// ============================================================================

describe("LRUCache", () => {
	let cache: LRUCache<number>;

	beforeEach(() => {
		cache = new LRUCache<number>({ maxSize: 3, ttl: 1000 }); // 1 second TTL for testing
	});

	// ========================================================================
	// Basic Functionality Tests
	// ========================================================================

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

	it("should update access order on get", () => {
		cache.set("key1", 1);
		cache.set("key2", 2);
		cache.set("key3", 3);

		// Access key1 to make it most recently used
		cache.get("key1");

		// Now key2 is least recently used
		// Adding a new key should evict key2
		cache.set("key4", 4);

		expect(cache.has("key1")).toBe(true);
		expect(cache.has("key2")).toBe(false);
		expect(cache.has("key3")).toBe(true);
		expect(cache.has("key4")).toBe(true);
	});

	// ========================================================================
	// LRU Eviction Tests
	// ========================================================================

	it("should evict least recently used entry when maxSize exceeded", () => {
		cache.set("key1", 1);
		cache.set("key2", 2);
		cache.set("key3", 3);

		// All keys present
		expect(cache.size()).toBe(3);

		// Adding key4 should evict key1 (least recently used)
		cache.set("key4", 4);

		expect(cache.size()).toBe(3);
		expect(cache.has("key1")).toBe(false);
		expect(cache.has("key2")).toBe(true);
		expect(cache.has("key3")).toBe(true);
		expect(cache.has("key4")).toBe(true);
	});

	it("should maintain LRU order correctly across multiple operations", () => {
		cache.set("a", 1);
		cache.set("b", 2);
		cache.set("c", 3);

		// Access order: a, b, c
		// LRU candidate: a

		cache.get("a"); // Access a (now most recent)
		// Access order: b, c, a
		// LRU candidate: b

		cache.get("b"); // Access b (now most recent)
		// Access order: c, a, b
		// LRU candidate: c

		cache.set("d", 4); // Should evict c
		expect(cache.has("c")).toBe(false);
		expect(cache.has("a")).toBe(true);
		expect(cache.has("b")).toBe(true);
		expect(cache.has("d")).toBe(true);
	});

	it("should handle edge case with maxSize=1", () => {
		const smallCache = new LRUCache<number>({ maxSize: 1 });
		smallCache.set("key1", 1);
		expect(smallCache.has("key1")).toBe(true);

		smallCache.set("key2", 2);
		expect(smallCache.has("key1")).toBe(false);
		expect(smallCache.has("key2")).toBe(true);
	});

	// ========================================================================
	// TTL Expiration Tests
	// ========================================================================

	it("should remove expired entries on get", async () => {
		cache.set("key1", 100);
		expect(cache.get("key1")).toBe(100);

		// Wait for TTL to expire (1 second)
		await new Promise((resolve) => setTimeout(resolve, 1100));

		// Entry should be expired
		expect(cache.get("key1")).toBe(null);
	});

	it("should not count expired entries in size", async () => {
		cache.set("key1", 1);
		cache.set("key2", 2);
		expect(cache.size()).toBe(2);

		// Wait for TTL to expire
		await new Promise((resolve) => setTimeout(resolve, 1100));

		// Access should trigger cleanup
		cache.get("key1");

		// Size should not count expired entries
		expect(cache.size()).toBe(0);
	});

	it("should handle has() with expired entries", async () => {
		cache.set("key1", 100);
		expect(cache.has("key1")).toBe(true);

		await new Promise((resolve) => setTimeout(resolve, 1100));

		expect(cache.has("key1")).toBe(false);
	});

	it("should not include expired entries in keys()", async () => {
		cache.set("key1", 1);
		cache.set("key2", 2);
		cache.set("key3", 3);

		expect(cache.keys().length).toBe(3);

		await new Promise((resolve) => setTimeout(resolve, 1100));

		// Trigger cleanup by accessing
		cache.get("key1");

		expect(cache.keys().length).toBe(0);
	});

	// ========================================================================
	// Statistics Methods Tests
	// ========================================================================

	it("should return correct size", () => {
		expect(cache.size()).toBe(0);

		cache.set("key1", 1);
		expect(cache.size()).toBe(1);

		cache.set("key2", 2);
		expect(cache.size()).toBe(2);

		cache.set("key3", 3);
		expect(cache.size()).toBe(3);

		cache.set("key4", 4);
		expect(cache.size()).toBe(3); // maxSize=3
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

	it("should report stats correctly", () => {
		cache.set("key1", 1);
		cache.set("key2", 2);

		const stats = cache.getStats();
		expect(stats).toBeDefined();
		expect(typeof stats.size).toBe("number");
		expect(typeof stats.maxSize).toBe("number");
		expect(stats.size).toBe(2);
		expect(stats.maxSize).toBe(3);
	});

	it("should track hit and miss statistics", () => {
		cache.set("key1", 1);

		cache.get("key1"); // Hit
		cache.get("key2"); // Miss
		cache.get("key1"); // Hit

		const stats = cache.getStats();
		expect(stats.hits).toBe(2);
		expect(stats.misses).toBe(1);
	});

	it("should calculate hit rate correctly", () => {
		cache.set("key1", 1);

		// 3 hits, 1 miss = 75% hit rate
		cache.get("key1");
		cache.get("key1");
		cache.get("key1");
		cache.get("key2"); // Miss

		const stats = cache.getStats();
		expect(stats.hitRate).toBe(0.75);
	});

	// ========================================================================
	// Clear Operation Tests
	// ========================================================================

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

	it("should reset stats on clear", () => {
		cache.set("key1", 1);
		cache.get("key1");
		cache.get("key2");

		let stats = cache.getStats();
		expect(stats.hits).toBe(1);
		expect(stats.misses).toBe(1);

		cache.clear();

		stats = cache.getStats();
		expect(stats.hits).toBe(0);
		expect(stats.misses).toBe(0);
		expect(stats.size).toBe(0);
	});

	// ========================================================================
	// Type Safety Tests
	// ========================================================================

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

	// ========================================================================
	// Edge Cases Tests
	// ========================================================================

	it("should handle empty cache gracefully", () => {
		expect(cache.size()).toBe(0);
		expect(cache.keys().length).toBe(0);
		expect(cache.get("any")).toBe(null);
		expect(cache.has("any")).toBe(false);

		const stats = cache.getStats();
		expect(stats.size).toBe(0);
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

	// ========================================================================
	// Token Counting Use Case Tests
	// ========================================================================

	it("should work for token counting use case", () => {
		const tokenCache = new LRUCache<number>({ maxSize: 1000, ttl: 3600000 }); // 1 hour

		// Simulate token count caching
		tokenCache.set("session-1", 1500);
		tokenCache.set("session-2", 2300);
		tokenCache.set("session-3", 1800);

		expect(tokenCache.get("session-1")).toBe(1500);
		expect(tokenCache.get("session-2")).toBe(2300);
		expect(tokenCache.get("session-3")).toBe(1800);

		const stats = tokenCache.getStats();
		expect(stats.size).toBe(3);
		expect(stats.maxSize).toBe(1000);
	});

	it("should prevent memory growth beyond maxSize", () => {
		const largeCache = new LRUCache<number>({ maxSize: 100 });

		// Add 1000 entries
		for (let i = 0; i < 1000; i++) {
			largeCache.set(`key-${i}`, i);
		}

		// Cache should never exceed maxSize
		expect(largeCache.size()).toBeLessThanOrEqual(100);
	});
});
