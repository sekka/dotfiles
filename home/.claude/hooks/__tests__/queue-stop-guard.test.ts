import { describe, expect, test } from "bun:test";
import {
  extractCurrentTurn,
  hasAskUserQuestionAfterEvalRef,
  hasEvalRefCall,
  isQueueDrivenTurn,
  parseTranscript,
  shouldBlock,
  type TranscriptMessage,
} from "../queue-stop-guard";

// テスト用 transcript を組み立てるヘルパー
function buildTranscript(events: TranscriptMessage[]): string {
  return events.map((e) => JSON.stringify(e)).join("\n");
}

// テスト fixture: /user-research-queue quick 呼び出し user メッセージ
function makeQueueQuickMsg(): TranscriptMessage {
  return {
    type: "user",
    message: {
      content: [
        {
          type: "text",
          text: "<command-name>/user-research-queue</command-name><command-args>quick</command-args>",
        },
      ],
    },
  };
}

// テスト fixture: /user-research-queue deep 呼び出し user メッセージ
function makeQueueDeepMsg(): TranscriptMessage {
  return {
    type: "user",
    message: {
      content: [
        {
          type: "text",
          text: "<command-name>/user-research-queue</command-name><command-args>deep</command-args>",
        },
      ],
    },
  };
}

// テスト fixture: /user-research-queue list 呼び出し user メッセージ (eval-ref 呼ばない)
function makeQueueListMsg(): TranscriptMessage {
  return {
    type: "user",
    message: {
      content: [
        {
          type: "text",
          text: "<command-name>/user-research-queue</command-name><command-args>list</command-args>",
        },
      ],
    },
  };
}

// テスト fixture: /user-research-eval-ref 単独呼び出し user メッセージ
function makeEvalRefDirectMsg(): TranscriptMessage {
  return {
    type: "user",
    message: {
      content: [
        {
          type: "text",
          text: "<command-name>/user-research-eval-ref</command-name><command-args></command-args>",
        },
      ],
    },
  };
}

// テスト fixture: user-research-eval-ref Skill tool_use を含む assistant メッセージ
function makeEvalRefSkillMsg(): TranscriptMessage {
  return {
    type: "assistant",
    message: {
      content: [
        {
          type: "tool_use",
          name: "Skill",
          input: { skill: "user-research-eval-ref", args: "some args" },
        },
      ],
    },
  };
}

// テスト fixture: AskUserQuestion tool_use を含む assistant メッセージ
function makeAskUserQuestionMsg(): TranscriptMessage {
  return {
    type: "assistant",
    message: {
      content: [
        {
          type: "tool_use",
          name: "AskUserQuestion",
          input: { questions: ["promote/discard/keep?"] },
        },
      ],
    },
  };
}

// テスト fixture: text のみの assistant メッセージ
function makeAssistantTextMsg(text = "応答テキスト"): TranscriptMessage {
  return {
    type: "assistant",
    message: {
      content: [{ type: "text", text }],
    },
  };
}

// テスト fixture: tool_result を含む user メッセージ (tool_result wrapper)
function makeToolResultMsg(): TranscriptMessage {
  return {
    type: "user",
    message: {
      content: [
        {
          type: "tool_result",
          // tool_result の中身
        },
      ],
    },
  };
}

describe("parseTranscript", () => {
  test("正常な JSONL をパースする", () => {
    const msgs = [makeQueueQuickMsg(), makeEvalRefSkillMsg()];
    const jsonl = buildTranscript(msgs);
    const result = parseTranscript(jsonl);
    expect(result).toHaveLength(2);
    expect(result[0]?.type).toBe("user");
    expect(result[1]?.type).toBe("assistant");
  });

  test("空文字列は空配列を返す", () => {
    expect(parseTranscript("")).toEqual([]);
  });

  test("壊れた JSON 行をスキップして続行する (case #8)", () => {
    const jsonl = `not-valid-json\n${JSON.stringify(makeAssistantTextMsg())}`;
    const result = parseTranscript(jsonl);
    expect(result).toHaveLength(1);
    expect(result[0]?.type).toBe("assistant");
  });
});

