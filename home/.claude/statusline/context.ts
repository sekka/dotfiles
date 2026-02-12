import { HookInput, TranscriptEntry } from "./utils.ts";
import { debug } from "./logging.ts";
import { colors } from "./colors.ts";
import { loadSessionTokens } from "./cache.ts";

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
async function calculateTokensFromTranscript(transcriptPath: string): Promise<{
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
 * @returns {number} 圧縮実行回数（ファイルが存在しない、またはセッションIDが見つからない場合は 0）
 *
 * @remarks
 * - ファイルが存在しない場合は 0 を返す
 * - JSON パースエラーは 0 を返す
 * - セッションIDが見つからない場合は 0 を返す
 *
 * @example
 * const count = getCompactCount("abc123");
 * console.log(`Compact count: ${count}`);
 */
export function getCompactCount(sessionId: string): number {
	try {
		const { homedir } = require("os");
		const { join } = require("path");
		const { readFileSync } = require("fs");

		const countsPath = join(homedir(), ".claude", "data", "compact-counts.json");
		const data = JSON.parse(readFileSync(countsPath, "utf-8"));
		return data[sessionId] || 0;
	} catch {
		return 0;
	}
}

// ============================================================================
// Format Helpers
// ============================================================================

/**
 * トークン数を人間が読みやすい形式にフォーマット
 * 1,000,000 以上は M（百万）、1,000 以上は K（千）で表現、
 * 1,000 未満は数値のまま返します。
 *
 * @param {number} tokens - フォーマットするトークン数
 * @returns {string} フォーマット済みトークン数（例："1.5M"、"250K"、"500"）
 *
 * @example
 * formatTokenCount(5000000);    // returns "5.0M"
 * formatTokenCount(250000);     // returns "250.0K"
 * formatTokenCount(999);        // returns "999"
 */
export function formatTokenCount(tokens: number): string {
	if (tokens >= 1000000) {
		return `${(tokens / 1000000).toFixed(1)}M`;
	}
	if (tokens >= 1000) {
		return `${(tokens / 1000).toFixed(1)}K`;
	}
	return tokens.toString();
}

/**
 * コスト値（USD）を数値文字列にフォーマット（ドル記号なし）
 *
 * @param {number} cost - フォーマットするコスト（USD）
 * @returns {string} フォーマットされたコスト文字列
 *
 * @remarks
 * - $0.01 以上の場合: 小数点第2位まで表示（例："1.23"）
 * - $0.01 未満かつ 0 より大きい場合: 小数点第3位まで表示（例："0.005"）
 * - toFixed() によって自動的に四捨五入される
 *
 * @example
 * formatCostValue(99.6);   // returns "99.60"
 * formatCostValue(1.234);  // returns "1.23"
 * formatCostValue(0.05);   // returns "0.05"
 * formatCostValue(0.005);  // returns "0.005"
 * formatCostValue(0);      // returns "0.00"
 */
export function formatCostValue(cost: number): string {
	if (cost >= 0.01) {
		return cost.toFixed(2);
	}
	if (cost > 0) {
		return cost.toFixed(3);
	}
	return "0.00";
}

/**
 * コスト値をドル形式にフォーマット
 * $1.00 以上は小数点第2位まで、$0.01-$0.99 は小数点第2位まで、
 * $0.01 未満は小数点第3位まで表示します。
 *
 * @param {number} cost - フォーマットするコスト値（USD）
 * @returns {string} ドル記号付きのフォーマット済みコスト（例："$1.23"、"$0.01"、"$0.005"）
 *
 * @remarks
 * - formatCostValue() でフォーマットした値にドル記号を付加
 *
 * @example
 * formatCost(1.234);  // returns "$1.23"
 * formatCost(0.05);   // returns "$0.05"
 * formatCost(0.005);  // returns "$0.005"
 * formatCost(0);      // returns "$0.00"
 */
export function formatCost(cost: number): string {
	return `$${formatCostValue(cost)}`;
}

/**
 * ミリ秒を HH:MM:SS または MM:SS 形式の経過時間にフォーマット
 * 1時間以上の場合は HH:MM:SS、1時間未満の場合は MM:SS で表示します。
 *
 * @param {number} ms - フォーマットするミリ秒数
 * @returns {string} 経過時間の文字列（例："1:23:45"、"15:30"）
 *
 * @remarks
 * - 時間と分、秒は 0 パッドされます（MM:SS 形式）
 * - 総時間が 1 時間未満の場合は時間部分は表示されません
 * - 総時間が 1 日以上の場合、24 時間を超えるため表示は複数日になります
 *
 * @example
 * formatElapsedTime(3661000);  // returns "1:01:01" (1時間1分1秒)
 * formatElapsedTime(900000);   // returns "15:00" (15分)
 * formatElapsedTime(45000);    // returns "0:45" (45秒)
 */
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

/**
 * パーセンテージをブレイル文字（点字）を使用したプログレスバーにフォーマット
 * パーセンテージに応じて進行状況と色を変更するビジュアルバーを生成します。
 * パーセンテージが上がるにつれて色が灰色→黄色→オレンジ→赤へ変化します。
 *
 * @param {number} percentage - パーセンテージ値（0-100）
 * @param {number} [length=10] - プログレスバーの幅（ブロック数）、デフォルト 10
 * @returns {string} ブレイル文字を使用した ANSI カラー付きプログレスバー
 *
 * @remarks
 * - ブレイル文字セット：⣀, ⣄, ⣤, ⣦, ⣶, ⣷, ⣿（段階的な充填度）
 * - 色の段階：
 *   - 0-50%: グレー（ANSI #90）
 *   - 51-70%: 黄色（ANSI #33）
 *   - 71-90%: オレンジ（ANSI 256色 #208）
 *   - 91-100%: 赤（ANSI #91）
 * - length パラメータで全体の長さをカスタマイズ可能
 * - 値が 100 を超える場合は 100 として扱う
 *
 * @example
 * formatBrailleProgressBar(25);   // returns グレーのプログレスバー 25% 表示
 * formatBrailleProgressBar(60);   // returns 黄色のプログレスバー 60% 表示
 * formatBrailleProgressBar(95);   // returns 赤のプログレスバー 95% 表示
 * formatBrailleProgressBar(50, 20);  // returns 20 ブロック幅の 50% バー
 */
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
	let colorFn = colors.gray;
	if (percentage > 50 && percentage <= 70) {
		colorFn = colors.yellow;
	} else if (percentage > 70 && percentage <= 90) {
		colorFn = colors.orange;
	} else if (percentage > 90) {
		colorFn = colors.red;
	}

	return colorFn(`${fullPart}${partialPart}${emptyPart}`);
}

