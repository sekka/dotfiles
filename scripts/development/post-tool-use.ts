#!/usr/bin/env bun

/**
 * Unified Claude Code PostToolUse hook handler
 *
 * 複数のPost-tool-useタスクを統合管理：
 * 1. Lint/Format処理（Edit/Writeの後）
 * 2. Permissions ソート（.claude/settings.local.json）
 *
 * 入力: stdin より Claude Code hook JSON形式で受け取り
 * {
 *   "tool_input": {
 *     "tool": "Edit|Write",
 *     "file_path": "path/to/file"
 *   }
 * }
 */

interface HookInput {
	tool_input?: {
		tool?: string;
		file_path?: string;
	};
}

/**
 * Run lint/format via lint-format.ts
 */
async function runLintFormat(filePath: string): Promise<boolean> {
	try {
		const { spawnSync } = await import("child_process");
		const result = spawnSync("bun", [
			`${process.env.HOME}/dotfiles/scripts/development/lint-format.ts`,
			"--mode=fix",
			`--file=${filePath}`,
		]);

		if (result.status === 0) {
			return true;
		}

		const sanitized = filePath.split("/").pop() || "unknown";
		console.error(`❌ [Claude Hook:Lint] Lint/format failed for: ${sanitized}`);
		return false;
	} catch (error) {
		console.error(
			`❌ [Claude Hook:Lint] Error: ${error instanceof Error ? error.message : String(error)}`,
		);
		return false;
	}
}

/**
 * Run sort permissions via sort-permissions.sh
 */
async function runSortPermissions(filePath: string): Promise<boolean> {
	try {
		const { spawnSync } = await import("child_process");
		const result = spawnSync("bash", [
			`${process.env.HOME}/dotfiles/scripts/development/sort-permissions.sh`,
			"--file",
			filePath,
		]);

		return result.status === 0;
	} catch (error) {
		console.error(
			`❌ [Claude Hook:Sort] Error: ${error instanceof Error ? error.message : String(error)}`,
		);
		return false;
	}
}

/**
 * Main handler
 */
async function main(): Promise<void> {
	let input: HookInput = {};

	// Parse stdin input
	try {
		const stdinText = await Bun.stdin.text();
		if (stdinText) {
			input = JSON.parse(stdinText);
		}
	} catch {
		// Invalid or missing input - exit silently
		process.exit(0);
	}

	const filePath = input.tool_input?.file_path;

	if (!filePath) {
		process.exit(0);
	}

	let success = true;

	// Run lint/format for code files (Edit/Write tools)
	if (
		/\.(ts|js|tsx|jsx|json|yaml|yml|md|sh|bash)$/.test(filePath) &&
		!/\.local\.json$/.test(filePath)
	) {
		success = (await runLintFormat(filePath)) && success;
	}

	// Run sort permissions for settings.local.json
	if (filePath.endsWith(".claude/settings.local.json")) {
		success = (await runSortPermissions(filePath)) && success;
	}

	process.exit(success ? 0 : 1);
}

main().catch((error) => {
	console.error(`❌ [Claude Hook] Unexpected error: ${error}`);
	process.exit(1);
});