describe("extractCurrentTurn", () => {
  test("最後の実 user メッセージから末尾を返す", () => {
    const msgs = [makeAssistantTextMsg("前のターン"), makeQueueQuickMsg(), makeEvalRefSkillMsg()];
    const turn = extractCurrentTurn(msgs);
    expect(turn).toHaveLength(2); // user + assistant
    expect(turn[0]?.type).toBe("user");
  });

  test("tool_result の user メッセージはスキップして実メッセージを返す", () => {
    // tool_result wrapper が type:"user" で包まれるケース
    const msgs = [makeQueueQuickMsg(), makeEvalRefSkillMsg(), makeToolResultMsg()];
    const turn = extractCurrentTurn(msgs);
    // tool_result (index 2) をスキップして index 0 (user with text) から
    expect(turn).toHaveLength(3);
    const firstMsg = turn[0];
    expect(firstMsg?.type).toBe("user");
    const content = firstMsg?.message?.content;
    expect(Array.isArray(content) && content.some((i) => i.type === "text")).toBe(true);
  });

  test("メッセージなしの場合は全メッセージを返す", () => {
    const msgs: TranscriptMessage[] = [];
    expect(extractCurrentTurn(msgs)).toEqual([]);
  });

  // 回帰: Skill ツール呼び出し後に Claude Code が注入する synthetic user message
  // (`Base directory for this skill:` で始まる) をターン境界として扱わないこと。
  // これを実メッセージと誤認すると /user-research-queue 起動 message が前ターン扱いに
  // なって isQueueDrivenTurn が false を返し、block されなくなる (4 回目再発の原因)。
  test("Skill loader 由来の synthetic user message はスキップする (regression #4)", () => {
    const skillLoaderMsg: TranscriptMessage = {
      type: "user",
      message: {
        content: [
          {
            type: "text",
            text: "Base directory for this skill: /Users/kei/.claude/skills/user-research-eval-ref\n\n<objective>...",
          },
        ],
      },
    };
    const msgs = [makeQueueQuickMsg(), makeEvalRefSkillMsg(), skillLoaderMsg];
    const turn = extractCurrentTurn(msgs);
    // 期待: index 0 (makeQueueQuickMsg) から末尾まで = 3 件
    expect(turn).toHaveLength(3);
    const firstMsg = turn[0];
    const firstContent = firstMsg?.message?.content;
    const firstText =
      Array.isArray(firstContent) && firstContent[0]?.type === "text" ? firstContent[0].text : "";
    expect(firstText).toContain("/user-research-queue");
  });
});

describe("isQueueDrivenTurn", () => {
  test("quick コマンドは true", () => {
    const turn = [makeQueueQuickMsg()];
    expect(isQueueDrivenTurn(turn)).toBe(true);
  });

  test("deep コマンドは true", () => {
    const turn = [makeQueueDeepMsg()];
    expect(isQueueDrivenTurn(turn)).toBe(true);
  });

  test("list コマンドは false", () => {
    const turn = [makeQueueListMsg()];
    expect(isQueueDrivenTurn(turn)).toBe(false);
  });

  test("eval-ref 単独は false", () => {
    const turn = [makeEvalRefDirectMsg()];
    expect(isQueueDrivenTurn(turn)).toBe(false);
  });

  test("無関係な会話は false", () => {
    const turn = [
      {
        type: "user" as const,
        message: { content: [{ type: "text", text: "今日の天気はどうですか" }] },
      },
    ];
    expect(isQueueDrivenTurn(turn)).toBe(false);
  });

  test("フォールバック: command タグなしでも user-research-queue + quick を含む場合は true", () => {
    const turn = [
      {
        type: "user" as const,
        message: {
          content: [{ type: "text", text: "user-research-queue quick でお願いします" }],
        },
      },
    ];
    expect(isQueueDrivenTurn(turn)).toBe(true);
  });
});

describe("hasEvalRefCall", () => {
  test("eval-ref Skill tool_use があれば true", () => {
    const turn = [makeQueueQuickMsg(), makeEvalRefSkillMsg()];
    expect(hasEvalRefCall(turn)).toBe(true);
  });

  test("eval-ref がなければ false", () => {
    const turn = [makeQueueListMsg(), makeAssistantTextMsg()];
    expect(hasEvalRefCall(turn)).toBe(false);
  });

  test("別の Skill tool_use は false", () => {
    const turn = [
      {
        type: "assistant" as const,
        message: {
          content: [{ type: "tool_use", name: "Skill", input: { skill: "other-skill" } }],
        },
      },
    ];
    expect(hasEvalRefCall(turn)).toBe(false);
  });
});

