import type { StatuslineConfig } from "./types.ts";

// Configuration
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

// Cache TTL constants
export const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
export const CONFIG_CACHE_TTL = 60 * 1000; // 1 minute
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Command execution timeout constants (Phase 1: Security Enhancement)
export const GIT_COMMAND_TIMEOUT_MS = 5000; // 5 seconds for git commands
export const API_CALL_TIMEOUT_MS = 5000; // 5 seconds for API calls
export const FILE_OPERATION_TIMEOUT_MS = 10000; // 10 seconds for file operations

// Binary file extensions
export const BINARY_EXTENSIONS = new Set([
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
