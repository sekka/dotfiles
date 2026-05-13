import { describe, test, expect, beforeEach, afterEach, setSystemTime } from "bun:test";
import {
  tmuxBraille,
  resetTime,
  resetDate,
  shouldFetchNow,
  parseRetryAfter,
  parseCache,
  computeStaleness,
  compute429Record,
  shouldShowStaleMark,
} from "./tmux-status";

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

describe("shouldFetchNow", () => {
  test("fresh + バックオフ無 → skip", () => {
    expect(shouldFetchNow({ staleness: "fresh", now: 1000, nextRetryAt: null })).toBe("skip");
  });

  test("stale + バックオフ無 → background", () => {
    expect(shouldFetchNow({ staleness: "stale", now: 1000, nextRetryAt: null })).toBe("background");
  });

  test("expired + バックオフ無 → sync", () => {
    expect(shouldFetchNow({ staleness: "expired", now: 1000, nextRetryAt: null })).toBe("sync");
  });

  test("stale + バックオフ未来 → skip (fetch しない)", () => {
    expect(shouldFetchNow({ staleness: "stale", now: 1000, nextRetryAt: 2000 })).toBe("skip");
  });

  test("expired + バックオフ未来 → skip (fetch しない)", () => {
    expect(shouldFetchNow({ staleness: "expired", now: 1000, nextRetryAt: 2000 })).toBe("skip");
  });

  test("fresh + バックオフ未来 → skip", () => {
    expect(shouldFetchNow({ staleness: "fresh", now: 1000, nextRetryAt: 2000 })).toBe("skip");
  });

  test("バックオフ過去 → 通常判定 (stale → background)", () => {
    expect(shouldFetchNow({ staleness: "stale", now: 2000, nextRetryAt: 1000 })).toBe("background");
  });

  test("バックオフ過去 → 通常判定 (expired → sync)", () => {
    expect(shouldFetchNow({ staleness: "expired", now: 2000, nextRetryAt: 1000 })).toBe("sync");
  });

  test("バックオフ = now ちょうど → 通常判定 (skip 扱いではない)", () => {
    expect(shouldFetchNow({ staleness: "stale", now: 1000, nextRetryAt: 1000 })).toBe("background");
  });
});

describe("parseRetryAfter", () => {
  test("数値秒指定 '30' → now + 30000ms", () => {
    expect(parseRetryAfter("30", 1000, 60_000)).toBe(31_000);
  });

  test("Retry-After: '0' → now + 1s 最小 backoff", () => {
    expect(parseRetryAfter("0", 1000, 60_000)).toBe(2000);
  });

  test("HTTP date 未来 → そのepoch", () => {
    const future = "Wed, 21 Oct 2026 07:28:00 GMT";
    const futureMs = Date.parse(future);
    expect(parseRetryAfter(future, 1000, 60_000)).toBe(futureMs);
  });

  test("HTTP date 過去 → now + 1s 最小 backoff", () => {
    const past = "Wed, 21 Oct 2020 07:28:00 GMT";
    expect(parseRetryAfter(past, 1_700_000_000_000, 60_000)).toBe(1_700_000_001_000);
  });

  test("null → now + default", () => {
    expect(parseRetryAfter(null, 1000, 60_000)).toBe(61_000);
  });

  test("空文字 → now + default", () => {
    expect(parseRetryAfter("", 1000, 60_000)).toBe(61_000);
  });

  test("無効文字列 → now + default", () => {
    expect(parseRetryAfter("not-a-number", 1000, 60_000)).toBe(61_000);
  });

  test("負の秒数 → now + default", () => {
    expect(parseRetryAfter("-5", 1000, 60_000)).toBe(61_000);
  });
});

