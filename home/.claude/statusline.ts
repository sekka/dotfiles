#!/usr/bin/env bun

// Claude Code statusline hook - TypeScript + Bun version
// 既存のNode.js版statusline.jsの機能を完全に移行

import { existsSync } from "fs";
import { resolve } from "path";
import { realpath, chmod } from "fs/promises";
import { homedir } from "os";

// ============================================================================
// Phase 2.1 & 3.1: Debug Level Control
// ============================================================================

type DebugLevel = "off" | "basic" | "verbose";

// Phase 3.1: DEBUG_LEVEL enum 検証の実装
function validateDebugLevel(value: string | undefined): DebugLevel {
	const validLevels: DebugLevel[] = ["off", "basic", "verbose"];
	const level = (value || "off").toLowerCase();
	return validLevels.includes(level as DebugLevel) ? (level as DebugLevel) : "off";
}

const DEBUG_LEVEL: DebugLevel = validateDebugLevel(process.env.STATUSLINE_DEBUG);

function debug(message: string, level: "basic" | "verbose" = "basic"): void {
	if (DEBUG_LEVEL === "off") return;
	if (DEBUG_LEVEL === "basic" && level === "verbose") return;
	console.error(`[DEBUG] ${message}`);
}

// ============================================================================
// Type Definitions
// ============================================================================

interface HookInput {
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
		current_usage: {
			input_tokens: number;
			output_tokens: number;
			cache_creation_input_tokens: number;
			cache_read_input_tokens: number;
		} | null;
	};
	transcript_path?: string;
}

interface GitStatus {
	branch: string;
	hasChanges: boolean;
	aheadBehind: string | null;
	diffStats: string | null;
}

interface TranscriptEntry {
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

interface StatuslineConfig {
	git: {
		showBranch: boolean; // ブランチ名表示
		showAheadBehind: boolean; // ahead/behind表示
		showDiffStats: boolean; // 差分統計（+/-）表示
		alwaysShowMain: boolean; // main/masterでもahead/behind表示
	};
	rateLimits: {
		showFiveHour: boolean; // 5時間レート制限表示
		showWeekly: boolean; // 週間レート制限表示
		showPeriodCost: boolean; // 期間コスト（$119）表示
	};
	costs: {
		showDailyCost: boolean; // 日次コスト表示
		showSessionCost: boolean; // セッションコスト表示
	};
	tokens: {
		showContextUsage: boolean; // コンテキスト使用率表示
	};
	session: {
		showSessionId: boolean; // セッションID表示
		showElapsedTime: boolean; // 経過時間表示
	};
	display: {
		showSeparators: boolean; // メトリクス間の区切り表示
	};
}

// ============================================================================
// ANSI Color Helpers (no external dependencies)
// ============================================================================

const colors = {
	reset: (s: string) => `${s}\x1b[0m`,
	gray: (s: string) => `\x1b[90m${s}\x1b[0m`,
	red: (s: string) => `\x1b[91m${s}\x1b[0m`,
	green: (s: string) => `\x1b[32m${s}\x1b[0m`,
	yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
	cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
	white: (s: string) => `\x1b[37m${s}\x1b[0m`,
	dimWhite: (s: string) => `\x1b[37m${s}\x1b[39m`,
	lightGray: (s: string) => `\x1b[97m${s}\x1b[0m`,
	peach: (s: string) => `\x1b[38;5;216m${s}\x1b[0m`,
	darkOrange: (s: string) => `\x1b[38;5;202m${s}\x1b[0m`,
};

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_CONFIG: StatuslineConfig = {
	git: {
		showBranch: true,
		showAheadBehind: true,
		showDiffStats: true,
		alwaysShowMain: false,
	},
	rateLimits: {
		showFiveHour: true,
		showWeekly: true,
		showPeriodCost: true,
	},
	costs: {
		showDailyCost: true,
		showSessionCost: true,
	},
	tokens: {
		showContextUsage: true,
	},
	session: {
		showSessionId: true,
		showElapsedTime: false,
	},
	display: {
		showSeparators: false,
	},
};

// ============================================================================
// Validation Helpers
// ============================================================================

// Phase 3.4: sanitizeForLogging() の型混合解決
// デバッグログ用のセンシティブ情報をマスキングする関数
function sanitizeForLogging(obj: unknown): unknown {
	const sensitiveKeys = new Set([
		"token",
		"accesstoken",
		"password",
		"secret",
		"refreshtoken",
		"credentials",
	]);

	// Phase 3.4: 配列を明示的に処理
	if (Array.isArray(obj)) {
		return obj.map((item) => sanitizeForLogging(item));
	}

	// Phase 3.4: オブジェクトを処理
	if (typeof obj === "object" && obj !== null) {
		const sanitized: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(obj)) {
			if (sensitiveKeys.has(key.toLowerCase())) {
				sanitized[key] = "***REDACTED***";
			} else if (value !== null && typeof value === "object") {
				sanitized[key] = sanitizeForLogging(value);
			} else {
				sanitized[key] = value;
			}
		}
		return sanitized;
	}

