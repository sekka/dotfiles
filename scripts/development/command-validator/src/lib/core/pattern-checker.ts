/**
 * パターン検出モジュール（バリデーション段階2）
 *
 * 責務：
 * - 危険な正規表現パターンの検出（fork bombs, 権限昇格コマンド）
 * - コマンド分類による検出（CRITICAL/PRIVILEGE/NETWORK/SYSTEM）
 * - メインコマンド（exe名）の抽出と正規化
 *
 * 入力：文字列型のシェルコマンド
 * 出力：ValidationResult | null（違反検出時のみ結果を返す）
 *
 * セキュリティ保証：
 * - DANGEROUS_PATTERNS正規表現群による既知マルウェアパターン検出
 * - CRITICAL_COMMANDS（dd, mkfs, shred等）の絶対ブロック
 * - PRIVILEGE_COMMANDS（sudo, passwd, chmod等）の検出
 * - NETWORK_COMMANDS（nc, nmap, telnet等）の検出
 * - SYSTEM_COMMANDS（shutdown, reboot, service等）の検出
 *
 * ReDoS対策：
 * - パターン正規表現は予めコンパイル・検証済み
 * - 複雑な量指定子/交互を避けた設計
 */

import { SECURITY_RULES } from "../security-rules";
import type { ValidationResult } from "../types";

/**
 * コマンドをパース して正規化
 * @param command - パースするコマンド
 * @returns 正規化されたコマンド情報
 */
function parseCommand(command: string): {
	normalizedCmd: string;
	mainCommand: string;
	cmdParts: string[];
} {
	const normalizedCmd = command.trim().toLowerCase();
	const cmdParts = normalizedCmd.split(/\s+/).filter((part) => part.length > 0);
	const mainCommand = cmdParts[0]?.split("/").pop() || "";

	return { normalizedCmd, mainCommand, cmdParts };
}

/**
 * コマンド内に存在する危険なキーワードを抽出（パフォーマンス最適化）
 * 正規表現テストの前に事前フィルタリング用
 * @param command - チェック対象のコマンド
 * @returns 見つかったキーワードのセット
 */
function extractDangerousKeywords(command: string): Set<string> {
	const keywords = new Set<string>();
	const lowerCmd = command.toLowerCase();

	// rm コマンド関連
	if (lowerCmd.includes("rm ")) keywords.add("rm");

	// dd コマンド
	if (lowerCmd.includes("dd ")) keywords.add("dd");

	// shred コマンド
	if (lowerCmd.includes("shred ")) keywords.add("shred");

	// mkfs コマンド
	if (lowerCmd.includes("mkfs")) keywords.add("mkfs");

	// fork bomb の危険なシンボル（様々な表現形式に対応）
	if (lowerCmd.includes(":()") || lowerCmd.includes("while true") || lowerCmd.includes("for ((")) {
		keywords.add("fork");
	}

	// パイプとシェル
	if (
		lowerCmd.includes("| sh") ||
		lowerCmd.includes("| bash") ||
		lowerCmd.includes("| zsh") ||
		lowerCmd.includes("| fish")
	) {
		keywords.add("shell_pipe");
	}

	// wget/curl
	if (lowerCmd.includes("wget ") || lowerCmd.includes("curl ")) keywords.add("wget_curl");

	// コマンド置換
	if (lowerCmd.includes("$(") || lowerCmd.includes("`")) keywords.add("command_substitution");

	// ネットワークコマンド
	if (lowerCmd.includes("nc ") || lowerCmd.includes("ncat ")) keywords.add("netcat");

	// デバイスファイル操作（/dev/mem, /dev/kmem等）
	if (lowerCmd.includes("/dev/mem") || lowerCmd.includes("/dev/kmem")) keywords.add("device_mem");
	// その他の /dev/ 操作
	if (lowerCmd.includes("/dev/")) keywords.add("device_file");

	// 危険なシステムパス
	if (lowerCmd.includes("/etc/")) keywords.add("etc_files");
	if (lowerCmd.includes("/var/log/")) keywords.add("var_log");
	if (lowerCmd.includes(".bash_history")) keywords.add("bash_history");

	// その他の危険なコマンド
	if (lowerCmd.includes("docker ")) keywords.add("docker");
	if (
		lowerCmd.includes("insmod ") ||
		lowerCmd.includes("rmmod ") ||
		lowerCmd.includes("modprobe ")
	) {
		keywords.add("kernel_module");
	}
	if (lowerCmd.includes("crontab ") || lowerCmd.includes("/var/spool/cron"))
		keywords.add("crontab");
	if (lowerCmd.includes("ssh-keygen")) keywords.add("ssh_keygen");
	if (
		lowerCmd.includes("xmrig") ||
		lowerCmd.includes("ccminer") ||
		lowerCmd.includes("cgminer") ||
		lowerCmd.includes("bfgminer")
	) {
		keywords.add("miner");
	}
	if (lowerCmd.includes("env ") || lowerCmd.includes("printenv")) keywords.add("env_vars");
	// prisma コマンド
	if (lowerCmd.includes("prisma ")) keywords.add("prisma");

	return keywords;
}

/**
 * 危険なパターンをチェック（事前フィルタリング付き）
 * @param command - チェックするコマンド
 * @returns 違反が見つかった場合はValidationResult、見つからなければnull
 */
