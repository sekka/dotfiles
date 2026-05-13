import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { rmSync } from "node:fs";
import { sessionDir } from "../lib/session-state";
import {
  FILE_THRESHOLD,
  LINE_THRESHOLD,
  editLineCount,
  splitLines,
  updateState,
  type DelegationState,
} from "../delegation-guard";

const SESSION = `test-delegation-guard-${Date.now()}`;
let dir: string;

beforeEach(() => {
  dir = sessionDir(`${SESSION}-${Math.random()}`);
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// splitLines
// ---------------------------------------------------------------------------
describe("splitLines", () => {
  test("空文字は 0 を返す", () => {
    expect(splitLines("")).toBe(0);
  });

  test("1 行は 1 を返す", () => {
    expect(splitLines("hello")).toBe(1);
  });

  test("複数行は行数を返す", () => {
    expect(splitLines("a\nb\nc")).toBe(3);
  });

  test("末尾改行を含む場合も行数を返す", () => {
    // "a\nb\n" → split => ["a","b",""] → 3
    expect(splitLines("a\nb\n")).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// editLineCount
// ---------------------------------------------------------------------------
describe("editLineCount", () => {
  test("Edit: old_string と new_string の大きい方を返す", () => {
    const result = editLineCount("Edit", {
      old_string: "a\nb",
      new_string: "a\nb\nc\nd",
    });
    expect(result).toBe(4); // new_string is 4 lines
  });

  test("Edit: old_string が大きければそちらを返す", () => {
    const result = editLineCount("Edit", {
      old_string: "a\nb\nc\nd\ne",
      new_string: "x",
    });
    expect(result).toBe(5);
  });

  test("Write: content の行数を返す", () => {
    const result = editLineCount("Write", { content: "line1\nline2\nline3" });
    expect(result).toBe(3);
  });

  test("NotebookEdit: new_source の行数を返す", () => {
    const result = editLineCount("NotebookEdit", { new_source: "a\nb" });
    expect(result).toBe(2);
  });

  test("不明なツール名は 0 を返す", () => {
    const result = editLineCount("Bash", { command: "echo hi" });
    expect(result).toBe(0);
  });

  test("フィールドが欠けている場合は 0 を返す", () => {
    const result = editLineCount("Write", {});
    expect(result).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// updateState: filesEdited threshold
// ---------------------------------------------------------------------------
describe("updateState: filesEdited", () => {
  const base = (): DelegationState => ({
    filesEdited: [],
    totalLines: 0,
    warnedFiles: false,
    warnedLines: false,
  });

  test("1 ファイル目では警告しない", () => {
    const { warnings } = updateState(base(), "/tmp/a.ts", 1);
    expect(warnings).not.toContain("files");
  });

  test(`${FILE_THRESHOLD} ファイル目 (${FILE_THRESHOLD - 1}→${FILE_THRESHOLD}) で files 警告を出す`, () => {
    let state = base();
    for (let i = 1; i < FILE_THRESHOLD; i++) {
      state = updateState(state, `/tmp/file${i}.ts`, 1).state;
    }
    const { warnings, state: next } = updateState(state, `/tmp/file${FILE_THRESHOLD}.ts`, 1);
    expect(warnings).toContain("files");
    expect(next.warnedFiles).toBe(true);
  });

  test(`同じ閾値を超えても 2 回目の警告は出さない`, () => {
    let state = base();
    for (let i = 1; i <= FILE_THRESHOLD; i++) {
      state = updateState(state, `/tmp/file${i}.ts`, 1).state;
    }
    // state.warnedFiles is now true; add another new file
    const { warnings } = updateState(state, "/tmp/extra.ts", 1);
    expect(warnings).not.toContain("files");
  });

  test("同じファイルを 2 回追加しても重複カウントしない", () => {
    let state = base();
    state = updateState(state, "/tmp/same.ts", 5).state;
    state = updateState(state, "/tmp/same.ts", 5).state;
    expect(state.filesEdited.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// updateState: totalLines threshold
// ---------------------------------------------------------------------------
describe("updateState: totalLines", () => {
  const base = (): DelegationState => ({
    filesEdited: [],
    totalLines: 0,
    warnedFiles: false,
    warnedLines: false,
  });

  test("29 行以下では lines 警告しない", () => {
    const { warnings } = updateState(base(), "/tmp/a.ts", LINE_THRESHOLD - 1);
    expect(warnings).not.toContain("lines");
  });

  test(`totalLines が ${LINE_THRESHOLD - 1}→${LINE_THRESHOLD} で lines 警告を出す`, () => {
    let state: DelegationState = { ...base(), totalLines: LINE_THRESHOLD - 1 };
    const { warnings, state: next } = updateState(state, "/tmp/a.ts", 1);
    expect(warnings).toContain("lines");
    expect(next.warnedLines).toBe(true);
  });

  test("閾値超過後の追加編集では再警告しない", () => {
    let state: DelegationState = {
      ...base(),
      totalLines: LINE_THRESHOLD,
      warnedLines: true,
    };
    const { warnings } = updateState(state, "/tmp/a.ts", 5);
    expect(warnings).not.toContain("lines");
  });

  test("totalLines に行数が累積される", () => {
    let state = base();
    state = updateState(state, "/tmp/a.ts", 10).state;
    state = updateState(state, "/tmp/b.ts", 15).state;
    expect(state.totalLines).toBe(25);
  });
});

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
describe("constants", () => {
  test("FILE_THRESHOLD は 2", () => {
    expect(FILE_THRESHOLD).toBe(2);
  });

  test("LINE_THRESHOLD は 30", () => {
    expect(LINE_THRESHOLD).toBe(30);
  });
});
