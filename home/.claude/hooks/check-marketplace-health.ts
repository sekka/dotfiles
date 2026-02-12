#!/usr/bin/env bun

/**
 * マーケットプレース健全性チェック Hook (SessionStart)
 *
 * 全マーケットプレースの健全性を確認し、破損を検出した場合は修復を試みる。
 *
 * 修復ロジック:
 * 1. known_marketplaces.json を読み込み
 * 2. 各マーケットプレースの installLocation/.claude-plugin/marketplace.json を確認
 * 3. キャッシュが有効な場合はチェックをスキップ（1時間）
 * 4. 欠損している場合:
 *    - origin リモートの存在確認
 *    - git fetch --depth=1 && git reset --hard FETCH_HEAD を試みる (15秒タイムアウト)
 *    - 修復失敗時は installLocation を削除（次回起動で再クローン）
 * 5. additionalContext で結果をセッションに注入
 *
 * 制約:
 * - SessionStart hook は非ブロッキング（エラーでも process.exit(0)）
 * - git 操作は 15秒タイムアウト（環境変数 CLAUDE_GIT_TIMEOUT で設定可能）
 * - セキュリティ: ~/.claude/plugins 配下のみ削除許可
 */

import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";

// HOME 環境変数の検証
const HOME = process.env.HOME || process.env.USERPROFILE;
if (!HOME) {
	console.error("Error: HOME environment variable is not set");
	process.exit(0);
}

const KNOWN_MARKETPLACES_PATH = join(
	HOME,
	".claude",
	"plugins",
	"known_marketplaces.json",
);
const TIMEOUT_MS = Number.parseInt(
	process.env.CLAUDE_GIT_TIMEOUT || "15000",
	10,
);
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1時間
const CACHE_FILE = join(HOME, ".claude", "plugins", ".marketplace-health-cache.json");

interface Marketplace {
	installLocation: string;
}

interface KnownMarketplaces {
	[name: string]: Marketplace;
}

export interface CheckResult {
	checked: string[];
	repaired: string[];
	removed: string[];
	errors: string[];
}

interface CacheEntry {
	lastChecked: number;
	status: string;
}

/**
 * キャッシュを読み込む
 */
