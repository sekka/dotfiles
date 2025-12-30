/**
 * statusline モジュール
 *
 * Claude Code のステータスライン表示を管理するモジュール群
 * 型、定数、ユーティリティ、セキュリティ、バリデーション機能を提供
 */

// Types
export type {
	HookInput,
	GitStatus,
	TranscriptEntry,
	StatuslineConfig,
	UsageLimits,
	CachedUsageLimits,
	Credentials,
	CacheData,
} from "./types.ts";

// Constants
export {
	colors,
	DEFAULT_CONFIG,
	CACHE_TTL_MS,
	CONFIG_CACHE_TTL,
	MAX_FILE_SIZE,
	BINARY_EXTENSIONS,
} from "./constants.ts";

// Debug
export { type DebugLevel, validateDebugLevel, DEBUG_LEVEL, debug } from "./logging.ts";

// Validation
export { isValidUsageLimits } from "./validation/limits.ts";
export { isValidStatuslineConfig } from "./validation/config.ts";

// Security
export { SecurityValidator } from "./security/validator.ts";
export { sanitizeForLogging } from "./security/sanitizer.ts";

// Error Handling
export { ErrorCategory, categorizeError, logCategorizedError } from "./error/handler.ts";
