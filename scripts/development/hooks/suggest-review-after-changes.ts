#!/usr/bin/env bun
/**
 * 実装後レビュー提案 Hook
 * PostToolUse(Edit|Write) イベントで呼ばれ、一定量以上の変更を検出し、
 * /reviewing-parallel での包括的レビューを提案する。
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";

// ============================================
// 型定義
// ============================================

interface HookInput {
	hook_event_name: string;
	tool_name?: string;
	tool_input?: {
		file_path?: string;
		content?: string;
		new_string?: string;
	};
	session_id?: string;
}

interface HookOutput {
	approved: boolean;
	additionalContext?: string;
}

interface SessionState {
	files_changed: Set<string>;
	total_lines_changed: number;
	review_suggested: boolean;
}

// ============================================
// 設定
// ============================================

const STATE_DIR = "/tmp";
const MIN_FILES_FOR_REVIEW = 3;
const MIN_LINES_FOR_REVIEW = 100;

// ============================================
// セッション状態管理
// ============================================

function getStateFilePath(sessionId: string): string {
	return path.join(STATE_DIR, `claude-code-session-state-${sessionId}.json`);
}

async function loadSessionState(sessionId: string): Promise<SessionState> {
	try {
		const filePath = getStateFilePath(sessionId);
		const data = await fs.readFile(filePath, "utf-8");
		const parsed = JSON.parse(data);
		return {
			files_changed: new Set(parsed.files_changed || []),
			total_lines_changed: parsed.total_lines_changed || 0,
			review_suggested: parsed.review_suggested || false,
		};
	} catch {
		// ファイルがない、または読み込み失敗 → 初期状態
		return {
			files_changed: new Set(),
			total_lines_changed: 0,
			review_suggested: false,
		};
	}
}

async function saveSessionState(sessionId: string, state: SessionState): Promise<void> {
	try {
		const filePath = getStateFilePath(sessionId);
		const data = JSON.stringify({
			files_changed: Array.from(state.files_changed),
			total_lines_changed: state.total_lines_changed,
			review_suggested: state.review_suggested,
		});
		await fs.writeFile(filePath, data, "utf-8");
	} catch {
		// 保存失敗は無視
	}
}

// ============================================
// 変更量カウント
// ============================================

function countLines(text: string): number {
	return text.split("\n").length;
}

// ============================================
// Hook ハンドラー
// ============================================

async function handleHook(input: HookInput): Promise<HookOutput> {
	const sessionId = input.session_id || "unknown";
	const filePath = input.tool_input?.file_path || "";
	const content = input.tool_input?.content || "";
	const newString = input.tool_input?.new_string || "";

	// ファイルパスが空なら何もしない
	if (!filePath) {
		return { approved: true };
	}

	// セッション状態を読み込み
	const state = await loadSessionState(sessionId);

	// 既にレビュー提案済みならスキップ
	if (state.review_suggested) {
		return { approved: true };
	}

	// 変更ファイルを記録
	state.files_changed.add(filePath);

	// 変更行数をカウント
	const linesChanged = Math.max(countLines(content), countLines(newString));
	state.total_lines_changed += linesChanged;

	// 閾値チェック
	const shouldSuggestReview =
		state.files_changed.size >= MIN_FILES_FOR_REVIEW ||
		state.total_lines_changed >= MIN_LINES_FOR_REVIEW;

	if (shouldSuggestReview) {
		state.review_suggested = true;
		await saveSessionState(sessionId, state);

		return {
			approved: true,
			additionalContext: `📊 ${state.files_changed.size}ファイル以上変更しました。/reviewing-parallel で包括的レビューを検討してください。`,
		};
	}

	// 状態を保存
	await saveSessionState(sessionId, state);

	return { approved: true };
}

// ============================================
// メイン
// ============================================

async function main(): Promise<void> {
	try {
		const chunks: Buffer[] = [];
		for await (const chunk of process.stdin) {
			chunks.push(chunk);
		}
		const input: HookInput = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
		const output = await handleHook(input);
		console.log(JSON.stringify(output));
		process.exit(0);
	} catch (error) {
		// エラー時も approved: true で続行
		console.log(JSON.stringify({ approved: true }));
		process.exit(0);
	}
}

if (import.meta.main) {
	main();
}
