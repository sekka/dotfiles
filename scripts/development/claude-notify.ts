#!/usr/bin/env bun
/**
 * Claude Code Hooks 用 macOS 通知スクリプト（Terminal Notifier版）
 *
 * 作業完了や許可リクエストなど、重要なタイミングで macOS 標準通知を表示します。
 * Terminal Notifier を使用してClaudeアイコン付きの高度な通知を表示します。
 *
 * 対応する hooks:
 * - Stop: メインエージェントの作業完了
 * - PermissionRequest: 許可リクエスト（Bash, Task, ファイル操作など）
 * - SubagentStop: サブタスク完了
 * - Notification: Claude Code からの通知（permission_prompt, idle_prompt など）
 *
 * アイコン表示:
 * - SVG: ~/dotfiles/assets/icons/claude.svg が存在する場合は file:// URL で表示
 * - PNG: ~/dotfiles/assets/icons/claude.png が存在する場合は絶対パスで表示
 * - 存在しない場合は Terminal Notifier のデフォルトアイコンを使用
 *
 * 終了コード:
 * - 0: 成功（通知表示成功またはスキップ）
 * - 1: JSON パースエラー
 */

// ============================================
// 定数定義
// ============================================

/** Claudeロゴアイコンのパス（絶対パス） */
const CLAUDE_ICON_PATHS = [
	`${process.env.HOME}/dotfiles/assets/icons/claude.svg`,
	`${process.env.HOME}/dotfiles/assets/icons/claude.png`,
];

// ============================================
// 型定義
// ============================================

interface StopHookInput {
	session_id: string;
	transcript_path: string;
	permission_mode: string;
	hook_event_name: "Stop";
	stop_hook_active: boolean;
}

interface PermissionRequestHookInput {
	tool_name: string;
	tool_input: Record<string, unknown>;
	hook_event_name: "PermissionRequest";
}

interface SubagentStopHookInput {
	session_id: string;
	transcript_path: string;
	permission_mode: string;
	hook_event_name: "SubagentStop";
	stop_hook_active: boolean;
}

interface NotificationHookInput {
	session_id: string;
	transcript_path: string;
	cwd: string;
	permission_mode: string;
	hook_event_name: "Notification";
	message: string;
	notification_type: string;
}

type HookInput =
	| StopHookInput
	| PermissionRequestHookInput
	| SubagentStopHookInput
	| NotificationHookInput;

// ============================================
// 通知表示関数
// ============================================

/**
 * macOS 通知を表示（Terminal Notifier使用）
 *
 * Claudeアイコン（SVG または PNG）が存在する場合は表示。存在しない場合はデフォルトアイコンを使用。
 * SVG は `file://` URL プロトコルで指定、PNG は絶対パスで指定。
 *
 * @param title - 通知のタイトル
 * @param message - 通知のメッセージ
 */
async function showNotification(title: string, message: string): Promise<void> {
	try {
		// terminal-notifier のコマンド引数を構築
		const args = ["-title", title, "-message", message, "-sound", "default"];

		// アイコンファイルを探す（SVG → PNG の順で確認）
		let iconPath: string | null = null;
		for (const path of CLAUDE_ICON_PATHS) {
			if (await Bun.file(path).exists()) {
				// SVG の場合は file:// URL プロトコルで指定
				if (path.endsWith(".svg")) {
					iconPath = `file://${path}`;
				} else {
					// PNG などは絶対パスで指定
					iconPath = path;
				}
				break;
			}
		}

		// アイコンが見つかった場合は追加
		if (iconPath) {
			args.push("-appIcon", iconPath);
		}

		const proc = Bun.spawn({
			cmd: ["terminal-notifier", ...args],
			stdout: "pipe",
			stderr: "pipe",
		});

		const exitCode = await proc.exited;

		if (exitCode !== 0) {
			// terminal-notifier 失敗時はログに記録するが、hook 自体は成功扱い
			const stderr = await new Response(proc.stderr).text();
			console.error(`terminal-notifier failed (exit code ${exitCode}): ${stderr}`);
		}
	} catch (error) {
		// terminal-notifier の実行エラーも無視（通知失敗で Claude を止めない）
		console.error(`Failed to execute terminal-notifier: ${error}`);
	}
}

