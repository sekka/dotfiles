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

type Staleness = "fresh" | "stale" | "expired";

interface CacheRecord {
  data: UsageLimits | null;
  timestamp: number;
  nextRetryAt: number | null;
}

// ============================================================================
// Pure Decision Helpers (exported for tests)
// ============================================================================

export function shouldFetchNow(args: {
  staleness: Staleness;
  now: number;
  nextRetryAt: number | null;
}): "skip" | "background" | "sync" {
  if (args.nextRetryAt !== null && args.nextRetryAt > args.now) return "skip";
  if (args.staleness === "fresh") return "skip";
  if (args.staleness === "stale") return "background";
  return "sync";
}

export function parseRetryAfter(header: string | null, now: number, defaultMs: number): number {
  if (!header) return now + defaultMs;
  const trimmed = header.trim();
  if (trimmed === "") return now + defaultMs;
  let candidate: number;
  if (/^[-+]?\d+$/.test(trimmed)) {
    const sec = parseInt(trimmed, 10);
    if (sec < 0) return now + defaultMs;
    candidate = now + sec * 1000;
  } else {
    const dateMs = Date.parse(trimmed);
    if (!isNaN(dateMs)) {
      candidate = Math.max(dateMs, now);
    } else {
      return now + defaultMs;
    }
  }
  // Enforce minimum 1s backoff to prevent tight retry loops
  return Math.max(candidate, now + 1000);
}

export function parseCache(json: string): CacheRecord | null {
  try {
    const parsed = JSON.parse(json);
    if (
      parsed === null ||
      typeof parsed !== "object" ||
      !("data" in parsed) ||
      !("timestamp" in parsed) ||
      typeof parsed.timestamp !== "number"
    ) {
      return null;
    }
    return {
      data: parsed.data as UsageLimits | null,
      timestamp: parsed.timestamp,
      nextRetryAt: typeof parsed.nextRetryAt === "number" ? parsed.nextRetryAt : null,
    };
  } catch {
    return null;
  }
}

export function computeStaleness(timestamp: number, now: number): Staleness {
  const age = now - timestamp;
  if (age < CACHE_FRESH_MS) return "fresh";
  if (age < CACHE_STALE_MS) return "stale";
  return "expired";
}

export function shouldShowStaleMark(args: {
  staleness: Staleness;
  nextRetryAt: number | null;
  now: number;
}): boolean {
  if (args.staleness === "stale") return true;
  if (args.staleness === "expired" && args.nextRetryAt !== null && args.nextRetryAt > args.now) {
    return true;
  }
  return false;
}

export function compute429Record(
  existing: CacheRecord | null,
  retryAfterHeader: string | null,
  now: number,
  defaultMs: number,
): CacheRecord {
  const nextRetryAt = parseRetryAfter(retryAfterHeader, now, defaultMs);
  if (existing === null) {
    return { data: null, timestamp: now, nextRetryAt };
  }
  return { data: existing.data, timestamp: existing.timestamp, nextRetryAt };
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

async function readCache(): Promise<{
  data: UsageLimits | null;
  staleness: Staleness;
  ageMs: number;
  nextRetryAt: number | null;
}> {
  try {
    const json = await Bun.file(CACHE_FILE).text();
    const record = parseCache(json);
    if (!record) return { data: null, staleness: "expired", ageMs: Infinity, nextRetryAt: null };
    const now = Date.now();
    const age = now - record.timestamp;
    const staleness = computeStaleness(record.timestamp, now);
    if (staleness === "expired") {
      // Preserve data during backoff so main can display stale data with ? mark
      const keepData = record.nextRetryAt !== null && record.nextRetryAt > now ? record.data : null;
      return { data: keepData, staleness: "expired", ageMs: age, nextRetryAt: record.nextRetryAt };
    }
    return { data: record.data, staleness, ageMs: age, nextRetryAt: record.nextRetryAt };
  } catch {
    return { data: null, staleness: "expired", ageMs: Infinity, nextRetryAt: null };
  }
}

async function readRawRecord(): Promise<CacheRecord | null> {
  try {
    const json = await Bun.file(CACHE_FILE).text();
    return parseCache(json);
  } catch {
    return null;
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

    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After");
      const existing = await readRawRecord();
      const record = compute429Record(existing, retryAfter, Date.now(), 60_000);
      await mkdir(`${HOME}/.claude/data`, { recursive: true, mode: 0o700 });
      await Bun.write(CACHE_FILE, JSON.stringify(record));
      await chmod(CACHE_FILE, 0o600);
      return;
    }

    if (!res.ok) return;
    const data = await res.json();

    await mkdir(`${HOME}/.claude/data`, { recursive: true, mode: 0o700 });
    await Bun.write(CACHE_FILE, JSON.stringify({ data, timestamp: Date.now(), nextRetryAt: null }));
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
  let cache = await readCache();

  const decision = shouldFetchNow({
    staleness: cache.staleness,
    now: Date.now(),
    nextRetryAt: cache.nextRetryAt,
  });

  if (decision === "sync") {
    await fetchAndCacheLimits();
    cache = await readCache();
  } else if (decision === "background") {
    fetchAndCacheLimits().catch(() => {});
  }

  if (!cache.data) {
    console.log("");
    process.exit(0);
  }

  const showStale = shouldShowStaleMark({
    staleness: cache.staleness,
    nextRetryAt: cache.nextRetryAt,
    now: Date.now(),
  });
  const mark = showStale ? "?" : "";
  const parts: string[] = [];

  if (cache.data.five_hour) parts.push(formatLimit("LMT", cache.data.five_hour, mark));
  if (cache.data.seven_day) parts.push(formatLimit("WK", cache.data.seven_day, mark));
  if (cache.data.seven_day_sonnet)
    parts.push(formatLimit("WKS", cache.data.seven_day_sonnet, mark));

  if (showStale) {
    parts.push(`${t.gray}(${Math.floor(cache.ageMs / 60000)}m ago)${t.reset}`);
  }

  console.log(parts.join(" "));
} catch {
  console.log("");
}
