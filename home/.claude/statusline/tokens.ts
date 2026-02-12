import { homedir } from "os";
import { join } from "path";
import { chmod } from "fs/promises";

import { type HookInput, type TranscriptEntry } from "./config.ts";
import { debug, errorMessage } from "./format.ts";
import { formatElapsedTime } from "./format.ts";

const HOME = homedir();

// ============================================================================
// Token Calculation
// ============================================================================

/**
 * トランスクリプトファイルから会話全体のトークン使用量を計算
 * ファイル内のすべてのアシスタント応答を検索して、使用トークンを合計します。
 * 入力トークン、出力トークン、キャッシュ作成トークン、キャッシュ読み込みトークンを含みます。
 *
 * @async
 * @param {string} transcriptPath - トランスクリプトファイルのパス
 * @returns {Promise<{totalTokens: number, inputTokens: number, outputTokens: number}>} 合計トークン数と入出力の内訳（ファイルが見つからない場合は全て 0）
 *
 * @remarks
 * - 各行は JSON 形式のトランスクリプトエントリ
 * - type が "assistant" で、message.usage が存在するすべてのエントリを集計
 * - 会話全体（/clear 後）のトークン数を返す
 * - JSON パースエラーは無視（破損した行をスキップ）
 * - ファイル読み取りエラーまたはトークン情報がない場合は {totalTokens: 0, inputTokens: 0, outputTokens: 0} を返す
 * - inputTokens = input_tokens + cache_creation_input_tokens + cache_read_input_tokens
 * - outputTokens = output_tokens
 *
 * @example
 * const {totalTokens, inputTokens, outputTokens} = await calculateTokensFromTranscript("/path/to/transcript.jsonl");
 * // returns {totalTokens: 5000, inputTokens: 3000, outputTokens: 2000}
 */
export async function calculateTokensFromTranscript(transcriptPath: string): Promise<{
	totalTokens: number;
	inputTokens: number;
	outputTokens: number;
}> {
	debug(`[calculateTokensFromTranscript] Reading transcript from: ${transcriptPath}`, "basic");
	try {
		const file = Bun.file(transcriptPath);
		const exists = await file.exists();
		debug(`[calculateTokensFromTranscript] Transcript file exists: ${exists}`, "basic");

		if (!exists) {
			debug(`[calculateTokensFromTranscript] Transcript file not found`, "basic");
			return { totalTokens: 0, inputTokens: 0, outputTokens: 0 };
		}

		const content = await file.text();
		const lines = content.trim().split("\n");
		debug(`[calculateTokensFromTranscript] Read ${lines.length} lines from transcript`, "basic");

		let totalTokens = 0;
		let inputTokens = 0;
		let outputTokens = 0;
		let assistantEntries = 0;

		for (const line of lines) {
			try {
				const entry: TranscriptEntry = JSON.parse(line);

				if (entry.type === "assistant" && entry.message?.usage) {
					assistantEntries++;
					const usage = entry.message.usage;
					const entryInputTokens =
						(usage.input_tokens || 0) +
						(usage.cache_creation_input_tokens || 0) +
						(usage.cache_read_input_tokens || 0);
					const entryOutputTokens = usage.output_tokens || 0;

					inputTokens += entryInputTokens;
					outputTokens += entryOutputTokens;
					totalTokens += entryInputTokens + entryOutputTokens;
				}
			} catch (error) {
				// Skip invalid JSON lines - log at debug level for troubleshooting
				debug(
					`Failed to parse transcript line: ${error instanceof Error ? error.message : String(error)}`,
					"debug",
				);
			}
		}

		debug(`[calculateTokensFromTranscript] Processed ${assistantEntries} assistant entries, total=${totalTokens}, input=${inputTokens}, output=${outputTokens}`, "basic");
		return { totalTokens, inputTokens, outputTokens };
	} catch (error) {
		debug(`[calculateTokensFromTranscript] Error reading transcript: ${error instanceof Error ? error.message : String(error)}`, "basic");
		return { totalTokens: 0, inputTokens: 0, outputTokens: 0 };
	}
}