	return obj;
}

// ============================================================================
// Phase 4.1: Security Module
// ============================================================================

class SecurityValidator {
	/**
	 * パストラバーサル攻撃を防ぐためにファイルパスを検証
	 */
	static async validatePath(
		baseDir: string,
		filePath: string,
	): Promise<{ isValid: boolean; resolvedPath?: string }> {
		try {
			const resolvedBase = await realpath(baseDir);
			const resolvedPath = await realpath(filePath);

			if (!resolvedPath.startsWith(resolvedBase)) {
				console.error(`[SECURITY] Path traversal attempt: ${filePath}`);
				return { isValid: false };
			}

			return { isValid: true, resolvedPath };
		} catch (e) {
			const errorMsg = e instanceof Error ? e.message : String(e);
			debug(`Path validation failed: ${errorMsg}`, "verbose");
			return { isValid: false };
		}
	}

	/**
	 * ファイルサイズ制限チェック
	 */
	static validateFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
		return size <= maxSize;
	}

	/**
	 * バイナリファイル拡張子チェック
	 */
	static isBinaryExtension(filePath: string): boolean {
		const BINARY_EXTENSIONS = new Set([
			".png",
			".jpg",
			".jpeg",
			".gif",
			".bmp",
			".ico",
			".mp4",
			".mov",
			".avi",
			".mkv",
			".zip",
			".tar",
			".gz",
			".7z",
			".bin",
			".so",
			".dylib",
			".dll",
			".pdf",
			".doc",
			".docx",
		]);

		const ext = filePath.toLowerCase();
		const dotIndex = ext.lastIndexOf(".");
		if (dotIndex === -1) return false;

		return BINARY_EXTENSIONS.has(ext.substring(dotIndex));
	}
}

// ============================================================================
// Phase 4.4: Unified Error Handling
// ============================================================================

enum ErrorCategory {
	PERMISSION_DENIED = "PERMISSION_DENIED",
	NOT_FOUND = "NOT_FOUND",
	TIMEOUT = "TIMEOUT",
	JSON_PARSE = "JSON_PARSE",
	NETWORK = "NETWORK",
	UNKNOWN = "UNKNOWN",
}

/**
 * Phase 4.4: エラーを分類する
 * Node.js のエラーコードを優先して判定し、メッセージベースのフォールバックを使用
 */
function categorizeError(e: unknown): ErrorCategory {
	const errorMsg = e instanceof Error ? e.message : String(e);
	const code = (e as NodeJS.ErrnoException).code;

	// コードベースの判定を優先
	if (code === "EACCES") return ErrorCategory.PERMISSION_DENIED;
	if (code === "ENOENT") return ErrorCategory.NOT_FOUND;

	// メッセージベースのフォールバック
	if (errorMsg.includes("timeout") || errorMsg.includes("TimeoutError")) {
		return ErrorCategory.TIMEOUT;
	}
	if (errorMsg.includes("JSON") || errorMsg.includes("parse")) {
		return ErrorCategory.JSON_PARSE;
	}
	if (errorMsg.includes("fetch") || errorMsg.includes("Network")) {
		return ErrorCategory.NETWORK;
	}

	return ErrorCategory.UNKNOWN;
}

/**
 * Phase 4.4: エラーを分類してログ出力する
 * エラー種別に応じて適切なログレベルで出力
 */
function logCategorizedError(e: unknown, context: string): void {
	const category = categorizeError(e);
	const errorMsg = e instanceof Error ? e.message : String(e);

	switch (category) {
		case ErrorCategory.PERMISSION_DENIED:
			console.error(`[ERROR] ${context}: Permission denied - ${errorMsg}`);
			break;
		case ErrorCategory.NOT_FOUND:
			debug(`${context}: File not found - ${errorMsg}`, "verbose");
			break;
		case ErrorCategory.TIMEOUT:
			console.error(`[ERROR] ${context}: Operation timed out - ${errorMsg}`);
			break;
		case ErrorCategory.JSON_PARSE:
			console.error(`[ERROR] ${context}: JSON parsing failed - ${errorMsg}`);
			break;
		case ErrorCategory.NETWORK:
			console.error(`[ERROR] ${context}: Network error - ${errorMsg}`);
			break;
		default:
			console.error(`[ERROR] ${context}: ${errorMsg}`);
	}
}

