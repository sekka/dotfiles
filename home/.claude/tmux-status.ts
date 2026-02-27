#!/usr/bin/env bun

// ============================================================================
// tmux-status.ts - Claude Code rate limits in tmux color format
// ============================================================================

import { homedir } from "os";
import { getPeriodCost, getTodayCost } from "./statusline/api.ts";
import type { UsageLimits, CachedUsageLimits } from "./statusline/api.ts";
import { formatResetTime, formatResetDateOnly, formatCostValue } from "./statusline/format.ts";

// ============================================================================
// Tmux Color Codes
// ============================================================================

const tmux = {
	gray: "#[fg=colour240]",
	white: "#[fg=white]",
	brightWhite: "#[fg=brightwhite]",
	yellow: "#[fg=yellow]",
	orange: "#[fg=colour208]",
	red: "#[fg=brightred]",
	default: "#[default]",
} as const;

// ============================================================================
// Braille Progress Bar with Tmux Colors
// ============================================================================

function formatBrailleProgressBarTmux(percentage: number, length = 5): string {
	const brailleChars = ["⣀", "⣄", "⣤", "⣦", "⣶", "⣷", "⣿"];
	const totalSteps = length * (brailleChars.length - 1);
	const currentStep = Math.round((percentage / 100) * totalSteps);

	const fullBlocks = Math.floor(currentStep / (brailleChars.length - 1));
	const partialIndex = currentStep % (brailleChars.length - 1);
	const emptyBlocks = length - fullBlocks - (partialIndex > 0 ? 1 : 0);

	const fullPart = "⣿".repeat(fullBlocks);
	const partialPart = partialIndex > 0 ? brailleChars[partialIndex] : "";
	const emptyPart = "⣀".repeat(emptyBlocks);
	const bar = `${fullPart}${partialPart}${emptyPart}`;

	// Progressive color: 0-50% gray, 51-70% yellow, 71-90% orange, 91-100% red
	let color = tmux.gray;
	if (percentage > 50 && percentage <= 70) {
		color = tmux.yellow;
	} else if (percentage > 70 && percentage <= 90) {
		color = tmux.orange;
	} else if (percentage > 90) {
		color = tmux.red;
	}

	return `${color}${bar}${tmux.default}`;
}

// ============================================================================
// Cache Staleness Check
// ============================================================================

const CACHE_FRESH_MS = 5 * 60 * 1000;     // 5 minutes: matches api.ts CACHE_TTL_MS
const CACHE_EXPIRED_MS = 60 * 60 * 1000;  // 60 minutes: expired → hide display

type Staleness = "fresh" | "stale" | "expired";

interface CacheInfo {
	data: UsageLimits | null;
	staleness: Staleness;
	ageMs: number;
}

async function readCacheWithInfo(): Promise<CacheInfo> {
	const HOME = homedir();
	const cacheFile = `${HOME}/.claude/data/usage-limits-cache.json`;

	try {
		const cache: CachedUsageLimits = await Bun.file(cacheFile).json();
		if (typeof cache.timestamp !== 'number' || cache.timestamp <= 0) {
			return { data: null, staleness: "expired", ageMs: Infinity };
		}
		const ageMs = Date.now() - cache.timestamp;
		let staleness: Staleness;
		if (ageMs < CACHE_FRESH_MS) {
			staleness = "fresh";
		} else if (ageMs < CACHE_EXPIRED_MS) {
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
// Main Output Function
// ============================================================================

async function generateTmuxStatus(): Promise<string> {
	const { data: limits, staleness, ageMs } = await readCacheWithInfo();

	if (staleness === "expired" || !limits) {
		return "";
	}

	// Stale suffix: "(Xm ago)"
	const staleLabel = staleness === "stale"
		? ` ${tmux.gray}(${Math.floor(ageMs / 60000)}m ago)${tmux.default}`
		: "";
	// "?" marker appended to label names when stale
	const q = staleness === "stale" ? "?" : "";

	const parts: string[] = [];

	// LMT (5-hour limit)
	if (limits.five_hour) {
		const bar = formatBrailleProgressBarTmux(limits.five_hour.utilization, 5);
		let lmt = `${tmux.gray}LMT${q}:${tmux.default}${bar} ${tmux.white}${limits.five_hour.utilization}%${tmux.default}`;

		if (limits.five_hour.resets_at) {
			const resetDate = formatResetDateOnly(limits.five_hour.resets_at);
			const timeLeft = formatResetTime(limits.five_hour.resets_at);
			lmt += ` ${tmux.gray}(${resetDate}|${timeLeft})${tmux.default}`;

			// Add period cost
			try {
				const periodCost = await getPeriodCost(limits.five_hour.resets_at);
				if (periodCost >= 0.01) {
					lmt += ` ${tmux.gray}$${tmux.white}${formatCostValue(periodCost)}${tmux.default}`;
				}
			} catch {
				// Gracefully ignore period cost errors
			}
		}

		parts.push(lmt);
	}

	// DAY (daily cost)
	try {
		const todayCost = await getTodayCost();
		if (todayCost >= 0.01) {
			parts.push(`${tmux.gray}DAY${q}:${tmux.gray}$${tmux.white}${formatCostValue(todayCost)}${tmux.default}`);
		}
	} catch {
		// Gracefully ignore daily cost errors
	}

	// WK (7-day limit)
	if (limits.seven_day) {
		const bar = formatBrailleProgressBarTmux(limits.seven_day.utilization, 5);
		let wk = `${tmux.gray}WK${q}:${tmux.default}${bar} ${tmux.white}${limits.seven_day.utilization}%${tmux.default}`;

		if (limits.seven_day.resets_at) {
			const resetDate = formatResetDateOnly(limits.seven_day.resets_at);
			const timeLeft = formatResetTime(limits.seven_day.resets_at);
			wk += ` ${tmux.gray}(${resetDate}|${timeLeft})${tmux.default}`;
		}

		parts.push(wk);
	}

	// WKS (7-day Sonnet limit)
	if (limits.seven_day_sonnet) {
		const bar = formatBrailleProgressBarTmux(limits.seven_day_sonnet.utilization, 5);
		let wks = `${tmux.gray}WKS${q}:${tmux.default}${bar} ${tmux.white}${limits.seven_day_sonnet.utilization}%${tmux.default}`;

		if (limits.seven_day_sonnet.resets_at) {
			const resetDate = formatResetDateOnly(limits.seven_day_sonnet.resets_at);
			const timeLeft = formatResetTime(limits.seven_day_sonnet.resets_at);
			wks += ` ${tmux.gray}(${resetDate}|${timeLeft})${tmux.default}`;
		}

		parts.push(wks);
	}

	// Append stale age indicator at the end
	if (staleLabel) {
		parts.push(staleLabel.trim());
	}

	return parts.join(" ");
}

// ============================================================================
// Entry Point
// ============================================================================

try {
	const output = await generateTmuxStatus();
	console.log(output);
} catch {
	// Never crash, output empty string on any error
	console.log("");
}
