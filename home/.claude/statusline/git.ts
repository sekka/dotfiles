import { existsSync } from "fs";
import { realpath } from "fs/promises";

import { type StatuslineConfig } from "./api.ts";
import { debug, errorMessage, colors } from "./format.ts";

// Git command timeout constant
const GIT_COMMAND_TIMEOUT_MS = 5000; // 5 seconds for git commands

// ============================================================================
// 型定義
// ============================================================================

/** Git リポジトリの現在のステータス情報 */
export interface GitStatus {
	branch: string;
	hasChanges: boolean;
	aheadBehind: string | null;
	diffStats: string | null;
}

// ============================================================================
// Git Operations
// ============================================================================

/** タイムアウト付きで git コマンドを実行 */
async function spawnWithTimeout(
	cmd: string[],
	cwd: string,
	timeoutMs: number = GIT_COMMAND_TIMEOUT_MS,
): Promise<Bun.Subprocess> {
	const proc = Bun.spawn({
		cmd,
		cwd,
		stdout: "pipe",
		stderr: "pipe",
	});

	// Phase 1: Timeout protection using AbortController
	// This prevents git commands from hanging indefinitely
	const timeoutPromise = new Promise<never>((_, reject) => {
		const timer = setTimeout(() => {
			proc.kill();
			reject(new Error(`Git command timed out after ${timeoutMs}ms: ${cmd.join(" ")}`));
		}, timeoutMs);

		// Cleanup timer when process completes
		proc.exited.then(() => clearTimeout(timer)).catch(() => clearTimeout(timer));
	});

	// Race between process completion and timeout
	try {
		await Promise.race([proc.exited, timeoutPromise]);
	} catch {
		// Timeout occurred, already killed the process above
	}

	return proc;
}

/** Git ステータスを取得（リポジトリ外では空オブジェクト） */
export async function getGitStatus(
	currentDir: string,
	config: StatuslineConfig,
): Promise<GitStatus> {
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
		// Get branch name with timeout protection
		const branchProc = await spawnWithTimeout(
			["git", "--no-optional-locks", "branch", "--show-current"],
			currentDir,
		);

		const branchStdout = await new Response(branchProc.stdout).text();

		// Validate git output
		if (!branchStdout || typeof branchStdout !== 'string') {
			debug('Invalid git branch output format', 'verbose');
			return {
				branch: "",
				hasChanges: false,
				aheadBehind: null,
				diffStats: null,
			};
		}

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
		const errorMsg = errorMessage(e);
		debug(`Git status error: ${errorMsg}`, "verbose");

		return {
			branch: "",
			hasChanges: false,
			aheadBehind: null,
			diffStats: null,
		};
	}
}

/** リモートの親ブランチ（origin/main または origin/master）を決定 */
async function determineParentBranch(cwd: string): Promise<string | null> {
	try {
		// Phase 2B: Resilience improvement with allSettled
		// Even if one git command fails, the other result is still available
		const results = await Promise.allSettled([
			spawnWithTimeout(["git", "--no-optional-locks", "rev-parse", "--verify", "origin/main"], cwd),
			spawnWithTimeout(
				["git", "--no-optional-locks", "rev-parse", "--verify", "origin/master"],
				cwd,
			),
		]);

		// Extract successful processes
		const mainProc =
			results[0].status === "fulfilled"
				? results[0].value
				: (debug(`origin/main check failed: ${results[0].reason}`, "verbose"), null);
		const masterProc =
			results[1].status === "fulfilled"
				? results[1].value
				: (debug(`origin/master check failed: ${results[1].reason}`, "verbose"), null);

		// Get results from successful processes
		const textResults = await Promise.allSettled([
			mainProc ? new Response(mainProc.stdout).text() : Promise.resolve(""),
			masterProc ? new Response(masterProc.stdout).text() : Promise.resolve(""),
		]);

		const mainResult = textResults[0].status === "fulfilled" ? textResults[0].value : "";
		const masterResult = textResults[1].status === "fulfilled" ? textResults[1].value : "";

		// Return first valid branch
		if (mainResult.trim()) {
			return "origin/main";
		}
		if (masterResult.trim()) {
			return "origin/master";
		}

		return null;
	} catch (e) {
		const errorMsg = errorMessage(e);
		debug(`Failed to determine parent branch: ${errorMsg}`, "verbose");
		return null;
	}
}

