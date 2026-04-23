#!/usr/bin/env bun
export {};

// PreToolUse:Edit|Write hook: 未読ファイルへの編集を物理的にブロックする
//
// track-read-hook.ts が記録した read-files.json を参照し、
// このセッションで一度も Read していないファイルへの Edit/Write を
// exit 2 で拒否する（PreToolUse で exit 2 = ツール実行のキャンセル）。
//
// 狙い: CLAUDE.md の「Read before modify」ルールを意思に頼らず強制する。
// edit-thrashing（同ファイルの反復編集）の根本的な防止策として機能する。

import { existsSync } from "node:fs";
import { join } from "node:path";
import { readJson, sessionDir } from "./lib/session-state.ts";

interface HookInput {
  session_id?: string;
  tool_name?: string;
  tool_input?: { file_path?: string };
}

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
  const stateFile = join(dir, "read-files.json");
  const readFiles = readJson<string[]>(stateFile, []);

  if (!readFiles.includes(filePath) && existsSync(filePath)) {
    process.stdout.write(
      `⛔ Read-before-edit: "${filePath}" をまだ Read していません。先に Read ツールで内容を確認してください。`,
    );
    process.exit(2); // exit 2 = PreToolUse ブロック
  }

  process.exit(0);
}

if (import.meta.main) {
  await main();
}
