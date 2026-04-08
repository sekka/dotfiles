#!/usr/bin/env bun

/**
 * macOS設定変更後のスナップショットを取得し、差分を生成する
 *
 * pdef（利用可能な場合）またはdiffを使用して、変更前後のスナップショットの差分を生成します。
 * snapshot-before を実行後、macOS設定を変更し、このスクリプトを実行することで差分を確認できます。
 *
 * 使用方法:
 *   snapshot-after [--snapshot-dir <ディレクトリ>] [--output-dir <ディレクトリ>]
 *
 * オプション:
 *   --snapshot-dir  スナップショットの保存先ディレクトリ（デフォルト: ~/.dotfiles-macos-snapshots）
 *   --output-dir    差分ファイルの出力先ディレクトリ（デフォルト: ~/Desktop）
 */

import { readdirSync } from "node:fs";
import { join } from "node:path";
import { $ } from "bun";
import { parseArgs as nodeParseArgs } from "node:util";

const DEFAULT_SNAPSHOT_DIR = join(process.env.HOME ?? "", ".dotfiles-macos-snapshots");
const DEFAULT_OUTPUT_DIR = join(process.env.HOME ?? "", "Desktop");

/**
 * コマンドライン引数をパースする
 */
export function parseArgs(args: string[]): { snapshotDir: string; outputDir: string } {
  const { values } = nodeParseArgs({
    args,
    options: {
      "snapshot-dir": {
        type: "string",
      },
      "output-dir": {
        type: "string",
      },
    },
    strict: false,
  });

  return {
    snapshotDir: (values["snapshot-dir"] as string | undefined) ?? DEFAULT_SNAPSHOT_DIR,
    outputDir: (values["output-dir"] as string | undefined) ?? DEFAULT_OUTPUT_DIR,
  };
}

/**
 * 変更後のスナップショットを取得し、差分を生成する
 */
export async function generateDiff(snapshotDir: string, outputDir: string): Promise<boolean> {
  console.log("=== macOS設定のスナップショット取得（変更後） ===");
  console.log("");

  // 最新のbeforeファイルを検索
  let latestBefore: string | undefined;
  try {
    const files = readdirSync(snapshotDir);
    const beforeFiles = files
      .filter((f) => f.startsWith("before_") && f.endsWith(".txt"))
      .sort()
      .reverse();
    if (beforeFiles.length > 0) {
      latestBefore = join(snapshotDir, beforeFiles[0]);
    }
  } catch {
    // directory doesn't exist or is unreadable
  }

  if (!latestBefore) {
    console.error("❌ エラー: 変更前のスナップショットが見つかりません");
    console.error("   先に 'mise run macos:snapshot-before' を実行してください");
    return false;
  }

  const beforeFileName = latestBefore.split("/").pop() ?? "";
  console.log(`変更前のスナップショット: ${beforeFileName}`);
  console.log("");

  // タイムスタンプ生成
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "_").slice(0, 15);
  const afterFile = join(snapshotDir, `after_${timestamp}.txt`);

  // スナップショット取得
  console.log("スナップショットを取得中...");
  const result = await $`defaults read`.nothrow().quiet();

  if (result.exitCode !== 0) {
    console.error("エラー: defaults read に失敗しました");
    return false;
  }

  await Bun.write(afterFile, result.stdout);
  console.log(`✓ スナップショット保存: ${afterFile}`);
  console.log("");

  // pdefの存在確認
  const pdefCheck = await $`command -v pdef`.nothrow().quiet();
  const hasPdef = pdefCheck.exitCode === 0;

  if (hasPdef) {
    console.log("pdefを使用して差分を生成中...");
    const diffFile = join(outputDir, `macos_settings_diff_${timestamp}.sh`);

    const diffResult = await $`pdef ${latestBefore} ${afterFile}`.nothrow().quiet();
    const diffOutput = diffResult.stdout.toString();

    if (diffOutput.trim().length > 0) {
      await Bun.write(diffFile, diffOutput);
      console.log(`✅ 差分スクリプト生成完了: ${diffFile}`);
      console.log("");
      console.log("📝 生成されたスクリプトの内容:");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(diffOutput);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("");
      console.log("💡 このスクリプトを setup/04_macos.sh に追加できます");
    } else {
      console.log("ℹ️  変更は検出されませんでした");
    }
  } else {
    console.log("⚠️  pdefがインストールされていません。diffで代替します...");
    const diffFile = join(outputDir, `macos_settings_diff_${timestamp}.txt`);

    const diffResult = await $`diff ${latestBefore} ${afterFile}`.nothrow().quiet();
    const diffOutput = diffResult.stdout.toString();

    if (diffOutput.trim().length > 0) {
      await Bun.write(diffFile, diffOutput);
      console.log(`✅ 差分ファイル生成完了: ${diffFile}`);
      console.log("");
      console.log("⚠️  注意: diffの結果は手動で解釈する必要があります");
      console.log("");
      console.log("💡 pdefをインストールすると、defaults writeコマンドを自動生成できます:");
      console.log("   git clone https://github.com/yammerjp/pdef.git");
      console.log("   cd pdef && make && sudo cp bin/pdef /usr/local/bin/");
    } else {
      console.log("ℹ️  変更は検出されませんでした");
    }
  }

  console.log("");
  console.log("🗑️  スナップショットファイルを削除する場合:");
  console.log(`   rm -rf ${snapshotDir}`);
  console.log("");

  return true;
}

/**
 * メイン関数
 */
export async function main(): Promise<number> {
  const args = process.argv.slice(2);
  const { snapshotDir, outputDir } = parseArgs(args);

  const success = await generateDiff(snapshotDir, outputDir);
  return success ? 0 : 1;
}

// スクリプトとして直接実行された場合
if (import.meta.main) {
  const exitCode = await main();
  process.exit(exitCode);
}
