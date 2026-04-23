#!/usr/bin/env bun
export {};

import { join } from "node:path";
import { readNumber, sessionDir, writeNumber } from "./lib/session-state.ts";

interface HookInput {
  session_id?: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  tool_response?: { is_error?: boolean };
}

const READ_ONLY_TOOLS = new Set(["Read", "Glob", "Grep"]);

const WARN_THRESHOLD = 2;

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
  } else if (!READ_ONLY_TOOLS.has(input.tool_name ?? "")) {
    writeNumber(streakFile, 0);
  }

  process.exit(0);
}

if (import.meta.main) {
  await main();
}
