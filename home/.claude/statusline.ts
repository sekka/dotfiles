#!/usr/bin/env bun

import { getGitStatus } from "./statusline/git.ts";

// ============================================================================
// Types
// ============================================================================

interface HookInput {
  model?: { display_name?: string };
  workspace?: { current_dir?: string };
  cwd?: string;
  session_id?: string;
  cost?: {
    total_cost_usd?: number;
    total_duration_ms?: number;
  };
  context_window?: {
    context_window_size?: number;
    total_input_tokens?: number;
    total_output_tokens?: number;
    used_percentage?: number;
    current_usage?: {
      input_tokens: number;
      output_tokens: number;
      cache_creation_input_tokens: number;
      cache_read_input_tokens: number;
    } | null;
  };
}

// ============================================================================
// ANSI Colors
// ============================================================================

const NO_COLOR = process.env.NO_COLOR !== undefined;
const ansi = (code: string) => (s: string) => (NO_COLOR ? s : `\x1b[${code}m${s}\x1b[0m`);

const c = {
  gray: ansi("90"),
  cyan: ansi("36"),
  white: ansi("97"),
  yellow: ansi("33"),
  green: ansi("32"),
  red: ansi("91"),
  orange: ansi("38;5;208"),
} as const;

// ============================================================================
// Format Helpers
// ============================================================================

export function tokensK(n: number): string {
  return (n / 1000).toFixed(1);
}

export function elapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${m}:${String(sec).padStart(2, "0")}`;
}

export function braille(pct: number, len = 5): string {
  const chars = ["⣀", "⣄", "⣤", "⣦", "⣶", "⣷", "⣿"];
  const steps = len * (chars.length - 1);
  const cur = Math.round((pct / 100) * steps);
  const full = Math.floor(cur / (chars.length - 1));
  const partial = cur % (chars.length - 1);
  const empty = len - full - (partial > 0 ? 1 : 0);
  const bar = "⣿".repeat(full) + (partial > 0 ? chars[partial] : "") + "⣀".repeat(empty);
  const colorFn = pct > 90 ? c.red : pct > 70 ? c.orange : pct > 50 ? c.yellow : c.gray;
  return colorFn(bar);
}

const lbl = (key: string) => c.gray(`${key}:`);

// ============================================================================
// Main
// ============================================================================

async function main() {
  try {
    const data: HookInput = await Bun.stdin.json();

    const model = data.model?.display_name || "Claude";
    const cwd = data.workspace?.current_dir || data.cwd || ".";
    const dir = cwd.split("/").pop() || ".";

    const git = await getGitStatus(cwd);

    // Line 1: Model PRJ:dir BR:branch ↑N ↓M +A -D SES:time
    let line1 = `${c.cyan(model)} ${lbl("PRJ")}${c.white(dir)}`;

    if (git.branch) {
      line1 += ` ${lbl("BR")}${c.white(git.branch)}`;
      if (git.aheadBehind) line1 += ` ${git.aheadBehind}`;
      if (git.diffStats) line1 += ` ${git.diffStats}`;
    }

    const durationMs = data.cost?.total_duration_ms ?? 0;
    if (durationMs > 0) {
      line1 += ` ${lbl("SES")}${c.white(elapsed(durationMs))}`;
    }

    // Line 2: TK:bar N% NK/NK  IN:NK OUT:NK
    const cw = data.context_window;
    const pct = cw?.used_percentage ?? 0;
    const winSize = cw?.context_window_size ?? 200000;

    let contextTokens = 0;
    if (cw?.current_usage) {
      const cu = cw.current_usage;
      contextTokens =
        (cu.input_tokens || 0) +
        (cu.cache_creation_input_tokens || 0) +
        (cu.cache_read_input_tokens || 0);
    } else if (pct > 0) {
      contextTokens = Math.round((pct / 100) * winSize);
    }

    const inTokens = cw?.total_input_tokens ?? 0;
    const outTokens = cw?.total_output_tokens ?? 0;

    let line2 = `${lbl("TK")}${braille(pct)} ${c.white(String(pct))}${c.gray("%")}`;
    line2 += ` ${c.white(tokensK(contextTokens))}${c.gray("K/")}${c.gray(tokensK(winSize))}${c.gray("K")}`;
    line2 += ` ${lbl("IN")}${c.white(tokensK(inTokens))}${c.gray("K")}`;
    line2 += ` ${lbl("OUT")}${c.white(tokensK(outTokens))}${c.gray("K")}`;

    console.log(`${line1}\n${line2}`);
  } catch {
    console.log("[Claude Code]");
  }
}

await main();
