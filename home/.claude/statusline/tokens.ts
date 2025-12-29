import { HookInput, TranscriptEntry, debug } from "./utils.ts";

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

export async function getContextTokens(
	data: HookInput,
): Promise<{ tokens: number; percentage: number }> {
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

export function formatTokenCount(tokens: number): string {
	if (tokens >= 1000000) {
		return `${(tokens / 1000000).toFixed(1)}M`;
	}
	if (tokens >= 1000) {
		return `${(tokens / 1000).toFixed(1)}K`;
	}
	return tokens.toString();
}

export function formatCost(cost: number): string {
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

export function formatElapsedTime(ms: number): string {
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
export async function getSessionElapsedTime(transcriptPath: string): Promise<string> {
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

export function formatBrailleProgressBar(percentage: number, length = 10): string {
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
	let colorFn = (s: string) => `\x1b[90m${s}\x1b[0m`; // gray
	if (percentage > 50 && percentage <= 70) {
		colorFn = (s: string) => `\x1b[33m${s}\x1b[0m`; // yellow
	} else if (percentage > 70 && percentage <= 90) {
		colorFn = (s: string) => `\x1b[38;5;208m${s}\x1b[0m`; // orange
	} else if (percentage > 90) {
		colorFn = (s: string) => `\x1b[91m${s}\x1b[0m`; // red
	}

	return colorFn(`${fullPart}${partialPart}${emptyPart}`);
}

export function formatResetTime(resetsAt: string): string {
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
export function formatResetDateOnly(resetsAt: string): string {
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
