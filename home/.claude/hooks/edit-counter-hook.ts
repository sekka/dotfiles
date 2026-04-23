#!/usr/bin/env bun
export {};

import { join } from "node:path";
import { readJson, sessionDir, writeJson } from "./lib/session-state.ts";

interface HookInput {
  session_id?: string;
  tool_name?: string;
  tool_input?: { file_path?: string };
}

const WARN_THRESHOLD = 3;

async function main() {
  const stdinText = await Bun.stdin.text();
  let input: HookInput = {};
  try {
    if (stdinText) input = JSON.parse(stdinText);
  } catch {
    process.exit(0);
  }

  if (!input.session_id) process.exit(0);
  const filePath = input.tool_input?.file_path;
  if (!filePath) process.exit(0);

  const dir = sessionDir(input.session_id);
  const stateFile = join(dir, "edit-counts.json");
  const counts = readJson<Record<string, number>>(stateFile, {});

  counts[filePath] = (counts[filePath] ?? 0) + 1;
  writeJson(stateFile, counts);

  if (counts[filePath] >= WARN_THRESHOLD) {
    console.error(
      JSON.stringify({
        additionalContext: `[edit-counter] "${filePath}" をこのセッションで${counts[filePath]}回編集しています。一度止まってユーザーの要件を再確認してください。`,
      }),
    );
  }

  process.exit(0);
}

if (import.meta.main) {
  await main();
}