// API レスポンス検証関数
function isValidUsageLimits(data: unknown): data is {
	five_hour: { utilization: number; resets_at: string | null } | null;
	seven_day: { utilization: number; resets_at: string | null } | null;
} {
	if (typeof data !== "object" || data === null) return false;
	const obj = data as Record<string, unknown>;

	// five_hour のチェック
	if (obj.five_hour !== null && obj.five_hour !== undefined) {
		if (typeof obj.five_hour !== "object" || obj.five_hour === null) return false;
		const fh = obj.five_hour as Record<string, unknown>;
		if (typeof fh.utilization !== "number" || fh.utilization < 0 || fh.utilization > 100)
			return false;
		if (fh.resets_at !== null && typeof fh.resets_at !== "string") return false;
	}

	// seven_day のチェック
	if (obj.seven_day !== null && obj.seven_day !== undefined) {
		if (typeof obj.seven_day !== "object" || obj.seven_day === null) return false;
		const sd = obj.seven_day as Record<string, unknown>;
		if (typeof sd.utilization !== "number" || sd.utilization < 0 || sd.utilization > 100)
			return false;
		if (sd.resets_at !== null && typeof sd.resets_at !== "string") return false;
	}

	return true;
}

// StatuslineConfig 検証関数
function isValidStatuslineConfig(data: unknown): data is Partial<StatuslineConfig> {
	if (typeof data !== "object" || data === null) return false;
	const obj = data as Record<string, unknown>;

	// git セクション
	if (obj.git !== undefined) {
		if (typeof obj.git !== "object" || obj.git === null) return false;
		const git = obj.git as Record<string, unknown>;
		if (git.showBranch !== undefined && typeof git.showBranch !== "boolean") return false;
		if (git.showAheadBehind !== undefined && typeof git.showAheadBehind !== "boolean") return false;
		if (git.showDiffStats !== undefined && typeof git.showDiffStats !== "boolean") return false;
		if (git.alwaysShowMain !== undefined && typeof git.alwaysShowMain !== "boolean") return false;
	}

	// rateLimits セクション
	if (obj.rateLimits !== undefined) {
		if (typeof obj.rateLimits !== "object" || obj.rateLimits === null) return false;
		const rl = obj.rateLimits as Record<string, unknown>;
		if (rl.showFiveHour !== undefined && typeof rl.showFiveHour !== "boolean") return false;
		if (rl.showWeekly !== undefined && typeof rl.showWeekly !== "boolean") return false;
		if (rl.showPeriodCost !== undefined && typeof rl.showPeriodCost !== "boolean") return false;
	}

	// costs セクション
	if (obj.costs !== undefined) {
		if (typeof obj.costs !== "object" || obj.costs === null) return false;
		const costs = obj.costs as Record<string, unknown>;
		if (costs.showDailyCost !== undefined && typeof costs.showDailyCost !== "boolean") return false;
		if (costs.showSessionCost !== undefined && typeof costs.showSessionCost !== "boolean")
			return false;
	}

	// tokens セクション
	if (obj.tokens !== undefined) {
		if (typeof obj.tokens !== "object" || obj.tokens === null) return false;
		const tokens = obj.tokens as Record<string, unknown>;
		if (tokens.showContextUsage !== undefined && typeof tokens.showContextUsage !== "boolean")
			return false;
	}

	// session セクション
	if (obj.session !== undefined) {
		if (typeof obj.session !== "object" || obj.session === null) return false;
		const session = obj.session as Record<string, unknown>;
		if (session.showSessionId !== undefined && typeof session.showSessionId !== "boolean")
			return false;
		if (session.showElapsedTime !== undefined && typeof session.showElapsedTime !== "boolean")
			return false;
	}

	// display セクション
	if (obj.display !== undefined) {
		if (typeof obj.display !== "object" || obj.display === null) return false;
		const display = obj.display as Record<string, unknown>;
		if (display.showSeparators !== undefined && typeof display.showSeparators !== "boolean")
			return false;
	}

	return true;
}

// ============================================================================
// Git Operations
// ============================================================================

