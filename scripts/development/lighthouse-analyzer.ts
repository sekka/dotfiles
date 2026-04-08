#!/usr/bin/env bun

/**
 * Lighthouse自動分析スクリプト
 *
 * 指定したURLに対してLighthouse分析を複数回実行し、結果をJSON形式で保存する。
 * 認証が必要なページの場合は、Chromeプロファイルを使用して分析できる。
 *
 * 使用方法:
 *   lighthouse-analyzer <URL> <実行回数> <間隔(秒)> [出力ディレクトリ] [オプション]
 *
 * オプション:
 *   --auth                  認証付きモード（Chromeプロファイル使用）
 *   --profile=ProfileName   使用するChromeプロファイル名（デフォルト: Default）
 *
 * 例:
 *   lighthouse-analyzer https://example.com 5 60 ./results
 *   lighthouse-analyzer https://example.com 5 60 ./results --auth
 *   lighthouse-analyzer https://example.com 5 60 ./results --auth --profile="Profile 1"
 *
 * 依存関係:
 *   - lighthouse（npm install -g lighthouse）
 *   - jq（サマリー生成用、オプション）
 */

import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import { $ } from "bun";

/**
 * 引数をパースする
 */
export function parseArgs(args: string[]): {
  url: string;
  count: number;
  interval: number;
  outputDir: string;
  useAuth: boolean;
  chromeProfile: string;
} | null {
  if (args.length < 3) {
    return null;
  }

  const url = args[0];
  const count = parseInt(args[1], 10);
  const interval = parseInt(args[2], 10);

  // count と interval のバリデーション
  if (Number.isNaN(count) || Number.isNaN(interval) || count <= 0 || interval < 0) {
    return null;
  }

  let outputDir = "./lighthouse-results";
  let useAuth = false;
  let chromeProfile = "Default";

  // 残りの引数を解析
  for (let i = 3; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--auth") {
      useAuth = true;
    } else if (arg.startsWith("--profile=")) {
      const profile = arg.slice("--profile=".length);
      // プロファイル名のバリデーション（英数字、スペース、ハイフン、アンダースコアのみ許可）
      // シェルインジェクションを防止
      if (!/^[a-zA-Z0-9\s_-]+$/.test(profile)) {
        console.error(`エラー: 無効なプロファイル名です: ${profile}`);
        return null;
      }
      chromeProfile = profile;
    } else if (!arg.startsWith("--")) {
      outputDir = arg;
    }
  }

  return { url, count, interval, outputDir, useAuth, chromeProfile };
}

/**
 * 利用可能なChromeプロファイルを取得する
 */
export function getAvailableProfiles(): string[] {
  const chromeDir = join(homedir(), "Library/Application Support/Google/Chrome");
  if (!existsSync(chromeDir)) {
    return [];
  }

  const profiles: string[] = [];
  const entries = readdirSync(chromeDir);

  for (const entry of entries) {
    if (entry === "Default" || entry.startsWith("Profile")) {
      profiles.push(entry);
    }
  }

  return profiles;
}

/**
 * URLからファイル名用の文字列を生成する
 */
export function sanitizeUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_/, "")
    .replace(/_$/, "");
}

/**
 * タイムスタンプを生成する
 */