/** 現在のブランチの親ブランチに対する ahead/behind 数を計算 */
async function getAheadBehind(cwd: string): Promise<string | null> {
	try {
		// Determine parent branch (origin/main or origin/master)
		const parentBranch = await determineParentBranch(cwd);
		if (!parentBranch) return null;

		// Performance optimization: Calculate ahead/behind counts in parallel with timeout
		// Both operations are independent and can run simultaneously
		// Using allSettled() for resilience - if one git command fails, the other still completes
		const results = await Promise.allSettled([
			spawnWithTimeout(
				["git", "--no-optional-locks", "rev-list", "--count", `${parentBranch}..HEAD`],
				cwd,
			)
				.then((proc) => new Response(proc.stdout).text())
				.catch((err) => {
					debug(`ahead count check failed: ${err}`, "verbose");
					return "0";
				}),
			spawnWithTimeout(
				["git", "--no-optional-locks", "rev-list", "--count", `HEAD..${parentBranch}`],
				cwd,
			)
				.then((proc) => new Response(proc.stdout).text())
				.catch((err) => {
					debug(`behind count check failed: ${err}`, "verbose");
					return "0";
				}),
		]);

		const aheadOutput = results[0].status === "fulfilled" ? results[0].value : "0";
		const behindOutput = results[1].status === "fulfilled" ? results[1].value : "0";

		const aheadStr = aheadOutput.trim();
		const behindStr = behindOutput.trim();

		const ahead = parseInt(aheadStr || "0", 10);
		const behind = parseInt(behindStr || "0", 10);

		// Format result (yellow)
		if (ahead > 0 && behind > 0) {
			return colors.yellow(`↑${ahead}↓${behind}`);
		}
		if (ahead > 0) {
			return colors.yellow(`↑${ahead}`);
		}
		if (behind > 0) {
			return colors.yellow(`↓${behind}`);
		}

		return null;
	} catch (e) {
		// Phase 2.5: Enhanced error messages
		const errorMsg = errorMessage(e);
		debug(`Failed to get ahead/behind count: ${errorMsg}`, "verbose");
		return null;
	}
}

// ============================================================================
// Phase 4.2: Untracked File Statistics - Responsibility Separation
// ============================================================================

/** Untracked ファイルの統計情報を読み取る */
async function readUntrackedFileStats(
	cwd: string,
	files: string[],
): Promise<{ added: number; skipped: number }> {
	let resolvedCwd: string;
	try {
		resolvedCwd = await realpath(cwd);
	} catch (e) {
		const errorMsg = errorMessage(e);
		debug(`Cannot resolve working directory ${cwd}: ${errorMsg}`, "verbose");
		return { added: 0, skipped: files.length }; // 全てをスキップ扱い
	}

	// Pre-filter files: remove empty entries and prevent obvious path traversal
	const validFiles = files.filter((file) => {
		if (!file.trim()) return false;

		// Prevent obvious path traversal attempts
		if (file.includes("..") || file.startsWith("/")) {
			debug(`Rejected unsafe path: ${file}`, "verbose");
			return false;
		}

		return true;
	});

	const skippedByFilter = files.length - validFiles.length;

	// Performance optimization: Read files in parallel instead of sequentially
	// This dramatically improves performance for large numbers of untracked files
	const fileStatPromises = validFiles.map(async (file): Promise<number> => {
		try {
			// Construct the file path
			const filePath = `${resolvedCwd}/${file}`;
			const fileObj = Bun.file(filePath);
			const fileContent = await fileObj.text();
			return fileContent.split("\n").length;
		} catch (e) {
			const errorMsg = errorMessage(e);
			debug(`Failed to read untracked file ${file}: ${errorMsg}`, "verbose");
			return 0;
		}
	});

	// Execute all file reads in parallel and sum results
	// Each promise is wrapped in try-catch, so they never reject
	const fileLinesCounts = await Promise.all(fileStatPromises);
	const added = fileLinesCounts.reduce((sum, count) => sum + count, 0);

	// Count skipped files (pre-filtered + those that failed validation/read)
	const successCount = fileLinesCounts.filter((count) => count > 0).length;
	const skipped = skippedByFilter + (validFiles.length - successCount);

	return { added, skipped };
}

/** Git の変更統計（追加行と削除行）を取得 */
export async function getDiffStats(cwd: string): Promise<string | null> {
	try {
		// Get unstaged and staged diffs in parallel with timeout
		// Using allSettled() for resilience - if one git diff times out, we still get the other
		const results = await Promise.allSettled([
			spawnWithTimeout(["git", "--no-optional-locks", "diff", "--numstat"], cwd)
				.then((proc) => new Response(proc.stdout).text())
				.catch((err) => {
					debug(`unstaged diff check failed: ${err}`, "verbose");
					return "";
				}),
			spawnWithTimeout(["git", "--no-optional-locks", "diff", "--cached", "--numstat"], cwd)
				.then((proc) => new Response(proc.stdout).text())
				.catch((err) => {
					debug(`staged diff check failed: ${err}`, "verbose");
					return "";
				}),
		]);

		const unstagedDiff = results[0].status === "fulfilled" ? results[0].value : "";
		const stagedDiff = results[1].status === "fulfilled" ? results[1].value : "";

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

		// Get untracked files with timeout
		const untrackedProc = await spawnWithTimeout(
			["git", "--no-optional-locks", "ls-files", "--others", "--exclude-standard"],
			cwd,
		);

		const untrackedOutput = await new Response(untrackedProc.stdout).text();
		const untrackedFiles = untrackedOutput.trim().split("\n");

		// Phase 4.2: 分離された関数を呼び出し
		const { added: untrackedAdded } = await readUntrackedFileStats(cwd, untrackedFiles);
		added += untrackedAdded;

		// Format result
		if (added > 0 || deleted > 0) {
			return `${colors.green(`+${added}`)} ${colors.red(`-${deleted}`)}`;
		}

		return null;
	} catch (e) {
		// Phase 2.5: Enhanced error messages
		const errorMsg = errorMessage(e);
		debug(`Failed to get diff stats: ${errorMsg}`, "verbose");
		return null;
	}
}