async function getGitStatus(currentDir: string, config: StatuslineConfig): Promise<GitStatus> {
	const gitDir = `${currentDir}/.git`;
	const gitExists = existsSync(gitDir);

	if (!gitExists) {
		return {
			branch: "",
			hasChanges: false,
			aheadBehind: null,
			diffStats: null,
		};
	}

	try {
		// Get branch name
		const branchProc = Bun.spawn({
			cmd: ["git", "--no-optional-locks", "branch", "--show-current"],
			cwd: currentDir,
			stdout: "pipe",
			stderr: "pipe",
		});

		const branchStdout = await new Response(branchProc.stdout).text();
		const branch = branchStdout.trim();

		if (!branch) {
			return {
				branch: "",
				hasChanges: false,
				aheadBehind: null,
				diffStats: null,
			};
		}

		// Get ahead/behind (respects alwaysShowMain config)
		let aheadBehind: string | null = null;
		if (config.git.alwaysShowMain || (branch !== "main" && branch !== "master")) {
			aheadBehind = await getAheadBehind(currentDir);
		}

		// Get diff stats
		const diffStats = await getDiffStats(currentDir);

		const hasChanges = aheadBehind !== null || diffStats !== null;

		return {
			branch,
			hasChanges,
			aheadBehind,
			diffStats,
		};
	} catch (e) {
		// Phase 2.5: Enhanced error messages
		const errorMsg = e instanceof Error ? e.message : String(e);
		debug(`Git status error: ${errorMsg}`, "verbose");

		return {
			branch: "",
			hasChanges: false,
			aheadBehind: null,
			diffStats: null,
		};
	}
}

async function getAheadBehind(cwd: string): Promise<string | null> {
	try {
		// Determine parent branch (origin/main or origin/master)
		let parentBranch = "";

		try {
			const mainProc = Bun.spawn({
				cmd: ["git", "--no-optional-locks", "rev-parse", "--verify", "origin/main"],
				cwd,
				stdout: "pipe",
				stderr: "pipe",
			});
			const mainResult = await new Response(mainProc.stdout).text();
			if (mainResult.trim()) {
				parentBranch = "origin/main";
			}
		} catch {
			// Try master
		}

		if (!parentBranch) {
			try {
				const masterProc = Bun.spawn({
					cmd: ["git", "--no-optional-locks", "rev-parse", "--verify", "origin/master"],
					cwd,
					stdout: "pipe",
					stderr: "pipe",
				});
				const masterResult = await new Response(masterProc.stdout).text();
				if (masterResult.trim()) {
					parentBranch = "origin/master";
				}
			} catch {
				return null;
			}
		}

		if (!parentBranch) return null;

		// Get ahead count
		const aheadProc = Bun.spawn({
			cmd: ["git", "--no-optional-locks", "rev-list", "--count", `${parentBranch}..HEAD`],
			cwd,
			stdout: "pipe",
			stderr: "pipe",
		});

		const aheadStr = (await new Response(aheadProc.stdout).text()).trim();
		const ahead = parseInt(aheadStr || "0", 10);

		// Get behind count
		const behindProc = Bun.spawn({
			cmd: ["git", "--no-optional-locks", "rev-list", "--count", `HEAD..${parentBranch}`],
			cwd,
			stdout: "pipe",
			stderr: "pipe",
		});

		const behindStr = (await new Response(behindProc.stdout).text()).trim();
		const behind = parseInt(behindStr || "0", 10);

		// Format result (yellow)
		if (ahead > 0 && behind > 0) {
			return `\x1b[33m↑${ahead}↓${behind}\x1b[0m`;
		}
		if (ahead > 0) {
			return `\x1b[33m↑${ahead}\x1b[0m`;
		}
		if (behind > 0) {
			return `\x1b[33m↓${behind}\x1b[0m`;
		}

		return null;
	} catch (e) {
		// Phase 2.5: Enhanced error messages
		const errorMsg = e instanceof Error ? e.message : String(e);
		debug(`Failed to get ahead/behind count: ${errorMsg}`, "verbose");
		return null;
	}
}

// ============================================================================
// Phase 4.2: Untracked File Statistics - Responsibility Separation
// ============================================================================

/**
 * Phase 4.2: untracked ファイルの統計を読み取る
 * getDiffStats() から分離された専用関数
 */