export function checkDangerousPatterns(command: string): ValidationResult | null {
	const keywords = extractDangerousKeywords(command);

	// キーワードが全く見つからない場合は安全
	if (keywords.size === 0) {
		return null;
	}

	// キーワードに基づいて関連パターンのみをテスト
	for (const pattern of SECURITY_RULES.DANGEROUS_PATTERNS) {
		const source = pattern.source.toLowerCase();

		// パターンが含むキーワードをチェック
		let shouldTest = false;

		if (keywords.has("rm") && source.includes("rm")) shouldTest = true;
		else if (keywords.has("dd") && source.includes("dd")) shouldTest = true;
		else if (keywords.has("shred") && source.includes("shred")) shouldTest = true;
		else if (keywords.has("mkfs") && source.includes("mkfs")) shouldTest = true;
		else if (
			keywords.has("fork") &&
			(source.includes(":()") ||
				source.includes(":\\(\\)") ||
				source.includes("while") ||
				source.includes("for"))
		)
			shouldTest = true;
		else if (keywords.has("shell_pipe") && source.includes("sh|bash|zsh|fish")) shouldTest = true;
		else if (keywords.has("wget_curl") && (source.includes("wget") || source.includes("curl")))
			shouldTest = true;
		else if (
			keywords.has("command_substitution") &&
			(source.includes("$(") || source.includes("`"))
		)
			shouldTest = true;
		else if (keywords.has("netcat") && (source.includes("nc") || source.includes("ncat")))
			shouldTest = true;
		else if (
			keywords.has("device_mem") &&
			(source.includes("mem|kmem") || source.includes("mem") || source.includes("kmem"))
		)
			shouldTest = true;
		else if (keywords.has("device_file") && source.includes("/dev/")) shouldTest = true;
		else if (keywords.has("etc_files") && source.includes("etc")) shouldTest = true;
		else if (keywords.has("var_log") && source.includes("var/log")) shouldTest = true;
		else if (keywords.has("bash_history") && source.includes("bash_history")) shouldTest = true;
		else if (keywords.has("docker") && source.includes("docker")) shouldTest = true;
		else if (
			keywords.has("kernel_module") &&
			(source.includes("insmod") || source.includes("rmmod") || source.includes("modprobe"))
		)
			shouldTest = true;
		else if (keywords.has("crontab") && source.includes("crontab")) shouldTest = true;
		else if (keywords.has("ssh_keygen") && source.includes("ssh")) shouldTest = true;
		else if (
			keywords.has("miner") &&
			(source.includes("xmrig") ||
				source.includes("ccminer") ||
				source.includes("cgminer") ||
				source.includes("bfgminer"))
		)
			shouldTest = true;
		else if (keywords.has("env_vars") && (source.includes("env") || source.includes("printenv")))
			shouldTest = true;
		else if (keywords.has("prisma") && source.includes("prisma")) shouldTest = true;

		if (shouldTest && pattern.test(command)) {
			return {
				isValid: false,
				severity: "CRITICAL",
				violations: [`Dangerous pattern detected: ${pattern.source}`],
				sanitizedCommand: command,
			};
		}
	}
	return null;
}

/**
 * コマンド分類による検出（CRITICAL/PRIVILEGE/NETWORK/SYSTEM）
 * @param command - チェックするコマンド
 * @returns 違反が見つかった場合はValidationResult、見つからなければnull
 */
export function checkCommandClassification(command: string): ValidationResult | null {
	const { mainCommand } = parseCommand(command);

	// ホワイトリスト：source と python は許可（後で値を返す実装）
	if (mainCommand === "source" || mainCommand === "python") {
		return null;
	}

	if (SECURITY_RULES.CRITICAL_COMMANDS.includes(mainCommand)) {
		return {
			isValid: false,
			severity: "CRITICAL",
			violations: [`Critical dangerous command: ${mainCommand}`],
			sanitizedCommand: command,
		};
	}

	if (SECURITY_RULES.PRIVILEGE_COMMANDS.includes(mainCommand)) {
		return {
			isValid: false,
			severity: "HIGH",
			violations: [`Privilege escalation command: ${mainCommand}`],
			sanitizedCommand: command,
		};
	}

	if (SECURITY_RULES.NETWORK_COMMANDS.includes(mainCommand)) {
		return {
			isValid: false,
			severity: "HIGH",
			violations: [`Network/remote access command: ${mainCommand}`],
			sanitizedCommand: command,
		};
	}

	if (SECURITY_RULES.SYSTEM_COMMANDS.includes(mainCommand)) {
		return {
			isValid: false,
			severity: "HIGH",
			violations: [`System manipulation command: ${mainCommand}`],
			sanitizedCommand: command,
		};
	}

	return null;
}

/**
 * 一連のパターン検出を実行
 * @param command - 検出対象のコマンド
 * @returns 最初に見つかった違反、またはnull（全て合格）
 */
export function runPatternCheck(command: string): ValidationResult | null {
	// 順序が重要：パターン → コマンド分類
	let result = checkDangerousPatterns(command);
	if (result) return result;

	result = checkCommandClassification(command);
	if (result) return result;

	return null;
}

/**
 * メインコマンドを取得
 * （validator.tsで頻繁に使用されるため公開）
 * @param command - コマンド文字列
 * @returns メインコマンド名
 */
export function getMainCommand(command: string): string {
	const { mainCommand } = parseCommand(command);
	return mainCommand;
}
