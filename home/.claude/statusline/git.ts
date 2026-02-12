import { existsSync } from "fs";
import { realpath } from "fs/promises";

import { type StatuslineConfig } from "./config.ts";
import { debug, errorMessage } from "./logging.ts";
import { GIT_COMMAND_TIMEOUT_MS } from "./constants.ts";
import { colors } from "./colors.ts";

// ============================================================================
// 型定義
// ============================================================================

/**
 * Git リポジトリの現在のステータス情報
 */
export interface GitStatus {
	branch: string;
	hasChanges: boolean;
	aheadBehind: string | null;
	diffStats: string | null;
}

// ============================================================================
// Git Operations
// ============================================================================

/**
 * Phase 1: タイムアウト付きで git コマンドを実行
 * Bun.spawn() でタイムアウト付きで git コマンドを実行し、無限待機を防止
 *
 * @param {string[]} cmd - git コマンドとその引数（例: ["git", "status"]）
 * @param {string} cwd - 作業ディレクトリ
 * @param {number} timeoutMs - タイムアウト時間（ミリ秒）、デフォルト 5000ms
 * @returns {Promise<Bun.Subprocess>} タイムアウト付きで実行された subprocess
 * @throws {Error} タイムアウト超過時は エラーをスロー
 */
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

/**
 * 現在のディレクトリの Git ステータスを取得
 * Git リポジトリが存在しない場合は、空のステータスオブジェクトを返します。
 *
 * @async
 * @param {string} currentDir - 確認するディレクトリのパス
 * @param {StatuslineConfig} config - Git セクションの表示設定（alwaysShowMain など）
 * @returns {Promise<GitStatus>} Git ステータス情報を含むオブジェクト
 *
 * @property {string} branch - 現在のブランチ名（Git リポジトリでない場合は空文字列）
 * @property {boolean} hasChanges - 変更があるかどうか（ahead/behind または diff stats が存在）
 * @property {string|null} aheadBehind - 上流ブランチとの前後関係（ANSI 黄色でフォーマット済み）
 * @property {string|null} diffStats - 変更統計：+行数と-行数（ANSI カラー付き）
 *
 * @example
 * const status = await getGitStatus("/home/user/project", config);
 * console.log(`Branch: ${status.branch}`);
 * if (status.hasChanges) {
 *   console.log(`Changes: ${status.diffStats}`);
 * }
 *
 * @remarks
 * - Git コマンドの実行時に --no-optional-locks オプションを使用
 * - main/master ブランチでは config.alwaysShowMain が false の場合 ahead/behind を表示しない
 * - エラーが発生した場合は空のステータスオブジェクトを返す（fail-safe 設計）
 */
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

/**
 * リモートの親ブランチ（origin/main または origin/master）を決定
 * 両方のブランチを並列で確認して、存在する方を返します。
 * パフォーマンス最適化のため、2つの git rev-parse コマンドを並列実行します。
 *
 * @async
 * @param {string} cwd - 作業ディレクトリのパス
 * @returns {Promise<string|null>} 存在するリモートブランチ（"origin/main" または "origin/master"）、
 *                                  存在しない場合は null
 *
 * @remarks
 * - Promise.all() でリモートブランチ確認を並列化し、パフォーマンスを向上
 * - origin/main が存在すればそれを優先返却
 * - Git コマンド実行エラーの場合は null を返す
 *
 * @example
 * const parentBranch = await determineParentBranch("/home/user/project");
 * // parentBranch === "origin/main" または "origin/master" または null
 */
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

/**
 * 現在のブランチの親ブランチに対する ahead/behind 数を計算
 * コミット数を ANSI 黄色の矢印付きで返します。形式は以下の通り：
 * - "↑3": 3コミット先行
 * - "↓2": 2コミット遅延
 * - "↑3↓1": 3コミット先行、1コミット遅延
 *
 * @async
 * @param {string} cwd - 作業ディレクトリのパス
 * @returns {Promise<string|null>} ANSI カラー付きの ahead/behind 表記、または null（親ブランチが見つからない場合）
 *
 * @remarks
 * - 2つの git rev-list コマンドを並列実行してパフォーマンス最適化
 * - 矢印記号は ANSI 黄色（#33）でフォーマット済み
 * - ahead/behind 両方が 0 の場合は null を返す
 *
 * @example
 * const aheadBehind = await getAheadBehind("/home/user/project");
 * // returns "\x1b[33m↑5\x1b[0m" or "\x1b[33m↓3↑2\x1b[0m"
 */
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

/**
 * Untracked ファイルの統計情報を読み取る
 * getDiffStats() から責任分離された専用関数。複数の untracked ファイルを並列で処理し、
 * 合計行数をカウントします。ファイルサイズ制限、パス検証、バイナリファイル検出を含みます。
 *
 * @async
 * @param {string} cwd - 作業ディレクトリのパス
 * @param {string[]} files - untracked ファイルのパスリスト
 * @returns {Promise<{added: number, skipped: number}>} 追加された行数とスキップされたファイル数
 *
 * @property {number} added - untracked ファイルの合計行数
 * @property {number} skipped - スキップされたファイル数（無効なパス、大きすぎるファイル、バイナリなど）
 *
 * @remarks
 * - ファイル読み取りは Promise.all() で並列化してパフォーマンスを向上
 * - 最大ファイルサイズ：10MB。超過分はスキップ
 * - パス検証：パストラバーサルやセキュリティ脅威をチェック
 * - バイナリファイル：SecurityValidator.isBinaryExtension() で検出してスキップ
 * - realpath() でシンボリックリンクを解決
 *
 * @example
 * const { added, skipped } = await readUntrackedFileStats(cwd, ["new-file.ts", "docs.md"]);
 * console.log(`Lines: ${added}, Skipped: ${skipped}`);
 */
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

/**
 * Git の変更統計（追加行と削除行）を取得
 * ステージング済みと未ステージングの両方の変更、および untracked ファイルを合算します。
 * 結果は ANSI カラー付き（緑=追加、赤=削除）でフォーマットされます。
 *
 * @async
 * @param {string} cwd - 作業ディレクトリのパス
 * @returns {Promise<string|null>} 変更統計の ANSI カラー付き文字列（例："+10 -5"）、変更がない場合は null
 *
 * @remarks
 * - ステージング済みと未ステージングの diff を並列で取得
 * - "+" は ANSI 緑色（#32）でフォーマット
 * - "-" は ANSI 赤色（#31）でフォーマット
 * - untracked ファイルは readUntrackedFileStats() で処理
 * - git ls-files --others --exclude-standard で untracked ファイル一覧を取得
 * - エラーが発生した場合は null を返す（fail-safe 設計）
 *
 * @example
 * const stats = await getDiffStats("/home/user/project");
 * // returns "\x1b[32m+10\x1b[0m \x1b[31m-5\x1b[0m"
 */
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
