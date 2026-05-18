import { describe, expect, test } from "bun:test";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  escapeTsv,
  fmtBytes,
  fmtDuration,
  type Hashlist,
  hashlistToMap,
  listFiles,
  readHashlist,
  realpathAllowMissing,
  unescapeTsv,
  writeHashlist,
} from "./_font-hash.ts";

describe("fmtBytes", () => {
  test("formats bytes range", () => {
    expect(fmtBytes(0)).toBe("0 B");
    expect(fmtBytes(1023)).toBe("1023 B");
  });
  test("formats kilobytes range", () => {
    expect(fmtBytes(1024)).toBe("1.0 KB");
    expect(fmtBytes(1500)).toBe("1.5 KB");
  });
  test("formats megabytes range", () => {
    expect(fmtBytes(1024 * 1024)).toBe("1.0 MB");
    expect(fmtBytes(500 * 1024 * 1024)).toBe("500.0 MB");
  });
  test("formats gigabytes range", () => {
    expect(fmtBytes(1024 * 1024 * 1024)).toBe("1.00 GB");
    expect(fmtBytes(40 * 1024 * 1024 * 1024)).toBe("40.00 GB");
  });
});

describe("fmtDuration", () => {
  test("handles invalid input", () => {
    expect(fmtDuration(Number.NaN)).toBe("--:--");
    expect(fmtDuration(-1)).toBe("--:--");
    expect(fmtDuration(Number.POSITIVE_INFINITY)).toBe("--:--");
  });
  test("formats under one minute", () => {
    expect(fmtDuration(0)).toBe("0:00");
    expect(fmtDuration(5)).toBe("0:05");
    expect(fmtDuration(59)).toBe("0:59");
  });
  test("formats minutes:seconds", () => {
    expect(fmtDuration(60)).toBe("1:00");
    expect(fmtDuration(125)).toBe("2:05");
    expect(fmtDuration(3599)).toBe("59:59");
  });
  test("formats hours:minutes:seconds when over an hour", () => {
    expect(fmtDuration(3600)).toBe("1:00:00");
    expect(fmtDuration(3661)).toBe("1:01:01");
  });
});

describe("escapeTsv", () => {
  test("escapes tab, newline, and carriage return", () => {
    expect(escapeTsv("a\tb")).toBe("a\\tb");
    expect(escapeTsv("a\nb")).toBe("a\\nb");
    expect(escapeTsv("a\rb")).toBe("a\\rb");
    expect(escapeTsv("a\\b")).toBe("a\\\\b"); // escape the escape so round-trip is unambiguous
  });
  test("passes mojibake through unchanged when no control chars present", () => {
    // Latin-1 bytes interpreted as UTF-8 produce mojibake but no \t/\n/\r,
    // so the path should round-trip verbatim through the report.
    const mojibake = "ï½›ï½£ï½Ÿ.ttf";
    expect(escapeTsv(mojibake)).toBe(mojibake);
  });
  test("leaves normal paths unchanged", () => {
    expect(escapeTsv("/a/b/c.ttf")).toBe("/a/b/c.ttf");
    expect(escapeTsv("あいう.ttf")).toBe("あいう.ttf");
  });
});

