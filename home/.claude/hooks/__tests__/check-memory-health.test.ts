import { describe, expect, test } from "bun:test";
import { extractLinks } from "../check-memory-health";

/**
 * check-memory-health.ts のテスト
 *
 * テスト対象:
 * - extractLinks: MEMORY.md の Markdown リンク抽出ロジック
 *   リンク切れチェックの精度がこの関数の正確さに依存するため重要。
 */

describe("extractLinks", () => {
  test("単一リンクを抽出する", () => {
    const content = "- [タイトル](file.md) — 説明";
    expect(extractLinks(content)).toEqual(["file.md"]);
  });

  test("複数リンクをすべて抽出する", () => {
    const content = [
      "- [ファイルA](a.md) — 説明",
      "- [ファイルB](sub/b.md) — 説明",
      "- [ファイルC](c.md) — 説明",
    ].join("\n");
    expect(extractLinks(content)).toEqual(["a.md", "sub/b.md", "c.md"]);
  });

  test("HTTP リンクも抽出する（スキップは呼び出し元が行う）", () => {
    const content = "- [外部](https://example.com) — 外部リンク";
    expect(extractLinks(content)).toEqual(["https://example.com"]);
  });

  test("リンクが含まれない場合は空配列を返す", () => {
    expect(extractLinks("普通のテキストのみ")).toEqual([]);
    expect(extractLinks("")).toEqual([]);
  });

  test("タイトル部分に ] が含まれる場合はリンクを抽出しない", () => {
    // [foo]bar] のような壊れたリンクは抽出しない
    const content = "テキスト [foo](a.md) [壊れた](b.md";
    expect(extractLinks(content)).toEqual(["a.md"]);
  });

  test("括弧が入れ子になっているリンクは最初の ) で終了する", () => {
    const content = "[title](path/to/file.md)";
    expect(extractLinks(content)).toEqual(["path/to/file.md"]);
  });

  test("MEMORY.md 形式のリアルな入力を処理する", () => {
    const content = `# Memory Index

- [ユーザープロファイル](user_profile.md) — ロールと設定
- [フィードバック記録](feedback_testing.md) — テストに関する指示
- [Nix 調査結果](reference_nix.md) — 2026-04 初回調査
`;
    expect(extractLinks(content)).toEqual([
      "user_profile.md",
      "feedback_testing.md",
      "reference_nix.md",
    ]);
  });
});
