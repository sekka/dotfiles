#!/usr/bin/env bun

// Claude Code statusline hook - TypeScript + Bun version
// 既存のNode.js版statusline.jsの機能を完全に移行

// Utilities
import { colors, HookInput, StatuslineConfig, debug } from "./statusline/utils.ts";

// Git operations
import { getGitStatus } from "./statusline/git.ts";

// Token calculations and formatting
import {
	getContextTokens,
	formatElapsedTime,
	getSessionElapsedTime,
	formatBrailleProgressBar,
	formatResetTime,
	formatResetDateOnly,
} from "./statusline/tokens.ts";

// Caching and cost tracking
import {
	UsageLimits,
	loadConfigCached,
	getCachedUsageLimits,
	getTodayCost,
	saveSessionCost,
	getPeriodCost,
} from "./statusline/cache.ts";

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
