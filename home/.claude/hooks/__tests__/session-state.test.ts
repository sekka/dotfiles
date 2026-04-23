import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  readJson,
  readNumber,
  sessionDir,
  writeJson,
  writeNumber,
} from "../lib/session-state";

const BASE = `/tmp/claude-hooks-test-session-state-${Date.now()}`;

beforeEach(() => {
  if (!existsSync(BASE)) mkdirSync(BASE, { recursive: true });
});

afterEach(() => {
  rmSync(BASE, { recursive: true, force: true });
});

describe("sessionDir", () => {
  test("ディレクトリを作成して返す", () => {
    const dir = sessionDir(`sess-${Date.now()}`);
    expect(existsSync(dir)).toBe(true);
    rmSync(dir, { recursive: true, force: true });
  });

  test("既存ディレクトリでもエラーにならない", () => {
    const id = `sess-existing-${Date.now()}`;
    sessionDir(id);
    expect(() => sessionDir(id)).not.toThrow();
    rmSync(join("/tmp", `claude-hooks-${id}`), { recursive: true, force: true });
  });
});

describe("readJson", () => {
  test("ファイルが存在しない場合はデフォルト値を返す", () => {
    expect(readJson(join(BASE, "missing.json"), [])).toEqual([]);
    expect(readJson(join(BASE, "missing.json"), { x: 1 })).toEqual({ x: 1 });
  });

  test("JSON ファイルの内容を返す", () => {
    const f = join(BASE, "data.json");
    writeFileSync(f, JSON.stringify(["/foo", "/bar"]), "utf-8");
    expect(readJson<string[]>(f, [])).toEqual(["/foo", "/bar"]);
  });

  test("破損した JSON はデフォルト値を返す", () => {
    const f = join(BASE, "bad.json");
    writeFileSync(f, "not-json", "utf-8");
    expect(readJson(f, ["default"])).toEqual(["default"]);
  });
});

describe("writeJson", () => {
  test("JSON ファイルを書き込む", () => {
    const f = join(BASE, "out.json");
    writeJson(f, { key: "value" });
    expect(readJson<{ key: string }>(f, { key: "" })).toEqual({ key: "value" });
  });
});

describe("readNumber", () => {
  test("ファイルが存在しない場合はデフォルト値を返す", () => {
    expect(readNumber(join(BASE, "missing.txt"), 0)).toBe(0);
    expect(readNumber(join(BASE, "missing.txt"), 5)).toBe(5);
  });

  test("数値ファイルの内容を返す", () => {
    const f = join(BASE, "count.txt");
    writeFileSync(f, "3", "utf-8");
    expect(readNumber(f, 0)).toBe(3);
  });

  test("値が 0 のときデフォルト値を返さない", () => {
    const f = join(BASE, "zero.txt");
    writeFileSync(f, "0", "utf-8");
    expect(readNumber(f, 99)).toBe(0);
  });

  test("破損した内容はデフォルト値を返す", () => {
    const f = join(BASE, "bad.txt");
    writeFileSync(f, "not-a-number", "utf-8");
    expect(readNumber(f, 42)).toBe(42);
  });
});

describe("writeNumber", () => {
  test("数値ファイルを書き込む", () => {
    const f = join(BASE, "num.txt");
    writeNumber(f, 7);
    expect(readNumber(f, 0)).toBe(7);
  });
});
