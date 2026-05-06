#!/usr/bin/env bun
export {};

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// PostToolUse:Edit|Write hook: .md ファイル保存後に Mermaid 構文を検証する
//
// ファイル内の ```mermaid ... ``` ブロックを抽出し、mmdc で構文チェックする。
// エラーがあればブロック番号と mmdc のエラーメッセージを stderr に出力する。
// mmdc が未インストールの場合はスキップ（非致命的）。

export function isMdFile(filePath: string): boolean {
  return filePath.toLowerCase().endsWith(".md");
}

export function extractMermaidBlocks(content: string): string[] {
  const blocks: string[] = [];
  const regex = /```mermaid\r?\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    const trimmed = (match[1] ?? "").trim();
    if (trimmed) blocks.push(trimmed);
  }
  return blocks;
}

async function main() {
  try {
    const stdinText = await Bun.stdin.text();
    if (!stdinText) process.exit(0);

    const input = JSON.parse(stdinText);
    const filePath: string | undefined = input.tool_input?.file_path;

    if (!filePath || !isMdFile(filePath)) process.exit(0);

    const file = Bun.file(filePath);
    const content = await file.text();
    const blocks = extractMermaidBlocks(content);

    if (blocks.length === 0) process.exit(0);

    // Verify mmdc is available
    const which = Bun.spawnSync({ cmd: ["which", "mmdc"], stdout: "ignore", stderr: "ignore" });
    if (which.exitCode !== 0) process.exit(0);

    const tmpDir = mkdtempSync(join(tmpdir(), "mermaid-validate-"));

    try {
      for (let i = 0; i < blocks.length; i++) {
        const inFile = join(tmpDir, `block-${i}.mmd`);
        const outFile = join(tmpDir, `block-${i}.svg`);
        writeFileSync(inFile, blocks[i] ?? "");

        const result = Bun.spawnSync({
          cmd: ["mmdc", "-i", inFile, "-o", outFile, "-q"],
          stdout: "ignore",
          stderr: "pipe",
        });

        if (result.exitCode !== 0) {
          const stderr = new TextDecoder().decode(result.stderr).trim();
          const msg = stderr || "syntax error";
          console.error(`[mermaid-validate] block ${i + 1} in ${filePath}: ${msg}`);
        }
      }
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }

    process.exit(0); // Always exit 0 — validation is advisory
  } catch {
    process.exit(0);
  }
}

if (import.meta.main) {
  await main();
}