// ============================================
// Hook ハンドラー
// ============================================

/**
 * Stop hook ハンドラー: メインエージェントの作業完了
 *
 * @param input - Stop hook の入力データ
 */
async function handleStopHook(input: StopHookInput): Promise<void> {
	// stop_hook_active が true の場合は既に通知済みなのでスキップ（無限ループ防止）
	if (input.stop_hook_active) {
		return;
	}

	await showNotification("Claude Code", "作業が完了しました");
}

/**
 * PermissionRequest hook ハンドラー: 許可リクエスト
 *
 * @param input - PermissionRequest hook の入力データ
 */
async function handlePermissionRequestHook(input: PermissionRequestHookInput): Promise<void> {
	const toolName = input.tool_name;
	const command = input.tool_input?.command as string | undefined;

	let message = `${toolName} ツールの使用許可が必要です`;

	// Bash コマンドの場合は、コマンド内容を含める（長すぎる場合は切り詰め）
	if (toolName === "Bash" && command) {
		const shortCommand = command.length > 50 ? `${command.substring(0, 47)}...` : command;
		message = `Bash: ${shortCommand}`;
	}

	await showNotification("Claude Code - 許可リクエスト", message);
}

/**
 * SubagentStop hook ハンドラー: サブタスク完了
 *
 * @param input - SubagentStop hook の入力データ
 */
async function handleSubagentStopHook(input: SubagentStopHookInput): Promise<void> {
	// stop_hook_active が true の場合はスキップ（無限ループ防止）
	if (input.stop_hook_active) {
		return;
	}

	await showNotification("Claude Code", "サブタスクが完了しました");
}

/**
 * Notification hook ハンドラー: Claude Code からの通知
 *
 * @param input - Notification hook の入力データ
 */
async function handleNotificationHook(input: NotificationHookInput): Promise<void> {
	const { notification_type, message } = input;

	// notification_type に応じてタイトルをカスタマイズ
	const titleMap: Record<string, string> = {
		permission_prompt: "Claude Code - 許可が必要",
		idle_prompt: "Claude Code - 待機中",
		auth_success: "Claude Code - 認証成功",
		elicitation_dialog: "Claude Code - 入力が必要",
	};

	const title = titleMap[notification_type] || "Claude Code";

	await showNotification(title, message);
}

// ============================================
// メイン処理
// ============================================

/**
 * Hook イベントに応じて通知を表示
 *
 * @param input - Hook の入力データ
 */
async function handleHook(input: HookInput): Promise<void> {
	switch (input.hook_event_name) {
		case "Stop":
			await handleStopHook(input);
			break;
		case "PermissionRequest":
			await handlePermissionRequestHook(input);
			break;
		case "SubagentStop":
			await handleSubagentStopHook(input);
			break;
		case "Notification":
			await handleNotificationHook(input);
			break;
		default:
			// 未知の hook タイプは無視
			break;
	}
}

/**
 * メイン関数
 *
 * Claude Code Hooks から呼び出されるエントリーポイント。
 * 標準入力から JSON 形式の hook データを受け取り、適切な通知を表示します。
 */
async function main(): Promise<void> {
	try {
		// 標準入力から JSON 形式の hook データを読み取る
		const chunks: Buffer[] = [];
		for await (const chunk of process.stdin) {
			chunks.push(chunk);
		}
		const input = Buffer.concat(chunks).toString("utf-8");
		const inputData: HookInput = JSON.parse(input);

		// Hook タイプに応じて処理を実行
		await handleHook(inputData);

		process.exit(0);
	} catch (error) {
		// JSON パースエラーの場合は終了コード 1
		if (error instanceof SyntaxError) {
			console.error(`JSON parse error: ${error.message}`);
			process.exit(1);
		}

		// osascript 失敗など予期しないエラーは無視して成功扱い
		// （通知失敗で Claude の動作を止めない）
		process.exit(0);
	}
}

// スクリプトとして直接実行された場合のみ main を呼ぶ
if (import.meta.main) {
	main();
}
