#!/usr/bin/env bun
/**
 * Claude Code Hooksで使用する安全なコマンド実行ガード
 *
 * 元ネタ: https://zenn.dev/tmasuyama1114/articles/claude_code_hooks_guard_bash_command
 *
 * このスクリプトは、Claude CodeのHooks機能を使用して、AIが実行しようとする
 * Bashコマンドを事前に検証し、危険な操作をブロックします。
 *
 * 主な機能:
 * 1. 禁止コマンドの検出（sudo, rm -rf, chmod 777など）
 * 2. 保護ディレクトリの削除検出（/etc, /usr, /varなど）
 * 3. ホームディレクトリ直下の削除検出
 *
 * 使い方:
 * - ~/.claude/settings.jsonのhooks設定に追加
 * - Claude Codeがツールを実行する前に自動的に実行される
 * - 危険なコマンドを検出した場合は終了コード2を返して実行をブロック
 */
import { homedir } from "node:os";

// 削除を禁止するディレクトリ（配下も含む）
// システムの重要なディレクトリへの削除操作を防ぐ
const PROTECTED_DIRS = [
	"/etc",
	"/usr",
	"/var",
	"/opt",
	"/home/", // システムレベルの /home/ のみ（ユーザーホーム配下の同名フォルダは除外）
	"guard_test", // テスト用の保護されたディレクトリ
];

// 禁止するコマンドパターン（正規表現で危険なコマンドを指定）
// 各パターンには、ユーザーにわかりやすいエラーメッセージを添付
const FORBIDDEN_COMMANDS = [
	{ pattern: /\bsudo\b/, message: "root権限での実行" },
	{
		pattern: /\brm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r)\b/,
		message: "強制的な再帰削除（rm -rf）",
	},
	{ pattern: /\brm\s+.*\*/, message: "ワイルドカードを使った削除" },
	{ pattern: /\bchmod\s+777\b/, message: "危険な権限設定（chmod 777）" },
	{
		pattern: /curl.*\|\s*(bash|sh)/,
		message: "未検証スクリプトの実行（curl | bash）",
	},
	{
		pattern: /wget.*\|\s*(bash|sh)/,
		message: "未検証スクリプトの実行（wget | sh）",
	},
	{ pattern: /:\(\)/, message: "フォークボム攻撃" },
	{ pattern: /\bdd\s+.*of=\/dev\//, message: "ディスク直接書き込み（dd）" },
	{ pattern: /\bmkfs\b/, message: "ファイルシステムの破壊（mkfs）" },
	{
		pattern: />\s*\/dev\/(sd|hd|nvme)/,
		message: "ディスクデバイスへの直接書き込み",
	},
	{ pattern: /\beval\b/, message: "任意のコード実行（eval）" },
	{
		pattern: /\bsource\b/,
		message: "未検証スクリプトの読み込み（source）",
	},
	{
		pattern: /^\s*\.\s+/,
		message: "未検証スクリプトの読み込み（. script）",
	},
];

// 削除系コマンドのパターン
// rm, rmdir, unlink, find -delete, find -exec rm, xargs rm などの
// ファイル削除を行う可能性のあるコマンドを検出
const DELETE_COMMANDS = [
	/\brm\b/,
	/\brmdir\b/,
	/\bunlink\b/,
	/\bfind\b.*-delete/,
	/\bfind\b.*-exec\s+rm/,
	/\bxargs\s+rm/,
];

/**
 * 保護されたディレクトリへの削除操作をチェック
 *
 * システムの重要なディレクトリ（/etc, /usr, /var等）への削除コマンドを検出します。
 * まず削除系コマンドの有無を確認し、その後保護ディレクトリがコマンドに含まれているかチェックします。
 *
 * @param command - チェックするコマンド文字列
 * @returns 保護されたディレクトリへの削除操作が検出された場合true
 */
function checkProtectedDirectoryDeletion(command: string): boolean {
	// 削除系コマンドが含まれているかチェック
	const hasDelete = DELETE_COMMANDS.some((pattern) =>
		pattern.test(command.toLowerCase()),
	);
	if (!hasDelete) {
		return false;
	}

	// 保護ディレクトリがコマンドに含まれているかチェック
	for (const protectedDir of PROTECTED_DIRS) {
		// 正規表現の特殊文字をエスケープ
		const escaped = protectedDir.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		if (new RegExp(escaped).test(command)) {
			return true;
		}
	}

	return false;
}

