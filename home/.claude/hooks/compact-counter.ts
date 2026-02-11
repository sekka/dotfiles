#!/usr/bin/env bun

/**
 * PreCompact Hook: 圧縮実行回数をトラッキング
 *
 * このフックは PreCompact イベント時に実行され、
 * セッションごとの圧縮実行回数を ~/.claude/data/compact-counts.json に記録します。
 *
 * 動作:
 * 1. stdin から JSON 入力を読み取り（session_id を含む）
 * 2. compact-counts.json からカウントを読み込み
 * 3. 該当セッションのカウントを +1
 * 4. ファイルに保存
 * 5. 古いセッション（カウント > 1000）をクリーンアップ
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

interface HookInput {
	session_id?: string;
	[key: string]: unknown;
}

// stdin から JSON 入力を読み取り
const stdin = await Bun.stdin.text();

try {
	const input: HookInput = JSON.parse(stdin);
	const sessionId = input.session_id;

	if (!sessionId) {
		console.error("No session_id found in input");
		process.exit(0);
	}

	// データディレクトリを作成（存在しない場合）
	const dataDir = join(homedir(), ".claude", "data");
	mkdirSync(dataDir, { recursive: true });

	const countsPath = join(dataDir, "compact-counts.json");
	let counts: Record<string, number> = {};

	// 既存のカウントを読み込み
	try {
		counts = JSON.parse(readFileSync(countsPath, "utf-8"));
	} catch {
		// ファイルが存在しない場合は空オブジェクトから開始
	}

	// カウントを +1
	counts[sessionId] = (counts[sessionId] || 0) + 1;

	// 古いセッションのクリーンアップ（カウント > 1000 は異常値として削除）
	Object.keys(counts).forEach((sid) => {
		if (counts[sid] > 1000) {
			delete counts[sid];
		}
	});

	// ファイルに保存
	writeFileSync(countsPath, JSON.stringify(counts, null, 2));
	process.exit(0);
} catch (error) {
	console.error(`compact-counter error: ${error instanceof Error ? error.message : String(error)}`);
	process.exit(0); // エラーでもフックは成功として扱う（圧縮を妨げない）
}
