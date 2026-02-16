#!/usr/bin/env bun

// ============================================================================
// tmux-status.ts - Claude Code rate limits in tmux color format
// ============================================================================

import { homedir } from "os";
import { getCachedUsageLimits, getPeriodCost, getTodayCost } from "./statusline/api.ts";
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

const CACHE_STALE_MS = 10 * 60 * 1000; // 10 minutes

async function isCacheStale(): Promise<boolean> {
	const HOME = homedir();
	const cacheFile = `${HOME}/.claude/data/usage-limits-cache.json`;

	try {
		const cache = await Bun.file(cacheFile).json();
		const age = Date.now() - cache.timestamp;
		return age > CACHE_STALE_MS;
	} catch {
		// Cache doesn't exist or is invalid
		return true;
	}
}

// ============================================================================
// Main Output Function
// ============================================================================

async function generateTmuxStatus(): Promise<string> {
	// Check cache staleness first
	if (await isCacheStale()) {
		return "";
	}

	// Get usage limits
	const limits = await getCachedUsageLimits();
	if (!limits) {
		return "";
	}

	const parts: string[] = [];

	// LMT (5-hour limit)
	if (limits.five_hour) {
		const bar = formatBrailleProgressBarTmux(limits.five_hour.utilization, 5);
		let lmt = `${tmux.gray}LMT:${tmux.default}${bar} ${tmux.white}${limits.five_hour.utilization}%${tmux.default}`;

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
			parts.push(`${tmux.gray}DAY:${tmux.gray}$${tmux.white}${formatCostValue(todayCost)}${tmux.default}`);
		}
	} catch {
		// Gracefully ignore daily cost errors
	}

	// WK (7-day limit)
	if (limits.seven_day) {
		const bar = formatBrailleProgressBarTmux(limits.seven_day.utilization, 5);
		let wk = `${tmux.gray}WK:${tmux.default}${bar} ${tmux.white}${limits.seven_day.utilization}%${tmux.default}`;

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
		let wks = `${tmux.gray}WKS:${tmux.default}${bar} ${tmux.white}${limits.seven_day_sonnet.utilization}%${tmux.default}`;

		if (limits.seven_day_sonnet.resets_at) {
			const resetDate = formatResetDateOnly(limits.seven_day_sonnet.resets_at);
			const timeLeft = formatResetTime(limits.seven_day_sonnet.resets_at);
			wks += ` ${tmux.gray}(${resetDate}|${timeLeft})${tmux.default}`;
		}

		parts.push(wks);
	}

	return parts.join("  ");
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
