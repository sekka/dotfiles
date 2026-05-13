#!/usr/bin/env bun
export {};

// Stop hook: 直前の assistant 応答に英語が含まれているかチェックする
//
// L3 以上の場合、応答テキスト (コードブロック・URL 除外後) に英語単語がゼロなら
// additionalContext 警告を出力し、次ターンで英語混在を促す。
// transcript_path の JSONL から最後の assistant テキストを取得する。
// 失敗時は何もせず exit 0 (fail-closed)。

import { homedir } from "node:os";
import { join } from "node:path";

const POLICY_PATH = join(homedir(), ".claude/rules/language-policy.md");

/**
 * language-policy.md テキストから現在のレベル番号を抽出する。
 * 見つからない場合は null を返す。
 */
function parseCurrentLevel(text: string): number | null {
  const match = text.match(/Current level:\s*L(\d+)/i);
  if (!match || !match[1]) return null;
  return parseInt(match[1], 10);
}

/**
 * テキストからコードブロック (fenced + inline) と URL を除去する。
 * 英語判定の前処理として使用する。
 */
export function stripCodeAndUrls(text: string): string {
  // fenced コードブロック (``` ... ```) を除去
  let result = text.replace(/```[\s\S]*?```/g, "");
  // インライン backtick コード (`...`) を除去
  result = result.replace(/`[^`]*`/g, "");
  // URL (http/https) を除去
  result = result.replace(/https?:\/\/\S+/g, "");
  return result;
}

/**
 * テキストに英語単語 (3文字以上) が含まれているかを返す。
 * stripCodeAndUrls 適用後のテキストを渡すこと。
 */
export function containsEnglish(text: string): boolean {
  return /\b[a-zA-Z]{3,}\b/.test(text);
}

/**
 * JSONL 形式のトランスクリプト文字列から最後の assistant テキストを取得する。
 * tool_use のみのメッセージはスキップする。
 * 複数の text content item は連結する。
 */
export function extractLastAssistantText(jsonlContent: string): string {
  if (!jsonlContent.trim()) return "";

  const lines = jsonlContent.split("\n").filter((l) => l.trim());
  // 後ろから走査してテキストを持つ assistant メッセージを探す
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const obj = JSON.parse(lines[i]!);
      if (obj.type !== "assistant") continue;

      const content = obj.message?.content;
      if (!Array.isArray(content)) {
        // string の場合はそのまま返す (古い形式)
        if (typeof content === "string" && content.length > 0) return content;
        continue;
      }

      const textParts = content
        .filter((item: { type: string }) => item.type === "text")
        .map((item: { text: string }) => item.text ?? "");

      if (textParts.length === 0) continue; // tool_use のみ → スキップ

      return textParts.join("");
    } catch {
      // 壊れた JSON 行は無視
      continue;
    }
  }

  return "";
}

interface StopHookInput {
  session_id?: string;
  transcript_path?: string;
  hook_event_name?: string;
}

async function main(): Promise<void> {
  try {
    const stdinText = await Bun.stdin.text();
    let input: StopHookInput = {};
    try {
      if (stdinText) input = JSON.parse(stdinText);
    } catch {
      process.exit(0);
    }

    // transcript_path が無ければ何もできない
    const transcriptPath = input.transcript_path;
    if (!transcriptPath) process.exit(0);

    // policy ファイルを読んでレベルを取得
    let level: number | null = null;
    try {
      const policyText = await Bun.file(POLICY_PATH).text();
      level = parseCurrentLevel(policyText);
    } catch {
      process.exit(0);
    }

    // L3 未満 (L0-L2) はチェック対象外
    if (level === null || level < 3) process.exit(0);

    // transcript から最後の assistant テキストを取得
    let assistantText = "";
    try {
      const jsonlContent = await Bun.file(transcriptPath).text();
      assistantText = extractLastAssistantText(jsonlContent);
    } catch {
      process.exit(0);
    }

    if (!assistantText) process.exit(0);

    // コードブロック・URL 除外後に英語チェック
    const stripped = stripCodeAndUrls(assistantText);
    if (!containsEnglish(stripped)) {
      console.log(
        JSON.stringify({
          additionalContext: `[language-check] 直前応答に英語が 0 でした。次の応答で L${level} mix を適用してください。`,
        }),
      );
    }

    process.exit(0);
  } catch {
    // fail-closed
    process.exit(0);
  }
}

if (import.meta.main) {
  await main();
}
