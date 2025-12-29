import { chmod } from "fs/promises";
import { homedir } from "os";

import {
	StatuslineConfig,
	DEFAULT_CONFIG,
	isValidStatuslineConfig,
	isValidUsageLimits,
	sanitizeForLogging,
	debug,
} from "./utils.ts";

// ============================================================================
// Rate Limit Features (Phase 2)
// ============================================================================

export interface UsageLimits {
	five_hour: { utilization: number; resets_at: string | null } | null;
	seven_day: { utilization: number; resets_at: string | null } | null;
}

interface CachedUsageLimits {
	data: UsageLimits;
	timestamp: number;
}

interface Credentials {
	claudeAiOauth: {
		accessToken: string;
		refreshToken: string;
		expiresAt: number;
		scopes: string[];
		subscriptionType: string;
	};
}

async function getClaudeApiToken(): Promise<string | null> {
	try {
		const proc = Bun.spawn({
			cmd: ["security", "find-generic-password", "-s", "Claude Code-credentials", "-w"],
			stdout: "pipe",
			stderr: "pipe",
		});

		const stdout = await new Response(proc.stdout).text();
		const trimmedOutput = stdout.trim();

		// 基本的な形式チェック
		if (!trimmedOutput.startsWith("{")) {
			console.error("[ERROR] Invalid credential format from Keychain");
			return null;
		}

		let credentials: Credentials;
		try {
			credentials = JSON.parse(trimmedOutput);
		} catch (e) {
			const errorMsg = e instanceof Error ? e.message : String(e);
			console.error(`[ERROR] Failed to parse credentials: ${errorMsg}`);
			return null;
		}

		// 構造バリデーション
		if (typeof credentials !== "object" || !credentials.claudeAiOauth) {
			console.error("[ERROR] Invalid credentials structure from Keychain");
			return null;
		}

		const token = credentials.claudeAiOauth.accessToken;

		// トークンの有効性チェック
		if (typeof token !== "string" || token.length === 0) {
			console.error("[ERROR] No valid access token found in credentials");
			return null;
		}

		// 基本的なトークン形式チェック（最小限の長さ）
		if (token.length < 10) {
			console.error("[ERROR] Access token appears invalid (too short)");
			return null;
		}

		return token;
	} catch (e) {
		const errorMsg = e instanceof Error ? e.message : String(e);

		if (errorMsg.includes("ENOENT")) {
			console.error("[ERROR] Credentials not found in Keychain");
		} else if (errorMsg.includes("EACCES")) {
			console.error("[ERROR] Permission denied accessing Keychain");
		} else {
			console.error("[ERROR] Failed to retrieve credentials from Keychain");
		}
		return null;
	}
}

async function fetchUsageLimits(token: string): Promise<UsageLimits | null> {
	try {
		console.error(`[DEBUG] Fetching from API...`);
		const response = await fetch("https://api.anthropic.com/api/oauth/usage", {
			method: "GET",
			headers: {
				Accept: "application/json, text/plain, */*",
				"Content-Type": "application/json",
				"User-Agent": "claude-code/2.0.31",
				Authorization: `Bearer ${token}`,
				"anthropic-beta": "oauth-2025-04-20",
				"Accept-Encoding": "gzip, compress, deflate, br",
			},
			signal: AbortSignal.timeout(5000),
		});

		console.error(`[DEBUG] API response status: ${response.status}`);
		if (!response.ok) {
			const errorText = await response.text();
			console.error(`[DEBUG] API response not ok: ${response.status} - ${errorText}`);
			return null;
		}

		const data = await response.json();
		console.error(`[DEBUG] API data: ${JSON.stringify(sanitizeForLogging(data))}`);

		// カスタム検証関数でAPI レスポンスを検証
		if (!isValidUsageLimits(data)) {
			console.error(`[DEBUG] API response validation failed`);
			return null;
		}

		return data;
	} catch (e) {
		// Phase 1.6: Enhanced error handling
		const errorMsg = e instanceof Error ? e.message : String(e);

		if (errorMsg.includes("EACCES")) {
			console.error(`[ERROR] Permission denied accessing API: ${errorMsg}`);
		} else if (errorMsg.includes("ENOENT")) {
			console.error(`[ERROR] File not found: ${errorMsg}`);
		} else if (errorMsg.includes("timeout") || errorMsg.includes("TimeoutError")) {
			console.error(`[ERROR] API request timeout: ${errorMsg}`);
		} else if (errorMsg.includes("JSON")) {
			console.error(`[ERROR] Invalid JSON response: ${errorMsg}`);
		} else if (errorMsg.includes("fetch") || errorMsg.includes("Network")) {
			console.error(`[ERROR] Network error: ${errorMsg}`);
		} else {
			console.error(`[ERROR] Unexpected error in fetchUsageLimits: ${errorMsg}`);
		}
		return null;
	}
}

