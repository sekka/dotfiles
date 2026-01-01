#!/usr/bin/env bun
/**
 * Claude Code Hooks 用 macOS 通知スクリプト
 * Stop、PermissionRequest、SubagentStop、Notification hook から呼び出されます。
 */

const CLAUDE_ICON_PATHS = [
	`${process.env.HOME}/dotfiles/assets/icons/claude.svg`,
	`${process.env.HOME}/dotfiles/assets/icons/claude.png`,
];

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

async function handleHook(input: HookInput): Promise<void> {
	switch (input.hook_event_name) {
		case "Stop":
			await showNotification("Claude Code", "作業が完了しました");
			break;

		case "PermissionRequest": {
			const toolName = input.tool_name || "Unknown";
			const command = input.tool_input?.command as string | undefined;

			let message = `${toolName} ツールの使用許可が必要です`;
			if (toolName === "Bash" && command) {
				const shortCommand = command.length > 50 ? `${command.substring(0, 47)}...` : command;
				message = `Bash: ${shortCommand}`;
			}

			await showNotification("Claude Code - 許可リクエスト", message);
			break;
		}

		case "SubagentStop":
			await showNotification("Claude Code", "サブタスクが完了しました");
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
	}
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
		const input = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
		await handleHook(input);
		process.exit(0);
	} catch (error) {
		if (error instanceof SyntaxError) {
			console.error(`JSON parse error: ${error.message}`);
			process.exit(1);
		}
		process.exit(0);
	}
}

if (import.meta.main) {
	main();
}
