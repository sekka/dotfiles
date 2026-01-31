#!/usr/bin/env bun
/**
 * Claude Code Hooks 用 macOS 通知スクリプト
 * Stop、PermissionRequest、SubagentStop、Notification hook から呼び出されます。
 */

const CLAUDE_ICON_PATHS = [
	`${process.env.HOME}/dotfiles/assets/icons/claude.svg`,
	`${process.env.HOME}/dotfiles/assets/icons/claude.png`,
];

// タイムアウト設定（ミリ秒）
const STDIN_TIMEOUT_MS = 5000;

// ============================================
// 型定義
// ============================================

interface HookInput {
	hook_event_name: string;
	tool_name?: string;
	tool_input?: Record<string, unknown>;
	notification_type?: string;
	message?: string;
}

// ============================================
// バリデーション
// ============================================

/**
 * HookInput データの検証
 * @throws {Error} 検証失敗時
 */
function validateHookInput(data: unknown): asserts data is HookInput {
	if (typeof data !== "object" || data === null) {
		throw new Error("Invalid input: not an object");
	}

	const input = data as Record<string, unknown>;

	if (typeof input.hook_event_name !== "string") {
		throw new Error("Invalid input: missing or invalid hook_event_name");
	}

	// オプショナルフィールドの型チェック
	if (input.tool_name !== undefined && typeof input.tool_name !== "string") {
		throw new Error("Invalid input: tool_name must be string");
	}

	if (input.notification_type !== undefined && typeof input.notification_type !== "string") {
		throw new Error("Invalid input: notification_type must be string");
	}

	if (input.message !== undefined && typeof input.message !== "string") {
		throw new Error("Invalid input: message must be string");
	}
}

// ============================================
// 通知表示
// ============================================

async function showNotification(title: string, message: string): Promise<void> {
	try {
		const args = ["-title", title, "-message", message, "-sound", "default"];

		// アイコンファイルを探す
		for (const path of CLAUDE_ICON_PATHS) {
			if (await Bun.file(path).exists()) {
				const iconPath = path.endsWith(".svg") ? `file://${path}` : path;
				args.push("-appIcon", iconPath);
				break;
			}
		}

		const proc = Bun.spawn({
			cmd: ["terminal-notifier", ...args],
			stdout: "pipe",
			stderr: "pipe",
		});

		await proc.exited;
	} catch {
		// 通知失敗は無視（Claude を止めない）
	}
}

// ============================================
// Hook ハンドラー
// ============================================

/**
 * Hook イベントを処理して通知を表示
 *
 * settings.json の hooks 設定:
 * - Stop: Claude Code の作業完了時
 * - Notification: 各種通知イベント（matcher で条件指定）
 *   - permission_prompt: 権限リクエスト時（PermissionRequest hook は使用しない）
 *   - idle_prompt: アイドル状態時
 *   - elicitation_dialog: ユーザー入力要求時
 *   - auth_success: 認証成功時
 *
 * 注意: matcher は OR 条件（パイプ区切り）で、1イベントにつき1つのみ発火（相互排他的）
 */
async function handleHook(input: HookInput): Promise<void> {
	switch (input.hook_event_name) {
		case "Stop":
			await showNotification("Claude Code", "作業が完了しました");
			break;

		case "Notification": {
			const notificationType = input.notification_type || "";
			const message = input.message || "";

			const titleMap: Record<string, string> = {
				permission_prompt: "Claude Code - 許可が必要",
				idle_prompt: "Claude Code - 待機中",
				auth_success: "Claude Code - 認証成功",
				elicitation_dialog: "Claude Code - 入力が必要",
			};

			const title = titleMap[notificationType] || "Claude Code";
			await showNotification(title, message);
			break;
		}

		default:
			// 未知のイベントはログに記録して無視
			console.warn(`[claude-notify] Unknown hook event: ${input.hook_event_name}`);
			break;
	}
}

// ============================================
// stdin 読み込み（タイムアウト付き）
// ============================================

/**
 * stdin からデータを読み込む（タイムアウト付き）
 * @returns {Promise<string>} 読み込んだデータ
 * @throws {Error} タイムアウトまたは読み込みエラー時
 */
async function readStdinWithTimeout(): Promise<string> {
	return new Promise((resolve, reject) => {
		const chunks: Buffer[] = [];
		let timeoutId: Timer;

		// タイムアウト設定
		timeoutId = setTimeout(() => {
			process.stdin.removeAllListeners();
			reject(new Error(`stdin timeout after ${STDIN_TIMEOUT_MS}ms`));
		}, STDIN_TIMEOUT_MS);

		// データ読み込み
		process.stdin.on("data", (chunk) => {
			chunks.push(chunk);
		});

		process.stdin.on("end", () => {
			clearTimeout(timeoutId);
			const data = Buffer.concat(chunks).toString("utf-8");
			resolve(data);
		});

		process.stdin.on("error", (error) => {
			clearTimeout(timeoutId);
			reject(error);
		});
	});
}

// ============================================
// メイン
// ============================================

async function main(): Promise<void> {
	try {
		// stdin からデータを読み込む（タイムアウト付き）
		const rawInput = await readStdinWithTimeout();

		// JSON解析
		let parsedData: unknown;
		try {
			parsedData = JSON.parse(rawInput);
		} catch (error) {
			if (error instanceof SyntaxError) {
				console.error(`[claude-notify] JSON parse error: ${error.message}`);
				console.error(`[claude-notify] Raw input (first 200 chars): ${rawInput.slice(0, 200)}`);
			} else {
				console.error(`[claude-notify] Unexpected parse error:`, error);
			}
			process.exit(1);
		}

		// 型検証
		try {
			validateHookInput(parsedData);
		} catch (error) {
			if (error instanceof Error) {
				console.error(`[claude-notify] Validation error: ${error.message}`);
				console.error(`[claude-notify] Received data:`, parsedData);
			}
			process.exit(1);
		}

		// 通知処理
		await handleHook(parsedData);
		process.exit(0);
	} catch (error) {
		if (error instanceof Error) {
			if (error.message.includes("timeout")) {
				console.warn(`[claude-notify] stdin timeout - skipping notification`);
			} else {
				console.error(`[claude-notify] Unexpected error: ${error.message}`);
			}
		} else {
			console.error(`[claude-notify] Unknown error:`, error);
		}
		process.exit(1);
	}
}

if (import.meta.main) {
	main();
}
