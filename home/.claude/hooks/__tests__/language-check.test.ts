import { describe, expect, test } from "bun:test";
import { containsEnglish, extractLastAssistantText, stripCodeAndUrls } from "../language-check";

describe("stripCodeAndUrls", () => {
  test("fenced コードブロックを除去する", () => {
    const text = "Hello\n```\nconst x = 1;\n```\n世界";
    const result = stripCodeAndUrls(text);
    expect(result).not.toContain("const");
    expect(result).toContain("Hello");
    expect(result).toContain("世界");
  });

  test("インライン backtick コードを除去する", () => {
    const text = "これは `let x = foo` です。";
    const result = stripCodeAndUrls(text);
    expect(result).not.toContain("let");
    expect(result).toContain("これは");
    expect(result).toContain("です。");
  });

  test("URL を除去する", () => {
    const text = "参考: https://example.com/path/to/doc を見てください。";
    const result = stripCodeAndUrls(text);
    expect(result).not.toContain("https");
    expect(result).toContain("参考");
    expect(result).toContain("を見てください。");
  });

  test("複数のコードブロックと URL を一括除去する", () => {
    const text = "A\n```\ncode here\n```\nB `inline` C https://url.com D";
    const result = stripCodeAndUrls(text);
    expect(result).not.toContain("code");
    expect(result).not.toContain("inline");
    expect(result).not.toContain("https");
    expect(result).toContain("A");
    expect(result).toContain("B");
  });

  test("コードなし URL なしのテキストはそのまま", () => {
    const text = "これは普通のテキストです。Let me check.";
    expect(stripCodeAndUrls(text)).toBe(text);
  });
});

describe("containsEnglish", () => {
  test("英語文字列を含む場合は true", () => {
    expect(containsEnglish("Let me check.")).toBe(true);
  });

  test("SVO 英語文を含む場合は true", () => {
    expect(containsEnglish("これは done です。")).toBe(true);
  });

  test("pure 日本語は false", () => {
    expect(containsEnglish("これは日本語のみのテキストです。")).toBe(false);
  });

  test("1文字英字のみは false (regex 要件: 2文字以上が必要)", () => {
    // /\b[a-zA-Z]{2,}\b/ は 2文字以上が必要
    expect(containsEnglish("a b c")).toBe(false);
  });

  test("2文字以上の英語単語は true", () => {
    expect(containsEnglish("bun test コマンドです")).toBe(true);
  });

  test("空文字列は false", () => {
    expect(containsEnglish("")).toBe(false);
  });

  test("日本語と記号のみは false", () => {
    expect(containsEnglish("確認しました。！？")).toBe(false);
  });

  test("OK だけ含む場合は true (2文字英単語)", () => {
    expect(containsEnglish("OK だけ含む")).toBe(true);
  });

  test("UI/OS 混在は true", () => {
    expect(containsEnglish("UI と OS の設定")).toBe(true);
  });

  test("AI を含む場合は true", () => {
    expect(containsEnglish("AI の応答")).toBe(true);
  });
});

describe("extractLastAssistantText", () => {
  test("最後の assistant text メッセージのテキストを返す", () => {
    const lines = [
      JSON.stringify({
        type: "user",
        message: { role: "user", content: [{ type: "text", text: "こんにちは" }] },
      }),
      JSON.stringify({
        type: "assistant",
        message: {
          role: "assistant",
          content: [{ type: "text", text: "Let me check that for you." }],
        },
      }),
    ];
    const jsonl = lines.join("\n");
    expect(extractLastAssistantText(jsonl)).toBe("Let me check that for you.");
  });

  test("tool_use のみの assistant メッセージはスキップして text 持ちを返す", () => {
    const lines = [
      JSON.stringify({
        type: "assistant",
        message: {
          role: "assistant",
          content: [{ type: "text", text: "First response 確認します。" }],
        },
      }),
      JSON.stringify({
        type: "assistant",
        message: {
          role: "assistant",
          content: [{ type: "tool_use", id: "tool1", name: "Read", input: {} }],
        },
      }),
    ];
    const jsonl = lines.join("\n");
    // tool_use のみの最後エントリをスキップして 1 つ前の text を返す
    expect(extractLastAssistantText(jsonl)).toBe("First response 確認します。");
  });

  test("複数の text content を連結する", () => {
    const lines = [
      JSON.stringify({
        type: "assistant",
        message: {
          role: "assistant",
          content: [
            { type: "text", text: "First. " },
            { type: "thinking", thinking: "internal" },
            { type: "text", text: "Second." },
          ],
        },
      }),
    ];
    const jsonl = lines.join("\n");
    expect(extractLastAssistantText(jsonl)).toBe("First. Second.");
  });

  test("assistant メッセージなしは空文字列を返す", () => {
    const lines = [JSON.stringify({ type: "user", message: { role: "user", content: [] } })];
    expect(extractLastAssistantText(lines.join("\n"))).toBe("");
  });

  test("壊れた JSON 行を無視して継続する", () => {
    const lines = [
      "not-valid-json",
      JSON.stringify({
        type: "assistant",
        message: { role: "assistant", content: [{ type: "text", text: "OK response" }] },
      }),
    ];
    expect(extractLastAssistantText(lines.join("\n"))).toBe("OK response");
  });

  test("空文字列入力は空文字列を返す", () => {
    expect(extractLastAssistantText("")).toBe("");
  });
});