async function readUntrackedFileStats(
	cwd: string,
	files: string[],
): Promise<{ added: number; skipped: number }> {
	let added = 0;
	let skipped = 0;

	const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

	let resolvedCwd: string;
	try {
		resolvedCwd = await realpath(cwd);
	} catch (e) {
		const errorMsg = e instanceof Error ? e.message : String(e);
		debug(`Cannot resolve working directory ${cwd}: ${errorMsg}`, "verbose");
		return { added: 0, skipped: files.length }; // 全てをスキップ扱い
	}

	for (const file of files) {
		if (!file.trim()) {
			skipped++;
			continue;
		}

		// バイナリファイルをスキップ
		if (SecurityValidator.isBinaryExtension(file)) {
			skipped++;
			continue;
		}

		try {
			const filePath = resolve(resolvedCwd, file);

			// Phase 4.1: SecurityValidator を使用したパス検証
			const validation = await SecurityValidator.validatePath(resolvedCwd, filePath);
			if (!validation.isValid || !validation.resolvedPath) {
				skipped++;
				continue;
			}

			// Phase 4.1: ファイルサイズ検証
			const fileObj = Bun.file(validation.resolvedPath);
			const stat = await fileObj.stat();

			if (!SecurityValidator.validateFileSize(stat.size, MAX_FILE_SIZE)) {
				skipped++;
				continue;
			}

			const fileContent = await fileObj.text();
			added += fileContent.split("\n").length;
		} catch (e) {
			const errorMsg = e instanceof Error ? e.message : String(e);
			debug(`Failed to read untracked file ${file}: ${errorMsg}`, "verbose");
			skipped++;
		}
	}

	return { added, skipped };
}

async function getDiffStats(cwd: string): Promise<string | null> {
	try {
		// Get unstaged diff
		const unstagedProc = Bun.spawn({
			cmd: ["git", "--no-optional-locks", "diff", "--numstat"],
			cwd,
			stdout: "pipe",
			stderr: "pipe",
		});

		const unstagedDiff = await new Response(unstagedProc.stdout).text();

		// Get staged diff
		const stagedProc = Bun.spawn({
			cmd: ["git", "--no-optional-locks", "diff", "--cached", "--numstat"],
			cwd,
			stdout: "pipe",
			stderr: "pipe",
		});

		const stagedDiff = await new Response(stagedProc.stdout).text();

		// Parse diff stats
		let added = 0;
		let deleted = 0;

		const parseDiff = (diffOutput: string) => {
			for (const line of diffOutput.split("\n")) {
				if (!line.trim()) continue;
				const parts = line.split("\t");
				if (parts.length >= 2) {
					const addCount = parseInt(parts[0], 10);
					const delCount = parseInt(parts[1], 10);
					if (!isNaN(addCount)) added += addCount;
					if (!isNaN(delCount)) deleted += delCount;
				}
			}
		};

		parseDiff(unstagedDiff);
		parseDiff(stagedDiff);

		// Get untracked files
		const untrackedProc = Bun.spawn({
			cmd: ["git", "--no-optional-locks", "ls-files", "--others", "--exclude-standard"],
			cwd,
			stdout: "pipe",
			stderr: "pipe",
		});

		const untrackedOutput = await new Response(untrackedProc.stdout).text();
		const untrackedFiles = untrackedOutput.trim().split("\n");

		// Phase 4.2: 分離された関数を呼び出し
		const { added: untrackedAdded } = await readUntrackedFileStats(cwd, untrackedFiles);
		added += untrackedAdded;

		// Format result
		if (added > 0 || deleted > 0) {
			return `\x1b[32m+${added}\x1b[0m \x1b[31m-${deleted}\x1b[0m`;
		}

		return null;
	} catch (e) {
		// Phase 2.5: Enhanced error messages
		const errorMsg = e instanceof Error ? e.message : String(e);
		debug(`Failed to get diff stats: ${errorMsg}`, "verbose");
		return null;
	}
}

// ============================================================================
// Token Calculation
// ============================================================================

async function calculateTokensFromTranscript(transcriptPath: string): Promise<number> {
	try {
		const file = Bun.file(transcriptPath);
		const content = await file.text();
		const lines = content.trim().split("\n");

		let lastUsage: TranscriptEntry["message"]["usage"] | null = null;

		for (const line of lines) {
			try {
				const entry: TranscriptEntry = JSON.parse(line);

				if (entry.type === "assistant" && entry.message?.usage) {
					lastUsage = entry.message.usage;
				}
			} catch {
				// Skip invalid JSON lines
			}
		}

		if (!lastUsage) {
			return 0;
		}

		const totalTokens =
			(lastUsage.input_tokens || 0) +
			(lastUsage.output_tokens || 0) +
			(lastUsage.cache_creation_input_tokens || 0) +
			(lastUsage.cache_read_input_tokens || 0);

		return totalTokens;
	} catch {
		return 0;
	}
}

