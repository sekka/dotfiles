// Debug Level Control

export type DebugLevel = "off" | "basic" | "verbose";

// Phase 3.1: DEBUG_LEVEL enum 検証の実装
export function validateDebugLevel(value: string | undefined): DebugLevel {
	const validLevels: DebugLevel[] = ["off", "basic", "verbose"];
	const level = (value || "off").toLowerCase();
	return validLevels.includes(level as DebugLevel) ? (level as DebugLevel) : "off";
}

export const DEBUG_LEVEL: DebugLevel = validateDebugLevel(process.env.STATUSLINE_DEBUG);

export function debug(message: string, level: "basic" | "verbose" = "basic"): void {
	if (DEBUG_LEVEL === "off") return;
	if (DEBUG_LEVEL === "basic" && level === "verbose") return;
	console.error(`[DEBUG] ${message}`);
}