/**
 * ホームディレクトリ直下の削除操作をチェック
 *
 * ホームディレクトリ直下のファイルやディレクトリ（例: ~/important_file.txt）への
 * 削除操作を検出します。ホームディレクトリの表記は複数のパターンに対応しています：
 * - 絶対パス: /Users/username/file
 * - チルダ: ~/file
 * - 環境変数: $HOME/file
 *
 * @param command - チェックするコマンド文字列
 * @returns ホームディレクトリ直下への削除操作が検出された場合true
 */
function checkHomeDirectoryDeletion(command: string): boolean {
	const home = homedir();

	// 削除系コマンドが含まれているかチェック
	const hasDelete = DELETE_COMMANDS.some((pattern) =>
		pattern.test(command.toLowerCase()),
	);
	if (!hasDelete) {
		return false;
	}

	// ホームディレクトリの各種表記パターンをチェック
	const escaped = home.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const homePatterns = [
		new RegExp(`${escaped}/[^/\\s]+(?:\\s|$)`), // /Users/username/file
		/~\/[^/\s]+(?:\s|$)/, // ~/file
		/\$HOME\/[^/\s]+(?:\s|$)/, // $HOME/file
	];

	return homePatterns.some((pattern) => pattern.test(command));
}

/**
 * コマンドをバリデートし、問題があればエラーメッセージを返す
 *
 * 3つのセキュリティレイヤーでコマンドをチェックします：
 * 1. 保護されたディレクトリへの削除操作
 * 2. ホームディレクトリ直下への削除操作
 * 3. 禁止されたコマンドパターン
 *
 * @param command - バリデートするコマンド文字列
 * @returns 検出された問題のリスト（問題がない場合は空配列）
 */
export function validateCommand(command: string): string[] {
	const issues: string[] = [];

	// レイヤー1: 保護されたディレクトリの削除チェック
	if (checkProtectedDirectoryDeletion(command)) {
		issues.push("保護されたディレクトリの削除は禁止されています");
	}

	// レイヤー2: ホームディレクトリ直下の削除チェック
	if (checkHomeDirectoryDeletion(command)) {
		issues.push("ホームディレクトリ直下の削除は禁止されています");
	}

	// レイヤー3: 禁止コマンドパターンのチェック
	for (const { pattern, message } of FORBIDDEN_COMMANDS) {
		if (pattern.test(command.toLowerCase())) {
			issues.push(`禁止されたコマンド: ${message}`);
			break;
		}
	}

	return issues;
}

/**
 * メイン処理
 *
 * Claude Code Hooksから呼び出されるエントリーポイント。
 * 標準入力からJSON形式のツール情報を受け取り、Bashコマンドの安全性を検証します。
 *
 * 終了コード:
 * - 0: 安全なコマンド、または対象外のツール
 * - 1: JSON解析エラー
 * - 2: 危険なコマンドを検出（実行ブロック）
 */
async function main(): Promise<void> {
	try {
		// 標準入力からJSON形式のツール情報を読み取る
		// Claude Codeはツール実行前に以下のようなJSONを渡す:
		// { "tool_name": "Bash", "tool_input": { "command": "rm -rf /" } }
		const chunks: Buffer[] = [];
		for await (const chunk of process.stdin) {
			chunks.push(chunk);
		}
		const input = Buffer.concat(chunks).toString("utf-8");
		const inputData = JSON.parse(input);

		// Bashツール以外は検証不要なので終了
		if (inputData.tool_name !== "Bash") {
			process.exit(0);
		}

		// 実行予定のコマンドを取得
		const command = inputData.tool_input?.command;
		if (!command) {
			process.exit(0);
		}

		// コマンドの安全性をバリデート
		const issues = validateCommand(command);
		if (issues.length > 0) {
			// 危険なコマンドを検出した場合はエラーメッセージを表示してブロック
			console.error("⚠️ 危険なコマンドが検出されました:");
			for (const issue of issues) {
				console.error(`• ${issue}`);
			}
			// 終了コード2を返すことでClaude Codeに実行をブロックさせる
			process.exit(2);
		}

		// 問題なければ終了コード0でClaude Codeに実行を許可
	} catch (error) {
		// JSON解析エラーの場合は終了コード1
		if (error instanceof SyntaxError) {
			console.error(`Error: ${error.message}`);
			process.exit(1);
		}
		throw error;
	}
}

// スクリプトとして直接実行された場合のみmainを呼ぶ
// テストからインポートされた場合は実行されない
if (import.meta.main) {
	main();
}
