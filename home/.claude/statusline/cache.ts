import { chmod } from "fs/promises";
import { homedir } from "os";

import { type StatuslineConfig, DEFAULT_CONFIG } from "./config.ts";
import { type UsageLimits, type CachedUsageLimits } from "./utils.ts";
import { isValidStatuslineConfig, isValidUsageLimits, sanitizeForLogging } from "./validation.ts";
import { debug } from "./logging.ts";
import { type StatuslineServices } from "./interfaces.ts";
import { createDefaultServices } from "./providers.ts";

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
			signal: AbortSignal.timeout(5000),
		});

		debug(`API response status: ${response.status}`, "verbose");

		// Handle rate limiting response (429 Too Many Requests)
		if (response.status === 429) {
			const retryAfter = response.headers.get("Retry-After");
			const waitSeconds = retryAfter ? parseInt(retryAfter, 10) : 60;
			console.error(`[ERROR] API rate limited, retry after ${waitSeconds}s`);
			return null; // Return null to use cache instead
		}

		if (!response.ok) {
			console.error(`[ERROR] API request failed: ${response.status}`);
			return null;
		}

		const data = await response.json();
		debug(`API data retrieved successfully`, "verbose");

		// Validate API response
		if (!isValidUsageLimits(data)) {
			console.error(`[ERROR] API response validation failed`);
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

// ============================================================================
// Phase 5.1: LRU キャッシュ実装
// ============================================================================

/**
 * LRU キャッシュエントリ
 * 値とタイムスタンプを保持
 */
interface LRUCacheEntry<T> {
	value: T;
	timestamp: number;
}

/**
 * LRU（Least Recently Used）キャッシュの実装
 *
 * メモリ効率的なキャッシング戦略：
 * - maxSize 超過時は最も古いエントリを自動削除
 * - TTL により期限切れキャッシュを無効化
 * - アクセス時に LRU 順序を更新（最新に移動）
 *
 * @example
 * const cache = new LRUCache<number>({ maxSize: 1000, ttl: 3600000 });
 * cache.set('key1', 100);
 * const value = cache.get('key1'); // 100
 * const stats = cache.getStats();  // { size: 1, utilization: 0.1, ... }
 */
export class LRUCache<T> {
	private cache: Map<string, LRUCacheEntry<T>> = new Map();
	private accessOrder: string[] = []; // アクセス順序を記録（最古...最新）
	private hits: number = 0;
	private misses: number = 0;

	private readonly maxSize: number;
	private readonly ttl: number; // Time To Live (ミリ秒)

	/**
	 * LRU キャッシュを初期化
	 *
	 * @param options - キャッシュオプション
	 * @param options.maxSize - 最大エントリ数（デフォルト：1000）
	 * @param options.ttl - キャッシュの有効期限（ミリ秒、デフォルト：1時間）
	 */
	constructor(options: { maxSize?: number; ttl?: number } = {}) {
		this.maxSize = options.maxSize ?? 1000;
		this.ttl = options.ttl ?? 3600000; // 1時間
	}

	/**
	 * キャッシュから値を取得
	 *
	 * キャッシュヒット時：
	 * - TTL を確認（超過なら削除）
	 * - アクセス順序を更新（最新にマーク）
	 * - 値を返す
	 *
	 * @param key - キャッシュキー
	 * @returns キャッシュ値、または null（未存在またはTTL切れ）
	 */
	get(key: string): T | null {
		const entry = this.cache.get(key);

		// キャッシュ未存在
		if (!entry) {
			this.misses++;
			return null;
		}

		// TTL 超過チェック
		const elapsed = Date.now() - entry.timestamp;
		if (elapsed > this.ttl) {
			this.cache.delete(key);
			this.removeFromAccessOrder(key);
			this.misses++;
			return null;
		}

		// LRU: アクセス順序を更新（最新に移動）
		this.updateAccessOrder(key);
		this.hits++;

		return entry.value;
	}

	/**
	 * キャッシュに値を設定
	 *
	 * 処理フロー：
	 * 1. 既存エントリがあれば削除（再挿入で最新化）
	 * 2. キャッシュサイズが上限に達していれば最古を削除
	 * 3. 新規エントリを追加
	 * 4. アクセス順序に追加
	 *
	 * @param key - キャッシュキー
	 * @param value - 格納する値
	 */
	set(key: string, value: T): void {
		// 既に存在する場合は削除（再挿入で最新化）
		if (this.cache.has(key)) {
			this.cache.delete(key);
			this.removeFromAccessOrder(key);
		}

		// キャッシュサイズが上限に達した場合は最古を削除
		if (this.cache.size >= this.maxSize) {
			const oldestKey = this.accessOrder[0];
			if (oldestKey) {
				this.cache.delete(oldestKey);
				this.accessOrder.shift();
			}
		}

		// 新規エントリを追加
		this.cache.set(key, {
			value,
			timestamp: Date.now(),
		});

		this.accessOrder.push(key);
	}

	/**
	 * キャッシュ全体をクリア
	 */
	clear(): void {
		this.cache.clear();
		this.accessOrder = [];
		this.hits = 0;
		this.misses = 0;
	}

	/**
	 * キャッシュの統計情報を取得
	 *
	 * @returns キャッシュ統計情報
	 */
	getStats(): {
		size: number;
		maxSize: number;
		utilization: number;
		ttl: number;
		hits: number;
		misses: number;
		hitRate: number;
	} {
		const totalAccess = this.hits + this.misses;
		const hitRate = totalAccess === 0 ? 0 : this.hits / totalAccess;

		return {
			size: this.cache.size,
			maxSize: this.maxSize,
			utilization: Math.round((this.cache.size / this.maxSize) * 100),
			ttl: this.ttl,
			hits: this.hits,
			misses: this.misses,
			hitRate,
		};
	}

	/**
	 * キャッシュの現在のサイズを取得
	 *
	 * @returns キャッシュエントリ数（有効なエントリのみ）
	 */
	size(): number {
		const now = Date.now();
		let validCount = 0;

		for (const [key, entry] of this.cache.entries()) {
			const elapsed = now - entry.timestamp;
			if (elapsed <= this.ttl) {
				validCount++;
			} else {
				// 期限切れエントリを削除
				this.cache.delete(key);
				this.removeFromAccessOrder(key);
			}
		}

		return validCount;
	}

	/**
	 * キャッシュに指定キーが存在するかチェック
	 *
	 * @param key - キャッシュキー
	 * @returns キャッシュに存在する場合は true
	 */
	has(key: string): boolean {
		const entry = this.cache.get(key);
		if (!entry) {
			return false;
		}

		// TTL チェック
		const elapsed = Date.now() - entry.timestamp;
		if (elapsed > this.ttl) {
			this.cache.delete(key);
			this.removeFromAccessOrder(key);
			return false;
		}

		return true;
	}

	/**
	 * すべてのキャッシュキーを取得
	 *
	 * @returns キャッシュキーの配列（有効なエントリのみ）
	 */
	keys(): string[] {
		const now = Date.now();
		const validKeys: string[] = [];

		for (const [key, entry] of this.cache.entries()) {
			const elapsed = now - entry.timestamp;
			if (elapsed <= this.ttl) {
				validKeys.push(key);
			} else {
				// 期限切れエントリを削除
				this.cache.delete(key);
				this.removeFromAccessOrder(key);
			}
		}

		return validKeys;
	}

	/**
	 * アクセス順序を更新（最新に移動）
	 * @private
	 */
	private updateAccessOrder(key: string): void {
		const index = this.accessOrder.indexOf(key);
		if (index > -1) {
			this.accessOrder.splice(index, 1);
		}
		this.accessOrder.push(key);
	}

	/**
	 * アクセス順序から削除
	 * @private
	 */
	private removeFromAccessOrder(key: string): void {
		const index = this.accessOrder.indexOf(key);
		if (index > -1) {
			this.accessOrder.splice(index, 1);
		}
	}
}

/**
 * グローバルなトークンカウントキャッシュ
 * 各セッションで計算されたトークン数をメモリ内に保持
 */
export const tokenCountCache = new LRUCache<number>({
	maxSize: 1000, // 最大 1000 エントリ
	ttl: 3600000, // 1 時間の有効期限
});

// ============================================================================
// Phase 3-2: Dependency Injection Service
// ============================================================================

/**
 * Phase 3-2: キャッシュサービスの DI対応クラス
 * インターフェースを通じて依存関係を注入可能
 */
export class CacheService {
	constructor(private services: StatuslineServices) {}

	/**
	 * キャッシュされた使用制限を取得
	 */
	async getCachedUsageLimits(): Promise<UsageLimits | null> {
		// キャッシュから取得を試みる
		const cacheKey = "usage-limits";
		const cachedValue = await this.services.cacheProvider.get<UsageLimits>(cacheKey);
		if (cachedValue) {
			debug("Using cached usage limits", "verbose");
			return cachedValue;
		}

		// APIから取得
		const token = await this.services.tokenProvider.getToken();
		if (!token) {
			console.error(`[DEBUG] No API token found`);
			return null;
		}

		const limits = await this.services.usageLimitsProvider.fetchLimits(token);
		if (limits) {
			const CACHE_TTL_MS = 5 * 60 * 1000; // 5分
			await this.services.cacheProvider.set(cacheKey, limits, CACHE_TTL_MS);
		}

		return limits;
	}

	/**
	 * キャッシュされた設定を取得
	 */
	async getConfig(): Promise<StatuslineConfig> {
		const cacheKey = "config";
		const cachedValue = await this.services.cacheProvider.get<StatuslineConfig>(cacheKey);
		if (cachedValue) {
			debug("Using cached config", "verbose");
			return cachedValue;
		}

		const config = await this.services.configProvider.loadConfig();
		const CONFIG_CACHE_TTL = 60 * 1000; // 1分
		await this.services.cacheProvider.set(cacheKey, config, CONFIG_CACHE_TTL);

		return config;
	}
}

// ============================================================================
// Singleton Instance for Backward Compatibility
// ============================================================================

/**
 * Phase 3-2: デフォルトサービスインスタンス
 * 既存コードの互換性を保つ
 */
const defaultCacheService = new CacheService(createDefaultServices());

/**
 * 現在のシングルトンキャッシュサービスを取得
 * テスト時に置き換え可能
 */
let currentCacheService = defaultCacheService;

/**
 * キャッシュサービスを設定（主にテスト用）
 */
export function setCacheService(service: CacheService): void {
	currentCacheService = service;
}

/**
 * 現在のキャッシュサービスを取得
 */
export function getCacheService(): CacheService {
	return currentCacheService;
}
