import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { readNumber, sessionDir, writeNumber } from "../lib/session-state";
import { WARN_THRESHOLD } from "../error-loop-hook";

const SESSION = `test-error-loop-${Date.now()}`;
let dir: string;
let streakFile: string;

beforeEach(() => {
  dir = sessionDir(`${SESSION}-${Math.random()}`);
  streakFile = join(dir, "fail-streak.txt");
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("WARN_THRESHOLD", () => {
  test("2 である", () => {
    expect(WARN_THRESHOLD).toBe(2);
  });
});

describe("連続失敗カウンタ", () => {
  test("初期状態は 0", () => {
    expect(readNumber(streakFile, 0)).toBe(0);
  });

  test("失敗でインクリメントされる", () => {
    const streak = readNumber(streakFile, 0) + 1;
    writeNumber(streakFile, streak);
    expect(readNumber(streakFile, 0)).toBe(1);
  });

  test("成功でリセットされる", () => {
    writeNumber(streakFile, 2);
    writeNumber(streakFile, 0); // success → reset
    expect(readNumber(streakFile, 0)).toBe(0);
  });

  test(`${WARN_THRESHOLD} 回目に警告条件を満たす`, () => {
    writeNumber(streakFile, WARN_THRESHOLD - 1);
    const streak = readNumber(streakFile, 0) + 1;
    expect(streak >= WARN_THRESHOLD).toBe(true);
  });

  test(`${WARN_THRESHOLD - 1} 回では警告条件を満たさない`, () => {
    const streak = readNumber(streakFile, 0) + 1;
    expect(streak >= WARN_THRESHOLD).toBe(false);
  });
});

describe("統合: 連続失敗→成功→再失敗", () => {
  test("成功後は 0 から再カウントする", () => {
    // 2回失敗
    let streak = readNumber(streakFile, 0) + 1;
    writeNumber(streakFile, streak);
    streak = readNumber(streakFile, 0) + 1;
    writeNumber(streakFile, streak);
    expect(readNumber(streakFile, 0)).toBe(2);

    // 成功でリセット
    writeNumber(streakFile, 0);
    expect(readNumber(streakFile, 0)).toBe(0);

    // 再失敗は 1 からカウント
    const newStreak = readNumber(streakFile, 0) + 1;
    writeNumber(streakFile, newStreak);
    expect(readNumber(streakFile, 0)).toBe(1);
  });
});
