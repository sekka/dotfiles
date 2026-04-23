#!/usr/bin/env bun
export {};

import { extname } from "node:path";

// PostToolUse:Edit|Write hook: ファイル編集後に自動フォーマットをかける
//
// 編集されたファイルに lint-format.ts --mode=fix を実行し、
// 手動でフォーマットコマンドを打たなくてもコードを常に整った状態に保つ。
// フォーマット対象外の拡張子、settings.json 系（sort-permissions.ts が担当）、
// node_modules 配下はスキップする。フォーマット失敗は非致命的。

export const FORMATTABLE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".sh",
  ".bash",
  ".md",
  ".mdx",
  ".yaml",
  ".yml",
  ".toml",
]);

export function getExtension(filePath: string): string {
  return extname(filePath).toLowerCase();
}

export function shouldSkip(filePath: string): boolean {
  if (!FORMATTABLE_EXTENSIONS.has(getExtension(filePath))) return true;
  if (filePath.endsWith(".claude/settings.json")) return true;
  if (filePath.endsWith(".claude/settings.local.json")) return true;
  if (filePath.includes("/node_modules/")) return true;
  return false;
}

async function main() {
  try {
    const stdinText = await Bun.stdin.text();
    if (!stdinText) process.exit(0);

    const input = JSON.parse(stdinText);
    const filePath: string | undefined = input.tool_input?.file_path;

    if (!filePath) process.exit(0);
    if (shouldSkip(filePath)) process.exit(0);

    const proc = Bun.spawnSync({
      cmd: [
        "bun",
        `${process.env["HOME"]}/dotfiles/scripts/development/lint-format.ts`,
        "--file",
        filePath,
        "--mode=fix",
      ],
      stdout: "ignore",
      stderr: "pipe",
    });

    if (proc.exitCode !== 0) {
      const stderr = new TextDecoder().decode(proc.stderr);
      if (stderr) console.error(`[post-format] ${stderr.slice(0, 200)}`);
    }
  } catch {
    // Format failure is non-fatal — exit silently
    process.exit(0);
  }
}

if (import.meta.main) {
  await main();
}
