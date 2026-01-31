#!/usr/bin/env bun
/**
 * テスト失敗時デバッグ提案 Hook
 * PostToolUse(Bash) イベントで呼ばれ、テストコマンドの失敗を検出し、
 * /debug スキルの使用を提案する。
 */

// ============================================
// 型定義
// ============================================

interface HookInput {
	hook_event_name: string;
	tool_name?: string;
	tool_input?: {
		command?: string;
	};
	tool_output?: {
		stdout?: string;
		stderr?: string;
		exit_code?: number;
	};
}

interface HookOutput {
	approved: boolean;
	additionalContext?: string;
}

// ============================================
// 検出パターン
// ============================================

// テストコマンドパターン
const TEST_COMMAND_PATTERNS = [
	/\bpytest\b/,
	/\bnpm\s+test\b/,
	/\bnpm\s+run\s+test\b/,
	/\bbun\s+test\b/,
	/\bvitest\b/,
	/\bjest\b/,
];

// 失敗パターン（stdout/stderr）
const FAILURE_PATTERNS = [/FAILED/i, /ERROR/i, /\bFAIL\b/i, /Traceback/i, /AssertionError/i];

// 除外パターン（単純なセットアップエラーは除外）
const EXCLUDE_PATTERNS = [/ModuleNotFoundError/i, /command not found/i];

// ============================================
// 検出ロジック
// ============================================

function isTestCommand(command: string): boolean {
	return TEST_COMMAND_PATTERNS.some((pattern) => pattern.test(command));
}

function hasTestFailure(output: string): boolean {
	// 除外パターンに一致したら false
	if (EXCLUDE_PATTERNS.some((pattern) => pattern.test(output))) {
		return false;
	}

	// 失敗パターンに一致したら true
	return FAILURE_PATTERNS.some((pattern) => pattern.test(output));
}

// ============================================
// Hook ハンドラー
// ============================================

async function handleHook(input: HookInput): Promise<HookOutput> {
	const command = input.tool_input?.command || "";
	const exitCode = input.tool_output?.exit_code;
	const stdout = input.tool_output?.stdout || "";
	const stderr = input.tool_output?.stderr || "";

	// テストコマンドでない、または終了コードが0なら何もしない
	if (!isTestCommand(command) || exitCode === 0) {
		return { approved: true };
	}

	// 失敗パターンを検出
	const output = stdout + "\n" + stderr;
	if (hasTestFailure(output)) {
		return {
			approved: true,
			additionalContext: "❌ テストが失敗しました。/debug スキルで原因調査を検討してください。",
		};
	}

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