/**
 * リセット時刻までの相対時間をコンパクトな形式でフォーマット
 * 現在時刻からリセット時刻までの残り時間を計算し、
 * "Xd Yh"、"Xh Ym"、"Xm" の形式で返します。
 *
 * @param {string} resetsAt - ISO 8601 形式のリセット時刻文字列
 * @returns {string} 相対時間の文字列（例："2d3h"、"5h30m"、"15m"、"now"）
 *
 * @remarks
 * - リセット時刻が過去の場合は "now" を返す
 * - 24時間以上の場合は "Xd Yh" 形式で表示
 * - 1-23時間の場合は "Xh Ym" 形式で表示
 * - 1時間未満の場合は "Xm" 形式で表示
 * - 分単位で計算（秒以下は切り捨て）
 *
 * @example
 * formatResetTime("2025-01-01T12:00:00Z");  // returns "2d3h" など、現在時刻による
 * formatResetTime("2024-12-30T10:00:00Z");  // returns "now"（過去の場合）
 */
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

/**
 * リセット時刻を日時形式でフォーマット（JST タイムゾーン）
 * 同じ日付の場合は時刻のみ（HH:MM）、異なる日付の場合は月日と時刻（M/D HH:MM）を返します。
 * すべての時刻は Asia/Tokyo（日本標準時）で処理されます。
 *
 * @param {string} resetsAt - ISO 8601 形式のリセット時刻文字列
 * @returns {string} JST での日時文字列（例："13:00"（同日）、"12/30 13:00"（他日））
 *
 * @remarks
 * - 時刻は常に Asia/Tokyo タイムゾーンで処理
 * - 24 時間制（hour12: false）で表示
 * - 同じ日付の場合は時刻のみを返す（スペース効率的）
 * - 異なる日付の場合は "月/日 時刻" 形式（例："12/30 13:00"）
 * - 月・日の数値は数値形式（padded なし）
 * - ロケール固定：ja-JP（日本語環境に最適化）
 *
 * @example
 * // 現在が 2024-12-30 10:30:00 JST の場合
 * formatResetDateOnly("2024-12-30T13:00:00Z");  // returns "13:00"（同日）
 * formatResetDateOnly("2024-12-31T10:00:00Z");  // returns "12/31 10:00"（他日）
 */
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
