import { describe, expect, test } from "bun:test";
import { FORMATTABLE_EXTENSIONS, getExtension, shouldSkip } from "../post-format";

describe("getExtension", () => {
  test("通常の拡張子を返す", () => {
    expect(getExtension("foo.ts")).toBe(".ts");
    expect(getExtension("path/to/file.json")).toBe(".json");
    expect(getExtension("script.sh")).toBe(".sh");
  });

  test("拡張子を小文字に正規化する", () => {
    expect(getExtension("FILE.TS")).toBe(".ts");
    expect(getExtension("README.MD")).toBe(".md");
  });

  test("拡張子がない場合は空文字を返す", () => {
    expect(getExtension("Makefile")).toBe("");
    expect(getExtension("no-extension")).toBe("");
  });

  test("ドットファイルは空文字を返す（path.extname の標準挙動）", () => {
    expect(getExtension(".gitignore")).toBe("");
    expect(getExtension(".env")).toBe("");
  });

  test("複数のドットがある場合は最後の拡張子を返す", () => {
    expect(getExtension("file.test.ts")).toBe(".ts");
    expect(getExtension("archive.tar.gz")).toBe(".gz");
  });
});

describe("FORMATTABLE_EXTENSIONS", () => {
  test("主要な拡張子が含まれている", () => {
    expect(FORMATTABLE_EXTENSIONS.has(".ts")).toBe(true);
    expect(FORMATTABLE_EXTENSIONS.has(".tsx")).toBe(true);
    expect(FORMATTABLE_EXTENSIONS.has(".js")).toBe(true);
    expect(FORMATTABLE_EXTENSIONS.has(".json")).toBe(true);
    expect(FORMATTABLE_EXTENSIONS.has(".md")).toBe(true);
    expect(FORMATTABLE_EXTENSIONS.has(".sh")).toBe(true);
    expect(FORMATTABLE_EXTENSIONS.has(".yaml")).toBe(true);
    expect(FORMATTABLE_EXTENSIONS.has(".toml")).toBe(true);
  });

  test("対象外の拡張子は含まれていない", () => {
    expect(FORMATTABLE_EXTENSIONS.has(".png")).toBe(false);
    expect(FORMATTABLE_EXTENSIONS.has(".py")).toBe(false);
    expect(FORMATTABLE_EXTENSIONS.has(".rs")).toBe(false);
    expect(FORMATTABLE_EXTENSIONS.has("")).toBe(false);
  });
});

describe("shouldSkip", () => {
  test("フォーマット対象外の拡張子はスキップ", () => {
    expect(shouldSkip("image.png")).toBe(true);
    expect(shouldSkip("script.py")).toBe(true);
    expect(shouldSkip("Makefile")).toBe(true);
  });

  test("フォーマット対象の拡張子はスキップしない", () => {
    expect(shouldSkip("src/index.ts")).toBe(false);
    expect(shouldSkip("README.md")).toBe(false);
    expect(shouldSkip("config.json")).toBe(false);
  });

  test("settings.json はスキップ（sort-permissions.ts が担当）", () => {
    expect(shouldSkip("/home/user/.claude/settings.json")).toBe(true);
    expect(shouldSkip("/home/user/.claude/settings.local.json")).toBe(true);
  });

  test("settings.json という名前でも .claude/ 配下でなければスキップしない", () => {
    expect(shouldSkip("/project/config/settings.json")).toBe(false);
  });

  test("node_modules 配下はスキップ", () => {
    // フックが受け取るパスは常に絶対パスなので /node_modules/ の形式になる
    expect(shouldSkip("/project/node_modules/lodash/index.js")).toBe(true);
    expect(shouldSkip("/home/user/project/node_modules/react/index.ts")).toBe(true);
  });

  test("node_modules という名前のファイル自体はスキップしない", () => {
    expect(shouldSkip("/project/src/node_modules_helper.ts")).toBe(false);
  });
});
