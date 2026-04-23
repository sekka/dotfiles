#!/usr/bin/env bun
// PostToolUse:Bash hook: 連続失敗を検知してアプローチ変更を促す
//
// セッションごとに Bash ツールの連続失敗回数を /tmp に記録する。
// 3回連続で失敗すると additionalContext に警告を注入し、
// 同じコマンドを繰り返すのではなく別の方法を試すよう Claude に伝える。
// 成功時、または警告を出した直後にカウンターをリセットする。
//
// 狙い: オプション誤りやツール未インストールなど、同じ原因で
// 失敗し続けるリトライループを断ち切り、トークンの無駄遣いを防ぐ。

import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const THRESHOLD = 3;
export const WARNING_MESSAGE = `[circuit-breaker] ${THRESHOLD} consecutive Bash failures detected. Consider a different approach instead of retrying the same command.`;

export function getStateFile(sessionId: string): string {
  return join("/tmp", `claude-circuit-breaker-${sessionId}`);
}

export function readCount(stateFile: string): number {
  try {
    const n = parseInt(readFileSync(stateFile, "utf-8").trim(), 10);
    return isNaN(n) ? 0 : n;
  } catch {
    return 0;
  }
}

export function resetState(stateFile: string): void {
  rmSync(stateFile, { force: true });
}

// Does not persist at threshold — caller resets state instead.
export function incrementAndCheck(stateFile: string): boolean {
  const count = readCount(stateFile) + 1;
  if (count >= THRESHOLD) {
    return true;
  }
  writeFileSync(stateFile, String(count), "utf-8");
  return false;
}

interface HookInput {
  tool_response?: { exit_code?: number };
  session_id?: string;
}

async function main() {
  const stdinText = await Bun.stdin.text();
  let input: HookInput = {};
  try {
    if (stdinText) input = JSON.parse(stdinText);
  } catch {
    process.exit(0);
  }

  const exitCode = input.tool_response?.exit_code ?? 0;
  const sessionId = input.session_id ?? "default";
  const stateFile = getStateFile(sessionId);

  if (exitCode !== 0) {
    if (incrementAndCheck(stateFile)) {
      console.error(JSON.stringify({ additionalContext: WARNING_MESSAGE }));
      resetState(stateFile);
    }
  } else {
    resetState(stateFile);
  }

  process.exit(0);
}

if (import.meta.main) {
  await main();
}
