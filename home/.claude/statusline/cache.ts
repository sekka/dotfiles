import { chmod } from "fs/promises";
import { homedir } from "os";

import { type StatuslineConfig, DEFAULT_CONFIG } from "./config.ts";
import { type UsageLimits, type CachedUsageLimits } from "./utils.ts";
import { isValidStatuslineConfig, isValidUsageLimits, sanitizeForLogging } from "./validation.ts";
import { debug } from "./logging.ts";
import { API_CALL_TIMEOUT_MS } from "./constants.ts";

// ============================================================================
// Rate Limit Features (Phase 2)
// ============================================================================

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
			debug(`Invalid credential format from Keychain`, "error");
			return null;
		}

		let credentials: Credentials;
		try {
			credentials = JSON.parse(trimmedOutput);
		} catch (e) {
			const errorMsg = e instanceof Error ? e.message : String(e);
			debug(`Failed to parse credentials: ${errorMsg}`, "error");
			return null;
		}

		// 構造バリデーション
		if (typeof credentials !== "object" || !credentials.claudeAiOauth) {
			debug(`Invalid credentials structure from Keychain`, "error");
			return null;
		}

		const token = credentials.claudeAiOauth.accessToken;

		// トークンの有効性チェック
		if (typeof token !== "string" || token.length === 0) {
			debug(`No valid access token found in credentials`, "error");
			return null;
		}

		// 基本的なトークン形式チェック（最小限の長さ）
		if (token.length < 10) {
			debug(`Access token appears invalid (too short)`, "error");
			return null;
		}

		return token;
	} catch (e) {
		const errorMsg = e instanceof Error ? e.message : String(e);

		if (errorMsg.includes("ENOENT")) {
			debug(`Credentials not found in Keychain`, "error");
		} else if (errorMsg.includes("EACCES")) {
			debug(`Permission denied accessing Keychain`, "error");
		} else {
			debug(`Failed to retrieve credentials from Keychain: ${errorMsg}`, "error");
		}
		return null;
	}
}

// Rate limiting state to prevent overwhelming the API
let lastApiCallTime = 0;
const MIN_API_CALL_INTERVAL_MS = 30 * 1000; // 30 seconds minimum between calls

