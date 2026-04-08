import { describe, it, expect } from "bun:test";
import { tmuxBraille, resetTime, resetDate } from "../../tmux-status.ts";

// ============================================================================
// resetTime
// ============================================================================

describe("resetTime", () => {
  it("returns 'now' for a past date", () => {
    const past = new Date(Date.now() - 60000).toISOString();
    expect(resetTime(past)).toBe("now");
  });

  it("returns '30m' for 30 minutes from now", () => {
    const future = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    expect(resetTime(future)).toBe("30m");
  });

  it("returns '2h15m' for 2 hours 15 minutes from now", () => {
    const future = new Date(Date.now() + (2 * 3600 + 15 * 60) * 1000).toISOString();
    expect(resetTime(future)).toBe("2h15m");
  });

  it("returns '1d3h' for 27 hours from now", () => {
    // 27h = 1d3h (d=1, h%24=3)
    const future = new Date(Date.now() + 27 * 3600 * 1000).toISOString();
    expect(resetTime(future)).toBe("1d3h");
  });
});

// ============================================================================
// resetDate
// ============================================================================

describe("resetDate", () => {
  it("returns HH:mm format for a time today (Asia/Tokyo)", () => {
    // Use a date that is "today" in Asia/Tokyo: take current Asia/Tokyo date
    // and set hours/minutes in that timezone to produce a known time string.
    // Strategy: pass Date.now() itself — it will be formatted as HH:mm.
    const nowIso = new Date().toISOString();
    const result = resetDate(nowIso);
    // Should match HH:mm (no date prefix)
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });

  it("returns M/D HH:mm format for a date far in the future (different day)", () => {
    // 48 hours from now is guaranteed to be a different calendar day
    const future = new Date(Date.now() + 48 * 3600 * 1000);
    const result = resetDate(future.toISOString());
    // Should match M/D HH:mm pattern
    expect(result).toMatch(/^\d{1,2}\/\d{1,2} \d{2}:\d{2}$/);
  });
});

// ============================================================================
// tmuxBraille
// ============================================================================

describe("tmuxBraille", () => {
  it("pct=0 uses colour240 (gray) and only '⣀' braille chars", () => {
    const result = tmuxBraille(0);
    expect(result).toContain("#[fg=colour240]");
    // Strip tmux color tags and verify content
    const bare = result.replace(/#\[[^\]]*\]/g, "");
    expect(bare).toBe("⣀⣀⣀⣀⣀");
  });

  it("pct=100 uses brightred and only '⣿' braille chars", () => {
    const result = tmuxBraille(100);
    expect(result).toContain("#[fg=brightred]");
    const bare = result.replace(/#\[[^\]]*\]/g, "");
    expect(bare).toBe("⣿⣿⣿⣿⣿");
  });

  it("pct=75 uses colour208 (orange, >70)", () => {
    const result = tmuxBraille(75);
    expect(result).toContain("#[fg=colour208]");
  });

  it("pct=55 uses yellow (>50)", () => {
    const result = tmuxBraille(55);
    expect(result).toContain("#[fg=yellow]");
  });

  it("output contains #[default] reset tag", () => {
    const result = tmuxBraille(50);
    expect(result).toContain("#[default]");
  });
});