/**
 * 現在のコンテキストウィンドウ使用量を取得
 * HookInput から tokens、percentage、inputTokens、outputTokens を計算します。
 *
 * デュアルソース戦略:
 * - T: 表示（コンテキスト使用率）: current_usage を優先（/clear 後のリセットを反映）
 * - IO: 表示（入出力累積）: transcript を優先（セッション全体の累積値）
 *
 * current_usage が利用可能な場合、T: は current_usage から計算され、
 * IO: は transcript から取得されます（transcript がない場合は current_usage を使用）。
 * これにより、tokens !== inputTokens + outputTokens となる場合があります。
 *
 * @async
 * @param {HookInput} data - ホック入力データ（context_window、transcript_path を含む）
 * @returns {Promise<{tokens: number, percentage: number, inputTokens: number, outputTokens: number}>} 使用トークン数、使用率、累積入出力トークン
 *
 * @property {number} tokens - コンテキストで使用されているトークン数（T: 表示用、current_usage ベース）
 * @property {number} percentage - コンテキストウィンドウの使用率（0-100）。100を超える場合は 100 に制限
 * @property {number} inputTokens - セッション累積入力トークン数（IO: 表示用、transcript ベース）
 * @property {number} outputTokens - セッション累積出力トークン数（IO: 表示用、transcript ベース）
 *
 * @remarks
 * - 優先順序（T: 表示）: current_usage > transcript > total_input_tokens/total_output_tokens > デフォルト（0,0,0,0）
 * - 優先順序（IO: 表示）: transcript > current_usage > total_input_tokens/total_output_tokens > デフォルト（0,0,0,0）
 * - current_usage の output_tokens は次ターンのコンテキストに含まれるため、T: の forward-looking 推定値として含む
 * - contextWindowSize のデフォルト値：200000 トークン
 * - percentage は Math.min(100, ...) で 100 以下に制限
 * - 入力トークン＋出力トークン＋キャッシュ作成トークン＋キャッシュ読み込みトークンを合算
 *
 * @example
 * const { tokens, percentage, inputTokens, outputTokens } = await getContextTokens(hookInput);
 * console.log(`T: ${tokens} (${percentage}%) - IO: ${inputTokens}/${outputTokens}`);
 * // Note: tokens may not equal inputTokens + outputTokens due to dual-source strategy
 */
