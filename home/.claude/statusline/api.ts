// ============================================================================
// API, Configuration, and Cache Management
// ============================================================================

import { chmod } from "fs/promises";
import { homedir } from "os";

import { debug, errorMessage, LABEL_KEYS, type LabelKey } from "./format.ts";

// ============================================================================
// Type Definitions
// ============================================================================

/** Claude Code ステータスライン表示フックの入力データ型 */
export interface HookInput {
	model: { display_name: string };
	workspace: { current_dir: string };
	cwd?: string;
	session_id: string;
	cost: {
		total_cost_usd: number;
		total_duration_ms: number;
	};
	context_window?: {
		context_window_size: number;
		total_input_tokens?: number;
		total_output_tokens?: number;
		current_usage: {
			input_tokens: number;
			output_tokens: number;
			cache_creation_input_tokens: number;
			cache_read_input_tokens: number;
		} | null;
	};
	transcript_path?: string;
}

/** トランスクリプト JSON エントリの型定義 */
export interface TranscriptEntry {
	type?: string;
	message?: {
		usage?: {
			input_tokens?: number;
			output_tokens?: number;
			cache_creation_input_tokens?: number;
			cache_read_input_tokens?: number;
		};
	};
	timestamp?: string;
}

/** ステータスライン表示設定 */
export interface StatuslineConfig {
	git: {
		showBranch: boolean;
		showAheadBehind: boolean;
		showDiffStats: boolean;
		alwaysShowMain: boolean;
	};
	rateLimits: {
		showFiveHour: boolean;
		showWeekly: boolean;
		showSonnetWeekly: boolean;
		showPeriodCost: boolean;
	};
	costs: {
		showDailyCost: boolean;
		showSessionCost: boolean;
	};
	tokens: {
		showContextUsage: boolean;
		showInputOutput: boolean;
	};
	session: {
		showSessionId: boolean;
		showElapsedTime: boolean;
		showInFirstLine: boolean;
	};
	display: {
		showSeparators: boolean;
		lineBreakBefore?: string[];
	};
}

export interface UsageLimits {
	five_hour: { utilization: number; resets_at: string | null } | null;
	seven_day: { utilization: number; resets_at: string | null } | null;
	seven_day_sonnet: { utilization: number; resets_at: string | null } | null;
	seven_day_opus: { utilization: number; resets_at: string | null } | null;
}

export interface CachedUsageLimits {
	data: UsageLimits;
	timestamp: number;
}

export type Staleness = "fresh" | "stale" | "expired";

export interface CacheInfo {
	data: UsageLimits | null;
	staleness: Staleness;
	ageMs: number;
}

// ============================================================================
// Default Configuration
// ============================================================================

/** デフォルトステータスライン設定 */
export const DEFAULT_CONFIG: StatuslineConfig = {
	git: {
		showBranch: true,
		showAheadBehind: true,
		showDiffStats: true,
		alwaysShowMain: false,
	},
	rateLimits: {
		showFiveHour: true,
		showWeekly: true,
		showSonnetWeekly: true,
		showPeriodCost: true,
	},
	costs: {
		showDailyCost: true,
		showSessionCost: true,
	},
	tokens: {
		showContextUsage: true,
		showInputOutput: true,
	},
	session: {
		showSessionId: true,
		showElapsedTime: false,
		showInFirstLine: true,
	},
	display: {
		showSeparators: false,
		lineBreakBefore: [],
	},
};

// ============================================================================
// Cache TTL Constants
// ============================================================================

export const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
export const CACHE_STALE_EXPIRED_MS = 60 * 60 * 1000; // 60 minutes: stale data TTL
const CONFIG_CACHE_TTL = 60 * 1000; // 1 minute
const API_CALL_TIMEOUT_MS = 5000; // 5 seconds for API calls

// ============================================================================
// Type Guards (minimal validation)
// ============================================================================

function isValidStatuslineConfig(data: unknown): data is StatuslineConfig {
	return typeof data === "object" && data !== null;
}

function isValidUsageLimits(data: unknown): data is UsageLimits {
	if (typeof data !== "object" || data === null) return false;
	const obj = data as Record<string, unknown>;
	const isValidLimit = (limit: unknown): boolean => {
		if (limit === undefined || limit === null) return true;
		if (typeof limit !== "object") return false;
		const l = limit as Record<string, unknown>;
		return (
			typeof l.utilization === "number" && (l.resets_at === null || typeof l.resets_at === "string")
		);
	};
	return (
		isValidLimit(obj.five_hour) &&
		isValidLimit(obj.seven_day) &&
		isValidLimit(obj.seven_day_sonnet) &&
		isValidLimit(obj.seven_day_opus)
	);
}

// ============================================================================
// Configuration Loading
// ============================================================================

const HOME = homedir();

