// Debug Level Control

export type DebugLevel = "off" | "basic" | "verbose";

// Phase 3.1: DEBUG_LEVEL enum 検証の実装
export function validateDebugLevel(value: string | undefined): DebugLevel {
	const validLevels: DebugLevel[] = ["off", "basic", "verbose"];
	const level = (value || "off").toLowerCase();
	return validLevels.includes(level as DebugLevel) ? (level as DebugLevel) : "off";
}

// Phase 2A: 環境変数の安全なアクセス
// null coalescing で undefined を "off" に置換
function getDebugLevel(): DebugLevel {
	const envValue = process.env.STATUSLINE_DEBUG ?? "off";
	return validateDebugLevel(envValue);
}

export const DEBUG_LEVEL: DebugLevel = getDebugLevel();

export function debug(message: string, level: "basic" | "verbose" = "basic"): void {
	if (DEBUG_LEVEL === "off") return;
	if (DEBUG_LEVEL === "basic" && level === "verbose") return;
	console.error(`[DEBUG] ${message}`);
}