async function getContextTokens(data: HookInput): Promise<{ tokens: number; percentage: number }> {
	const contextWindowSize = data.context_window?.context_window_size || 200000;

	// Try current_usage first (more accurate)
	if (data.context_window?.current_usage) {
		const usage = data.context_window.current_usage;
		const totalTokens =
			(usage.input_tokens || 0) +
			(usage.output_tokens || 0) +
			(usage.cache_creation_input_tokens || 0) +
			(usage.cache_read_input_tokens || 0);

		const percentage = Math.min(100, Math.round((totalTokens / contextWindowSize) * 100));

		return { tokens: totalTokens, percentage };
	}

	// Fallback: calculate from transcript
	if (data.session_id && data.transcript_path) {
		const tokens = await calculateTokensFromTranscript(data.transcript_path);
		const percentage = Math.min(100, Math.round((tokens / contextWindowSize) * 100));

		return { tokens, percentage };
	}

	return { tokens: 0, percentage: 0 };
}

// ============================================================================
// Format Helpers
// ============================================================================

function formatTokenCount(tokens: number): string {
	if (tokens >= 1000000) {
		return `${(tokens / 1000000).toFixed(1)}M`;
	}
	if (tokens >= 1000) {
		return `${(tokens / 1000).toFixed(1)}K`;
	}
	return tokens.toString();
}

function formatCost(cost: number): string {
	if (cost >= 1) {
		return `$${cost.toFixed(2)}`;
	}
	if (cost >= 0.01) {
		return `$${cost.toFixed(2)}`;
	}
	if (cost > 0) {
		return `$${cost.toFixed(3)}`;
	}
	return "$0.00";
}

