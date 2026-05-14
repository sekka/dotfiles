#!/usr/bin/env bun
export {};

// Stop hook: user-research-queue の quick/deep ターンで user-research-eval-ref 委譲後に
// AskUserQuestion が呼ばれずに stop しようとした場合にブロックする。
//
// 背景: escalation-ladder.md の 3-strike ルールにより L3 (機械的強制) に昇格。
// Iron Law / MANDATORY ノート / Pre-output Self-Check の文面強化では止まらなかったため
// Stop hook による物理的強制を導入する。
//
// ブロック条件:
//   1. 現ターンが /user-research-queue quick または deep の呼び出しである
//   2. 現ターン内で user-research-eval-ref Skill が呼ばれた
//   3. その後 AskUserQuestion が呼ばれていない
//
// 失敗時は何もせず exit 0 (fail-open)。transcript が読めない・壊れている場合も同様。

// user-research-eval-ref の skill 名 (typo 防止のため 1 箇所定義)
const EVAL_REF_SKILL = "user-research-eval-ref";

export interface ContentItem {
  type: string;
  text?: string;
  name?: string;
  input?: Record<string, unknown>;
}

export interface TranscriptMessage {
  type: "user" | "assistant" | "system" | string;
  message?: {
    content?: ContentItem[] | string;
  };
}

/**
 * JSONL 形式の transcript 文字列をパースして配列を返す。
 * 壊れた行はスキップする。
 */
export function parseTranscript(jsonl: string): TranscriptMessage[] {
  if (!jsonl.trim()) return [];
  const lines = jsonl.split("\n").filter((l) => l.trim());
  const result: TranscriptMessage[] = [];
  for (const line of lines) {
    try {
      result.push(JSON.parse(line) as TranscriptMessage);
    } catch {
      // 壊れた行はスキップ
    }
  }
  return result;
}

/**
 * Skill ツール呼び出し後に Claude Code が注入する synthetic user message かを判定する。
 * Skill loader は本文を `Base directory for this skill:` で始めるため、それをマーカーに使う。
 * これを「実ユーザーメッセージ」と誤認すると現ターン境界が後ろにずれ、
 * /user-research-queue 起動 user message が検出されなくなる (false negative)。
 */
function isSkillLoaderMessage(m: TranscriptMessage): boolean {
  const content = m.message?.content;
  const texts: string[] = [];
  if (typeof content === "string") {
    texts.push(content);
  } else if (Array.isArray(content)) {
    for (const item of content) {
      if (item.type === "text" && typeof item.text === "string") texts.push(item.text);
    }
  }
  return texts.some((t) => t.trimStart().startsWith("Base directory for this skill:"));
}

/**
 * 末尾から最後の「実ユーザーメッセージ」を探し、そこから末尾までを現ターンとして返す。
 * 注意: tool_result も type:"user" で包まれるため、content に text 項目を持つ
 * メッセージだけを「実ユーザーメッセージ」として扱う。
 * さらに Skill ツール呼び出し後に注入される synthetic user message
 * (Skill loader、`Base directory for this skill:` で始まる) もスキップする。
 */
export function extractCurrentTurn(messages: TranscriptMessage[]): TranscriptMessage[] {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (!m || m.type !== "user") continue;

    // Skill loader 由来の synthetic user message はターン境界として扱わない
    if (isSkillLoaderMessage(m)) continue;

    const content = m.message?.content;
    // content が文字列の場合は実メッセージとみなす (古い形式)
    if (typeof content === "string" && content.length > 0) {
      return messages.slice(i);
    }
    // content が配列の場合、text 型の項目があれば実メッセージ
    if (Array.isArray(content) && content.some((item) => item.type === "text")) {
      return messages.slice(i);
    }
    // tool_result のみの user メッセージはスキップ
  }
  return messages;
}

/**
 * 現ターンの先頭 user メッセージが /user-research-queue quick または deep 呼び出しかを判定する。
 * 検出条件:
 *   - content text に <command-name>/user-research-queue</command-name> を含む
 *     かつ <command-args> 内に quick または deep を含む
 *   OR content text に user-research-queue AND (quick | deep) を含む (フォールバック)
 */