describe("hasAskUserQuestionAfterEvalRef", () => {
  test("eval-ref の後に AskUserQuestion があれば true", () => {
    const turn = [makeQueueQuickMsg(), makeEvalRefSkillMsg(), makeAskUserQuestionMsg()];
    expect(hasAskUserQuestionAfterEvalRef(turn)).toBe(true);
  });

  test("eval-ref の後に AskUserQuestion がなければ false", () => {
    const turn = [makeQueueQuickMsg(), makeEvalRefSkillMsg(), makeAssistantTextMsg()];
    expect(hasAskUserQuestionAfterEvalRef(turn)).toBe(false);
  });

  test("eval-ref がそもそもなければ false", () => {
    const turn = [makeQueueQuickMsg(), makeAssistantTextMsg()];
    expect(hasAskUserQuestionAfterEvalRef(turn)).toBe(false);
  });

  test("AskUserQuestion が eval-ref より前にある場合は false", () => {
    const turn = [makeQueueQuickMsg(), makeAskUserQuestionMsg(), makeEvalRefSkillMsg()];
    expect(hasAskUserQuestionAfterEvalRef(turn)).toBe(false);
  });
});

describe("shouldBlock — truth table", () => {
  // Case #1: quick → eval-ref → text → END (AUQ なし) → block
  test("#1 quick eval-ref 後 AUQ なし → true (block)", () => {
    const turn = [makeQueueQuickMsg(), makeEvalRefSkillMsg(), makeAssistantTextMsg()];
    expect(shouldBlock(turn)).toBe(true);
  });

  // Case #2: quick → eval-ref → AskUserQuestion → END → no block
  test("#2 quick eval-ref 後 AUQ あり → false", () => {
    const turn = [makeQueueQuickMsg(), makeEvalRefSkillMsg(), makeAskUserQuestionMsg()];
    expect(shouldBlock(turn)).toBe(false);
  });

  // Case #3: quick list (no eval-ref) → no block
  test("#3 quick list eval-ref なし → false", () => {
    const turn = [makeQueueListMsg(), makeAssistantTextMsg()];
    expect(shouldBlock(turn)).toBe(false);
  });

  // Case #4: eval-ref 単独 (queue 経由でない) → no block
  test("#4 eval-ref 単独呼び出し → false", () => {
    const turn = [makeEvalRefDirectMsg(), makeAssistantTextMsg()];
    expect(shouldBlock(turn)).toBe(false);
  });

  // Case #5: 無関係な会話 → no block
  test("#5 無関係な会話 → false", () => {
    const turn = [
      {
        type: "user" as const,
        message: { content: [{ type: "text", text: "こんにちは" }] },
      },
      makeAssistantTextMsg("こんにちは！"),
    ];
    expect(shouldBlock(turn)).toBe(false);
  });

  // Case #6: deep → eval-ref → AskUserQuestion → END → no block
  test("#6 deep eval-ref 後 AUQ あり → false", () => {
    const turn = [makeQueueDeepMsg(), makeEvalRefSkillMsg(), makeAskUserQuestionMsg()];
    expect(shouldBlock(turn)).toBe(false);
  });

  // Case #7: deep → eval-ref → END (no AUQ) → block
  test("#7 deep eval-ref 後 AUQ なし → true (block)", () => {
    const turn = [makeQueueDeepMsg(), makeEvalRefSkillMsg()];
    expect(shouldBlock(turn)).toBe(true);
  });

  // Case #9 (regression #4): quick → eval-ref → Skill loader synthetic → text → END (AUQ なし) → block
  // 旧実装は Skill loader を「実 user message」と誤認しターン境界を後ろにずらしていた。
  // 修正後は Skill loader をスキップして /user-research-queue 起動 message を見つけ block する。
  test("#9 quick eval-ref 後 Skill loader 注入あり AUQ なし → true (block)", () => {
    const skillLoaderMsg: TranscriptMessage = {
      type: "user",
      message: {
        content: [
          {
            type: "text",
            text: "Base directory for this skill: /Users/kei/.claude/skills/user-research-eval-ref",
          },
        ],
      },
    };
    const turn = [
      makeQueueQuickMsg(),
      makeEvalRefSkillMsg(),
      skillLoaderMsg,
      makeAssistantTextMsg("評価カード"),
    ];
    // extractCurrentTurn を経由してから shouldBlock を呼ぶ (実運用と同じパス)
    const slice = extractCurrentTurn(turn);
    expect(shouldBlock(slice)).toBe(true);
  });

  // Case #8: 壊れた JSONL を含む transcript → エラーをスローしない
  test("#8 壊れた JSONL を含む transcript でもエラーをスローしない", () => {
    const jsonl = `not-valid-json\n{"type":"garbage"}\n${JSON.stringify(makeQueueQuickMsg())}`;
    const msgs = parseTranscript(jsonl);
    const turn = extractCurrentTurn(msgs);
    expect(() => shouldBlock(turn)).not.toThrow();
  });
});
