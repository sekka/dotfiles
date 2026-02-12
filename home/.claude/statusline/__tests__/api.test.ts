#!/usr/bin/env bun

// Phase B2: Tests for api.ts module (config + cache + API logic)
import { describe, it, expect, afterEach } from "bun:test";
import { unlink } from "fs/promises";
import { homedir } from "os";

import { loadConfigCached, DEFAULT_CONFIG } from "../api.ts";
import { saveSessionTokens, loadSessionTokens } from "../tokens.ts";

// ============================================================================
// Config Defaults Tests
// ============================================================================

describe("DEFAULT_CONFIG", () => {
	it("should have all required sections", () => {
		expect(DEFAULT_CONFIG.git).toBeDefined();
		expect(DEFAULT_CONFIG.rateLimits).toBeDefined();
		expect(DEFAULT_CONFIG.costs).toBeDefined();
		expect(DEFAULT_CONFIG.tokens).toBeDefined();
		expect(DEFAULT_CONFIG.session).toBeDefined();
		expect(DEFAULT_CONFIG.display).toBeDefined();
	});

	it("should have boolean values for all git settings", () => {
		expect(typeof DEFAULT_CONFIG.git.showBranch).toBe("boolean");
		expect(typeof DEFAULT_CONFIG.git.showAheadBehind).toBe("boolean");
		expect(typeof DEFAULT_CONFIG.git.showDiffStats).toBe("boolean");
		expect(typeof DEFAULT_CONFIG.git.alwaysShowMain).toBe("boolean");
	});

	it("should have display section with correct types", () => {
		expect(typeof DEFAULT_CONFIG.display.showSeparators).toBe("boolean");
		expect(Array.isArray(DEFAULT_CONFIG.display.lineBreakBefore)).toBe(true);
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
// Session Tokens Tests (for /clear persistence)
// ============================================================================

describe("Session Tokens Persistence", () => {
	const HOME = homedir();
	const testStoreFile = `${HOME}/.claude/data/session-io-tokens.json`;
	const testSessionId = "test-session-" + Date.now();

	afterEach(async () => {
		// Cleanup test data
		try {
			await unlink(testStoreFile);
		} catch {
			// File may not exist
		}
	});

	it("should save and load session tokens", async () => {
		// Save tokens
		await saveSessionTokens(testSessionId, 50000, 20000);

		// Load tokens
		const loaded = await loadSessionTokens(testSessionId);

		expect(loaded).not.toBeNull();
		expect(loaded?.inputTokens).toBe(50000);
		expect(loaded?.outputTokens).toBe(20000);
	});

	it("should return null for non-existent session", async () => {
		const loaded = await loadSessionTokens("non-existent-session-id");
		expect(loaded).toBeNull();
	});

	it("should update existing session tokens", async () => {
		// Save initial tokens
		await saveSessionTokens(testSessionId, 50000, 20000);

		// Update with new values
		await saveSessionTokens(testSessionId, 75000, 30000);

		// Load tokens
		const loaded = await loadSessionTokens(testSessionId);

		expect(loaded).not.toBeNull();
		expect(loaded?.inputTokens).toBe(75000);
		expect(loaded?.outputTokens).toBe(30000);
	});

	it("should handle multiple sessions", async () => {
		const session1 = testSessionId + "-1";
		const session2 = testSessionId + "-2";

		await saveSessionTokens(session1, 10000, 5000);
		await saveSessionTokens(session2, 20000, 8000);

		const loaded1 = await loadSessionTokens(session1);
		const loaded2 = await loadSessionTokens(session2);

		expect(loaded1?.inputTokens).toBe(10000);
		expect(loaded1?.outputTokens).toBe(5000);
		expect(loaded2?.inputTokens).toBe(20000);
		expect(loaded2?.outputTokens).toBe(8000);
	});

	it("should return null when cache file does not exist", async () => {
		// Ensure file doesn't exist
		try {
			await unlink(testStoreFile);
		} catch {
			// Already doesn't exist
		}

		const loaded = await loadSessionTokens("any-session-id");
		expect(loaded).toBeNull();
	});
});