describe("realpathAllowMissing", () => {
  test("returns realpath when the directory exists", () => {
    const tmp = realpathSync(mkdtempSync(join(tmpdir(), "fh-real-")));
    try {
      const real = join(tmp, "real");
      mkdirSync(real);
      const link = join(tmp, "link");
      symlinkSync(real, link);
      expect(realpathAllowMissing(link)).toBe(realpathAllowMissing(real));
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  test("re-attaches the missing tail under a realpathed ancestor", () => {
    const tmp = realpathSync(mkdtempSync(join(tmpdir(), "fh-real-")));
    try {
      const real = join(tmp, "real");
      mkdirSync(real);
      const link = join(tmp, "link");
      symlinkSync(real, link);
      // <link>/sub/deeper does not exist yet; ancestor <link> resolves to <real>.
      const missing = join(link, "sub", "deeper");
      expect(realpathAllowMissing(missing)).toBe(join(real, "sub", "deeper"));
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  test("symlink in mid-path is followed via existing ancestor", () => {
    // If only the leaf is missing, the parent's symlink still gets resolved.
    const tmp = realpathSync(mkdtempSync(join(tmpdir(), "fh-real-")));
    try {
      const real = join(tmp, "real");
      mkdirSync(real);
      writeFileSync(join(real, "sentinel"), "x");
      const link = join(tmp, "link");
      symlinkSync(real, link);
      const missing = join(link, "notyet");
      expect(realpathAllowMissing(missing)).toBe(join(real, "notyet"));
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe("unescapeTsv", () => {
  test("decodes the four escape sequences produced by escapeTsv", () => {
    expect(unescapeTsv("a\\tb")).toBe("a\tb");
    expect(unescapeTsv("a\\nb")).toBe("a\nb");
    expect(unescapeTsv("a\\rb")).toBe("a\rb");
    expect(unescapeTsv("a\\\\b")).toBe("a\\b");
  });
  test("passes through unknown escapes verbatim", () => {
    // Forward-compat: a future escapeTsv may emit new sequences; older
    // readers should preserve them rather than corrupt the path.
    expect(unescapeTsv("a\\xb")).toBe("a\\xb");
    expect(unescapeTsv("trailing\\")).toBe("trailing\\");
  });
  test("passes mojibake through unchanged", () => {
    const mojibake = "ï½›ï½£ï½Ÿ.ttf";
    expect(unescapeTsv(mojibake)).toBe(mojibake);
  });
  test("round-trips with escapeTsv across the awkward cases", () => {
    const cases = [
      "/a/b/c.ttf",
      "あいう.ttf",
      "tab\there",
      "newline\nhere",
      "cr\rhere",
      "back\\slash",
      "back\\\\double",
      "mix\\t\t\\n\n\\r\r",
      "ï½›ï½£ï½Ÿ.ttf", // mojibake
      "", // empty
    ];
    for (const c of cases) {
      expect(unescapeTsv(escapeTsv(c))).toBe(c);
    }
  });
});

describe("writeHashlist / readHashlist", () => {
  test("round-trips entries through the on-disk format", async () => {
    const tmp = realpathSync(mkdtempSync(join(tmpdir(), "fh-hl-")));
    try {
      const path = join(tmp, "out.hashlist");
      const hl: Hashlist = {
        sourceRoot: "/some/master",
        generated: "2026-05-18T10:30:00Z",
        entries: [
          { relPath: "Sub/Regular.ttf", hash: "a".repeat(64), dataSize: 1024, rsrcSize: 0 },
          { relPath: "Sub/Bold.ttf", hash: "b".repeat(64), dataSize: 2048, rsrcSize: 512 },
        ],
      };
      await writeHashlist(path, hl);
      const round = await readHashlist(path);
      expect(round.sourceRoot).toBe(hl.sourceRoot);
      expect(round.generated).toBe(hl.generated);
      expect(round.entries).toEqual(hl.entries);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  test("preserves filenames containing tab / newline / backslash", async () => {
    // macOS allows these bytes in filenames; the TSV escape layer must
    // survive a round trip without corrupting them.
    const tmp = realpathSync(mkdtempSync(join(tmpdir(), "fh-hl-")));
    try {
      const path = join(tmp, "out.hashlist");
      const hl: Hashlist = {
        sourceRoot: "/has\ttab/and\nnewline",
        generated: "2026-05-18T10:30:00Z",
        entries: [
          { relPath: "tab\there.ttf", hash: "c".repeat(64), dataSize: 1, rsrcSize: 0 },
          { relPath: "nl\nhere.ttf", hash: "d".repeat(64), dataSize: 2, rsrcSize: 0 },
          { relPath: "back\\slash.ttf", hash: "e".repeat(64), dataSize: 3, rsrcSize: 0 },
          { relPath: "ï½›ï½£ï½Ÿ.ttf", hash: "f".repeat(64), dataSize: 4, rsrcSize: 0 },
        ],
      };
      await writeHashlist(path, hl);
      const round = await readHashlist(path);
      expect(round.sourceRoot).toBe(hl.sourceRoot);
      expect(round.entries).toEqual(hl.entries);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  test("preserves filenames starting with '#'", async () => {
    // Regression: an earlier readHashlist treated every '#'-prefixed line
    // as a comment header, silently dropping filenames like '#hashname.ttf'.
    // Entry rows always contain tabs; comment lines never do, so the parser
    // must use the presence of a tab to tell them apart.
    const tmp = realpathSync(mkdtempSync(join(tmpdir(), "fh-hl-")));
    try {
      const path = join(tmp, "out.hashlist");
      const hl: Hashlist = {
        sourceRoot: "/master",
        generated: "2026-05-18T10:30:00Z",
        entries: [
          { relPath: "#hashname.ttf", hash: "a".repeat(64), dataSize: 100, rsrcSize: 0 },
          { relPath: "Sub/#leading.ttf", hash: "b".repeat(64), dataSize: 200, rsrcSize: 0 },
          { relPath: "regular.ttf", hash: "c".repeat(64), dataSize: 300, rsrcSize: 0 },
        ],
      };
      await writeHashlist(path, hl);
      const round = await readHashlist(path);
      expect(round.entries).toEqual(hl.entries);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  test("rejects a file without the magic header", async () => {
    const tmp = realpathSync(mkdtempSync(join(tmpdir(), "fh-hl-")));
    try {
      const path = join(tmp, "bad.hashlist");
      await writeFile(path, "not a hashlist\n", "utf8");
      await expect(readHashlist(path)).rejects.toThrow(/not a font-hashlist file/);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  test("rejects a malformed entry line (wrong column count)", async () => {
    const tmp = realpathSync(mkdtempSync(join(tmpdir(), "fh-hl-")));
    try {
      const path = join(tmp, "bad.hashlist");
      // Valid header, then a broken row with only 2 columns.
      await writeFile(
        path,
        ["# font-hashlist v1", "# source_root: /x", "broken\trow", ""].join("\n"),
        "utf8",
      );
      await expect(readHashlist(path)).rejects.toThrow(/malformed entry/);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  test("rejects an entry with a negative size", async () => {
    // Defense in depth: file sizes can never be negative. Accepting them
    // would silently propagate garbage from a corrupt artifact.
    const tmp = realpathSync(mkdtempSync(join(tmpdir(), "fh-hl-")));
    try {
      const path = join(tmp, "bad.hashlist");
      await writeFile(
        path,
        [
          "# font-hashlist v1",
          "# source_root: /x",
          ["a.ttf", "a".repeat(64), "-5", "0"].join("\t"),
          "",
        ].join("\n"),
        "utf8",
      );
      await expect(readHashlist(path)).rejects.toThrow(/malformed sizes/);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  test("rejects an entry whose size has trailing junk or a decimal", async () => {
    // Defense in depth: parseInt("10abc") returns 10 and parseInt("1.5")
    // returns 1, so a digits-only check has to run before parseInt.
    const tmp = realpathSync(mkdtempSync(join(tmpdir(), "fh-hl-")));
    try {
      for (const bad of ["10abc", "1.5", " 5", "5 ", "+5"]) {
        const path = join(tmp, "bad.hashlist");
        await writeFile(
          path,
          [
            "# font-hashlist v1",
            "# source_root: /x",
            ["a.ttf", "a".repeat(64), bad, "0"].join("\t"),
            "",
          ].join("\n"),
          "utf8",
        );
        await expect(readHashlist(path)).rejects.toThrow(/malformed sizes/);
      }
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  test("rejects an entry whose hash is not 64 hex chars", async () => {
    // SHA-256 hex is exactly 64 chars. A shorter or non-hex value would
    // silently fall through to "no match in master", which is safe but
    // confusing; reject early with a clear error.
    const tmp = realpathSync(mkdtempSync(join(tmpdir(), "fh-hl-")));
    try {
      const path = join(tmp, "bad.hashlist");
      await writeFile(
        path,
        [
          "# font-hashlist v1",
          "# source_root: /x",
          ["a.ttf", "deadbeef", "10", "0"].join("\t"),
          "",
        ].join("\n"),
        "utf8",
      );
      await expect(readHashlist(path)).rejects.toThrow(/malformed hash/);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  test("rejects an entry whose size columns are not integers", async () => {
    const tmp = realpathSync(mkdtempSync(join(tmpdir(), "fh-hl-")));
    try {
      const path = join(tmp, "bad.hashlist");
      await writeFile(
        path,
        [
          "# font-hashlist v1",
          "# source_root: /x",
          ["a.ttf", "a".repeat(64), "notanumber", "0"].join("\t"),
          "",
        ].join("\n"),
        "utf8",
      );
      await expect(readHashlist(path)).rejects.toThrow(/malformed sizes/);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  test("ignores blank lines and unknown header keys", async () => {
    // Forward-compat: a future writer may add new `# key: value` lines.
    // Older readers should silently ignore them and still parse the rest.
    const tmp = realpathSync(mkdtempSync(join(tmpdir(), "fh-hl-")));
    try {
      const path = join(tmp, "fwd.hashlist");
      await writeFile(
        path,
        [
          "# font-hashlist v1",
          "# generated: 2026-05-18T00:00:00Z",
          "# source_root: /m",
          "# future_field: ignored",
          "",
          ["only.ttf", "1".repeat(64), "10", "0"].join("\t"),
          "",
        ].join("\n"),
        "utf8",
      );
      const round = await readHashlist(path);
      expect(round.sourceRoot).toBe("/m");
      expect(round.generated).toBe("2026-05-18T00:00:00Z");
      expect(round.entries).toEqual([
        { relPath: "only.ttf", hash: "1".repeat(64), dataSize: 10, rsrcSize: 0 },
      ]);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe("walk via listFiles", () => {
  test("propagates traversal errors instead of silently skipping", async () => {
    // Regression: an earlier walk swallowed readdir failures and returned,
    // so verify-by-hash could report "safe to delete" without ever seeing
    // files inside an unreadable subdirectory. The walker must surface
    // the failure as a thrown error so the caller cannot mistake a
    // partial enumeration for a complete one.
    const tmp = realpathSync(mkdtempSync(join(tmpdir(), "fh-walk-")));
    const blocked = join(tmp, "blocked");
    try {
      mkdirSync(blocked);
      writeFileSync(join(tmp, "visible.ttf"), "A");
      writeFileSync(join(blocked, "hidden.ttf"), "B");
      chmodSync(blocked, 0o000);
      await expect(listFiles(tmp)).rejects.toThrow(/readdir failed/);
    } finally {
      // Restore permissions so rmSync can clean up the tree.
      try {
        chmodSync(blocked, 0o755);
      } catch {
        // ignore: directory may already be readable
      }
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe("hashlistToMap", () => {
  test("maps each unique hash to its source-root-joined path", () => {
    const hl: Hashlist = {
      sourceRoot: "/master",
      generated: "2026-05-18T00:00:00Z",
      entries: [
        { relPath: "a/x.ttf", hash: "h1", dataSize: 1, rsrcSize: 0 },
        { relPath: "b/y.ttf", hash: "h2", dataSize: 2, rsrcSize: 0 },
      ],
    };
    const m = hashlistToMap(hl);
    expect(m.size).toBe(2);
    expect(m.get("h1")).toBe("/master/a/x.ttf");
    expect(m.get("h2")).toBe("/master/b/y.ttf");
  });

  test("keeps the first occurrence when the same hash appears twice", () => {
    // Matches the indexMaster behavior (first-seen wins) so the example
    // path is stable regardless of walk order.
    const hl: Hashlist = {
      sourceRoot: "/master",
      generated: "2026-05-18T00:00:00Z",
      entries: [
        { relPath: "first.ttf", hash: "dup", dataSize: 1, rsrcSize: 0 },
        { relPath: "second.ttf", hash: "dup", dataSize: 1, rsrcSize: 0 },
      ],
    };
    const m = hashlistToMap(hl);
    expect(m.size).toBe(1);
    expect(m.get("dup")).toBe("/master/first.ttf");
  });
});