export async function getContextTokens(
	data: HookInput,
): Promise<{ tokens: number; percentage: number; inputTokens: number; outputTokens: number }> {
	debug(`[getContextTokens] Called with session_id: ${data.session_id}`, "basic");
	const contextWindowSize = data.context_window?.context_window_size || 200000;

	// Primary: current_usage for context fullness (T: display)
	if (data.context_window?.current_usage) {
		debug(`[getContextTokens] current_usage exists`, "basic");
		const cu = data.context_window.current_usage;
		const cuInput = (cu.input_tokens || 0) + (cu.cache_creation_input_tokens || 0) + (cu.cache_read_input_tokens || 0);
		const cuOutput = cu.output_tokens || 0;
		// Note: output_tokens は次ターンで input に含まれるため、
		// context fullness の forward-looking 推定値として含む
		const contextTokens = cuInput + cuOutput;
		const percentage = Math.min(100, Math.round((contextTokens / contextWindowSize) * 100));

		// IO: from transcript if available, else from cache, else from current_usage
		let ioInput = 0;
		let ioOutput = 0;
		let transcriptEmpty = false;

		if (data.session_id && data.transcript_path) {
			const t = await calculateTokensFromTranscript(data.transcript_path);
			if (t.inputTokens > 0 || t.outputTokens > 0) {
				// Transcript has data - use it
				ioInput = t.inputTokens;
				ioOutput = t.outputTokens;
			} else {
				// Transcript is empty (after /clear) - try cache
				transcriptEmpty = true;
				debug(`Transcript is empty - checking cache for session ${data.session_id}`, "basic");
				const cached = await loadSessionTokens(data.session_id);
				if (cached) {
					debug(
						`Loaded cached tokens: input=${cached.inputTokens}, output=${cached.outputTokens}`,
						"basic",
					);
					ioInput = cached.inputTokens;
					ioOutput = cached.outputTokens;
				}
			}
		}

		// Fallback to current_usage if no transcript and no cache
		if (ioInput === 0 && ioOutput === 0) {
			ioInput = cuInput;
			ioOutput = cuOutput;
		}

		return { tokens: contextTokens, percentage, inputTokens: ioInput, outputTokens: ioOutput };
	}

	// /clear 後: context_window は存在するが current_usage が明示的に null
	// → コンテキストがクリアされた状態。T: は 0、IO: は transcript 累積を維持
	if (data.context_window && data.context_window.current_usage === null) {
		debug(`[getContextTokens] /clear detected (current_usage is null)`, "basic");
		let ioInput = 0;
		let ioOutput = 0;
		if (data.session_id && data.transcript_path) {
			debug(`[getContextTokens] /clear detected - reading transcript from: ${data.transcript_path}`, "basic");
			const t = await calculateTokensFromTranscript(data.transcript_path);
			debug(`[getContextTokens] Transcript tokens: total=${t.totalTokens}, input=${t.inputTokens}, output=${t.outputTokens}`, "basic");

			// If transcript is empty (cleared), load from cache
			if (t.inputTokens === 0 && t.outputTokens === 0) {
				debug(`[getContextTokens] Transcript is empty after /clear - loading from cache`, "basic");
				const cached = await loadSessionTokens(data.session_id);
				if (cached) {
					debug(`[getContextTokens] Loaded cached tokens: input=${cached.inputTokens}, output=${cached.outputTokens}`, "basic");
					ioInput = cached.inputTokens;
					ioOutput = cached.outputTokens;
				} else {
					debug(`[getContextTokens] No cached tokens found for session ${data.session_id}`, "basic");
				}
			} else {
				// Use transcript values if available
				debug(`[getContextTokens] Using transcript values: input=${t.inputTokens}, output=${t.outputTokens}`, "basic");
				ioInput = t.inputTokens;
				ioOutput = t.outputTokens;
			}
		} else {
			debug(`[getContextTokens] Missing session_id or transcript_path`, "basic");
		}
		debug(`[getContextTokens] Returning after /clear: tokens=0, inputTokens=${ioInput}, outputTokens=${ioOutput}`, "basic");
		return { tokens: 0, percentage: 0, inputTokens: ioInput, outputTokens: ioOutput };
	}

	// Fallback: transcript for both T: and IO:
	if (data.session_id && data.transcript_path) {
		const { totalTokens, inputTokens, outputTokens } = await calculateTokensFromTranscript(data.transcript_path);
		if (totalTokens > 0) {
			const percentage = Math.min(100, Math.round((totalTokens / contextWindowSize) * 100));
			return { tokens: totalTokens, percentage, inputTokens, outputTokens };
		}
	}

	// Fallback: total_input_tokens/total_output_tokens (session cumulative)
	if (data.context_window?.total_input_tokens !== undefined && data.context_window?.total_output_tokens !== undefined) {
		const inputTokens = data.context_window.total_input_tokens || 0;
		const outputTokens = data.context_window.total_output_tokens || 0;
		const totalTokens = inputTokens + outputTokens;
		const percentage = Math.min(100, Math.round((totalTokens / contextWindowSize) * 100));

		return { tokens: totalTokens, percentage, inputTokens, outputTokens };
	}

	return { tokens: 0, percentage: 0, inputTokens: 0, outputTokens: 0 };
}

/**
 * セッションの圧縮実行回数を取得
 * ~/.claude/data/compact-counts.json から該当セッションの圧縮回数を読み取ります。
 *
 * @param {string} sessionId - セッションID
 * @returns {Promise<number>} 圧縮実行回数（ファイルが存在しない、またはセッションIDが見つからない場合は 0）
 *
 * @remarks
 * - ファイルが存在しない場合は 0 を返す
 * - JSON パースエラーは 0 を返す
 * - セッションIDが見つからない場合は 0 を返す
 *
 * @example
 * const count = await getCompactCount("abc123");
 * console.log(`Compact count: ${count}`);
 */
export async function getCompactCount(sessionId: string): Promise<number> {
	try {
		const countsPath = join(HOME, ".claude", "data", "compact-counts.json");
		const file = Bun.file(countsPath);

		const exists = await file.exists();
		if (!exists) {
			return 0;
		}

		const data = await file.json();
		return data[sessionId] || 0;
	} catch {
		return 0;
	}
}

/**
 * トランスクリプトファイルの作成時刻から現在までの経過時間を取得
 * ファイルの birth time（作成時刻）から現在時刻までの差分を計算します。
 * 結果は formatElapsedTime() でフォーマットされた HH:MM:SS または MM:SS 形式です。
 *
 * @async
 * @param {string} transcriptPath - トランスクリプトファイルのパス
 * @returns {Promise<string>} 経過時間の文字列（例："1:23:45"）、エラーが発生した場合は空文字列
 *
 * @remarks
 * - ファイルの birthtimeMs から現在時刻の差分を計算（Date.now() - birthtimeMs）
 * - birthtimeMs が無効（0 または undefined）の場合は空文字列を返す
 * - ファイルが存在しない場合は空文字列を返す（fail-safe 設計）
 * - エラーはデバッグログに出力される（詳細は logging.ts の debug() 関数参照）
 *
 * @example
 * const elapsed = await getSessionElapsedTime("/path/to/transcript.jsonl");
 * console.log(`Session time: ${elapsed}`);  // "1:23:45"
 */
