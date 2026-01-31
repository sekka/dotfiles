#!/usr/bin/env bun
/**
 * Checkpointing スキル実行スクリプト
 * セッション状態を永続化し、コンテキストを保存する。
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import { spawnSync } from "node:child_process";

// ============================================
// 型定義
// ============================================

interface CheckpointOptions {
	mode: "session" | "full" | "analyze";
	sessionId?: string;
}

interface GitCommit {
	hash: string;
	message: string;
	timestamp: string;
}

interface AgentCallLog {
	timestamp: string;
	subagent_type: string;
	prompt_summary: string;
	status: string;
}

// ============================================
// 設定
// ============================================

const CLAUDE_MD_PATH = `${process.env.HOME}/.claude/CLAUDE.md`;
const CHECKPOINT_DIR = `${process.env.HOME}/.claude/checkpoints`;
const AGENT_LOG_PATH = `${process.env.HOME}/.claude/logs/agent-calls.jsonl`;

// ============================================
// Git情報取得
// ============================================

function getGitCommits(count = 20): GitCommit[] {
	try {
		const result = spawnSync("git", ["log", `--oneline`, `-${count}`, "--format=%H|||%s|||%ai"], {
			encoding: "utf-8",
			cwd: process.cwd(),
		});

		if (result.status !== 0) {
			return [];
		}

		return result.stdout
			.trim()
			.split("\n")
			.filter((line) => line.trim())
			.map((line) => {
				const [hash, message, timestamp] = line.split("|||");
				return { hash, message, timestamp };
			});
	} catch {
		return [];
	}
}

function getChangedFiles(): string[] {
	try {
		const result = spawnSync("git", ["diff", "--name-only", "HEAD~10..HEAD"], {
			encoding: "utf-8",
			cwd: process.cwd(),
		});

		if (result.status !== 0) {
			return [];
		}

		return result.stdout.trim().split("\n").filter((line) => line.trim());
	} catch {
		return [];
	}
}

// ============================================
// エージェントログ取得
// ============================================

async function getAgentLogs(limit = 20): Promise<AgentCallLog[]> {
	try {
		const content = await fs.readFile(AGENT_LOG_PATH, "utf-8");
		const lines = content.trim().split("\n");
		const logs: AgentCallLog[] = [];

		for (const line of lines.slice(-limit)) {
			try {
				const log = JSON.parse(line);
				logs.push({
					timestamp: log.timestamp,
					subagent_type: log.subagent_type,
					prompt_summary: log.prompt_summary,
					status: log.status,
				});
			} catch {
				// パース失敗は無視
			}
		}

		return logs;
	} catch {
		return [];
	}
}

// ============================================
// セッションモード
// ============================================

async function sessionCheckpoint(): Promise<string> {
	const commits = getGitCommits(5);
	const timestamp = new Date().toISOString();

	let summary = `\n## セッション (${timestamp})\n\n`;
	summary += "### 最近のコミット\n\n";

	if (commits.length > 0) {
		for (const commit of commits) {
			summary += `- \`${commit.hash.substring(0, 7)}\` ${commit.message}\n`;
		}
	} else {
		summary += "コミットなし\n";
	}

	try {
		// CLAUDE.mdの末尾に追記
		let claudeMd = "";
		try {
			claudeMd = await fs.readFile(CLAUDE_MD_PATH, "utf-8");
		} catch {
			// ファイルが存在しない場合は新規作成
			claudeMd = "# Claude Code セッション履歴\n\n";
		}

		// 既存の内容に追記
		claudeMd += summary;
		await fs.writeFile(CLAUDE_MD_PATH, claudeMd, "utf-8");

		return `✅ セッション履歴を ${CLAUDE_MD_PATH} に追記しました。`;
	} catch (error) {
		return `❌ エラー: ${error instanceof Error ? error.message : "不明なエラー"}`;
	}
}

// ============================================
// フルモード
// ============================================

async function fullCheckpoint(analyze = false): Promise<string> {
	const commits = getGitCommits(20);
	const changedFiles = getChangedFiles();
	const agentLogs = await getAgentLogs(20);
	const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
	const filename = `${timestamp}.md`;
	const filePath = path.join(CHECKPOINT_DIR, filename);

	// チェックポイントディレクトリ作成
	await fs.mkdir(CHECKPOINT_DIR, { recursive: true });

	// レポート生成
	let report = `# Checkpoint - ${timestamp}\n\n`;

	// Gitコミット履歴
	report += "## Git コミット履歴\n\n";
	if (commits.length > 0) {
		for (const commit of commits) {
			report += `- \`${commit.hash.substring(0, 7)}\` ${commit.message} (${commit.timestamp})\n`;
		}
	} else {
		report += "コミットなし\n";
	}

	// 変更ファイル
	report += "\n## 変更ファイル\n\n";
	if (changedFiles.length > 0) {
		for (const file of changedFiles) {
			report += `- ${file}\n`;
		}
	} else {
		report += "変更なし\n";
	}

	// エージェント呼び出しログ
	report += "\n## エージェント呼び出しログ\n\n";
	if (agentLogs.length > 0) {
		for (const log of agentLogs) {
			report += `- **${log.subagent_type}**: ${log.prompt_summary} (${log.status})\n`;
		}
	} else {
		report += "ログなし\n";
	}

	// 分析モード
	if (analyze) {
		report += "\n## パターン分析\n\n";
		report += "### 再利用可能パターン\n\n";
		report += "（パターン抽出ロジックは未実装）\n\n";
		report += "### 新規スキル候補\n\n";
		report += "（スキル候補提案ロジックは未実装）\n";
	}

	// ファイルに保存
	await fs.writeFile(filePath, report, "utf-8");

	return `✅ フルチェックポイントを ${filePath} に保存しました。`;
}

// ============================================
// メイン
// ============================================

async function main(): Promise<void> {
	const args = process.argv.slice(2);
	const hasFullFlag = args.includes("--full");
	const hasAnalyzeFlag = args.includes("--analyze");

	let mode: "session" | "full" | "analyze" = "session";
	if (hasFullFlag && hasAnalyzeFlag) {
		mode = "analyze";
	} else if (hasFullFlag) {
		mode = "full";
	}

	let result: string;
	switch (mode) {
		case "session":
			result = await sessionCheckpoint();
			break;
		case "full":
			result = await fullCheckpoint(false);
			break;
		case "analyze":
			result = await fullCheckpoint(true);
			break;
	}

	console.log(result);
}

if (import.meta.main) {
	main();
}