export function getTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const sec = String(now.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}_${hour}${min}${sec}`;
}

/**
 * Lighthouse分析を実行する
 */
export async function runLighthouse(
  url: string,
  outputFile: string,
  useAuth: boolean,
  chromeProfile: string,
): Promise<boolean> {
  const chromeDir = join(homedir(), "Library/Application Support/Google/Chrome");
  let chromeFlags: string;

  if (useAuth) {
    chromeFlags = `--user-data-dir=${chromeDir} --profile-directory=${chromeProfile}`;
  } else {
    chromeFlags = "--headless";
  }

  const result = await $`lighthouse ${url} \
    --chrome-flags="${chromeFlags}" \
    --output=json \
    --output-path=${outputFile} \
    --form-factor=desktop \
    --screenEmulation.mobile=false \
    --screenEmulation.width=1350 \
    --screenEmulation.height=940 \
    --screenEmulation.deviceScaleFactor=1 \
    --throttling-method=provided \
    --only-categories=performance,accessibility,best-practices,seo,pwa \
    --enable-error-reporting=false \
    --quiet`
    .quiet()
    .nothrow();

  return result.exitCode === 0;
}

/**
 * JSONファイルからスコアを抽出する
 */
export async function extractScores(jsonFile: string): Promise<Record<string, number> | null> {
  try {
    const content = await readFile(jsonFile, "utf-8");
    const data = JSON.parse(content);
    const categories = data.categories || {};

    const scores: Record<string, number> = {};

    if (categories.performance?.score !== undefined) {
      scores.performance = Math.floor(categories.performance.score * 100);
    }
    if (categories.accessibility?.score !== undefined) {
      scores.accessibility = Math.floor(categories.accessibility.score * 100);
    }
    if (categories["best-practices"]?.score !== undefined) {
      scores["best-practices"] = Math.floor(categories["best-practices"].score * 100);
    }
    if (categories.seo?.score !== undefined) {
      scores.seo = Math.floor(categories.seo.score * 100);
    }
    if (categories.pwa?.score !== undefined) {
      scores.pwa = Math.floor(categories.pwa.score * 100);
    }

    return scores;
  } catch {
    return null;
  }
}

/**
 * 使用方法を表示する
 */
export function showUsage(): void {
  console.error(
    "使用方法: lighthouse-analyzer <URL> <実行回数> <間隔(秒)> [出力ディレクトリ] [オプション]",
  );
  console.error("");
  console.error("オプション:");
  console.error("  --auth                  認証付きモード（Chromeプロファイル使用）");
  console.error("  --profile=ProfileName   使用するChromeプロファイル名（デフォルト: Default）");
  console.error("");
  console.error("例:");
  console.error("  lighthouse-analyzer https://example.com 5 60 ./results");
  console.error("  lighthouse-analyzer https://example.com 5 60 ./results --auth");
  console.error(
    '  lighthouse-analyzer https://example.com 5 60 ./results --auth --profile="Profile 1"',
  );
  console.error("");
  console.error("利用可能なプロファイル:");

  const profiles = getAvailableProfiles();
  for (const profile of profiles) {
    console.error(`  - ${profile}`);
  }
}

/**
 * 指定秒数待機する
 */
function sleep(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

/**
 * メイン関数
 */
export async function main(): Promise<number> {
  const args = process.argv.slice(2);
  const parsed = parseArgs(args);

  if (!parsed) {
    showUsage();
    return 1;
  }

  const { url, count, interval, outputDir, useAuth, chromeProfile } = parsed;

  // プロファイルの存在チェック（認証モードの場合）
  if (useAuth) {
    const chromeDir = join(homedir(), "Library/Application Support/Google/Chrome");
    const profilePath = join(chromeDir, chromeProfile);

    if (!existsSync(profilePath)) {
      console.error(`エラー: プロファイル '${chromeProfile}' が見つかりません`);
      console.error("利用可能なプロファイル:");
      for (const profile of getAvailableProfiles()) {
        console.error(`  - ${profile}`);
      }
      return 1;
    }
  }

  // 出力ディレクトリ作成
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  console.log("Lighthouse分析を開始します");
  console.log(`URL: ${url}`);
  console.log(`実行回数: ${count}`);
  console.log(`間隔: ${interval}秒`);
  console.log(`出力先: ${outputDir}`);

  if (useAuth) {
    console.log("認証: 有効（Chromeプロファイル使用）");
    console.log(`プロファイル: ${chromeProfile}`);
    console.log("⚠️  注意: 分析中はChromeブラウザを閉じることをお勧めします");
  }
  console.log("");

  const urlSanitized = sanitizeUrl(url);
  const results: Array<{
    file: string;
    scores: Record<string, number> | null;
  }> = [];

  // 分析実行
  for (let i = 1; i <= count; i++) {
    console.log(`[${i}/${count}] 分析実行中...`);

    const timestamp = getTimestamp();
    const outputFile = join(outputDir, `lighthouse_${urlSanitized}_${timestamp}.json`);

    if (useAuth) {
      console.log(`  🔐 認証付きモード（${chromeProfile}）で分析中...`);
    } else {
      console.log("  🔍 通常モードで分析中...");
    }

    const success = await runLighthouse(url, outputFile, useAuth, chromeProfile);

    if (success) {
      console.log("  ✅ 分析完了");
    } else {
      console.log("  ⚠️  警告: 分析中にエラーが発生しましたが、結果は保存されています");
    }

    console.log(`  結果保存: ${outputFile}`);

    // スコアを抽出
    const scores = await extractScores(outputFile);
    results.push({ file: basename(outputFile), scores });

    // 最後の実行でない場合は待機
    if (i < count) {
      console.log(`  ${interval}秒待機中...`);
      await sleep(interval);
    }
  }

  console.log("");
  console.log("すべての分析が完了しました");
  console.log(`結果は ${outputDir} に保存されています`);

  // サマリー生成
  const summaryFile = join(outputDir, `summary_${urlSanitized}_${getTimestamp()}.txt`);
  let summary = "=== Lighthouse分析サマリー ===\n";
  summary += `URL: ${url}\n`;
  summary += `実行回数: ${count}\n`;
  summary += `実行日時: ${new Date().toLocaleString("ja-JP")}\n\n`;
  summary += "各実行のスコア:\n";

  for (const result of results) {
    summary += `ファイル: ${result.file}\n`;
    if (result.scores) {
      if (result.scores.performance !== undefined) {
        summary += `  Performance: ${result.scores.performance}%\n`;
      }
      if (result.scores.accessibility !== undefined) {
        summary += `  Accessibility: ${result.scores.accessibility}%\n`;
      }
      if (result.scores["best-practices"] !== undefined) {
        summary += `  Best Practices: ${result.scores["best-practices"]}%\n`;
      }
      if (result.scores.seo !== undefined) {
        summary += `  SEO: ${result.scores.seo}%\n`;
      }
      if (result.scores.pwa !== undefined) {
        summary += `  PWA: ${result.scores.pwa}%\n`;
      }
    }
    summary += "\n";
  }

  await writeFile(summaryFile, summary);
  console.log(`サマリー保存: ${summaryFile}`);

  return 0;
}

// スクリプトとして直接実行された場合
if (import.meta.main) {
  const exitCode = await main();
  process.exit(exitCode);
}
