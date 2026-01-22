#!/usr/bin/env bun

/**
 * シンプルな command validator for Claude Code's PreToolUse hook
 *
 * 危険な Bash コマンドを実行前に検証し、ユーザーに確認を求める。
 * 既存の command-validator を単一ファイルにシンプル化した実装。
 */

import { homedir } from "node:os";
import { join } from "node:path";

// ============================================
// 型定義
// ============================================

interface HookInput {
	tool_name: string;
	tool_input: {
		command?: string;
	};
	session_id?: string;
}

interface ValidationResult {
	isValid: boolean;
	severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
	violations: string[];
}

interface HookOutput {
	hookSpecificOutput: {
		hookEventName: "PreToolUse";
		permissionDecision: "allow" | "block" | "ask";
		permissionDecisionReason: string;
	};
}

// ============================================
// セキュリティルール
// ============================================

const CRITICAL_COMMANDS = [
	"del",
	"format",
	"mkfs",
	"shred",
	"dd",
	"fdisk",
	"parted",
	"gparted",
	"cfdisk",
];

const PRIVILEGE_COMMANDS = [
	"sudo",
	"su",
	"passwd",
	"chpasswd",
	"usermod",
	"chmod",
	"chown",
	"chgrp",
	"setuid",
	"setgid",
];

const NETWORK_COMMANDS = [
	"nc",
	"netcat",
	"nmap",
	"telnet",
	"ssh-keygen",
	"iptables",
	"ufw",
	"firewall-cmd",
	"ipfw",
];

const SYSTEM_COMMANDS = [
	"systemctl",
	"service",
	"kill",
	"killall",
	"pkill",
	"mount",
	"umount",
	"swapon",
	"swapoff",
];

// 確認が必要なコマンド（破壊的だが条件次第では許可）
const CONFIRM_REQUIRED_COMMANDS = ["rm", "mv"];

const SAFE_COMMANDS = [
	"ls",
	"dir",
	"pwd",
	"whoami",
	"date",
	"echo",
	"cat",
	"head",
	"tail",
	"grep",
	"find",
	"wc",
	"sort",
	"uniq",
	"cut",
	"awk",
	"sed",
	"git",
	"npm",
	"pnpm",
	"node",
	"bun",
	"python",
	"pip",
	"source",
	"cd",
	"cp",
	"mkdir",
	"touch",
	"ln",
	"psql",
	"mysql",
	"sqlite3",
	"mongo",
	"docker",
];

