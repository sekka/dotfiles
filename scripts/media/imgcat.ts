#!/usr/bin/env bun
/**
 * iTerm2で画像を表示する
 *
 * iTerm2の画像表示プロトコルを使用して、ターミナル内に画像を表示する。
 * ファイルからの読み込みと標準入力からの読み込みの両方に対応。
 *
 * 使用方法:
 *   imgcat [-p] <ファイル名>...
 *   cat <ファイル名> | imgcat
 *
 * オプション:
 *   -p, --print  画像の後にファイル名を表示する
 *   -h, --help   ヘルプを表示する
 *
 * 例:
 *   imgcat image.png                 # 単一画像を表示
 *   imgcat -p *.jpg                  # 複数画像をファイル名付きで表示
 *   cat screenshot.png | imgcat      # パイプから読み込み
 *
 * 対応環境:
 *   - iTerm2
 *   - tmux内のiTerm2（自動対応）
 */

import { existsSync } from "node:fs";
import { basename } from "node:path";

/**
 * OSCシーケンスを出力する（tmux対応）
 */
export function printOsc(): string {
  const term = process.env.TERM || "";
  if (term.startsWith("screen")) {
    // tmux内ではDCSでラップする
    return "\x1bPtmux;\x1b\x1b]";
  }
  return "\x1b]";
}

/**
 * STシーケンスを出力する（tmux対応）
 */
export function printSt(): string {
  const term = process.env.TERM || "";
  if (term.startsWith("screen")) {
    // tmux内ではESC backslashで終了
    return "\x07\x1b\\";
  }
  return "\x07";
}

/**
 * 画像を表示する
 */
export function printImage(
  filename: string | null,
  inline: boolean,
  base64Contents: string,
  printFilename: boolean
): void {
  let output = printOsc();
  output += "1337;File=";

  if (filename) {
    // ファイル名をBase64エンコード
    const nameBase64 = Buffer.from(filename).toString("base64");
    output += `name=${nameBase64};`;
  }

  // Base64デコードしてサイズを計算
  const decodedSize = Buffer.from(base64Contents, "base64").length;
  output += `size=${decodedSize}`;
  output += `;inline=${inline ? "1" : "0"}`;
  output += ":";
  output += base64Contents;
  output += printSt();
  output += "\n";

  process.stdout.write(output);

  if (printFilename && filename) {
    console.log(filename);
  }
}

/**
 * 使用方法を表示する
 */
export function showHelp(): void {
  console.error("使用方法: imgcat [-p] <ファイル名>...");
  console.error("          cat <ファイル名> | imgcat");
  console.error("");
  console.error("オプション:");
  console.error("  -p, --print  画像の後にファイル名を表示する");
  console.error("  -h, --help   ヘルプを表示する");
}

/**
 * 引数をパースする
 */
export function parseArgs(
  args: string[]
): { files: string[]; printFilename: boolean; showHelp: boolean } | null {
  const files: string[] = [];
  let printFilename = false;
  let showHelpFlag = false;

  for (const arg of args) {
    if (arg === "-h" || arg === "--h" || arg === "--help") {
      showHelpFlag = true;
    } else if (arg === "-p" || arg === "--p" || arg === "--print") {
      printFilename = true;
    } else if (arg.startsWith("-")) {
      console.error(`エラー: 不明なオプション: ${arg}`);
      return null;
    } else {
      files.push(arg);
    }
  }

  return { files, printFilename, showHelp: showHelpFlag };
}

/**
 * ファイルから画像を読み込んで表示する
 */
export async function displayImageFromFile(
  filepath: string,
  printFilename: boolean
): Promise<boolean> {
  if (!existsSync(filepath)) {
    console.error(`エラー: imgcat: ${filepath}: そのようなファイルは存在しません`);
    return false;
  }

  const file = Bun.file(filepath);
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  printImage(basename(filepath), true, base64, printFilename);
  return true;
}

/**
 * 標準入力から画像を読み込んで表示する
 */
export async function displayImageFromStdin(): Promise<void> {
  const chunks: Uint8Array[] = [];

  for await (const chunk of Bun.stdin.stream()) {
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);
  const base64 = buffer.toString("base64");

  printImage(null, true, base64, false);
}

/**
 * メイン関数
 */
export async function main(): Promise<number> {
  const args = process.argv.slice(2);
  const hasStdin = !process.stdin.isTTY;

  // 引数なしかつ標準入力なし
  if (!hasStdin && args.length === 0) {
    showHelp();
    return 0;
  }

  const parsed = parseArgs(args);
  if (!parsed) {
    showHelp();
    return 1;
  }

  if (parsed.showHelp) {
    showHelp();
    return 0;
  }

  // ファイルが指定されている場合
  if (parsed.files.length > 0) {
    let hasError = false;
    for (const file of parsed.files) {
      const success = await displayImageFromFile(file, parsed.printFilename);
      if (!success) {
        hasError = true;
      }
    }
    return hasError ? 2 : 0;
  }

  // 標準入力から読み込む
  if (hasStdin) {
    await displayImageFromStdin();
    return 0;
  }

  return 0;
}

// スクリプトとして直接実行された場合
if (import.meta.main) {
  const exitCode = await main();
  process.exit(exitCode);
}
