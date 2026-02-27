#!/usr/bin/env bun

/**
 * Command chain validator for Claude Code's PreToolUse hook
 *
 * 禁止コマンド（sed/awk/git add -A 等）と危険なコマンドチェーンパターンを検出する。
 * settings.json の deny ルールを補完し、チェーン内に隠れた操作も検知する。
 */

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
		permissionDecision: "allow" | "deny" | "ask";
		permissionDecisionReason: string;
	};
}

// 使用禁止コマンド（即ブロック）
const PROHIBITED_COMMANDS: { pattern: RegExp; reason: string }[] = [
	{
		pattern: /\bg?sed\b/,
		reason:
			"sed は禁止されています。ファイル編集には Edit ツールを使用し、ストリーム処理には 'perl -pe' を使用してください。例: perl -pe 's/old/new/g' file",
	},
	{
		pattern: /\bg?awk\b/,
		reason:
			"awk は禁止されています。ファイル編集には Edit ツールを使用し、フィールド処理には 'perl -lane' を使用してください。例: perl -lane 'print $F[0]' file",
	},
	{
		pattern: /\bgit\s+add\s+(-A\b|--all\b|\.(?:\s|$))/,
		reason:
			"git add -A/--all/. は禁止されています。機密ファイルの意図しないステージングを防ぐため、ファイルを個別に指定してください。例: git add specific-file.ts",
	},
];

// チェーン内で危険な組み合わせパターン
const DANGEROUS_CHAINS = [
	// パイプで危険なコマンドに渡す
	/\|\s*(rm|sudo|dd|shred|mkfs)\s+/,
	// xargs で危険なコマンドを実行
	/xargs\s+(?:-[^\s]*\s+)*(rm|sudo|dd|shred)(?:\s+|$)/,
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
	/rm\s+-[rRf]*\s+~\/+\*\s*$/, // rm -rf ~/* (or ~//* etc.)
	/dd\s+if=[^\s]+\s+of=\/dev\/[sh]d[a-z]/, // dd to physical disk
];

export function validateCommand(command: string): {
	isValid: boolean;
	reason: string;
	severity?: "prohibited" | "dangerous" | "critical";
} {
	// 禁止コマンドは即ブロック
	for (const { pattern, reason } of PROHIBITED_COMMANDS) {
		if (pattern.test(command)) {
			return {
				isValid: false,
				reason,
				severity: "prohibited",
			};
		}
	}

	// Critical パターンは即ブロック
	for (const pattern of CRITICAL_PATTERNS) {
		if (pattern.test(command)) {
			return {
				isValid: false,
				reason: `Critical: システム破壊の危険性があるコマンドです: ${command.slice(0, 100)}`,
				severity: "critical",
			};
		}
	}

	// チェーン内の危険パターンは確認を求める
	for (const pattern of DANGEROUS_CHAINS) {
		if (pattern.test(command)) {
			return {
				isValid: false,
				reason: `Dangerous chain: コマンドチェーン内に危険な操作が含まれています: ${command.slice(0, 100)}`,
				severity: "dangerous",
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
		let permissionDecision: "allow" | "deny" | "ask";
		if (!result.isValid && (result.severity === "prohibited" || result.severity === "critical")) {
			permissionDecision = "deny";
		} else if (!result.isValid) {
			permissionDecision = "ask";
		} else {
			permissionDecision = "allow";
		}

		const output: HookOutput = {
			hookSpecificOutput: {
				hookEventName: "PreToolUse",
				permissionDecision,
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

// スクリプトが直接実行された場合のみ main() を呼び出す
if (import.meta.main) {
	main();
}