function formatElapsedTime(ms: number): string {
	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	if (hours > 0) {
		return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
	}
	return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// Phase 1.3: Async file operations
// Phase 3.2: getSessionElapsedTime() の stat() エラー処理改善
async function getSessionElapsedTime(transcriptPath: string): Promise<string> {
	try {
		const file = Bun.file(transcriptPath);
		const stats = await file.stat();

		// Phase 3.2: birthtimeMs が無効な値をチェック
		if (!stats.birthtimeMs || stats.birthtimeMs === 0) {
			debug("Invalid birthtimeMs in transcript file", "verbose");
			return "";
		}

		const elapsed = Date.now() - stats.birthtimeMs;
		return formatElapsedTime(elapsed);
	} catch (e) {
		const errorMsg = e instanceof Error ? e.message : String(e);
		debug(`Failed to get session elapsed time: ${errorMsg}`, "verbose");
		return "";
	}
}

// ============================================================================
// Main Statusline Builder
// ============================================================================

// Phase 2.2: buildFirstLine - builds first line with model/dir/git info and session ID
function buildFirstLine(
	model: string,
	dirName: string,
	gitPart: string,
	sessionId: string,
	config: StatuslineConfig,
): string {
	let result = `${colors.cyan(model)} 📁 ${colors.gray(dirName)}${gitPart ? ` 🌿 ${gitPart}` : ""}`;
	if (config.session.showSessionId) {
		result += ` ${colors.gray(sessionId)}`;
	}
	return result;
}

// Phase 2.2: buildMetricsLine - builds second line with all metrics
async function buildMetricsLine(
	config: StatuslineConfig,
	contextTokens: number,
	contextPercentage: number,
	usageLimits: UsageLimits | null,
	todayCost: number,
	sessionTimeDisplay: string,
	costDisplay: string,
	data: HookInput,
): Promise<string> {
	const parts: string[] = [];

	// Session elapsed time and cost (with config) - S first
	if (config.session.showElapsedTime && sessionTimeDisplay) {
		const sessionPart = `${colors.gray("S:")} ${sessionTimeDisplay} ${costDisplay}`;
		parts.push(sessionPart);
	}

	// Token and percentage info (with config) - T second
	if (config.tokens.showContextUsage) {
		const contextWindowSize = data.context_window?.context_window_size || 200000;
		const bar = formatBrailleProgressBar(contextPercentage, 6);
		const contextTokenStr = (contextTokens / 1000).toFixed(1);
		const contextSizeStr = (contextWindowSize / 1000).toFixed(1);
		const tokensPart = `${colors.gray("T:")} ${bar} ${colors.white(contextPercentage.toString())}${colors.gray("%")} ${colors.white(contextTokenStr)}${colors.gray("K")}${colors.gray("/")}${colors.gray(contextSizeStr)}${colors.gray("K")}`;
		parts.push(tokensPart);
	}

	// 5-hour rate limit (with config) - L third
	if (config.rateLimits.showFiveHour && usageLimits?.five_hour) {
		const fiveHour = usageLimits.five_hour;
		const bar = formatBrailleProgressBar(fiveHour.utilization);

		// Get period cost
		const periodCost = fiveHour.resets_at ? await getPeriodCost(fiveHour.resets_at) : 0;

		// Add cost display if >= $0.01 (respects showPeriodCost config)
		const costDisplayFiveHour =
			config.rateLimits.showPeriodCost && periodCost >= 0.01
				? `${colors.gray("$")}${colors.dimWhite(periodCost.toFixed(2))} `
				: "";

		let limitsPart = `${colors.gray("L:")} ${costDisplayFiveHour}${bar} ${colors.lightGray(fiveHour.utilization.toString())}${colors.gray("%")}`;

		if (fiveHour.resets_at) {
			const resetDate = formatResetDateOnly(fiveHour.resets_at);
			const timeLeft = formatResetTime(fiveHour.resets_at);
			limitsPart += ` ${colors.gray(`(${resetDate}|${timeLeft})`)}`;
		}

		parts.push(limitsPart);
	}

	// Daily cost (with config, show if >= $0.01) - D fourth
	if (config.costs.showDailyCost && todayCost >= 0.01) {
		const dailyCostDisplay = `${colors.gray("D:")} ${colors.gray("$")}${colors.dimWhite(todayCost.toFixed(1))}`;
		parts.push(dailyCostDisplay);
	}

	// Weekly rate limit (with config) - W fifth
	if (config.rateLimits.showWeekly && usageLimits?.seven_day) {
		const sevenDay = usageLimits.seven_day;
		const bar = formatBrailleProgressBar(sevenDay.utilization);
		let weeklyPart = `${colors.gray("W:")} ${bar} ${colors.lightGray(sevenDay.utilization.toString())}${colors.gray("%")}`;

		if (sevenDay.resets_at) {
			const resetDate = formatResetDateOnly(sevenDay.resets_at);
			const timeLeft = formatResetTime(sevenDay.resets_at);
			weeklyPart += ` ${colors.gray(`(${resetDate}|${timeLeft})`)}`;
		}

		parts.push(weeklyPart);
	}

	// Build metrics line with optional separator (・) between sections
	if (parts.length === 0) {
		return "";
	}

	let metricsLine = parts[0]; // First section
	if (parts.length > 1) {
		const separator = config.display.showSeparators ? ` ${colors.gray("・")} ` : " ";
		metricsLine += separator + parts.slice(1).join(separator);
	}

	return metricsLine;
}

async function buildStatusline(data: HookInput): Promise<string> {
	// Phase 4.3: Load configuration (with caching)
	const config = await loadConfigCached();

	const model = data.model?.display_name || "Unknown";
	const currentDir = data.workspace?.current_dir || data.cwd || ".";
	const dirName = currentDir.split("/").pop() || currentDir;

	// Phase 1.1: Parallel execution of independent async operations
	const [gitStatus, contextInfo, usageLimits, todayCost] = await Promise.all([
		getGitStatus(currentDir, config),
		getContextTokens(data),
		getCachedUsageLimits(),
		getTodayCost(),
	]);

	const { tokens: contextTokens, percentage } = contextInfo;

	// Build git part with config
	let gitPart = "";
	if (config.git.showBranch && gitStatus.branch) {
		gitPart = colors.gray(gitStatus.branch);

		if (gitStatus.hasChanges) {
			const changes: string[] = [];

			if (config.git.showAheadBehind && gitStatus.aheadBehind) {
				changes.push(gitStatus.aheadBehind);
			}

			if (config.git.showDiffStats && gitStatus.diffStats) {
				changes.push(gitStatus.diffStats);
			}

			if (changes.length > 0) {
				gitPart += " " + changes.join(" ");
			}
		}
	}

	// Get cost and duration
	const costNum =
		data.cost.total_cost_usd >= 1
			? data.cost.total_cost_usd.toFixed(2)
			: data.cost.total_cost_usd >= 0.01
				? data.cost.total_cost_usd.toFixed(2)
				: data.cost.total_cost_usd.toFixed(3);
	const costDisplay = `${colors.gray("$")}${colors.white(costNum)}`;
	const durationDisplay = formatElapsedTime(data.cost.total_duration_ms);

	// Get session time if available
	let sessionTimeDisplay = "";
	if (data.session_id && data.transcript_path) {
		sessionTimeDisplay = await getSessionElapsedTime(data.transcript_path);
	}

	debug(`usageLimits: ${JSON.stringify(usageLimits)}`, "basic");

	// Build status lines
	const firstLine = buildFirstLine(model, dirName, gitPart, data.session_id, config);
	const metricsLine = await buildMetricsLine(
		config,
		contextTokens,
		percentage,
		usageLimits,
		todayCost,
		sessionTimeDisplay,
		costDisplay,
		data,
	);

	return metricsLine ? `${firstLine}\n${metricsLine}` : firstLine;
}

// ============================================================================
// Rate Limit Features (Phase 2)
// ============================================================================

interface UsageLimits {
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
		const credentials: Credentials = JSON.parse(stdout.trim());
		return credentials.claudeAiOauth.accessToken;
	} catch {
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

function formatBrailleProgressBar(percentage: number, length = 10): string {
	const brailleChars = ["⣀", "⣄", "⣤", "⣦", "⣶", "⣷", "⣿"];
	const totalSteps = length * (brailleChars.length - 1);
	const currentStep = Math.round((percentage / 100) * totalSteps);

	const fullBlocks = Math.floor(currentStep / (brailleChars.length - 1));
	const partialIndex = currentStep % (brailleChars.length - 1);
	const emptyBlocks = length - fullBlocks - (partialIndex > 0 ? 1 : 0);

	const fullPart = "⣿".repeat(fullBlocks);
	const partialPart = partialIndex > 0 ? brailleChars[partialIndex] : "";
	const emptyPart = "⣀".repeat(emptyBlocks);

	// Progressive color: 0-50% gray, 51-70% yellow, 71-90% orange, 91-100% red
	let colorFn = colors.gray;
	if (percentage > 50 && percentage <= 70) {
		colorFn = colors.yellow;
	} else if (percentage > 70 && percentage <= 90) {
		colorFn = (s: string) => `\x1b[38;5;208m${s}\x1b[0m`; // orange
	} else if (percentage > 90) {
		colorFn = colors.red;
	}

	return colorFn(`${fullPart}${partialPart}${emptyPart}`);
}

function formatResetTime(resetsAt: string): string {
	const resetDate = new Date(resetsAt);
	const diffMs = resetDate.getTime() - Date.now();

	if (diffMs <= 0) return "now";

	const hours = Math.floor(diffMs / 3600000);
	const minutes = Math.floor((diffMs % 3600000) / 60000);
	const days = Math.floor(hours / 24);
	const remainingHours = hours % 24;

	if (days > 0) return `${days}d${remainingHours}h`;
	if (hours > 0) return `${hours}h${minutes}m`;
	return `${minutes}m`;
}

// Phase 1.4: Locale unification to ja-JP
function formatResetDateOnly(resetsAt: string): string {
	const resetDate = new Date(resetsAt);
	const now = new Date();

	// Format time as HH:MM JST
	const jstTimeStr = resetDate.toLocaleString("ja-JP", {
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "Asia/Tokyo",
		hour12: false,
	});

	// Check if same day (JST)
	const jstDateStr = resetDate.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });
	const nowJstDateStr = now.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });

	if (jstDateStr === nowJstDateStr) {
		return jstTimeStr;
	}

	// Different day: show "12/30 13:00" format (JST)
	const monthNum = resetDate
		.toLocaleDateString("ja-JP", {
			month: "numeric",
			timeZone: "Asia/Tokyo",
		})
		.replace(/月/g, "");
	const day = resetDate
		.toLocaleDateString("ja-JP", { day: "numeric", timeZone: "Asia/Tokyo" })
		.replace(/日/g, "");
	return `${monthNum}/${day} ${jstTimeStr}`;
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
async function loadConfigCached(): Promise<StatuslineConfig> {
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

async function getCachedUsageLimits(): Promise<UsageLimits | null> {
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
			await Bun.write(
				cacheFile,
				JSON.stringify(
					{
						data: limits,
						timestamp: Date.now(),
					},
					null,
					2,
				),
			);
			// ファイルパーミッションを 0o600 (所有者のみ読み書き可能) に設定
			await chmod(cacheFile, 0o600);
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

async function saveSessionCost(sessionId: string, cost: number): Promise<void> {
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

async function getPeriodCost(resetTime: string): Promise<number> {
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

async function getTodayCost(): Promise<number> {
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
// Main Entry Point
// ============================================================================

async function main() {
	try {
		const data: HookInput = await Bun.stdin.json();

		// Save session cost if available (Phase 3)
		if (data.session_id && data.cost.total_cost_usd > 0) {
			await saveSessionCost(data.session_id, data.cost.total_cost_usd);
		}

		const statusLine = await buildStatusline(data);
		console.log(statusLine);
	} catch (error) {
		// Fallback on error
		console.log("[Claude Code]");
	}
}

main();