describe("parseCache", () => {
  const validData = {
    five_hour: { utilization: 28, resets_at: null },
    seven_day: null,
    seven_day_sonnet: null,
  };

  test("正常 JSON → data, timestamp, nextRetryAt を返す", () => {
    const record = {
      data: validData,
      timestamp: 1000,
      nextRetryAt: 2000,
    };
    const result = parseCache(JSON.stringify(record));
    expect(result).not.toBeNull();
    expect(result!.data).toEqual(validData);
    expect(result!.timestamp).toBe(1000);
    expect(result!.nextRetryAt).toBe(2000);
  });

  test("nextRetryAt が null の正常 JSON", () => {
    const record = { data: validData, timestamp: 1000, nextRetryAt: null };
    const result = parseCache(JSON.stringify(record));
    expect(result).not.toBeNull();
    expect(result!.nextRetryAt).toBeNull();
  });

  test("legacy 形式 (nextRetryAt 欠落) → nextRetryAt: null で補完して返す", () => {
    const record = { data: validData, timestamp: 1000 };
    const result = parseCache(JSON.stringify(record));
    expect(result).not.toBeNull();
    expect(result!.data).toEqual(validData);
    expect(result!.timestamp).toBe(1000);
    expect(result!.nextRetryAt).toBeNull();
  });

  test("破損 JSON → null", () => {
    expect(parseCache("{not valid json")).toBeNull();
  });

  test("data フィールド欠落 → null", () => {
    const record = { timestamp: 1000, nextRetryAt: null };
    expect(parseCache(JSON.stringify(record))).toBeNull();
  });

  test("timestamp フィールド欠落 → null", () => {
    const record = { data: validData, nextRetryAt: null };
    expect(parseCache(JSON.stringify(record))).toBeNull();
  });

  test("timestamp が Infinity → null", () => {
    // 1e309 parses as Infinity in JS
    const result = parseCache('{"data":null,"timestamp":1e309,"nextRetryAt":null}');
    expect(result).toBeNull();
  });

  test("nextRetryAt が Infinity → null に落ちる", () => {
    const result = parseCache('{"data":null,"timestamp":1000,"nextRetryAt":1e309}');
    expect(result).not.toBeNull();
    expect(result!.nextRetryAt).toBeNull();
  });

  test("nextRetryAt が -Infinity → null に落ちる", () => {
    const result = parseCache('{"data":null,"timestamp":1000,"nextRetryAt":-1e309}');
    expect(result).not.toBeNull();
    expect(result!.nextRetryAt).toBeNull();
  });
});

describe("computeStaleness", () => {
  const CACHE_FRESH_MS = 5 * 60 * 1000;
  const CACHE_STALE_MS = 60 * 60 * 1000;

  test("age = 0 → fresh", () => {
    const now = 10_000;
    expect(computeStaleness(now, now)).toBe("fresh");
  });

  test("age < 5min → fresh", () => {
    const now = 10_000;
    const timestamp = now - CACHE_FRESH_MS + 1;
    expect(computeStaleness(timestamp, now)).toBe("fresh");
  });

  test("age = 5min ちょうど → stale (fresh の境界)", () => {
    const now = 10_000;
    const timestamp = now - CACHE_FRESH_MS;
    expect(computeStaleness(timestamp, now)).toBe("stale");
  });

  test("age = 5min + 1ms → stale", () => {
    const now = 10_000;
    const timestamp = now - CACHE_FRESH_MS - 1;
    expect(computeStaleness(timestamp, now)).toBe("stale");
  });

  test("age < 60min → stale", () => {
    const now = 10_000;
    const timestamp = now - CACHE_STALE_MS + 1;
    expect(computeStaleness(timestamp, now)).toBe("stale");
  });

  test("age = 60min ちょうど → expired", () => {
    const now = 10_000;
    const timestamp = now - CACHE_STALE_MS;
    expect(computeStaleness(timestamp, now)).toBe("expired");
  });

  test("age > 60min → expired", () => {
    const now = 10_000;
    const timestamp = now - CACHE_STALE_MS - 1;
    expect(computeStaleness(timestamp, now)).toBe("expired");
  });
});

