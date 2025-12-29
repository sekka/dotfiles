import { existsSync } from "fs";
import { resolve } from "path";
import { realpath } from "fs/promises";

import { GitStatus, StatuslineConfig, debug, SecurityValidator } from "./utils.ts";

// ============================================================================
// Git Operations
// ============================================================================

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
		// Get branch name
		const branchProc = Bun.spawn({
			cmd: ["git", "--no-optional-locks", "branch", "--show-current"],
			cwd: currentDir,
			stdout: "pipe",
			stderr: "pipe",
		});

		const branchStdout = await new Response(branchProc.stdout).text();
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
		const errorMsg = e instanceof Error ? e.message : String(e);
		debug(`Git status error: ${errorMsg}`, "verbose");

		return {
			branch: "",
			hasChanges: false,
			aheadBehind: null,
			diffStats: null,
		};
	}
}

async function getAheadBehind(cwd: string): Promise<string | null> {
	try {
		// Determine parent branch (origin/main or origin/master)
		let parentBranch = "";

		try {
			const mainProc = Bun.spawn({
				cmd: ["git", "--no-optional-locks", "rev-parse", "--verify", "origin/main"],
				cwd,
				stdout: "pipe",
				stderr: "pipe",
			});
			const mainResult = await new Response(mainProc.stdout).text();
			if (mainResult.trim()) {
				parentBranch = "origin/main";
			}
		} catch {
			// Try master
		}

		if (!parentBranch) {
			try {
				const masterProc = Bun.spawn({
					cmd: ["git", "--no-optional-locks", "rev-parse", "--verify", "origin/master"],
					cwd,
					stdout: "pipe",
					stderr: "pipe",
				});
				const masterResult = await new Response(masterProc.stdout).text();
				if (masterResult.trim()) {
					parentBranch = "origin/master";
				}
			} catch {
				return null;
			}
		}

		if (!parentBranch) return null;

		// Get ahead count
		const aheadProc = Bun.spawn({
			cmd: ["git", "--no-optional-locks", "rev-list", "--count", `${parentBranch}..HEAD`],
			cwd,
			stdout: "pipe",
			stderr: "pipe",
		});

		const aheadStr = (await new Response(aheadProc.stdout).text()).trim();
		const ahead = parseInt(aheadStr || "0", 10);

		// Get behind count
		const behindProc = Bun.spawn({
			cmd: ["git", "--no-optional-locks", "rev-list", "--count", `HEAD..${parentBranch}`],
			cwd,
			stdout: "pipe",
			stderr: "pipe",
		});

		const behindStr = (await new Response(behindProc.stdout).text()).trim();
		const behind = parseInt(behindStr || "0", 10);

		// Format result (yellow)
		if (ahead > 0 && behind > 0) {
			return `\x1b[33m↑${ahead}↓${behind}\x1b[0m`;
		}
		if (ahead > 0) {
			return `\x1b[33m↑${ahead}\x1b[0m`;
		}
		if (behind > 0) {
			return `\x1b[33m↓${behind}\x1b[0m`;
		}

		return null;
	} catch (e) {
		// Phase 2.5: Enhanced error messages
		const errorMsg = e instanceof Error ? e.message : String(e);
		debug(`Failed to get ahead/behind count: ${errorMsg}`, "verbose");
		return null;
	}
}

// ============================================================================
// Phase 4.2: Untracked File Statistics - Responsibility Separation
// ============================================================================

/**
 * Phase 4.2: untracked ファイルの統計を読み取る
 * getDiffStats() から分離された専用関数
 */
async function readUntrackedFileStats(
	cwd: string,
	files: string[],
): Promise<{ added: number; skipped: number }> {
	let added = 0;
	let skipped = 0;

	const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

	let resolvedCwd: string;
	try {
		resolvedCwd = await realpath(cwd);
	} catch (e) {
		const errorMsg = e instanceof Error ? e.message : String(e);
		debug(`Cannot resolve working directory ${cwd}: ${errorMsg}`, "verbose");
		return { added: 0, skipped: files.length }; // 全てをスキップ扱い
	}

	for (const file of files) {
		if (!file.trim()) {
			skipped++;
			continue;
		}

		// バイナリファイルをスキップ
		if (SecurityValidator.isBinaryExtension(file)) {
			skipped++;
			continue;
		}

		try {
			const filePath = resolve(resolvedCwd, file);

			// Phase 4.1: SecurityValidator を使用したパス検証
			const validation = await SecurityValidator.validatePath(resolvedCwd, filePath);
			if (!validation.isValid || !validation.resolvedPath) {
				skipped++;
				continue;
			}

			// Phase 4.1: ファイルサイズ検証
			const fileObj = Bun.file(validation.resolvedPath);
			const stat = await fileObj.stat();

			if (!SecurityValidator.validateFileSize(stat.size, MAX_FILE_SIZE)) {
				skipped++;
				continue;
			}

			const fileContent = await fileObj.text();
			added += fileContent.split("\n").length;
		} catch (e) {
			const errorMsg = e instanceof Error ? e.message : String(e);
			debug(`Failed to read untracked file ${file}: ${errorMsg}`, "verbose");
			skipped++;
		}
	}

	return { added, skipped };
}

export async function getDiffStats(cwd: string): Promise<string | null> {
	try {
		// Get unstaged diff
		const unstagedProc = Bun.spawn({
			cmd: ["git", "--no-optional-locks", "diff", "--numstat"],
			cwd,
			stdout: "pipe",
			stderr: "pipe",
		});

		const unstagedDiff = await new Response(unstagedProc.stdout).text();

		// Get staged diff
		const stagedProc = Bun.spawn({
			cmd: ["git", "--no-optional-locks", "diff", "--cached", "--numstat"],
			cwd,
			stdout: "pipe",
			stderr: "pipe",
		});

		const stagedDiff = await new Response(stagedProc.stdout).text();

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

		// Get untracked files
		const untrackedProc = Bun.spawn({
			cmd: ["git", "--no-optional-locks", "ls-files", "--others", "--exclude-standard"],
			cwd,
			stdout: "pipe",
			stderr: "pipe",
		});

		const untrackedOutput = await new Response(untrackedProc.stdout).text();
		const untrackedFiles = untrackedOutput.trim().split("\n");

		// Phase 4.2: 分離された関数を呼び出し
		const { added: untrackedAdded } = await readUntrackedFileStats(cwd, untrackedFiles);
		added += untrackedAdded;

		// Format result
		if (added > 0 || deleted > 0) {
			return `\x1b[32m+${added}\x1b[0m \x1b[31m-${deleted}\x1b[0m`;
		}

		return null;
	} catch (e) {
		// Phase 2.5: Enhanced error messages
		const errorMsg = e instanceof Error ? e.message : String(e);
		debug(`Failed to get diff stats: ${errorMsg}`, "verbose");
		return null;
	}
}
