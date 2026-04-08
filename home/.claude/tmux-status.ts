#!/usr/bin/env bun

import { homedir } from "os";
import { chmod, mkdir } from "fs/promises";

const HOME = homedir();
const CACHE_FILE = `${HOME}/.claude/data/usage-limits-cache.json`;
const CRED_FILE = `${HOME}/.claude/.credentials.json`;
const CACHE_FRESH_MS = 5 * 60 * 1000;
const CACHE_STALE_MS = 60 * 60 * 1000;
const API_TIMEOUT = 5000;

// ============================================================================
// Types
// ============================================================================

interface LimitEntry {
  utilization: number;
  resets_at: string | null;
}

interface UsageLimits {
  five_hour: LimitEntry | null;
  seven_day: LimitEntry | null;
  seven_day_sonnet: LimitEntry | null;
}

// ============================================================================
// Tmux Colors
// ============================================================================

const t = {
  gray: "#[fg=colour240]",
  white: "#[fg=white]",
  yellow: "#[fg=yellow]",
  orange: "#[fg=colour208]",
  red: "#[fg=brightred]",
  reset: "#[default]",
} as const;

// ============================================================================
// Format Helpers
// ============================================================================

export function tmuxBraille(pct: number, len = 5): string {
  const chars = ["⣀", "⣄", "⣤", "⣦", "⣶", "⣷", "⣿"];
  const steps = len * (chars.length - 1);
  const cur = Math.round((pct / 100) * steps);
  const full = Math.floor(cur / (chars.length - 1));
  const partial = cur % (chars.length - 1);
  const empty = len - full - (partial > 0 ? 1 : 0);
  const bar = "⣿".repeat(full) + (partial > 0 ? chars[partial] : "") + "⣀".repeat(empty);
  const color = pct > 90 ? t.red : pct > 70 ? t.orange : pct > 50 ? t.yellow : t.gray;
  return `${color}${bar}${t.reset}`;
}

export function resetTime(resetsAt: string): string {
  const diff = new Date(resetsAt).getTime() - Date.now();
  if (diff <= 0) return "now";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d${h % 24}h`;
  if (h > 0) return `${h}h${m}m`;
  return `${m}m`;
}

export function resetDate(resetsAt: string): string {
  const rd = new Date(resetsAt);
  const now = new Date();
  const time = rd.toLocaleString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
    hour12: false,
  });
  const dateStr = rd.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });
  const nowStr = now.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });
  if (dateStr === nowStr) return time;
  const mo = rd
    .toLocaleDateString("ja-JP", { month: "numeric", timeZone: "Asia/Tokyo" })
    .replace(/月/g, "");
  const da = rd
    .toLocaleDateString("ja-JP", { day: "numeric", timeZone: "Asia/Tokyo" })
    .replace(/日/g, "");
  return `${mo}/${da} ${time}`;
}

// ============================================================================
// Credentials
// ============================================================================

async function getToken(): Promise<string | null> {
  try {
    const creds = await Bun.file(CRED_FILE).json();
    const token = creds?.claudeAiOauth?.accessToken;
    return typeof token === "string" && token.length >= 20 ? token : null;
  } catch {
    try {
      const proc = Bun.spawn({
        cmd: ["security", "find-generic-password", "-s", "Claude Code-credentials", "-w"],
        stdout: "pipe",
        stderr: "pipe",
      });
      const out = await new Response(proc.stdout).text();
      if ((await proc.exited) !== 0) return null;
      const creds = JSON.parse(out.trim());
      const token = creds?.claudeAiOauth?.accessToken;
      return typeof token === "string" && token.length >= 20 ? token : null;
    } catch {
      return null;
    }
  }
}

// ============================================================================
// Cache & API
// ============================================================================

type Staleness = "fresh" | "stale" | "expired";

async function readCache(): Promise<{
  data: UsageLimits | null;
  staleness: Staleness;
  ageMs: number;
}> {
  try {
    const cache: { data: UsageLimits; timestamp: number } = await Bun.file(CACHE_FILE).json();
    const age = Date.now() - cache.timestamp;
    if (age < CACHE_FRESH_MS) return { data: cache.data, staleness: "fresh", ageMs: age };
    if (age < CACHE_STALE_MS) return { data: cache.data, staleness: "stale", ageMs: age };
    return { data: null, staleness: "expired", ageMs: age };
  } catch {
    return { data: null, staleness: "expired", ageMs: Infinity };
  }
}

async function fetchAndCacheLimits(): Promise<void> {
  const token = await getToken();
  if (!token) return;

  try {
    const res = await fetch("https://api.anthropic.com/api/oauth/usage", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "anthropic-beta": "oauth-2025-04-20",
      },
      signal: AbortSignal.timeout(API_TIMEOUT),
    });
    if (!res.ok) return;
    const data = await res.json();

    await mkdir(`${HOME}/.claude/data`, { recursive: true, mode: 0o700 });
    await Bun.write(CACHE_FILE, JSON.stringify({ data, timestamp: Date.now() }));
    await chmod(CACHE_FILE, 0o600);
  } catch {
    // Silently fail — cache stays as-is
  }
}

// ============================================================================
// Main
// ============================================================================

function formatLimit(label: string, limit: LimitEntry, staleMark: string): string {
  let s = `${t.gray}${label}${staleMark}:${t.reset}${tmuxBraille(limit.utilization)} ${t.white}${limit.utilization}%${t.reset}`;
  if (limit.resets_at) {
    s += ` ${t.gray}(${resetDate(limit.resets_at)}|${resetTime(limit.resets_at)})${t.reset}`;
  }
  return s;
}

try {
  const cache = await readCache();

  if (cache.staleness !== "fresh") {
    fetchAndCacheLimits().catch(() => {});
  }

  if (!cache.data || cache.staleness === "expired") {
    console.log("");
    process.exit(0);
  }

  const mark = cache.staleness === "stale" ? "?" : "";
  const parts: string[] = [];

  if (cache.data.five_hour) parts.push(formatLimit("LMT", cache.data.five_hour, mark));
  if (cache.data.seven_day) parts.push(formatLimit("WK", cache.data.seven_day, mark));
  if (cache.data.seven_day_sonnet)
    parts.push(formatLimit("WKS", cache.data.seven_day_sonnet, mark));

  if (cache.staleness === "stale") {
    parts.push(`${t.gray}(${Math.floor(cache.ageMs / 60000)}m ago)${t.reset}`);
  }

  console.log(parts.join(" "));
} catch {
  console.log("");
}