async function fetchUsageLimits(token: string): Promise<UsageLimits | null> {
	try {
		// Rate limiting: Enforce minimum interval between API calls
		const now = Date.now();
		const timeSinceLastCall = now - lastApiCallTime;

		if (timeSinceLastCall < MIN_API_CALL_INTERVAL_MS) {
			const waitTime = MIN_API_CALL_INTERVAL_MS - timeSinceLastCall;
			debug(
				`Rate limiting: Skipping API call, wait ${Math.ceil(waitTime / 1000)}s before retry`,
				"verbose",
			);
			return null; // Return null to rely on cache instead
		}

		debug(`Fetching from API...`, "verbose");
		lastApiCallTime = now;

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
			signal: AbortSignal.timeout(API_CALL_TIMEOUT_MS),
		});

		debug(`API response status: ${response.status}`, "verbose");

		// Handle rate limiting response (429 Too Many Requests)
		if (response.status === 429) {
			const retryAfter = response.headers.get("Retry-After");
			const waitSeconds = retryAfter ? parseInt(retryAfter, 10) : 60;
			debug(`API rate limited, retry after ${waitSeconds}s`, "error");
			return null; // Return null to use cache instead
		}

		if (!response.ok) {
			debug(`API request failed: ${response.status}`, "error");
			return null;
		}

		const data = await response.json();
		debug(`API data retrieved successfully`, "verbose");

		// Validate API response
		if (!isValidUsageLimits(data)) {
			debug(`API response validation failed`, "error");
			return null;
		}

		return data;
	} catch (e) {
		// Enhanced error handling
		const errorMsg = e instanceof Error ? e.message : String(e);

		if (errorMsg.includes("timeout") || errorMsg.includes("TimeoutError")) {
			debug(`API request timeout`, "error");
		} else if (errorMsg.includes("fetch") || errorMsg.includes("Network")) {
			debug(`Network error accessing API: ${errorMsg}`, "error");
		} else if (errorMsg.includes("JSON")) {
			debug(`Invalid JSON response from API: ${errorMsg}`, "error");
		} else {
			debug(`API request failed: ${errorMsg}`, "error");
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
		debug(`Loaded user config from ${localConfigFile}`, "verbose");

		// カスタム検証関数で検証
		if (isValidStatuslineConfig(rawConfig)) {
			validatedConfig = rawConfig;
			debug(`Config validated successfully from ${localConfigFile}`, "verbose");
		} else {
			debug(`Config validation failed from ${localConfigFile}`, "warning");
		}
	} catch {
		debug(`User config not found at ${localConfigFile}`, "verbose");
	}

	// Try to load dotfiles config (fallback if no user override)
	if (!validatedConfig) {
		const dotfilesConfigFile = `${HOME}/dotfiles/home/.claude/statusline-config.json`;
		try {
			const rawConfig = await Bun.file(dotfilesConfigFile).json();
			debug(`Loaded dotfiles config from ${dotfilesConfigFile}`, "verbose");

			// カスタム検証関数で検証
			if (isValidStatuslineConfig(rawConfig)) {
				validatedConfig = rawConfig;
				debug(`Config validated successfully from ${dotfilesConfigFile}`, "verbose");
			} else {
				debug(`Config validation failed from ${dotfilesConfigFile}`, "warning");
			}
		} catch {
			debug(`Dotfiles config not found at ${dotfilesConfigFile}`, "verbose");
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
	debug(`No config found, using DEFAULT_CONFIG`, "verbose");
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
	debug(`Checking cache file: ${cacheFile}`, "verbose");

	// Try to load from cache
	try {
		const cache: CachedUsageLimits = await Bun.file(cacheFile).json();
		const age = Date.now() - cache.timestamp;
		debug(`Cache found, age: ${age}ms, TTL: ${CACHE_TTL_MS}ms`, "verbose");
		if (age < CACHE_TTL_MS) {
			debug(`Cache valid, returning data`, "verbose");
			return cache.data;
		}
		debug(`Cache expired`, "verbose");
	} catch (e) {
		// Cache doesn't exist or is invalid
		debug(`Cache error: ${e instanceof Error ? e.message : String(e)}`, "verbose");
	}

	// Fetch from API
	debug(`Fetching from API...`, "verbose");
	const token = await getClaudeApiToken();
	if (!token) {
		debug(`No API token found`, "verbose");
		return null;
	}

	debug(`API token found, fetching limits...`, "verbose");
	const limits = await fetchUsageLimits(token);
	debug(`API response: ${JSON.stringify(limits)}`, "verbose");
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
				debug(`Permission denied writing cache: ${errorMsg}`, "error");
			} else if (errorMsg.includes("ENOENT")) {
				debug(`Cache directory does not exist: ${errorMsg}`, "error");
			} else {
				debug(`Failed to write cache file: ${errorMsg}`, "error");
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

// ============================================================================
// Session IO Tokens Tracking (for /clear persistence)
// ============================================================================

interface SessionTokensStore {
	[sessionId: string]: {
		inputTokens: number;
		outputTokens: number;
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
	} catch (error) {
		// Log error but don't throw - session cost saving is non-critical
		debug(
			`Failed to save session cost: ${error instanceof Error ? error.message : String(error)}`,
			"warning",
		);
	}
}

export async function getPeriodCost(resetTime: string): Promise<number> {
	try {
		const storeFile = `${HOME}/.claude/data/session-costs.json`;

		// Calculate period range (5 hours)
		const periodEndMs = new Date(resetTime).getTime();
		if (isNaN(periodEndMs)) {
			debug(`Invalid resetTime: ${resetTime}`, "verbose");
			return 0;
		}

		const periodStartMs = periodEndMs - 5 * 60 * 60 * 1000; // 5 hours ago
		debug(
			`Calculating period cost from ${new Date(periodStartMs).toISOString()} to ${resetTime}`,
			"verbose",
		);

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

		debug(`Period cost: $${total.toFixed(2)} from ${count} sessions`, "verbose");
		return total;
	} catch (error) {
		debug(
			`Failed to calculate period cost: ${error instanceof Error ? error.message : String(error)}`,
			"error",
		);
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

/**
 * セッションの累積 I/O トークンを保存
 * /clear 後も累積値を保持するために使用
 */
export async function saveSessionTokens(
	sessionId: string,
	inputTokens: number,
	outputTokens: number,
): Promise<void> {
	debug(`[saveSessionTokens] Called with sessionId=${sessionId}, input=${inputTokens}, output=${outputTokens}`, "basic");
	const storeFile = `${HOME}/.claude/data/session-io-tokens.json`;

	let store: SessionTokensStore = {};

	try {
		store = await Bun.file(storeFile).json();
		debug(`[saveSessionTokens] Loaded existing store with ${Object.keys(store).length} sessions`, "basic");
	} catch {
		debug(`[saveSessionTokens] Creating new store file`, "basic");
		// File doesn't exist or is invalid, create new
	}

	// Update session tokens
	store[sessionId] = {
		inputTokens,
		outputTokens,
		updated: Date.now(),
	};

	// Clean up entries older than 7 days (sessions are typically shorter)
	const cutoffMs = Date.now() - 7 * 24 * 60 * 60 * 1000;

	for (const [sid, data] of Object.entries(store)) {
		if (data.updated < cutoffMs) {
			delete store[sid];
		}
	}

	try {
		await Bun.write(storeFile, JSON.stringify(store, null, 2));
		await chmod(storeFile, 0o600);
		debug(`[saveSessionTokens] Successfully saved to ${storeFile}`, "basic");
	} catch (error) {
		debug(
			`[saveSessionTokens] Failed to save session tokens: ${error instanceof Error ? error.message : String(error)}`,
			"warning",
		);
	}
}

/**
 * セッションの累積 I/O トークンを読み込み
 * /clear 後に transcript から取得できない場合に使用
 */
export async function loadSessionTokens(sessionId: string): Promise<{
	inputTokens: number;
	outputTokens: number;
} | null> {
	debug(`[loadSessionTokens] Called with sessionId=${sessionId}`, "basic");
	const storeFile = `${HOME}/.claude/data/session-io-tokens.json`;

	// Check if file exists
	try {
		const file = Bun.file(storeFile);
		const exists = await file.exists();
		debug(`[loadSessionTokens] Cache file exists: ${exists}`, "basic");

		if (!exists) {
			debug(`[loadSessionTokens] Cache file not found: ${storeFile}`, "basic");
			return null;
		}
	} catch (e) {
		debug(`[loadSessionTokens] Error checking file existence: ${e instanceof Error ? e.message : String(e)}`, "basic");
		return null;
	}

	try {
		const store: SessionTokensStore = await Bun.file(storeFile).json();
		debug(`[loadSessionTokens] Loaded store with ${Object.keys(store).length} sessions`, "basic");
		debug(`[loadSessionTokens] Available session IDs: ${Object.keys(store).join(", ")}`, "basic");
		const data = store[sessionId];

		if (!data) {
			debug(`[loadSessionTokens] No data found for session ${sessionId}`, "basic");
			return null;
		}

		debug(`[loadSessionTokens] Found cached tokens: input=${data.inputTokens}, output=${data.outputTokens}`, "basic");
		// Return cached tokens if found
		return {
			inputTokens: data.inputTokens,
			outputTokens: data.outputTokens,
		};
	} catch (error) {
		debug(`[loadSessionTokens] Failed to load: ${error instanceof Error ? error.message : String(error)}`, "basic");
		return null;
	}
}

// ============================================================================
// Phase 3.3: シンプルなキャッシュ実装
// ============================================================================

/**
 * TTLベースのシンプルなキャッシュ
 * @template T キャッシュする値の型
 */
interface CacheEntry<T> {
	value: T;
	timestamp: number;
}

/**
 * TTL付きのシンプルなキャッシュ
 * @example
 * const cache = new SimpleCache<number>({ ttl: 3600000 });
 * cache.set('key1', 100);
 * console.log(cache.get('key1')); // 100
 */
export class SimpleCache<T> {
	private cache: Map<string, CacheEntry<T>> = new Map();
	private readonly ttl: number;

	constructor(options: { ttl?: number } = {}) {
		this.ttl = options.ttl ?? 3600000; // 1時間デフォルト
	}

	get(key: string): T | null {
		const entry = this.cache.get(key);
		if (!entry) return null;

		if (Date.now() - entry.timestamp > this.ttl) {
			this.cache.delete(key);
			return null;
		}

		return entry.value;
	}

	set(key: string, value: T): void {
		this.cache.set(key, { value, timestamp: Date.now() });
	}

	has(key: string): boolean {
		const entry = this.cache.get(key);
		if (!entry) return false;
		if (Date.now() - entry.timestamp > this.ttl) {
			this.cache.delete(key);
			return false;
		}
		return true;
	}

	clear(): void {
		this.cache.clear();
	}

	size(): number {
		return this.cache.size;
	}

	keys(): string[] {
		return Array.from(this.cache.keys());
	}
}

// 後方互換性のためのエイリアス
export class LRUCache<T> extends SimpleCache<T> {}
