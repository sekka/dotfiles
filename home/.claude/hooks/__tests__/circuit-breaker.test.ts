import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import {
  THRESHOLD,
  WARNING_MESSAGE,
  getStateFile,
  incrementAndCheck,
  readCount,
  resetState,
} from "../circuit-breaker";

const SESSION = `test-circuit-breaker-${Date.now()}`;
let stateFile: string;

beforeEach(() => {
  stateFile = getStateFile(SESSION + `-${Math.random()}`);
});

afterEach(() => {
  if (existsSync(stateFile)) rmSync(stateFile);
});

describe("readCount", () => {
  test("状態ファイルが存在しない場合は 0 を返す", () => {
    expect(readCount(stateFile)).toBe(0);
  });

  test("状態ファイルの値を返す", () => {
    Bun.write(stateFile, "2");
    expect(readCount(stateFile)).toBe(2);
  });

  test("破損した内容は 0 として扱う", () => {
    Bun.write(stateFile, "not-a-number");
    expect(readCount(stateFile)).toBe(0);
  });
});

describe("resetState", () => {
  test("状態ファイルを削除する", () => {
    Bun.write(stateFile, "1");
    resetState(stateFile);
    expect(existsSync(stateFile)).toBe(false);
  });

  test("ファイルが存在しなくてもエラーにならない", () => {
    expect(() => resetState(stateFile)).not.toThrow();
  });
});

describe("incrementAndCheck", () => {
  test("1 回目: false を返しカウント 1 を書き込む", () => {
    expect(incrementAndCheck(stateFile)).toBe(false);
    expect(readCount(stateFile)).toBe(1);
  });

  test("2 回目: false を返しカウント 2 を書き込む", () => {
    Bun.write(stateFile, "1");
    expect(incrementAndCheck(stateFile)).toBe(false);
    expect(readCount(stateFile)).toBe(2);
  });

  test(`${THRESHOLD} 回目: true を返しファイルを書き換えない（呼び出し元がリセット）`, () => {
    Bun.write(stateFile, String(THRESHOLD - 1));
    expect(incrementAndCheck(stateFile)).toBe(true);
    expect(readCount(stateFile)).toBe(THRESHOLD - 1);
  });
});

describe("統合: 連続失敗シナリオ", () => {
  test("3 回連続失敗後にリセットされ、次の失敗は 1 からカウント", () => {
    const sf = getStateFile(`integration-${Date.now()}`);
    try {
      // 1回目・2回目: 警告なし
      expect(incrementAndCheck(sf)).toBe(false);
      expect(incrementAndCheck(sf)).toBe(false);
      // 3回目: 警告あり
      expect(incrementAndCheck(sf)).toBe(true);
      // リセット（main() が行う操作を再現）
      resetState(sf);
      // 次の失敗はカウント 1 から
      expect(readCount(sf)).toBe(0);
    } finally {
      if (existsSync(sf)) rmSync(sf);
    }
  });

  test("成功でカウントがリセットされる", () => {
    Bun.write(stateFile, "2");
    resetState(stateFile); // success → reset
    expect(readCount(stateFile)).toBe(0);
  });
});

describe("定数", () => {
  test("THRESHOLD は 3", () => {
    expect(THRESHOLD).toBe(3);
  });

  test("WARNING_MESSAGE は circuit-breaker を含む", () => {
    expect(WARNING_MESSAGE).toContain("circuit-breaker");
  });
});
