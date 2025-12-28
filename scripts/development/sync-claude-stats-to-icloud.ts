#!/usr/bin/env bun

/**
 * Claude Code Statistics Sync to iCloud
 *
 * 各マシンのClaude Code統計をiCloud Driveに自動同期する
 * stats-cache.jsonをマシン名を含むファイル名でiCloudにアップロード
 *
 * 使用方法:
 *   bun ~/dotfiles/scripts/development/sync-claude-stats-to-icloud.ts
 *
 * mise統合:
 *   mise run llm-claude-sync-stats
 *   mise run ccss
 */

import { existsSync, mkdirSync } from "node:fs";
import { homedir, hostname } from "node:os";
import { join, resolve } from "node:path";

// ============================================================================
// Configuration
// ============================================================================

const ICLOUD_DIR = join(homedir(), "Library/Mobile Documents/com~apple~CloudDocs/ClaudeCodeStats");
const STATS_CACHE = join(homedir(), ".claude/stats-cache.json");

// ============================================================================
// Main Sync Function
// ============================================================================

async function syncToICloud(): Promise<void> {
	try {
		// 1. stats-cache.jsonの存在確認
		if (!existsSync(STATS_CACHE)) {
			console.error(`❌ stats-cache.json not found at: ${STATS_CACHE}`);
			console.error("   ℹ️  Claude Code has not been used yet on this machine");
			process.exit(1);
		}

		// 2. iCloud Driveディレクトリの存在確認
		if (!existsSync(iCloudDriveExists())) {
			console.error("❌ iCloud Drive not available or not synced to this machine");
			console.error("   ℹ️  Please ensure you are logged in to iCloud with the same Apple ID");
			process.exit(1);
		}

		// 3. ClaudeCodeStatsディレクトリを作成（存在しない場合）
		if (!existsSync(ICLOUD_DIR)) {
			mkdirSync(ICLOUD_DIR, { recursive: true });
			console.log(`📁 Created iCloud directory: ${ICLOUD_DIR}`);
		}

		// 4. ファイルをコピー
		const sourceFile = Bun.file(STATS_CACHE);
		const sourceContent = await sourceFile.json();

		// マシン名を取得（スペース除去、.local削除）
		const machineName = getNormalizedMachineName();
		const targetFile = join(ICLOUD_DIR, `stats-${machineName}.json`);

		// iCloudに書き込み
		await Bun.write(targetFile, JSON.stringify(sourceContent, null, 2));

		// 5. 成功メッセージ
		console.log("✅ Successfully synced to iCloud Drive");
		console.log(`   File: stats-${machineName}.json`);
		console.log(`   Location: ClaudeCodeStats/`);
		console.log(`   Size: ${formatFileSize(sourceContent)}`);

		// 6. 統計情報を表示
		const totalSessions = sourceContent.totalSessions || 0;
		const totalMessages = sourceContent.totalMessages || 0;
		const lastComputedDate = sourceContent.lastComputedDate || "unknown";

		console.log("");
		console.log("📊 Current Statistics:");
		console.log(`   Sessions: ${totalSessions.toLocaleString()}`);
		console.log(`   Messages: ${totalMessages.toLocaleString()}`);
		console.log(`   Last updated: ${lastComputedDate}`);
	} catch (error) {
		console.error("❌ Sync failed:");
		if (error instanceof Error) {
			console.error(`   ${error.message}`);
		} else {
			console.error(`   Unknown error: ${String(error)}`);
		}
		process.exit(1);
	}
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * iCloud Driveが存在するか確認
 */
function iCloudDriveExists(): string {
	const icloudPath = join(homedir(), "Library/Mobile Documents/com~apple~CloudDocs");
	return icloudPath;
}

/**
 * マシン名を正規化（スペース除去、.local削除、小文字化）
 */
function getNormalizedMachineName(): string {
	const rawName = hostname();

	// スペースをハイフンに変換
	let normalized = rawName.replace(/\s+/g, "-");

	// .local を削除
	normalized = normalized.replace(/\.local$/, "");

	// 小文字に変換
	normalized = normalized.toLowerCase();

	// 複数のハイフンを1つに
	normalized = normalized.replace(/-+/g, "-");

	return normalized;
}

/**
 * JSONサイズをフォーマット
 */
function formatFileSize(obj: unknown): string {
	const jsonStr = JSON.stringify(obj);
	const bytes = new TextEncoder().encode(jsonStr).length;

	if (bytes < 1024) {
		return `${bytes} B`;
	} else if (bytes < 1024 * 1024) {
		return `${(bytes / 1024).toFixed(1)} KB`;
	} else {
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}
}

/**
 * iCloud同期の状態を確認（デバッグ用）
 */
async function checkICloudStatus(): Promise<void> {
	const icloudDir = iCloudDriveExists();

	console.log("\n📱 iCloud Status Check:");
	console.log(`   iCloud Path: ${icloudDir}`);
	console.log(`   Exists: ${existsSync(icloudDir) ? "✅ Yes" : "❌ No"}`);

	if (existsSync(ICLOUD_DIR)) {
		try {
			const files = await Bun.file(ICLOUD_DIR).exists();
			console.log(`   ClaudeCodeStats exists: ✅ Yes`);
		} catch {
			console.log(`   ClaudeCodeStats exists: ❌ No`);
		}
	}

	console.log(`   stats-cache.json exists: ${existsSync(STATS_CACHE) ? "✅ Yes" : "❌ No"}`);
}

// ============================================================================
// Entry Point
// ============================================================================

async function main(): Promise<void> {
	// パラメータチェック
	const args = process.argv.slice(2);

	if (args.includes("--check-icloud")) {
		await checkICloudStatus();
		return;
	}

	if (args.includes("--help") || args.includes("-h")) {
		showHelp();
		return;
	}

	// メイン処理
	await syncToICloud();
}

function showHelp(): void {
	console.log(`
Claude Code Statistics Sync to iCloud

使用方法:
  bun ~/dotfiles/scripts/development/sync-claude-stats-to-icloud.ts [オプション]

オプション:
  --check-icloud    iCloud Drive設定を確認
  --help            このヘルプを表示
  -h                このヘルプを表示

環境変数:
  $HOME             ホームディレクトリ（デフォルト）

説明:
  Claude Code の使用統計（~/.claude/stats-cache.json）をiCloud Drive内の
  ClaudeCodeStats フォルダに同期します。

  各マシンのファイルはマシン名を含むファイル名で保存され、複数マシン間での
  統計マージが可能になります。

例:
  # 通常の同期実行
  bun ~/dotfiles/scripts/development/sync-claude-stats-to-icloud.ts

  # iCloud設定を確認
  bun ~/dotfiles/scripts/development/sync-claude-stats-to-icloud.ts --check-icloud

  # mise経由で実行
  mise run llm-claude-sync-stats
  mise run ccss
`);
}

// 実行
if (import.meta.main) {
	main().catch(console.error);
}