async function loadConfig(): Promise<StatuslineConfig> {
	// Try to load user override config
	const localConfigFile = `${HOME}/.claude/statusline-config.json`;
	let validatedConfig: Partial<StatuslineConfig> | null = null;

	try {
		const rawConfig = await Bun.file(localConfigFile).json();
		debug(`Loaded user config from ${localConfigFile}`, "verbose");

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

// ============================================================================
// Configuration Caching
// ============================================================================

let cachedConfig: StatuslineConfig | null = null;
let configCacheTime = 0;

/** Config をキャッシュして複数回の読み込みを回避 */
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

// ============================================================================
// API Token Retrieval (from macOS Keychain)
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

async function readKeychainCredentials(): Promise<string> {
	const proc = Bun.spawn({
		cmd: ["security", "find-generic-password", "-s", "Claude Code-credentials", "-w"],
		stdout: "pipe",
		stderr: "pipe",
	});
	const [stdout, stderr, exitCode] = await Promise.all([
		new Response(proc.stdout).text(),
		new Response(proc.stderr).text(),
		proc.exited,
	]);
	if (exitCode !== 0) {
		debug(`Keychain lookup failed (exit ${exitCode}): ${stderr.trim()}`, "error");
		return "";
	}
	return stdout.trim();
}

function parseCredentials(raw: string): Credentials | null {
	if (!raw.startsWith("{")) {
		debug(`Invalid credential format`, "error");
		return null;
	}
	try {
		const creds: Credentials = JSON.parse(raw);
		if (!creds.claudeAiOauth) return null;
		return creds;
	} catch (e) {
		debug(`Failed to parse credentials: ${errorMessage(e)}`, "error");
		return null;
	}
}

async function getClaudeApiToken(): Promise<string | null> {
	try {
		// ~/.claude/.credentials.json から直接読み込む
		// security コマンドは 4030 hex chars でバイナリデータを切り詰めるため使用しない
		const credFile = Bun.file(`${process.env.HOME}/.claude/.credentials.json`);

		let credentials: Credentials | null = null;
		try {
			credentials = parseCredentials(await credFile.text());
		} catch (fileErr) {
			const code = (fileErr as NodeJS.ErrnoException).code;
			if (code !== "ENOENT") {
				debug(`Cannot read credentials file: ${errorMessage(fileErr)}`, "error");
				return null;
			}
		}

		if (!credentials) {
			debug(`Falling back to Keychain`, "verbose");
			credentials = parseCredentials(await readKeychainCredentials());
			if (!credentials) {
				debug(`Keychain fallback failed`, "error");
				return null;
			}
		}

		const token = credentials.claudeAiOauth.accessToken;

		// トークンの有効性チェック
		if (typeof token !== "string" || token.length === 0) {
			debug(`No valid access token found in credentials`, "error");
			return null;
		}

		// 基本的なトークン形式チェック（最小限の長さ）
		if (token.length < 20) {
			debug(`Access token appears invalid (too short)`, "error");
			return null;
		}

		return token;
	} catch (e) {
		const errorMsg = errorMessage(e);

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

// ============================================================================
// Rate Limiting and API Fetching
// ============================================================================

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
		const errorMsg = errorMessage(e);

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

// ============================================================================
// Usage Limits Caching
// ============================================================================

// Promise cache to prevent concurrent API calls
let usageLimitsPromise: Promise<UsageLimits | null> | null = null;

export async function getCachedUsageLimits(): Promise<UsageLimits | null> {
	const cacheFile = `${HOME}/.claude/data/usage-limits-cache.json`;
	debug(`Checking cache file: ${cacheFile}`, "verbose");

	// Try to load from cache
	let staleData: UsageLimits | null = null;
	try {
		const cache: CachedUsageLimits = await Bun.file(cacheFile).json();
		const age = Date.now() - cache.timestamp;
		debug(`Cache found, age: ${age}ms, TTL: ${CACHE_TTL_MS}ms`, "verbose");
		if (age < CACHE_TTL_MS) {
			debug(`Cache valid, returning data`, "verbose");
			return cache.data;
		}
		debug(`Cache expired, keeping as fallback`, "verbose");
		staleData = cache.data;
	} catch {
		// Cache doesn't exist or is invalid
		debug(`Cache not found or invalid`, "verbose");
	}

	// Prevent multiple concurrent API calls
	if (usageLimitsPromise) {
		debug(`Returning in-flight usage limits request`, "verbose");
		return usageLimitsPromise;
	}

	// Create new promise
	usageLimitsPromise = (async () => {
		try {
			const token = await getClaudeApiToken();
			if (!token) {
				debug(`No API token found, using stale data as fallback`, "verbose");
				return staleData;
			}

			const limits = await fetchUsageLimits(token);
			if (!limits) {
				debug(`API returned null, using stale data as fallback`, "verbose");
				return staleData;
			}

			// Write cache with secure permissions
			try {
				const cacheDir = `${HOME}/.claude/data`;
				const { mkdir } = await import("fs/promises");
				await mkdir(cacheDir, { recursive: true, mode: 0o700 });

				const cacheContent = JSON.stringify({ data: limits, timestamp: Date.now() });
				await Bun.write(cacheFile, cacheContent);
				await chmod(cacheFile, 0o600);
				debug(`Cache file written: ${cacheFile}`, "verbose");
			} catch (e) {
				debug(`Failed to write cache file: ${errorMessage(e)}`, "error");
			}

			return limits;
		} finally {
			usageLimitsPromise = null;
		}
	})();

	return usageLimitsPromise;
}

export async function getCacheWithInfo(): Promise<CacheInfo> {
	const cacheFile = `${HOME}/.claude/data/usage-limits-cache.json`;
	try {
		const cache: CachedUsageLimits = await Bun.file(cacheFile).json();
		const now = Date.now();
		if (
			typeof cache.timestamp !== "number" ||
			cache.timestamp <= 0 ||
			cache.timestamp > now + 60_000
		) {
			return { data: null, staleness: "expired", ageMs: Infinity };
		}
		const ageMs = now - cache.timestamp;
		let staleness: Staleness;
		if (ageMs < CACHE_TTL_MS) {
			staleness = "fresh";
		} else if (ageMs < CACHE_STALE_EXPIRED_MS) {
			staleness = "stale";
		} else {
			staleness = "expired";
		}
		return { data: cache.data, staleness, ageMs };
	} catch {
		return { data: null, staleness: "expired", ageMs: Infinity };
	}
}

// ============================================================================
// Daily Cost Tracking
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
