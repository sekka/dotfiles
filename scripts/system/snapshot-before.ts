#!/usr/bin/env bun

/**
 * macOS設定変更前のスナップショットを取得する
 *
 * pdefで差分を取るために使用します。
 * このスクリプトを実行後、macOS設定を変更し、
 * snapshot-after を実行することで差分を確認できます。
 *
 * 使用方法:
 *   snapshot-before [--output-dir <ディレクトリ>]
 *
 * オプション:
 *   --output-dir  スナップショットの保存先ディレクトリ（デフォルト: ~/.dotfiles-macos-snapshots）
 */

import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { $ } from "bun";
import { parseArgs as nodeParseArgs } from "node:util";

const DEFAULT_SNAPSHOT_DIR = join(process.env["HOME"] ?? "", ".dotfiles-macos-snapshots");

/**
 * コマンドライン引数をパースする
 */
export function parseArgs(args: string[]): { outputDir: string } {
  const { values } = nodeParseArgs({
    args,
    options: {
      "output-dir": {
        type: "string",
      },
    },
    strict: false,
  });

  return {
    outputDir: (values["output-dir"] as string | undefined) ?? DEFAULT_SNAPSHOT_DIR,
  };
}

/**
 * macOS設定のスナップショットを取得する
 */
export async function takeSnapshot(outputDir: string): Promise<boolean> {
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "_").slice(0, 15);
  const beforeFile = join(outputDir, `before_${timestamp}.txt`);

  // ディレクトリ作成
  mkdirSync(outputDir, { recursive: true });

  console.log("=== macOS設定のスナップショット取得（変更前） ===");
  console.log("");

  // スナップショット取得
  console.log("スナップショットを取得中...");
  const result = await $`defaults read`.nothrow().quiet();

  if (result.exitCode !== 0) {
    console.error("エラー: defaults read に失敗しました");
    return false;
  }

  await Bun.write(beforeFile, result.stdout);

  const beforeFileName = `before_${timestamp}.txt`;

  console.log(`✓ スナップショット保存: ${beforeFile}`);
  console.log("");
  console.log("📝 次の手順:");
  console.log("   1. システム環境設定で設定を変更してください");
  console.log("   2. 変更が完了したら、以下のコマンドを実行してください:");
  console.log("      mise run macos:snapshot-after");
  console.log("");
  console.log("💡 現在のスナップショットファイル名をメモしてください:");
  console.log(`   ${beforeFileName}`);
  console.log("");

  return true;
}

/**
 * メイン関数
 */
export async function main(): Promise<number> {
  const args = process.argv.slice(2);
  const { outputDir } = parseArgs(args);

  const success = await takeSnapshot(outputDir);
  return success ? 0 : 1;
}

// スクリプトとして直接実行された場合
if (import.meta.main) {
  const exitCode = await main();
  process.exit(exitCode);
}
