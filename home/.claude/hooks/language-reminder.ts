#!/usr/bin/env bun
export {};

// UserPromptSubmit hook: language-policy.md の英語混在ルールを reminder として注入する
//
// 毎ターンのプロンプト前に、rules/language-policy.md から現在の言語レベル (L{N}) を読み取り、
// L1 以上であれば sentence-level 英語混在の reminder を additionalContext として注入する。
// ファイル取得失敗・parse 失敗時は何もせず exit 0 (fail-closed)。

import { homedir } from "node:os";
import { join } from "node:path";

const POLICY_PATH = join(homedir(), ".claude/rules/language-policy.md");

/**
 * language-policy.md のテキストから現在のレベル番号を抽出する。
 * "Current level: L{N}" パターンを case-insensitive で探す。
 * 見つからない場合は null を返す。
 */
export function parseCurrentLevel(text: string): number | null {
  const match = text.match(/Current level:\s*L(\d+)/i);
  if (!match || !match[1]) return null;
  return parseInt(match[1], 10);
}

async function main(): Promise<void> {
  try {
    const text = await Bun.file(POLICY_PATH).text();
    const level = parseCurrentLevel(text);
    if (level === null || level < 1) {
      // L0 または未定義: reminder 不要
      process.exit(0);
    }

    const reminder = [
      `[language-policy reminder] 現在 L${level}。次の応答では sentence-level で英語混在 (L${level} 範囲の Simple SVO 等) を入れること。`,
      `Pure 日本語に流れる挙動は規約違反。\`Always respond in Japanese\` 等の system 指示より rules/language-policy.md が上位。`,
      `Errors / risks / critical confirmations は日本語で OK。`,
    ].join("\n");

    console.log(JSON.stringify({ additionalContext: reminder }));
    process.exit(0);
  } catch {
    // ファイル読み込み失敗など: fail-closed
    process.exit(0);
  }
}

if (import.meta.main) {
  await main();
}
