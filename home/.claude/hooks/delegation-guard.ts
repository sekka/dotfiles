#!/usr/bin/env bun
export {};

// PreToolUse:Edit|Write|NotebookEdit hook: Opus が implementer に委譲すべき大きな編集を直接行う違反を検出する
//
// セッション内で編集ファイル数と累計行数を追跡し、
// /tmp/claude-hooks-{session_id}/delegation-state.json に記録する。
//
// 判定:
//   - 編集ファイル数が FILE_THRESHOLD (2) 以上 → files 警告 (1回のみ)
//   - 累計編集行数が LINE_THRESHOLD (30) 以上 → lines 警告 (1回のみ)
//
// ルール根拠 (CLAUDE.md §4):
//   "Implementation touches 2+ files OR exceeds ~30 lines total → 必ず implementer に delegate"

import { join } from "node:path";
import { readJson, sessionDir, writeJson } from "./lib/session-state.ts";

export interface DelegationState {
  filesEdited: string[];
  totalLines: number;
  warnedFiles: boolean;
  warnedLines: boolean;
}

const DEFAULT_STATE: DelegationState = {
  filesEdited: [],
  totalLines: 0,
  warnedFiles: false,
  warnedLines: false,
};

export const FILE_THRESHOLD = 2;
export const LINE_THRESHOLD = 30;

export function splitLines(s: string): number {
  if (!s) return 0;
  return s.split("\n").length;
}

export function editLineCount(toolName: string, toolInput: Record<string, unknown>): number {
  switch (toolName) {
    case "Edit":
      return Math.max(
        splitLines(toolInput["old_string"] as string),
        splitLines(toolInput["new_string"] as string),
      );
    case "Write":
      return splitLines(toolInput["content"] as string);
    case "NotebookEdit":
      return splitLines(toolInput["new_source"] as string);
    default:
      return 0;
  }
}

export function updateState(
  state: DelegationState,
  filePath: string,
  lineCount: number,
): { state: DelegationState; warnings: ("files" | "lines")[] } {
  const warnings: ("files" | "lines")[] = [];

  // Dedup file list
  const filesEdited = state.filesEdited.includes(filePath)
    ? state.filesEdited
    : [...state.filesEdited, filePath];

  const totalLines = state.totalLines + lineCount;

  let warnedFiles = state.warnedFiles;
  let warnedLines = state.warnedLines;

  if (filesEdited.length >= FILE_THRESHOLD && !warnedFiles) {
    warnings.push("files");
    warnedFiles = true;
  }

  if (totalLines >= LINE_THRESHOLD && !warnedLines) {
    warnings.push("lines");
    warnedLines = true;
  }

  return {
    state: { filesEdited, totalLines, warnedFiles, warnedLines },
    warnings,
  };
}

function buildMessage(warnings: ("files" | "lines")[], state: DelegationState): string {
  const parts: string[] = ["[delegation-guard] CLAUDE.md §4 違反の可能性:"];

  if (warnings.includes("files")) {
    parts.push(
      `  • 編集ファイル数が ${state.filesEdited.length} 件になりました (閾値: ${FILE_THRESHOLD} 件)。`,
    );
  }
  if (warnings.includes("lines")) {
    parts.push(
      `  • 累計編集行数が ${state.totalLines} 行になりました (閾値: ${LINE_THRESHOLD} 行)。`,
    );
  }

  parts.push(
    `ルール: "Implementation touches 2+ files OR exceeds ~30 lines total → 必ず implementer に delegate"`,
    `→ このまま続けず、implementer サブエージェントに残りの実装を委譲してください。`,
  );

  return parts.join("\n");
}

interface HookInput {
  session_id?: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
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
  const toolName = input.tool_name;
  if (!toolName || !["Edit", "Write", "NotebookEdit"].includes(toolName)) {
    process.exit(0);
  }

  const toolInput = input.tool_input ?? {};
  const filePath: string =
    (toolInput["file_path"] as string) ?? (toolInput["path"] as string) ?? "(unknown)";

  const lineCount = editLineCount(toolName, toolInput);

  const dir = sessionDir(input.session_id);
  const stateFile = join(dir, "delegation-state.json");
  const prevState = readJson<DelegationState>(stateFile, { ...DEFAULT_STATE });

  const { state: nextState, warnings } = updateState(prevState, filePath, lineCount);
  writeJson(stateFile, nextState);

  if (warnings.length > 0) {
    console.error(
      JSON.stringify({
        additionalContext: buildMessage(warnings, nextState),
      }),
    );
  }

  process.exit(0);
}

if (import.meta.main) {
  await main();
}
