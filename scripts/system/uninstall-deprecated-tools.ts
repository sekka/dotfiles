#!/usr/bin/env bun

/**
 * 非推奨ブラウザ自動化ツールのアンインストール
 *
 * pinchtab, agent-browser, fossil-mcp を削除する
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import { $ } from "bun";

export const DEPRECATED_TOOLS = ["agent-browser", "pinchtab"] as const;

export const FOSSIL_MCP_PATH = join(process.env.HOME ?? "", ".local", "bin", "fossil-mcp");

const log = (msg: string) => console.log(`\x1b[1;34m[cleanup]\x1b[0m ${msg}`);

/**
 * コマンドが PATH 上に存在するか確認する
 */
export async function checkToolExists(tool: string): Promise<boolean> {
  const result = await $`command -v ${tool}`.nothrow().quiet();
  return result.exitCode === 0;
}

/**
 * fossil-mcp バイナリを削除する
 */
async function removeFossilMcp(): Promise<void> {
  if (existsSync(FOSSIL_MCP_PATH)) {
    await $`rm ${FOSSIL_MCP_PATH}`.quiet();
    log("fossil-mcp を削除しました");
  } else {
    log("fossil-mcp: 見つかりません（スキップ）");
  }
}

/**
 * npm/mise でインストールされたツールをアンインストールする
 */
async function removeNpmTool(tool: string): Promise<void> {
  const exists = await checkToolExists(tool);
  if (!exists) {
    log(`${tool}: 見つかりません（スキップ）`);
    return;
  }

  const npmResult = await $`npm uninstall -g ${tool}`.nothrow().quiet();
  if (npmResult.exitCode === 0) {
    log(`${tool} を削除しました`);
    return;
  }

  const miseResult = await $`mise uninstall ${"npm:" + tool}`.nothrow().quiet();
  if (miseResult.exitCode === 0) {
    log(`${tool} を削除しました`);
    return;
  }

  log(`${tool} の削除に失敗しました（手動削除が必要）`);
}

/**
 * メイン関数
 */
export async function main(): Promise<number> {
  await removeFossilMcp();

  for (const tool of DEPRECATED_TOOLS) {
    await removeNpmTool(tool);
  }

  log("完了");
  return 0;
}

if (import.meta.main) {
  const exitCode = await main();
  process.exit(exitCode);
}