export function isQueueDrivenTurn(turn: TranscriptMessage[]): boolean {
  if (turn.length === 0) return false;

  // 先頭の user メッセージを探す
  const firstUser = turn.find((m) => m.type === "user");
  if (!firstUser) return false;

  const content = firstUser.message?.content;
  const texts: string[] = [];

  if (typeof content === "string") {
    texts.push(content);
  } else if (Array.isArray(content)) {
    for (const item of content) {
      if (item.type === "text" && typeof item.text === "string") {
        texts.push(item.text);
      }
    }
  }

  const combined = texts.join(" ");

  // プライマリ検出: command-name タグと command-args タグを使った検出
  const hasCommandTag = combined.includes("<command-name>/user-research-queue</command-name>");
  const hasArgsTag = combined.includes("<command-args>");
  if (hasCommandTag && hasArgsTag) {
    // command-args の中身に quick または deep が含まれるか
    const argsMatch = combined.match(/<command-args>([\s\S]*?)<\/command-args>/);
    if (argsMatch) {
      const args = argsMatch[1] ?? "";
      if (/\bquick\b/.test(args) || /\bdeep\b/.test(args)) {
        return true;
      }
    }
  }

  // フォールバック: user-research-queue AND (quick | deep) の substring 検索
  if (
    combined.includes("user-research-queue") &&
    (/\bquick\b/.test(combined) || /\bdeep\b/.test(combined))
  ) {
    return true;
  }

  return false;
}

/**
 * 現ターンの assistant メッセージに user-research-eval-ref の Skill tool_use が含まれるかを返す。
 */
export function hasEvalRefCall(turn: TranscriptMessage[]): boolean {
  for (const msg of turn) {
    if (msg.type !== "assistant") continue;
    const content = msg.message?.content;
    if (!Array.isArray(content)) continue;
    for (const item of content) {
      if (
        item.type === "tool_use" &&
        item.name === "Skill" &&
        (item.input as { skill?: string })?.skill === EVAL_REF_SKILL
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 現ターン内で user-research-eval-ref の Skill tool_use より後に
 * AskUserQuestion tool_use があるかを返す。
 * ターン内の全 assistant tool_use を時系列順に走査して判定する。
 */
export function hasAskUserQuestionAfterEvalRef(turn: TranscriptMessage[]): boolean {
  // ターン内の tool_use を時系列順に収集
  const toolUses: ContentItem[] = [];
  for (const msg of turn) {
    if (msg.type !== "assistant") continue;
    const content = msg.message?.content;
    if (!Array.isArray(content)) continue;
    for (const item of content) {
      if (item.type === "tool_use") {
        toolUses.push(item);
      }
    }
  }

  // eval-ref の最初のインデックスを探す
  const evalRefIndex = toolUses.findIndex(
    (item) => item.name === "Skill" && (item.input as { skill?: string })?.skill === EVAL_REF_SKILL,
  );

  if (evalRefIndex === -1) return false;

  // eval-ref より後に AskUserQuestion があるか
  return toolUses.slice(evalRefIndex + 1).some((item) => item.name === "AskUserQuestion");
}

/**
 * ブロックすべきかどうかを返す。
 * isQueueDrivenTurn && hasEvalRefCall && !hasAskUserQuestionAfterEvalRef の場合に true。
 */
export function shouldBlock(turn: TranscriptMessage[]): boolean {
  return isQueueDrivenTurn(turn) && hasEvalRefCall(turn) && !hasAskUserQuestionAfterEvalRef(turn);
}

interface StopHookInput {
  session_id?: string;
  transcript_path?: string;
  hook_event_name?: string;
  stop_hook_active?: boolean;
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

    // Stop hook が再 fire するループを防止 (block 時 Claude Code は再走させる)
    if (input.stop_hook_active) process.exit(0);

    // transcript_path がなければ何もできない
    const transcriptPath = input.transcript_path;
    if (!transcriptPath) process.exit(0);

    // transcript を読んで現ターンを取得
    const jsonl = await Bun.file(transcriptPath).text();
    const messages = parseTranscript(jsonl);
    const turn = extractCurrentTurn(messages);

    if (shouldBlock(turn)) {
      console.error(
        "[queue-stop-guard] user-research-queue quick/deep ターンで user-research-eval-ref 委譲後に AskUserQuestion が呼ばれていません。SKILL.md Step 6 (promote/discard/keep または takeaway 選択) を実行してください。",
      );
      process.exit(2);
    }

    process.exit(0);
  } catch {
    // fail-open: パースエラーや I/O エラーは無視
    process.exit(0);
  }
}

if (import.meta.main) {
  await main();
}
