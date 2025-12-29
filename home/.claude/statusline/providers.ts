// ============================================================================
// Phase 3-2: Default Dependency Injection Providers
// ============================================================================

import { homedir } from "os";
import { chmod } from "fs/promises";

import { type StatuslineConfig, DEFAULT_CONFIG } from "./config.ts";
import { debug } from "./logging.ts";
import { type UsageLimits, isValidStatuslineConfig, isValidUsageLimits } from "./utils.ts";
import {
	type TokenProvider,
	type UsageLimitsProvider,
	type ConfigProvider,
	type CacheProvider,
	type StatuslineServices,
} from "./interfaces.ts";

// ============================================================================
// Token Provider Implementation
// ============================================================================

/**
 * デフォルトのトークンプロバイダー
 * macOS Keychain からトークンを取得
 */
export class DefaultTokenProvider implements TokenProvider {
	async getToken(): Promise<string | null> {
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

			let credentials: { claudeAiOauth?: { accessToken?: string } };
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

			// 基本的なトークン形式チェック
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
}

// ============================================================================
// Usage Limits Provider Implementation
// ============================================================================

/**
 * デフォルトの使用制限プロバイダー
 * Anthropic API から制限情報を取得
 */
export class DefaultUsageLimitsProvider implements UsageLimitsProvider {
	private lastApiCallTime = 0;
	private readonly MIN_API_CALL_INTERVAL_MS = 30 * 1000; // 30秒

