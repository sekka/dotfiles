import { describe, test, expect, beforeEach, afterEach, setSystemTime } from "bun:test";
import { tmuxBraille, resetTime, resetDate } from "./tmux-status";

describe("tmuxBraille", () => {
  test("0% → 全て ⣀ (5文字)、グレー色", () => {
    const result = tmuxBraille(0);
    expect(result).toContain("⣀⣀⣀⣀⣀");
    expect(result).toContain("#[fg=colour240]");
  });

  test("100% → 全て ⣿ (5文字)", () => {
    const result = tmuxBraille(100);
    expect(result).toContain("⣿⣿⣿⣿⣿");
  });

  test("カラー閾値: <=50 → グレー", () => {
    const result = tmuxBraille(50);
    expect(result).toContain("#[fg=colour240]");
  });

  test("カラー閾値: >50 → イエロー", () => {
    const result = tmuxBraille(51);
    expect(result).toContain("#[fg=yellow]");
  });

  test("カラー閾値: >70 → オレンジ", () => {
    const result = tmuxBraille(71);
    expect(result).toContain("#[fg=colour208]");
  });

  test("カラー閾値: >90 → レッド", () => {
    const result = tmuxBraille(91);
    expect(result).toContain("#[fg=brightred]");
  });

  test("len=3 → バーの長さが3文字", () => {
    const result = tmuxBraille(0, 3);
    // Extract braille characters from result
    const brailleChars = ["⣀", "⣄", "⣤", "⣦", "⣶", "⣷", "⣿"];
    const stripped = result.replace(/#\[[^\]]*\]/g, "");
    const barChars = [...stripped].filter((c) => brailleChars.includes(c));
    expect(barChars.length).toBe(3);
  });

  test("50% → 約半分埋まったバー", () => {
    const result = tmuxBraille(50);
    const brailleChars = ["⣀", "⣄", "⣤", "⣦", "⣶", "⣷", "⣿"];
    const stripped = result.replace(/#\[[^\]]*\]/g, "");
    const barChars = [...stripped].filter((c) => brailleChars.includes(c));
    expect(barChars.length).toBe(5);
    // At 50%, some chars should be partially filled (not all ⣀ and not all ⣿)
    const hasPartialFill = barChars.some((c) => c !== "⣀" && c !== "⣿");
    const hasFullFill = barChars.some((c) => c === "⣿");
    expect(hasPartialFill || hasFullFill).toBe(true);
  });
});

describe("resetTime", () => {
  beforeEach(() => {
    setSystemTime(new Date("2026-04-09T00:00:00Z"));
  });

  afterEach(() => {
    setSystemTime();
  });

  test("過去の時刻 → 'now'", () => {
    expect(resetTime("2026-04-08T23:00:00Z")).toBe("now");
  });

  test("30分後 → '30m'", () => {
    expect(resetTime("2026-04-09T00:30:00Z")).toBe("30m");
  });

  test("2時間15分後 → '2h15m'", () => {
    expect(resetTime("2026-04-09T02:15:00Z")).toBe("2h15m");
  });

  test("1日3時間後 → '1d3h'", () => {
    expect(resetTime("2026-04-10T03:00:00Z")).toBe("1d3h");
  });
});

describe("resetDate", () => {
  beforeEach(() => {
    // 2026-04-09T06:00:00Z = JST 15:00
    setSystemTime(new Date("2026-04-09T06:00:00Z"));
  });

  afterEach(() => {
    setSystemTime();
  });

  test("同日(JST) → '19:00'", () => {
    // 2026-04-09T10:00:00Z = JST 19:00
    expect(resetDate("2026-04-09T10:00:00Z")).toBe("19:00");
  });

  test("翌日(JST) → '4/10 10:00'", () => {
    // 2026-04-10T01:00:00Z = JST 10:00 on 4/10
    expect(resetDate("2026-04-10T01:00:00Z")).toBe("4/10 10:00");
  });
});
