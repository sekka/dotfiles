import { describe, it, expect } from "bun:test";
import { tokensK, elapsed, braille } from "../../statusline.ts";

// ============================================================================
// tokensK
// ============================================================================

describe("tokensK", () => {
  it("returns '0.0' for 0", () => {
    expect(tokensK(0)).toBe("0.0");
  });

  it("returns '1.0' for 1000", () => {
    expect(tokensK(1000)).toBe("1.0");
  });

  it("returns '1.5' for 1500", () => {
    expect(tokensK(1500)).toBe("1.5");
  });

  it("returns '200.0' for 200000", () => {
    expect(tokensK(200000)).toBe("200.0");
  });

  it("rounds to 1 decimal: 999 → '1.0'", () => {
    expect(tokensK(999)).toBe("1.0");
  });
});

// ============================================================================
// elapsed
// ============================================================================

describe("elapsed", () => {
  it("returns '0:00' for 0ms", () => {
    expect(elapsed(0)).toBe("0:00");
  });

  it("returns '0:05' for 5000ms", () => {
    expect(elapsed(5000)).toBe("0:05");
  });

  it("returns '1:05' for 65000ms", () => {
    expect(elapsed(65000)).toBe("1:05");
  });

  it("returns '1:01:01' for 3661000ms", () => {
    expect(elapsed(3661000)).toBe("1:01:01");
  });

  it("returns '2:00:00' for 7200000ms", () => {
    expect(elapsed(7200000)).toBe("2:00:00");
  });
});

// ============================================================================
// braille
// Helper: strip ANSI escape codes to get the bare bar characters
// ============================================================================

function stripAnsi(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/\x1b\[[0-9;]*m/g, "");
}

describe("braille", () => {
  it("pct=0 produces 5 '⣀' chars", () => {
    const bar = stripAnsi(braille(0));
    expect(bar).toBe("⣀⣀⣀⣀⣀");
  });

  it("pct=100 produces 5 '⣿' chars", () => {
    const bar = stripAnsi(braille(100));
    expect(bar).toBe("⣿⣿⣿⣿⣿");
  });

  it("custom length: pct=0, len=3 → 3 '⣀' chars", () => {
    const bar = stripAnsi(braille(0, 3));
    expect(bar).toBe("⣀⣀⣀");
  });

  it("pct=50, len=5 → '⣿⣿⣦⣀⣀' (mix of full, partial, empty)", () => {
    // cur = round(0.5 * 30) = 15, full=2, partial=3 → chars[3]='⣦', empty=2
    const bar = stripAnsi(braille(50));
    expect(bar).toBe("⣿⣿⣦⣀⣀");
  });

  it("output has length 5 (bar chars) for default len", () => {
    const bar = stripAnsi(braille(75));
    // Each braille glyph is a single Unicode code point; count code points
    const codePoints = [...bar];
    expect(codePoints).toHaveLength(5);
  });
});