	async fetchLimits(token: string): Promise<UsageLimits | null> {
		try {
			// Rate limiting: 最小間隔を強制
			const now = Date.now();
			const timeSinceLastCall = now - this.lastApiCallTime;

			if (timeSinceLastCall < this.MIN_API_CALL_INTERVAL_MS) {
				const waitTime = this.MIN_API_CALL_INTERVAL_MS - timeSinceLastCall;
				debug(
					`Rate limiting: Skipping API call, wait ${Math.ceil(waitTime / 1000)}s before retry`,
					"verbose",
				);
				return null;
			}

			debug(`Fetching from API...`, "verbose");
			this.lastApiCallTime = now;

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
				return null;
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
			const errorMsg = e instanceof Error ? e.message : String(e);

			if (errorMsg.includes("timeout") || errorMsg.includes("TimeoutError")) {
				console.error(`[ERROR] API request timeout`);
			} else if (errorMsg.includes("fetch") || errorMsg.includes("Network")) {
				console.error(`[ERROR] Network error accessing API`);
			} else if (errorMsg.includes("JSON")) {
				console.error(`[ERROR] Invalid JSON response from API`);
			} else {
				console.error(`[ERROR] API request failed`);
			}
			return null;
		}
	}
}

// ============================================================================
// Config Provider Implementation
// ============================================================================

/**
 * デフォルトの設定プロバイダー
 * ファイルシステムから設定を読み込み
 */
export class DefaultConfigProvider implements ConfigProvider {
	async loadConfig(): Promise<StatuslineConfig> {
		const HOME = homedir();

		// ユーザー設定を試行
		const localConfigFile = `${HOME}/.claude/statusline-config.json`;
		let validatedConfig: Partial<StatuslineConfig> | null = null;

		try {
			const rawConfig = await Bun.file(localConfigFile).json();
			console.error(`[DEBUG] Loaded user config from ${localConfigFile}`);

			if (isValidStatuslineConfig(rawConfig)) {
				validatedConfig = rawConfig;
				console.error(`[DEBUG] Config validated successfully from ${localConfigFile}`);
			} else {
				console.error(`[DEBUG] Config validation failed from ${localConfigFile}`);
			}
		} catch {
			console.error(`[DEBUG] User config not found at ${localConfigFile}`);
		}

		// dotfiles設定を試行（フォールバック）
		if (!validatedConfig) {
			const dotfilesConfigFile = `${HOME}/dotfiles/home/.claude/statusline-config.json`;
			try {
				const rawConfig = await Bun.file(dotfilesConfigFile).json();
				console.error(`[DEBUG] Loaded dotfiles config from ${dotfilesConfigFile}`);

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

		// マージされた設定を返す
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

		console.error(`[DEBUG] No config found, using DEFAULT_CONFIG`);
		return DEFAULT_CONFIG;
	}
}

// ============================================================================
// File-based Cache Provider Implementation
// ============================================================================

/**
 * ファイルベースのキャッシュプロバイダー
 * ディスク上にキャッシュを保存
 */
export class FileCacheProvider implements CacheProvider {
	private readonly cacheDir: string;

	constructor(cacheDir: string = `${homedir()}/.claude/data`) {
		this.cacheDir = cacheDir;
	}

	private getCachePath(key: string): string {
		// キーをファイル名に正規化
		const normalized = key.replace(/[^a-z0-9-]/gi, "_");
		return `${this.cacheDir}/${normalized}.json`;
	}

	async get<T>(key: string): Promise<T | null> {
		try {
			const cachePath = this.getCachePath(key);
			const cache: { data: T; timestamp: number } = await Bun.file(cachePath).json();
			debug(`Cache loaded from ${cachePath}`, "verbose");
			return cache.data;
		} catch {
			debug(`Cache miss for key: ${key}`, "verbose");
			return null;
		}
	}

	async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
		try {
			const cachePath = this.getCachePath(key);

			// ディレクトリが存在することを確認
			try {
				await Bun.file(this.cacheDir).isDirectory();
			} catch {
				const { mkdir } = await import("fs/promises");
				await mkdir(this.cacheDir, { recursive: true, mode: 0o700 });
			}

			const content = JSON.stringify({ data: value, timestamp: Date.now() }, null, 2);
			await Bun.write(cachePath, content);
			await chmod(cachePath, 0o600);
			debug(`Cache saved to ${cachePath}`, "verbose");
		} catch (e) {
			const errorMsg = e instanceof Error ? e.message : String(e);
			console.error(`[ERROR] Failed to write cache: ${errorMsg}`);
		}
	}

	async clear(key: string): Promise<void> {
		try {
			const cachePath = this.getCachePath(key);
			const { unlink } = await import("fs/promises");
			await unlink(cachePath);
			debug(`Cache cleared for key: ${key}`, "verbose");
		} catch {
			debug(`Cache clear failed for key: ${key}`, "verbose");
		}
	}
}

// ============================================================================
// In-Memory Cache Provider (for testing)
// ============================================================================

/**
 * メモリベースのキャッシュプロバイダー
 * テスト用途向け
 */
export class MemoryCacheProvider implements CacheProvider {
	private cache = new Map<string, { data: unknown; expiresAt: number }>();

	async get<T>(key: string): Promise<T | null> {
		const entry = this.cache.get(key);
		if (!entry) return null;

		if (Date.now() > entry.expiresAt) {
			this.cache.delete(key);
			return null;
		}

		return entry.data as T;
	}

	async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
		this.cache.set(key, {
			data: value,
			expiresAt: Date.now() + ttlMs,
		});
	}

	async clear(key: string): Promise<void> {
		this.cache.delete(key);
	}
}

// ============================================================================
// Factory for Creating Default Services
// ============================================================================

/**
 * デフォルトのStatuslineServicesを作成
 */
export function createDefaultServices(): StatuslineServices {
	return {
		tokenProvider: new DefaultTokenProvider(),
		usageLimitsProvider: new DefaultUsageLimitsProvider(),
		configProvider: new DefaultConfigProvider(),
		cacheProvider: new FileCacheProvider(),
	};
}

/**
 * テスト用のStatuslineServicesを作成（メモリキャッシュ使用）
 */
export function createTestServices(): StatuslineServices {
	return {
		tokenProvider: new DefaultTokenProvider(),
		usageLimitsProvider: new DefaultUsageLimitsProvider(),
		configProvider: new DefaultConfigProvider(),
		cacheProvider: new MemoryCacheProvider(),
	};
}