export async function getSessionElapsedTime(transcriptPath: string): Promise<string> {
	try {
		const file = Bun.file(transcriptPath);
		const stats = await file.stat();

		// birthtimeMs が無効な値をチェック
		if (!stats.birthtimeMs || stats.birthtimeMs === 0) {
			debug("Invalid birthtimeMs in transcript file", "verbose");
			return "";
		}

		const elapsed = Date.now() - stats.birthtimeMs;
		return formatElapsedTime(elapsed);
	} catch (e) {
		const errorMsg = errorMessage(e);
		debug(`Failed to get session elapsed time: ${errorMsg}`, "verbose");
		return "";
	}
}

// ============================================================================
// Session IO Tokens Tracking (for /clear persistence)
// ============================================================================

interface SessionTokensStore {
	[sessionId: string]: {
		inputTokens: number;
		outputTokens: number;
		updated: number;
	};
}

/**
 * セッションの累積 I/O トークンを保存
 * /clear 後も累積値を保持するために使用
 */
export async function saveSessionTokens(
	sessionId: string,
	inputTokens: number,
	outputTokens: number,
): Promise<void> {
	debug(`[saveSessionTokens] Called with sessionId=${sessionId}, input=${inputTokens}, output=${outputTokens}`, "basic");
	const storeFile = join(HOME, ".claude", "data", "session-io-tokens.json");

	let store: SessionTokensStore = {};

	try {
		store = await Bun.file(storeFile).json();
		debug(`[saveSessionTokens] Loaded existing store with ${Object.keys(store).length} sessions`, "basic");
	} catch {
		debug(`[saveSessionTokens] Creating new store file`, "basic");
		// File doesn't exist or is invalid, create new
	}

	// Update session tokens
	store[sessionId] = {
		inputTokens,
		outputTokens,
		updated: Date.now(),
	};

	// Clean up entries older than 7 days (sessions are typically shorter)
	const cutoffMs = Date.now() - 7 * 24 * 60 * 60 * 1000;

	for (const [sid, data] of Object.entries(store)) {
		if (data.updated < cutoffMs) {
			delete store[sid];
		}
	}

	try {
		await Bun.write(storeFile, JSON.stringify(store, null, 2));
		await chmod(storeFile, 0o600);
		debug(`[saveSessionTokens] Successfully saved to ${storeFile}`, "basic");
	} catch (error) {
		debug(
			`[saveSessionTokens] Failed to save session tokens: ${error instanceof Error ? error.message : String(error)}`,
			"warning",
		);
	}
}

/**
 * セッションの累積 I/O トークンを読み込み
 * /clear 後に transcript から取得できない場合に使用
 */
export async function loadSessionTokens(sessionId: string): Promise<{
	inputTokens: number;
	outputTokens: number;
} | null> {
	debug(`[loadSessionTokens] Called with sessionId=${sessionId}`, "basic");
	const storeFile = join(HOME, ".claude", "data", "session-io-tokens.json");

	// Check if file exists
	try {
		const file = Bun.file(storeFile);
		const exists = await file.exists();
		debug(`[loadSessionTokens] Cache file exists: ${exists}`, "basic");

		if (!exists) {
			debug(`[loadSessionTokens] Cache file not found: ${storeFile}`, "basic");
			return null;
		}
	} catch (e) {
		debug(`[loadSessionTokens] Error checking file existence: ${errorMessage(e)}`, "basic");
		return null;
	}

	try {
		const store: SessionTokensStore = await Bun.file(storeFile).json();
		debug(`[loadSessionTokens] Loaded store with ${Object.keys(store).length} sessions`, "basic");
		debug(`[loadSessionTokens] Available session IDs: ${Object.keys(store).join(", ")}`, "basic");
		const data = store[sessionId];

		if (!data) {
			debug(`[loadSessionTokens] No data found for session ${sessionId}`, "basic");
			return null;
		}

		debug(`[loadSessionTokens] Found cached tokens: input=${data.inputTokens}, output=${data.outputTokens}`, "basic");
		// Return cached tokens if found
		return {
			inputTokens: data.inputTokens,
			outputTokens: data.outputTokens,
		};
	} catch (error) {
		debug(`[loadSessionTokens] Failed to load: ${error instanceof Error ? error.message : String(error)}`, "basic");
		return null;
	}
}
