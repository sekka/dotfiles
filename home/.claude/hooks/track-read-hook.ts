#!/usr/bin/env bun
export {};

import { join } from "node:path";
import { readJson, sessionDir, writeJson } from "./lib/session-state.ts";

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

  if (!readFiles.includes(filePath)) {
    readFiles.push(filePath);
    writeJson(stateFile, readFiles);
  }

  process.exit(0);
}

if (import.meta.main) {
  await main();
}
