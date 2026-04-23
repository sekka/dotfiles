#!/usr/bin/env bun
export {};

// PostToolUse:Read|Edit|Write hook: 連続ツール失敗を検知してアプローチ変更を促す
//
// Bash 以外のツール（Read/Edit/Write）の連続失敗回数を
// /tmp/claude-hooks-{session_id}/fail-streak.txt に記録する。
// WARN_THRESHOLD（デフォルト: 2）回連続で失敗すると additionalContext に警告を注入し、
// 同じ手法のリトライを禁止して別アプローチへの切り替えを強制する。
// 成功時はカウンターをリセットする。
//
// 狙い: Bash の circuit-breaker.ts（threshold=3）を補完し、
// ファイル操作系ツールの error-loop を早期に断ち切る。
// Bash は circuit-breaker.ts が担当するためこのフックでは除外している。

import { join } from "node:path";
import { readNumber, sessionDir, writeNumber } from "./lib/session-state.ts";

interface HookInput {
  session_id?: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  tool_response?: { is_error?: boolean };
}

export const WARN_THRESHOLD = 2;

async function main() {
  const stdinText = await Bun.stdin.text();
  let input: HookInput = {};
  try {
    if (stdinText) input = JSON.parse(stdinText);
  } catch {
    process.exit(0);
  }

  if (!input.session_id) process.exit(0);
  const isError = input.tool_response?.is_error === true;
  const dir = sessionDir(input.session_id);
  const streakFile = join(dir, "fail-streak.txt");

  if (isError) {
    const streak = readNumber(streakFile, 0) + 1;
    writeNumber(streakFile, streak);
    if (streak >= WARN_THRESHOLD) {
      console.error(
        JSON.stringify({
          additionalContext: `[error-loop] ${streak}回連続でツールが失敗しています。同じアプローチのリトライを禁止します。何が失敗したか説明し、別のアプローチを試してください。`,
        }),
      );
    }
  } else {
    writeNumber(streakFile, 0);
  }

  process.exit(0);
}

if (import.meta.main) {
  await main();
}
