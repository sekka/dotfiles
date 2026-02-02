#!/usr/bin/env bun
/**
 * CLI呼び出しログ Hook
 * PostToolUse(Task) イベントで呼ばれ、エージェント呼び出しをログに記録する。
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
		subagent_type?: string;
		prompt?: string;
		description?: string;
	};
	tool_output?: {
		status?: string;
		duration_ms?: number;
	};
	session_id?: string;
}

interface HookOutput {
	approved: boolean;
}

interface LogEntry {
	timestamp: string;
	session_id: string;
	subagent_type: string;
	prompt_summary: string;
	duration_ms: number;
	status: string;
}

// ============================================
// 設定
// ============================================

const LOG_DIR = `${process.env.HOME}/.claude/logs`;
const LOG_FILE = path.join(LOG_DIR, "agent-calls.jsonl");
const LOG_RETENTION_DAYS = 7;

// ============================================
// ログ記録
// ============================================

async function ensureLogDir(): Promise<void> {
	try {
		await fs.mkdir(LOG_DIR, { recursive: true });
	} catch {
		// ディレクトリ作成失敗は無視
	}
}

async function appendLog(entry: LogEntry): Promise<void> {
	try {
		await ensureLogDir();
		const line = JSON.stringify(entry) + "\n";
		await fs.appendFile(LOG_FILE, line, "utf-8");
	} catch {
		// ログ記録失敗は無視（Claudeを止めない）
	}
}

async function rotateOldLogs(): Promise<void> {
	try {
		const stats = await fs.stat(LOG_FILE);
		const ageInDays = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);

		if (ageInDays > LOG_RETENTION_DAYS) {
			// ログファイルをバックアップして新規作成
			const backupFile = `${LOG_FILE}.${Date.now()}.bak`;
			await fs.rename(LOG_FILE, backupFile);

			// 古いバックアップファイルを削除
			const files = await fs.readdir(LOG_DIR);
			const backupFiles = files.filter(
				(f) => f.startsWith("agent-calls.jsonl.") && f.endsWith(".bak"),
			);

			for (const file of backupFiles) {
				const filePath = path.join(LOG_DIR, file);
				const fileStats = await fs.stat(filePath);
				const fileAgeInDays = (Date.now() - fileStats.mtimeMs) / (1000 * 60 * 60 * 24);

				if (fileAgeInDays > LOG_RETENTION_DAYS) {
					await fs.unlink(filePath);
				}
			}
		}
	} catch {
		// ローテーション失敗は無視
	}
}

// ============================================
// Hook ハンドラー
// ============================================

async function handleHook(input: HookInput): Promise<HookOutput> {
	const subagentType = input.tool_input?.subagent_type || "unknown";
	const prompt = input.tool_input?.prompt || input.tool_input?.description || "";
	const status = input.tool_output?.status || "unknown";
	const durationMs = input.tool_output?.duration_ms || 0;
	const sessionId = input.session_id || "unknown";

	// プロンプトを要約（最初の100文字）
	const promptSummary = prompt.length > 100 ? `${prompt.substring(0, 97)}...` : prompt;

	const logEntry: LogEntry = {
		timestamp: new Date().toISOString(),
		session_id: sessionId,
		subagent_type: subagentType,
		prompt_summary: promptSummary,
		duration_ms: durationMs,
		status,
	};

	// ログに記録
	await appendLog(logEntry);

	// ログローテーション（バックグラウンドで実行）
	rotateOldLogs().catch(() => {
		// エラー無視
	});

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
