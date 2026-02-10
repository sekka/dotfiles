#!/usr/bin/env bun

/**
 * Command chain validator for Claude Code's PreToolUse hook
 *
 * コマンドチェーン内の危険なパターン（隠れた破壊的操作）を検出する。
 * settings.json のパーミッション設定と重複しないよう、
 * チェーン内の危険パターンのみに焦点を当てる。
 */

import { homedir } from "node:os";

interface HookInput {
	tool_name: string;
	tool_input: {
		command?: string;
	};
	session_id?: string;
}

interface HookOutput {
	hookSpecificOutput: {
		hookEventName: "PreToolUse";
		permissionDecision: "allow" | "block" | "ask";
		permissionDecisionReason: string;
	};
}

// チェーン内で危険な組み合わせパターン
const DANGEROUS_CHAINS = [
	// パイプで危険なコマンドに渡す
	/\|\s*(rm|sudo|dd|shred|mkfs)\s+/,
	// xargs で危険なコマンドを実行
	/xargs\s+(?:-[^\s]*\s+)*(rm|sudo|dd|shred)\s+/,
	// サブシェルでの危険な操作
	/\$\([^)]*(?:rm -rf|sudo|dd|shred)[^)]*\)/,
	// バッククォートでの危険な操作
	/`[^`]*(?:rm -rf|sudo|dd|shred)[^`]*`/,
	// セミコロンで危険なコマンドをチェーン
	/;\s*(?:rm -rf|sudo|dd|shred)\s+/,
	// && で危険なコマンドをチェーン
	/&&\s*(?:rm -rf|sudo|dd|shred)\s+/,
	// || で危険なコマンドをチェーン（エラー時に破壊的操作）
	/\|\|\s*(?:rm -rf|sudo|dd|shred)\s+/,
];

// 絶対ブロックすべきパターン（システム破壊リスク）
const CRITICAL_PATTERNS = [
	/rm\s+-[rRf]*\s+\/(?!\S)/, // rm -rf /
	/rm\s+-[rRf]*\s+~\/\*\s*$/, // rm -rf ~/*
	/dd\s+if=[^\s]+\s+of=\/dev\/[sh]d[a-z]/, // dd to physical disk
];

function validateCommand(command: string): {
	isValid: boolean;
	reason: string;
} {
	// Critical パターンは即ブロック
	for (const pattern of CRITICAL_PATTERNS) {
		if (pattern.test(command)) {
			return {
				isValid: false,
				reason: `Critical: システム破壊の危険性があるコマンドです: ${command.slice(0, 100)}`,
			};
		}
	}

	// チェーン内の危険パターンは確認を求める
	for (const pattern of DANGEROUS_CHAINS) {
		if (pattern.test(command)) {
			return {
				isValid: false,
				reason: `Dangerous chain: コマンドチェーン内に危険な操作が含まれています: ${command.slice(0, 100)}`,
			};
		}
	}

	return { isValid: true, reason: "" };
}

function main() {
	try {
		const stdinText = Bun.readFileSync("/dev/stdin", "utf8");
		if (!stdinText) {
			console.error(
				JSON.stringify({
					hookSpecificOutput: {
						hookEventName: "PreToolUse",
						permissionDecision: "allow",
						permissionDecisionReason: "No input provided",
					},
				}),
			);
			process.exit(0);
		}

		const input: HookInput = JSON.parse(stdinText);
		const command = input.tool_input?.command;

		if (!command) {
			console.error(
				JSON.stringify({
					hookSpecificOutput: {
						hookEventName: "PreToolUse",
						permissionDecision: "allow",
						permissionDecisionReason: "No command to validate",
					},
				}),
			);
			process.exit(0);
		}

		const result = validateCommand(command);
		const output: HookOutput = {
			hookSpecificOutput: {
				hookEventName: "PreToolUse",
				permissionDecision: result.isValid ? "allow" : "ask",
				permissionDecisionReason: result.reason || "Command validated successfully",
			},
		};

		console.error(JSON.stringify(output));
		process.exit(0);
	} catch (error) {
		console.error(
			JSON.stringify({
				hookSpecificOutput: {
					hookEventName: "PreToolUse",
					permissionDecision: "allow",
					permissionDecisionReason: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
				},
			}),
		);
		process.exit(0);
	}
}

main();