async function loadConfig(): Promise<StatuslineConfig> {
	const HOME = homedir();

	// Try to load user override config
	const localConfigFile = `${HOME}/.claude/statusline-config.json`;
	let validatedConfig: Partial<StatuslineConfig> | null = null;

	try {
		const rawConfig = await Bun.file(localConfigFile).json();
		console.error(`[DEBUG] Loaded user config from ${localConfigFile}`);

		// カスタム検証関数で検証
		if (isValidStatuslineConfig(rawConfig)) {
			validatedConfig = rawConfig;
			console.error(`[DEBUG] Config validated successfully from ${localConfigFile}`);
		} else {
			console.error(`[DEBUG] Config validation failed from ${localConfigFile}`);
		}
	} catch {
		console.error(`[DEBUG] User config not found at ${localConfigFile}`);
	}

	// Try to load dotfiles config (fallback if no user override)
	if (!validatedConfig) {
		const dotfilesConfigFile = `${HOME}/dotfiles/home/.claude/statusline-config.json`;
		try {
			const rawConfig = await Bun.file(dotfilesConfigFile).json();
			console.error(`[DEBUG] Loaded dotfiles config from ${dotfilesConfigFile}`);

			// カスタム検証関数で検証
			if (isValidStatuslineConfig(rawConfig)) {
				validatedConfig = rawConfig;
				console.error(`[DEBUG] Config validated successfully from ${dotfilesConfigFile}`);
			} else {
				console.error(`[DEBUG] Config validation failed from ${dotfilesConfigFile}`);
			}
		} catch {
			console.error(`[DEBUG] Dotfiles config not found at ${dotfilesConfigFile}`);
		}
	}

	// Return merged config
	if (validatedConfig) {
		return {
			git: { ...DEFAULT_CONFIG.git, ...(validatedConfig.git || {}) },
			rateLimits: { ...DEFAULT_CONFIG.rateLimits, ...(validatedConfig.rateLimits || {}) },
			costs: { ...DEFAULT_CONFIG.costs, ...(validatedConfig.costs || {}) },
			tokens: { ...DEFAULT_CONFIG.tokens, ...(validatedConfig.tokens || {}) },
			session: { ...DEFAULT_CONFIG.session, ...(validatedConfig.session || {}) },
			display: { ...DEFAULT_CONFIG.display, ...(validatedConfig.display || {}) },
		};
	}

	// Return default if no config found
	console.error(`[DEBUG] No config found, using DEFAULT_CONFIG`);
	return DEFAULT_CONFIG;
}

const HOME = homedir();
// Phase 1.5: Cache TTL extension (60s → 5 minutes)
const CACHE_TTL_MS = 5 * 60 * 1000;

// ============================================================================
// Phase 4.3: Configuration Caching
// ============================================================================

let cachedConfig: StatuslineConfig | null = null;
let configCacheTime = 0;
const CONFIG_CACHE_TTL = 60 * 1000; // 1分

/**
 * Phase 4.3: Config をキャッシュする
 * loadConfig() の実行結果をメモリにキャッシュして、複数回の読み込みを避ける
 */
export async function loadConfigCached(): Promise<StatuslineConfig> {
	const now = Date.now();

	// キャッシュが有効な場合は返す
	if (cachedConfig && now - configCacheTime < CONFIG_CACHE_TTL) {
		debug("Using cached config", "verbose");
		return cachedConfig;
	}

	// キャッシュが無効な場合は再読み込み
	debug("Loading fresh config", "basic");
	cachedConfig = await loadConfig();
	configCacheTime = now;
	return cachedConfig;
}