const DANGEROUS_PATTERNS: RegExp[] = [
	// rm -rf 危険パターン
	/rm\s+.*-rf\s*\/\s*$/i,
	/rm\s+.*-rf\s*\/etc/i,
	/rm\s+.*-rf\s*\/usr/i,
	/rm\s+.*-rf\s*\/bin/i,
	/rm\s+.*-rf\s*\/sys/i,
	/rm\s+.*-rf\s*\/proc/i,
	/rm\s+.*-rf\s*\/boot/i,
	/rm\s+.*-rf\s*\/home\/[^/]*\s*$/i,
	/rm\s+.*-rf\s*\.\.+\//i,
	/rm\s+.*-rf\s*\*.*\*/i,
	/rm\s+.*-rf\s*\$\w+/i,

	// デバイス破壊
	/>\s*\/dev\/(sda|hda|nvme)/i,
	/dd\s+.*of=\/dev\//i,
	/shred\s+.*\/dev\//i,
	/mkfs\.\w+\s+\/dev\//i,

	// フォークボム・無限ループ
	/:\(\)\{\s*:\|:&\s*\};:/,
	/while\s+true\s*;\s*do.*done/i,
	/for\s*\(\(\s*;\s*;\s*\)\)/i,

	// パイプ実行
	/\|\s*(sh|bash|zsh|fish)$/i,
	/(wget|curl)\s+.*\|\s*(sh|bash)/i,
	/(wget|curl)\s+.*-O-.*\|\s*(sh|bash)/i,

	// コマンド置換攻撃
	/`.*rm.*`/i,
	/\$\(.*rm.*\)/i,
	/`.*dd.*`/i,
	/\$\(.*dd.*\)/i,

	// センシティブファイルアクセス
	/cat\s+\/etc\/(passwd|shadow|sudoers)/i,
	/>\s*\/etc\/(passwd|shadow|sudoers)/i,
	/echo\s+.*>>\s*\/etc\/(passwd|shadow|sudoers)/i,

	// ネットワーク攻撃
	/\|\s*nc\s+\S+\s+\d+/i,
	/curl\s+.*-d.*\$\(/i,
	/wget\s+.*--post-data.*\$\(/i,

	// ログ改ざん
	/>\s*\/var\/log\//i,
	/rm\s+\/var\/log\//i,
	/echo\s+.*>\s*~?\/?\.bash_history/i,

	// バックドア
	/nc\s+.*-l.*-e/i,
	/nc\s+.*-e.*-l/i,
	/ncat\s+.*--exec/i,
	/ssh-keygen.*authorized_keys/i,

	// リモートスクリプト実行
	/(wget|curl).*\.(sh|py|pl|exe|bin).*\|\s*(sh|bash|python)/i,

	// クリプトマイナー
	/(xmrig|ccminer|cgminer|bfgminer)/i,

	// カーネルメモリアクセス
	/cat\s+\/dev\/(mem|kmem)/i,
	/echo\s+.*>\s*\/dev\/(mem|kmem)/i,

	// カーネルモジュール操作
	/(insmod|rmmod|modprobe)\s+/i,

	// Cron 操作
	/crontab\s+-e/i,
	/echo\s+.*>>\s*\/var\/spool\/cron/i,

	// 環境変数漏洩
	/env\s*\|\s*grep.*PASSWORD/i,
	/printenv.*PASSWORD/i,

	// Docker 危険操作
	/docker\s+(rm|rmi|kill|stop)\s+.*\$\(/i,
	/docker\s+system\s+prune.*-a/i,
	/docker\s+container\s+prune.*-f/i,
	/docker\s+volume\s+rm.*\$\(/i,
	/docker\s+network\s+rm.*\$\(/i,

	// Prisma 危険操作
	/prisma\s+(migrate\s+reset|db\s+push\s+--force-reset)/i,

	// パイプ経由の rm/mv
	/\|\s*rm(\s|$)/i,
	/xargs\s+.*\brm\b/i,
	/find\s+.*-exec\s+rm/i,
	/\|\s*mv(\s|$)/i,
];

const PROTECTED_PATHS = [
	"/etc/",
	"/usr/",
	"/sbin/",
	"/boot/",
	"/sys/",
	"/proc/",
	"/dev/",
	"/root/",
];

const SAFE_RM_PATHS = [join(homedir(), "Developer/"), "/tmp/", "/var/tmp/", `${process.cwd()}/`];

// ============================================
// バリデーション関数
// ============================================

/**
 * コマンド文字列からメインコマンド名を抽出
 */
function getMainCommand(command: string): string {
	const normalized = command.trim().toLowerCase();
	const parts = normalized.split(/\s+/).filter((p) => p.length > 0);
	const firstPart = parts[0] || "";
	return firstPart.split("/").pop() || "";
}

/**
 * 基本検証（空、長さ、バイナリ）
 */
function validateBasic(command: string): ValidationResult | null {
	if (!command || typeof command !== "string") {
		return {
			isValid: false,
			severity: "LOW",
			violations: ["Invalid command format"],
		};
	}

	if (command.length > 2000) {
		return {
			isValid: false,
			severity: "MEDIUM",
			violations: ["Command too long (potential buffer overflow)"],
		};
	}

	if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\xFF]/.test(command)) {
		return {
			isValid: false,
			severity: "HIGH",
			violations: ["Binary or encoded content detected"],
		};
	}

	return null;
}

/**
 * 危険コマンド分類チェック
 */
function checkCommandCategory(mainCmd: string): ValidationResult | null {
	if (CRITICAL_COMMANDS.includes(mainCmd)) {
		return {
			isValid: false,
			severity: "CRITICAL",
			violations: [`Critical system command: ${mainCmd}`],
		};
	}

	if (PRIVILEGE_COMMANDS.includes(mainCmd)) {
		return {
			isValid: false,
			severity: "HIGH",
			violations: [`Privilege escalation command: ${mainCmd}`],
		};
	}

	if (NETWORK_COMMANDS.includes(mainCmd)) {
		return {
			isValid: false,
			severity: "HIGH",
			violations: [`Network command: ${mainCmd}`],
		};
	}

	if (SYSTEM_COMMANDS.includes(mainCmd)) {
		return {
			isValid: false,
			severity: "HIGH",
			violations: [`System manipulation command: ${mainCmd}`],
		};
	}

	return null;
}

/**
 * 危険パターンチェック
 */
function checkDangerousPatterns(command: string): ValidationResult | null {
	for (const pattern of DANGEROUS_PATTERNS) {
		if (pattern.test(command)) {
			return {
				isValid: false,
				severity: "CRITICAL",
				violations: [`Dangerous pattern detected: ${pattern.source.substring(0, 50)}...`],
			};
		}
	}
	return null;
}

/**
 * rm -rf 安全性チェック
 */
function checkRmRfSafety(command: string): ValidationResult | null {
	// rm -r または rm -rf パターンをチェック
	if (!/rm\s+.*-[rf]*r[rf]*/.test(command)) {
		return null;
	}

	// ターゲットパスを抽出
	const pathMatch = command.match(/rm\s+(?:-\w+\s+)*([^\s;&|]+)/);
	const targetPath = pathMatch?.[1] || "";

	// ルートまたは絶対パスで終わる場合は危険
	if (targetPath === "/" || targetPath.endsWith("/")) {
		return {
			isValid: false,
			severity: "CRITICAL",
			violations: ["rm -rf on root or directory path"],
		};
	}

	// 安全なパスかチェック
	for (const safePath of SAFE_RM_PATHS) {
		if (targetPath.startsWith(safePath)) {
			return null;
		}
	}

	// 相対パスは許可
	if (!targetPath.startsWith("/")) {
		return null;
	}

	// 保護パスかチェック
	for (const protectedPath of PROTECTED_PATHS) {
		if (targetPath.startsWith(protectedPath)) {
			return {
				isValid: false,
				severity: "CRITICAL",
				violations: [`rm -rf on protected path: ${protectedPath}`],
			};
		}
	}

	return null;
}

/**
 * 確認が必要なコマンドのチェック
 * rm, mv は全て実行前にユーザー確認を求める
 * ただし rm -r/-rf で安全なパスの場合は checkRmRfSafety で既に判定済みのため除外
 */
function checkConfirmRequired(command: string, mainCmd: string): ValidationResult | null {
	// git サブコマンドとしての rm/mv は git コマンドとして扱う
	if (command.trim().startsWith("git ")) {
		return null;
	}

	// rm -r または rm -rf パターンは checkRmRfSafety で既に処理されている
	if (mainCmd === "rm" && /rm\s+.*-[rf]*r[rf]*/.test(command)) {
		return null;
	}

	if (CONFIRM_REQUIRED_COMMANDS.includes(mainCmd)) {
		return {
			isValid: false,
			severity: "MEDIUM",
			violations: [`Destructive command requires confirmation: ${mainCmd}`],
		};
	}
	return null;
}

/**
 * コマンドチェーン分割（&&, ||, ;）
 */
function splitCommandChain(command: string): string[] {
	const commands: string[] = [];
	let current = "";
	let inQuotes = false;
	let quoteChar = "";

	for (let i = 0; i < command.length; i++) {
		const char = command[i];
		const next = command[i + 1];

		if ((char === '"' || char === "'") && !inQuotes) {
			inQuotes = true;
			quoteChar = char;
		} else if (char === quoteChar && inQuotes) {
			inQuotes = false;
			quoteChar = "";
		}

		if (!inQuotes && ((char === "&" && next === "&") || (char === "|" && next === "|"))) {
			commands.push(current.trim());
			current = "";
			i++;
		} else if (!inQuotes && char === ";") {
			commands.push(current.trim());
			current = "";
		} else {
			current += char;
		}
	}

	if (current.trim()) {
		commands.push(current.trim());
	}

	return commands.filter((c) => c.length > 0);
}

/**
 * メインバリデーション関数
 */
export function validateCommand(command: string): ValidationResult {
	// 基本検証
	const basicResult = validateBasic(command);
	if (basicResult) return basicResult;

	const mainCmd = getMainCommand(command);

	// ホワイトリスト（source, python は常に許可）
	if (mainCmd === "source" || mainCmd === "python") {
		return { isValid: true, severity: "LOW", violations: [] };
	}

	// 危険コマンド分類
	const categoryResult = checkCommandCategory(mainCmd);
	if (categoryResult) return categoryResult;

	// 危険パターン
	const patternResult = checkDangerousPatterns(command);
	if (patternResult) return patternResult;

	// 確認必須コマンド（rm -rf 安全性チェックの前に実行）
	// ただし rm -rf は特別扱いするため、先に安全性をチェック
	const rmResult = checkRmRfSafety(command);
	if (rmResult) return rmResult;

	// rm -rf 以外の rm/mv コマンドは確認必須
	const confirmResult = checkConfirmRequired(command, mainCmd);
	if (confirmResult) return confirmResult;

	// コマンドチェーン検証（再帰的）
	if (command.includes("&&") || command.includes("||") || command.includes(";")) {
		const chains = splitCommandChain(command);
		// 1つ以上のコマンドに分割された場合のみ検証（無限ループ防止）
		if (chains.length > 1) {
			for (const chain of chains) {
				const chainResult = validateCommand(chain.trim());
				if (!chainResult.isValid) {
					return {
						...chainResult,
						violations: [`Chained command: ${chainResult.violations.join(", ")}`],
					};
				}
			}
		}
	}

	return { isValid: true, severity: "LOW", violations: [] };
}

// ============================================
// CLI エントリポイント
// ============================================

async function main() {
	try {
		// ログファイルへの出力（デバッグ用）
		// 環境変数 VALIDATE_COMMAND_DEBUG=1 でログを有効化
		const isDebugMode = process.env.VALIDATE_COMMAND_DEBUG === "1";
		const logFile = join(homedir(), "dotfiles", "validate-command.log");
		const log = (message: string) => {
			if (!isDebugMode) return;
			const fs = require("node:fs");
			const timestamp = new Date().toISOString();
			fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
		};

		// stdin から JSON 読み取り
		const chunks: Buffer[] = [];
		for await (const chunk of process.stdin) {
			chunks.push(chunk);
		}
		const input = Buffer.concat(chunks).toString();

		if (!input.trim()) {
			console.error("No input received from stdin");
			process.exit(1);
		}

		let hookData: HookInput;
		try {
			hookData = JSON.parse(input);
		} catch (error) {
			console.error("Invalid JSON input:", (error as Error).message);
			process.exit(1);
		}

		const toolName = hookData.tool_name || "Unknown";
		const toolInput = hookData.tool_input || {};

		// Bash 以外はスキップ
		if (toolName !== "Bash") {
			console.log(`Skipping validation for tool: ${toolName}`);
			process.exit(0);
		}

		const command = toolInput.command;
		if (!command) {
			console.error("No command found in tool input");
			process.exit(1);
		}

		// ログ出力
		log(`Hook called for command: ${command}`);

		// バリデーション実行
		const result = validateCommand(command);

		if (result.isValid) {
			log(`Command allowed: ${command}`);
			console.log("Command validation passed");
			process.exit(0);
		}

		// 危険コマンド検出時：ユーザーに確認
		log(
			`Command requires confirmation: ${command}, Severity: ${result.severity}, Violations: ${result.violations.join(", ")}`,
		);

		const confirmationMessage = `⚠️  Potentially dangerous command detected!\n\nCommand: ${command}\nViolations: ${result.violations.join(", ")}\nSeverity: ${result.severity}\n\nDo you want to proceed with this command?`;

		const hookOutput: HookOutput = {
			hookSpecificOutput: {
				hookEventName: "PreToolUse",
				permissionDecision: "ask",
				permissionDecisionReason: confirmationMessage,
			},
		};

		console.log(JSON.stringify(hookOutput));
		process.exit(0);
	} catch (error) {
		console.error("Validation script error:", error);
		process.exit(2);
	}
}

// CLI として実行された場合のみ main() を呼ぶ
if (import.meta.main) {
	main().catch((error) => {
		console.error("Fatal error:", error);
		process.exit(2);
	});
}
