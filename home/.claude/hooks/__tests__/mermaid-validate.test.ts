import { describe, expect, test } from "bun:test";
import { extractMermaidBlocks, isMdFile } from "../mermaid-validate";

describe("isMdFile", () => {
  test(".md ファイルは true", () => {
    expect(isMdFile("README.md")).toBe(true);
    expect(isMdFile("/home/user/docs/guide.md")).toBe(true);
  });

  test(".MD（大文字）も true", () => {
    expect(isMdFile("README.MD")).toBe(true);
    expect(isMdFile("NOTES.Md")).toBe(true);
  });

  test(".md 以外は false", () => {
    expect(isMdFile("script.ts")).toBe(false);
    expect(isMdFile("config.json")).toBe(false);
    expect(isMdFile("style.css")).toBe(false);
  });

  test("拡張子なしは false", () => {
    expect(isMdFile("Makefile")).toBe(false);
    expect(isMdFile("no-extension")).toBe(false);
  });

  test(".md が途中に含まれるだけでは false", () => {
    expect(isMdFile("readme.md.bak")).toBe(false);
  });
});

describe("extractMermaidBlocks", () => {
  test("単一の mermaid ブロックを抽出する", () => {
    const content = "# Title\n\n```mermaid\ngraph TD\n  A --> B\n```\n";
    const blocks = extractMermaidBlocks(content);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toBe("graph TD\n  A --> B");
  });

  test("複数の mermaid ブロックをすべて抽出する", () => {
    const content = [
      "```mermaid",
      "graph LR",
      "  A --> B",
      "```",
      "Some text",
      "```mermaid",
      "sequenceDiagram",
      "  Alice ->> Bob: Hello",
      "```",
    ].join("\n");
    const blocks = extractMermaidBlocks(content);
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toBe("graph LR\n  A --> B");
    expect(blocks[1]).toBe("sequenceDiagram\n  Alice ->> Bob: Hello");
  });

  test("mermaid ブロックがない場合は空配列", () => {
    const content = "# Title\n\nJust some text.\n";
    expect(extractMermaidBlocks(content)).toHaveLength(0);
  });

  test("空のコンテンツは空配列", () => {
    expect(extractMermaidBlocks("")).toHaveLength(0);
  });

  test("他のコードブロックは無視する", () => {
    const content = "```typescript\nconsole.log('hello');\n```\n```bash\necho hi\n```\n";
    expect(extractMermaidBlocks(content)).toHaveLength(0);
  });

  test("ブロック前後の空白をトリムする", () => {
    const content = "```mermaid\n\n  graph TD\n    A --> B\n\n```\n";
    const blocks = extractMermaidBlocks(content);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toBe("graph TD\n    A --> B");
  });

  test("空の mermaid ブロックは除外する", () => {
    const content = "```mermaid\n\n```\n";
    expect(extractMermaidBlocks(content)).toHaveLength(0);
  });

  test("```mermaid の後ろに属性や空白があっても抽出する", () => {
    const content = '```mermaid title="X"\ngraph TD\n  A --> B\n```\n';
    const blocks = extractMermaidBlocks(content);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toBe("graph TD\n  A --> B");
  });

  test("```Mermaid（大文字混在）も抽出する", () => {
    const content = "```Mermaid\ngraph TD\n  A --> B\n```\n";
    const blocks = extractMermaidBlocks(content);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toBe("graph TD\n  A --> B");
  });
});