export async function getCachedUsageLimits(): Promise<UsageLimits | null> {
	const cacheFile = `${HOME}/.claude/data/usage-limits-cache.json`;
	console.error(`[DEBUG] Checking cache file: ${cacheFile}`);

	// Try to load from cache
	try {
		const cache: CachedUsageLimits = await Bun.file(cacheFile).json();
		const age = Date.now() - cache.timestamp;
		console.error(`[DEBUG] Cache found, age: ${age}ms, TTL: ${CACHE_TTL_MS}ms`);
		if (age < CACHE_TTL_MS) {
			console.error(`[DEBUG] Cache valid, returning data`);
			return cache.data;
		}
		console.error(`[DEBUG] Cache expired`);
	} catch (e) {
		// Cache doesn't exist or is invalid
		console.error(`[DEBUG] Cache error: ${e instanceof Error ? e.message : String(e)}`);
	}

	// Fetch from API
	console.error(`[DEBUG] Fetching from API...`);
	const token = await getClaudeApiToken();
	if (!token) {
		console.error(`[DEBUG] No API token found`);
		return null;
	}

	console.error(`[DEBUG] API token found, fetching limits...`);
	const limits = await fetchUsageLimits(token);
	console.error(`[DEBUG] API response: ${JSON.stringify(limits)}`);
	if (limits) {
		try {
			// Security: Create file with secure permissions (0o600) from the start
			// to prevent race condition where file is readable before chmod() is called
			const cacheDir = `${HOME}/.claude/data`;

			// Ensure cache directory exists with secure permissions
			try {
				await Bun.file(cacheDir).isDirectory();
			} catch {
				// Directory doesn't exist, create it with secure permissions
				const { mkdir } = await import("fs/promises");
				await mkdir(cacheDir, { recursive: true, mode: 0o700 });
			}

			// Write file with secure permissions from creation
			const cacheContent = JSON.stringify(
				{
					data: limits,
					timestamp: Date.now(),
				},
				null,
				2,
			);

			// Use Bun.write to create file, then immediately set permissions
			// Note: Bun.write uses default permissions, so we secure immediately after
			await Bun.write(cacheFile, cacheContent);

			// Immediately set permissions before anything else can read
			await chmod(cacheFile, 0o600);

			debug(`Cache file written securely: ${cacheFile}`, "verbose");
		} catch (e) {
			// Phase 1.6: Enhanced error handling for cache write
			const errorMsg = e instanceof Error ? e.message : String(e);
			if (errorMsg.includes("EACCES")) {
				console.error(`[ERROR] Permission denied writing cache: ${errorMsg}`);
			} else if (errorMsg.includes("ENOENT")) {
				console.error(`[ERROR] Cache directory does not exist: ${errorMsg}`);
			} else {
				console.error(`[ERROR] Failed to write cache file: ${errorMsg}`);
			}
		}
	}

	return limits;
}

// ============================================================================
// Daily Cost Tracking (Phase 3)
// ============================================================================

interface SessionCostStore {
	[sessionId: string]: {
		date: string;
		cost: number;
		updated: number;
	};
}

export async function saveSessionCost(sessionId: string, cost: number): Promise<void> {
	const storeFile = `${HOME}/.claude/data/session-costs.json`;
	const today = new Date().toISOString().split("T")[0];

	let store: SessionCostStore = {};

	try {
		store = await Bun.file(storeFile).json();
	} catch {
		// File doesn't exist or is invalid, create new
	}

	// Update session cost
	store[sessionId] = {
		date: today,
		cost,
		updated: Date.now(),
	};

	// Clean up entries older than 30 days
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - 30);
	const cutoffStr = cutoffDate.toISOString().split("T")[0];

	for (const [sid, data] of Object.entries(store)) {
		if (data.date < cutoffStr) {
			delete store[sid];
		}
	}

	try {
		await Bun.write(storeFile, JSON.stringify(store, null, 2));
		// ファイルパーミッションを 0o600 (所有者のみ読み書き可能) に設定
		await chmod(storeFile, 0o600);
	} catch {
		// Fail silently if write fails
	}
}

export async function getPeriodCost(resetTime: string): Promise<number> {
	try {
		const storeFile = `${HOME}/.claude/data/session-costs.json`;

		// Calculate period range (5 hours)
		const periodEndMs = new Date(resetTime).getTime();
		if (isNaN(periodEndMs)) {
			console.error(`[DEBUG] Invalid resetTime: ${resetTime}`);
			return 0;
		}

		const periodStartMs = periodEndMs - 5 * 60 * 60 * 1000; // 5 hours ago
		console.error(`[DEBUG] Period: ${new Date(periodStartMs).toISOString()} - ${resetTime}`);

		// Read session costs
		const store: SessionCostStore = await Bun.file(storeFile).json();

		// Filter sessions in period and sum costs
		let total = 0;
		let count = 0;

		for (const session of Object.values(store)) {
			if (session.updated >= periodStartMs && session.updated < periodEndMs) {
				total += session.cost;
				count++;
			}
		}

		console.error(`[DEBUG] Period cost: $${total.toFixed(2)} (${count} sessions)`);
		return total;
	} catch (error) {
		console.error(`[DEBUG] getPeriodCost error: ${error}`);
		return 0;
	}
}

export async function getTodayCost(): Promise<number> {
	const storeFile = `${HOME}/.claude/data/session-costs.json`;
	const today = new Date().toISOString().split("T")[0];

	try {
		const store: SessionCostStore = await Bun.file(storeFile).json();
		return Object.values(store)
			.filter((s) => s.date === today)
			.reduce((sum, s) => sum + s.cost, 0);
	} catch {
		return 0;
	}
}