function loadCache(): Record<string, CacheEntry> {
	try {
		if (existsSync(CACHE_FILE)) {
			const data = JSON.parse(readFileSync(CACHE_FILE, "utf-8"));

			// スキーマ検証: オブジェクトであることを確認
			if (typeof data !== "object" || data === null || Array.isArray(data)) {
				console.warn("Cache file has invalid format");
				if (process.env.DEBUG) {
					console.debug(
						`[DEBUG] Invalid cache format: ${typeof data}`,
					);
				}
				return {};
			}

			// 各エントリを検証
			for (const [name, entry] of Object.entries(data)) {
				if (
					typeof entry !== "object" ||
					entry === null ||
					typeof (entry as any).lastChecked !== "number" ||
					typeof (entry as any).status !== "string"
				) {
					console.warn(`Removing invalid cache entry: ${name}`);
					if (process.env.DEBUG) {
						console.debug(
							`[DEBUG] Invalid entry structure: ${JSON.stringify(entry)}`,
						);
					}
					delete data[name];
				}
			}

			return data as Record<string, CacheEntry>;
		}
	} catch (error) {
		console.warn("Failed to load cache");
		if (process.env.DEBUG) {
			console.debug(
				`[DEBUG] Error details: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}
	return {};
}

/**
 * キャッシュを保存する
 */
function saveCache(cache: Record<string, CacheEntry>): void {
	try {
		writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), {
			mode: 0o600, // owner read/write only
		});
	} catch (error) {
		console.warn("Failed to save cache");
		if (process.env.DEBUG) {
			console.debug(
				`[DEBUG] Error details: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}
}

/**
 * マーケットプレースをチェックすべきか判定
 */
function shouldCheckMarketplace(
	name: string,
	cache: Record<string, CacheEntry>,
): boolean {
	const entry = cache[name];
	if (!entry) return true;

	const elapsed = Date.now() - entry.lastChecked;
	return elapsed > CACHE_DURATION_MS;
}

/**
 * known_marketplaces.json を読み込む
 */
function loadKnownMarketplaces(): KnownMarketplaces | null {
	try {
		if (!existsSync(KNOWN_MARKETPLACES_PATH)) {
			return null;
		}
		const content = readFileSync(KNOWN_MARKETPLACES_PATH, "utf-8");
		return JSON.parse(content);
	} catch (error) {
		console.error("Failed to read known_marketplaces.json");
		if (process.env.DEBUG) {
			console.debug(
				`[DEBUG] Error details: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
		return null;
	}
}

/**
 * marketplace.json の存在を確認
 */
function checkMarketplaceHealth(installLocation: string): boolean {
	const marketplaceJsonPath = join(
		installLocation,
		".claude-plugin",
		"marketplace.json",
	);
	return existsSync(marketplaceJsonPath);
}

/**
 * git fetch で修復を試みる
 */
function attemptGitRepair(installLocation: string): boolean {
	try {
		// origin リモートの存在確認
		const remoteResult = spawnSync(
			"git",
			["remote", "get-url", "origin"],
			{ cwd: installLocation, timeout: 2000, stdio: "pipe" },
		);

		if (remoteResult.status !== 0) {
			console.error(`No origin remote found in ${installLocation}`);
			return false;
		}

		// git fetch --depth=1 origin
		const fetchResult = spawnSync(
			"git",
			["fetch", "--depth=1", "origin"],
			{
				cwd: installLocation,
				timeout: TIMEOUT_MS,
				stdio: "pipe",
			},
		);

		if (fetchResult.error || fetchResult.status !== 0) {
			return false;
		}

		// git reset --hard FETCH_HEAD
		const resetResult = spawnSync(
			"git",
			["reset", "--hard", "FETCH_HEAD"],
			{
				cwd: installLocation,
				timeout: TIMEOUT_MS,
				stdio: "pipe",
			},
		);

		return resetResult.status === 0;
	} catch (error) {
		return false;
	}
}

/**
 * ディレクトリを削除（セキュリティチェック付き）
 */
function removeDirectory(installLocation: string): boolean {
	try {
		// セキュリティ: ~/.claude/plugins 配下のみ削除許可
		const allowedPath = join(HOME, ".claude", "plugins");

		// CRITICAL: resolve() で相対パスを完全に解決してから検証
		// これにより ../ などのパストラバーサル攻撃を防ぐ
		const resolvedLocation = resolve(installLocation);
		const resolvedAllowed = resolve(allowedPath);

		// ディレクトリセパレータで境界を明確にする
		// resolvedLocation === resolvedAllowed の場合も許可
		if (
			resolvedLocation !== resolvedAllowed &&
			!resolvedLocation.startsWith(resolvedAllowed + sep)
		) {
			console.error(
				`Security: Attempted to delete outside allowed directory: ${resolvedLocation}`,
			);
			if (process.env.DEBUG) {
				console.debug(
					`[DEBUG] Resolved path: ${resolvedLocation}, Allowed path: ${resolvedAllowed}`,
				);
			}
			return false;
		}

		if (!existsSync(resolvedLocation)) {
			return false;
		}

		rmSync(resolvedLocation, { recursive: true, force: true });
		console.log(`Removed corrupted directory: ${resolvedLocation}`);
		return true;
	} catch (error) {
		console.error("Failed to remove directory");
		if (process.env.DEBUG) {
			console.debug(
				`[DEBUG] Error details: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
		return false;
	}
}

/**
 * マーケットプレースの健全性をチェックして修復
 */
export function checkAndRepairMarketplaces(): CheckResult {
	const result: CheckResult = {
		checked: [],
		repaired: [],
		removed: [],
		errors: [],
	};

	const marketplaces = loadKnownMarketplaces();
	if (!marketplaces) {
		return result;
	}

	const cache = loadCache();

	for (const [name, marketplace] of Object.entries(marketplaces)) {
		const { installLocation } = marketplace;

		// ディレクトリが存在しない場合はスキップ
		if (!existsSync(installLocation)) {
			continue;
		}

		// キャッシュが有効な場合はスキップ
		if (!shouldCheckMarketplace(name, cache)) {
			continue;
		}

		result.checked.push(name);

		// 健全性チェック
		if (checkMarketplaceHealth(installLocation)) {
			// キャッシュを更新
			cache[name] = {
				lastChecked: Date.now(),
				status: "healthy",
			};
			continue;
		}

		// marketplace.json が欠損 → 修復を試みる
		console.log(
			`⚠️  Marketplace '${name}' is corrupted. Attempting repair...`,
		);

		// Step 1: git fetch で修復
		if (attemptGitRepair(installLocation)) {
			// 修復後に再度チェック
			if (checkMarketplaceHealth(installLocation)) {
				console.log(`✅ Successfully repaired '${name}' with git fetch.`);
				result.repaired.push(name);
				cache[name] = {
					lastChecked: Date.now(),
					status: "repaired",
				};
				continue;
			}
		}

		// Step 2: git fetch 失敗 → ディレクトリ削除
		console.log(
			`❌ Git repair failed for '${name}'. Removing directory for re-clone...`,
		);
		if (removeDirectory(installLocation)) {
			result.removed.push(name);
			// キャッシュからエントリを削除
			delete cache[name];
		} else {
			const errorMsg = "Failed to remove corrupted directory";
			result.errors.push(errorMsg);
		}
	}

	// キャッシュを保存
	saveCache(cache);

	return result;
}

/**
 * メイン処理
 */
function main() {
	try {
		const result = checkAndRepairMarketplaces();

		// 結果をログ出力
		if (result.checked.length > 0) {
			console.log(`🔍 Checked marketplaces: ${result.checked.join(", ")}`);
		}
		if (result.repaired.length > 0) {
			console.log(
				`🔧 Repaired marketplaces: ${result.repaired.join(", ")}`,
			);
		}
		if (result.removed.length > 0) {
			console.log(
				`🗑️  Removed corrupted marketplaces (will re-clone on next start): ${result.removed.join(", ")}`,
			);
		}
		if (result.errors.length > 0) {
			console.error(`❌ Errors: ${result.errors.join(", ")}`);
		}

		// additionalContext でセッションに結果を注入
		const context = {
			marketplaceHealth: result,
		};
		console.log(
			JSON.stringify({
				additionalContext: JSON.stringify(context),
			}),
		);

		process.exit(0);
	} catch (error) {
		console.error("Unexpected error in marketplace health check");
		if (process.env.DEBUG) {
			console.debug(
				`[DEBUG] Error details: ${error instanceof Error ? error.message : String(error)}`,
			);
		}

		// additionalContext にエラー情報を含める（簡略化）
		const context = {
			marketplaceHealth: {
				checked: [],
				repaired: [],
				removed: [],
				errors: ["Unexpected error occurred"],
			},
		};
		console.log(
			JSON.stringify({
				additionalContext: JSON.stringify(context),
			}),
		);

		process.exit(0); // 非ブロッキング
	}
}

// スクリプトとして実行された場合のみメイン処理
if (require.main === module) {
	main();
}