describe("compute429Record", () => {
  const validData = {
    five_hour: { utilization: 28, resets_at: null },
    seven_day: null,
    seven_day_sonnet: null,
  };
  const now = 1_000_000;
  const defaultMs = 60_000;

  test("既存キャッシュあり: data と timestamp を保持し nextRetryAt を更新", () => {
    const existing = { data: validData, timestamp: 900_000, nextRetryAt: null };
    const result = compute429Record(existing, "30", now, defaultMs);
    expect(result.data).toEqual(validData);
    expect(result.timestamp).toBe(900_000);
    expect(result.nextRetryAt).toBe(now + 30_000);
  });

  test("Retry-After ヘッダーなし → now + defaultMs", () => {
    const existing = { data: validData, timestamp: 900_000, nextRetryAt: null };
    const result = compute429Record(existing, null, now, defaultMs);
    expect(result.nextRetryAt).toBe(now + defaultMs);
  });

  test("既存キャッシュなし: data=null, timestamp=0 (expired扱い), nextRetryAt 設定", () => {
    const result = compute429Record(null, "30", now, defaultMs);
    expect(result.data).toBeNull();
    expect(result.timestamp).toBe(0);
    expect(result.nextRetryAt).toBe(now + 30_000);
  });

  test("既存キャッシュなし + 429: backoff 中は shouldFetchNow が skip", () => {
    const record = compute429Record(null, "30", now, defaultMs);
    const staleness = computeStaleness(record.timestamp, now);
    const decision = shouldFetchNow({ staleness, now, nextRetryAt: record.nextRetryAt });
    expect(decision).toBe("skip");
  });

  test("既存キャッシュなし + 429: backoff 解除後は shouldFetchNow が skip にならない (fetch する)", () => {
    const record = compute429Record(null, "30", now, defaultMs);
    const afterBackoff = now + 31_000;
    const staleness = computeStaleness(record.timestamp, afterBackoff);
    const decision = shouldFetchNow({
      staleness,
      now: afterBackoff,
      nextRetryAt: record.nextRetryAt,
    });
    // timestamp=0 なので staleness は stale or expired → background か sync (skip にはならない)
    expect(decision).not.toBe("skip");
  });

  test("429 後に readCache が skip を返す (nextRetryAt 未来)", () => {
    const existing = { data: validData, timestamp: 900_000, nextRetryAt: null };
    const record = compute429Record(existing, "30", now, defaultMs);
    // 書き込まれたレコードで shouldFetchNow を評価
    const staleness = computeStaleness(record.timestamp, now);
    const decision = shouldFetchNow({ staleness, now, nextRetryAt: record.nextRetryAt });
    expect(decision).toBe("skip");
  });

  test("expired キャッシュ + 429 でも data が保持される", () => {
    // キャッシュが expired 状態 (timestamp が古い) でも 429 で data は消えない
    const CACHE_STALE_MS = 60 * 60 * 1000;
    const expiredTimestamp = now - CACHE_STALE_MS - 1; // expired
    const existing = { data: validData, timestamp: expiredTimestamp, nextRetryAt: null };
    const result = compute429Record(existing, "30", now, defaultMs);
    expect(result.data).toEqual(validData); // data 保持
    expect(result.timestamp).toBe(expiredTimestamp); // timestamp 保持
    expect(result.nextRetryAt).toBe(now + 30_000);
  });
});

describe("shouldShowStaleMark", () => {
  const now = 1_000_000;

  test("fresh + backoff 無 → false", () => {
    expect(shouldShowStaleMark({ staleness: "fresh", nextRetryAt: null, now })).toBe(false);
  });

  test("stale + backoff 無 → true", () => {
    expect(shouldShowStaleMark({ staleness: "stale", nextRetryAt: null, now })).toBe(true);
  });

  test("expired + backoff 無 → false (data 自体無し)", () => {
    expect(shouldShowStaleMark({ staleness: "expired", nextRetryAt: null, now })).toBe(false);
  });

  test("expired + backoff 未来 → true (NEW: 古いデータを表示中)", () => {
    expect(shouldShowStaleMark({ staleness: "expired", nextRetryAt: now + 1000, now })).toBe(true);
  });

  test("expired + backoff 過去 → false", () => {
    expect(shouldShowStaleMark({ staleness: "expired", nextRetryAt: now - 1, now })).toBe(false);
  });

  test("stale + backoff 未来 → true", () => {
    expect(shouldShowStaleMark({ staleness: "stale", nextRetryAt: now + 1000, now })).toBe(true);
  });
});
