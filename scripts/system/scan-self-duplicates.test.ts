import { describe, expect, it } from "bun:test";
import {
  formatPairBasename,
  hasConflictMarker,
  isConflictedName,
  selectKeeper,
} from "./scan-self-duplicates.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEntry(path: string, hash = "abc123") {
  return {
    path,
    relPath: path.split("/").slice(-1)[0] ?? path,
    hash,
    dataSize: 1000,
    rsrcSize: 0,
    suspect: false,
    suspectReason: "",
  };
}

// ---------------------------------------------------------------------------
// selectKeeper
// ---------------------------------------------------------------------------

describe("selectKeeper", () => {
  it("shallower path wins regardless of name", () => {
    const shallow = makeEntry("/a/b/Helvetica.otf");
    const deep = makeEntry("/a/b/c/d/Helvetica.otf");
    const { keeper, candidates } = selectKeeper([deep, shallow]);
    expect(keeper.path).toBe(shallow.path);
    expect(candidates.map((c) => c.path)).toContain(deep.path);
  });

  it("when same depth, conflicted name becomes candidate", () => {
    const clean = makeEntry("/a/b/Helvetica.otf");
    const conflicted = makeEntry("/a/b/Helvetica (conflicted copy 2024-01-01).otf");
    const { keeper, candidates } = selectKeeper([conflicted, clean]);
    expect(keeper.path).toBe(clean.path);
    expect(candidates.map((c) => c.path)).toContain(conflicted.path);
  });

  it("when same depth, copy-numbered name becomes candidate", () => {
    const original = makeEntry("/a/b/Arial.ttf");
    const copy = makeEntry("/a/b/Arial (1).ttf");
    const { keeper, candidates } = selectKeeper([copy, original]);
    expect(keeper.path).toBe(original.path);
    expect(candidates.map((c) => c.path)).toContain(copy.path);
  });

  it("when depth and cleanliness tie, lex min wins", () => {
    const a = makeEntry("/a/b/Aaa.otf");
    const z = makeEntry("/a/b/Zzz.otf");
    const { keeper } = selectKeeper([z, a]);
    expect(keeper.path).toBe(a.path);
  });

  it("three-way: depth beats everything else", () => {
    const shallow = makeEntry("/a/Font.ttf"); // depth 3 (split gives ["", "a", "Font.ttf"])
    const deepClean = makeEntry("/a/b/c/Font.ttf"); // depth 5
    const deepCopy = makeEntry("/a/b/c/Font (1).ttf"); // depth 5, copy
    const { keeper, candidates } = selectKeeper([deepClean, deepCopy, shallow]);
    expect(keeper.path).toBe(shallow.path);
    expect(candidates.length).toBe(2);
  });

  it("Dropbox numbered-suffix folder (Foo 2/) becomes candidate", () => {
    const original = makeEntry("/root/H/Hannotate/Hannotate.ttc");
    const dupe = makeEntry("/root/H/Hannotate 2/Hannotate.ttc");
    const { keeper, candidates } = selectKeeper([dupe, original]);
    expect(keeper.path).toBe(original.path);
    expect(candidates.map((c) => c.path)).toContain(dupe.path);
  });

  it("numbered-suffix folder works for Foo 3, Foo 10", () => {
    const original = makeEntry("/root/X/Xingkai/X.ttc");
    const dup3 = makeEntry("/root/X/Xingkai 3/X.ttc");
    const dup10 = makeEntry("/root/X/Xingkai 10/X.ttc");
    const { keeper } = selectKeeper([dup10, dup3, original]);
    expect(keeper.path).toBe(original.path);
  });
});

// ---------------------------------------------------------------------------
// hasConflictMarker
// ---------------------------------------------------------------------------

describe("hasConflictMarker", () => {
  it("flags Dropbox numbered-suffix folder", () => {
    expect(hasConflictMarker("/root/H/Hannotate 2/foo.ttc")).toBe(true);
    expect(hasConflictMarker("/root/H/Kaiti 3/k.ttc")).toBe(true);
    expect(hasConflictMarker("/root/X/Xingkai 10/x.ttc")).toBe(true);
  });

  it("flags copy markers in any segment", () => {
    expect(hasConflictMarker("/a/Foo (1)/bar.ttf")).toBe(true);
    expect(hasConflictMarker("/a/b/Foo copy.ttf")).toBe(true);
    expect(hasConflictMarker("/a/Foo (conflicted copy 2024-01-01).ttf")).toBe(true);
  });

  it("does not flag clean paths", () => {
    expect(hasConflictMarker("/root/H/Hannotate/foo.ttc")).toBe(false);
    expect(hasConflictMarker("/a/Adobe Garamond/G.otf")).toBe(false);
    expect(hasConflictMarker("/a/Foo Bold/B.ttf")).toBe(false);
  });

  it("does not flag mid-segment numbered names", () => {
    // "Foo 2 Bold" ends in "Bold", not a number — should be clean
    expect(hasConflictMarker("/a/Foo 2 Bold/B.ttf")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isConflictedName
// ---------------------------------------------------------------------------

describe("isConflictedName", () => {
  it("detects English conflicted copy pattern", () => {
    expect(isConflictedName("Helvetica (conflicted copy 2024-01-01).otf")).toBe(true);
  });

  it("detects Japanese conflicted copy pattern", () => {
    expect(isConflictedName("Helvetica (Username のコンフリクトしたコピー 2024-01-01).otf")).toBe(
      true,
    );
  });

  it("does not flag a normal filename", () => {
    expect(isConflictedName("Helvetica Neue.otf")).toBe(false);
  });

  it("does not flag a filename with parentheses that are not conflicted", () => {
    expect(isConflictedName("Helvetica (Bold).otf")).toBe(false);
  });

  it("does not flag a filename with only a date", () => {
    expect(isConflictedName("Backup 2024-01-01.ttf")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// formatPairBasename
// ---------------------------------------------------------------------------

describe("formatPairBasename", () => {
  it("strips last extension from simple name", () => {
    expect(formatPairBasename("Foo.otf")).toBe("Foo");
  });

  it("strips only the last extension from multi-dot name", () => {
    expect(formatPairBasename("Foo.bold.ttf")).toBe("Foo.bold");
  });

  it("returns filename unchanged if no extension", () => {
    expect(formatPairBasename("Fontname")).toBe("Fontname");
  });

  it("handles .ttf extension", () => {
    expect(formatPairBasename("Arial.ttf")).toBe("Arial");
  });

  it("handles name with spaces", () => {
    expect(formatPairBasename("Helvetica Neue.otf")).toBe("Helvetica Neue");
  });
});
