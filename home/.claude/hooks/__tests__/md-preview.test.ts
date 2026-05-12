import { describe, expect, test } from "bun:test";
import { homedir, tmpdir } from "node:os";
import { isAbsolute, relative, resolve } from "node:path";
import { htmlPathFor, isTargetPath } from "../md-preview.ts";

const HOME = homedir();

describe("isTargetPath", () => {
  describe("対象パス", () => {
    test("dotfiles/plans 配下の .md", () => {
      expect(isTargetPath(resolve(HOME, "dotfiles/plans/foo.md"))).toBe(true);
    });

    test("dotfiles/docs 配下の .md", () => {
      expect(isTargetPath(resolve(HOME, "dotfiles/docs/bar/baz.md"))).toBe(true);
    });

    test("prj 配下の .md", () => {
      expect(isTargetPath(resolve(HOME, "prj/some-repo/README-notes.md"))).toBe(true);
    });

    test("拡張子大文字でも対象", () => {
      expect(isTargetPath(resolve(HOME, "dotfiles/plans/foo.MD"))).toBe(true);
    });
  });

  describe("対象外パス", () => {
    test("拡張子が .md ではない", () => {
      expect(isTargetPath(resolve(HOME, "dotfiles/plans/foo.txt"))).toBe(false);
    });

    test("除外ファイル名 (README.md)", () => {
      expect(isTargetPath(resolve(HOME, "dotfiles/plans/README.md"))).toBe(false);
    });

    test("除外ファイル名 (CLAUDE.md)", () => {
      expect(isTargetPath(resolve(HOME, "prj/x/CLAUDE.md"))).toBe(false);
    });

    test("除外ファイル名 (AGENTS.md / GEMINI.md / CHANGELOG.md / MEMORY.md / LICENSE.md)", () => {
      for (const name of ["AGENTS.md", "GEMINI.md", "CHANGELOG.md", "MEMORY.md", "LICENSE.md"]) {
        expect(isTargetPath(resolve(HOME, "dotfiles/docs", name))).toBe(false);
      }
    });

    test("除外ファイル名は大文字小文字を区別しない", () => {
      // 小文字でも除外されること (case-insensitive)
      for (const name of [
        "readme.md",
        "claude.md",
        "agents.md",
        "gemini.md",
        "changelog.md",
        "memory.md",
        "license.md",
      ]) {
        expect(isTargetPath(resolve(HOME, "dotfiles/docs", name))).toBe(false);
      }
    });

    test("node_modules 配下", () => {
      expect(isTargetPath(resolve(HOME, "prj/app/node_modules/pkg/notes.md"))).toBe(false);
    });

    test("許可ディレクトリ外", () => {
      expect(isTargetPath(resolve(HOME, "Documents/foo.md"))).toBe(false);
      expect(isTargetPath("/tmp/foo.md")).toBe(false);
    });

    test("プレフィックス前方一致のなりすまし防止 (dotfiles/plans2)", () => {
      expect(isTargetPath(resolve(HOME, "dotfiles/plans2/foo.md"))).toBe(false);
    });
  });
});

describe("htmlPathFor", () => {
  test("dotfiles 配下は同階層に .html を吐く", () => {
    const src = resolve(HOME, "dotfiles/plans/foo.md");
    expect(htmlPathFor(src)).toBe(resolve(HOME, "dotfiles/plans/foo.html"));
  });

  test("dotfiles 配下のサブディレクトリでも同階層", () => {
    const src = resolve(HOME, "dotfiles/docs/sub/bar.md");
    expect(htmlPathFor(src)).toBe(resolve(HOME, "dotfiles/docs/sub/bar.html"));
  });

  test("dotfiles 外 (~/prj) は tmpdir に逃がす (他リポジトリ汚染防止)", () => {
    const src = resolve(HOME, "prj/some-repo/notes.md");
    const out = htmlPathFor(src);
    const rel = relative(tmpdir(), out);
    // tmpdir 直下に出力されていること (rel が空でなく、上位ディレクトリ参照・絶対パスでない)
    expect(rel !== "" && !rel.startsWith("..") && !isAbsolute(rel)).toBe(true);
    expect(out.endsWith(".html")).toBe(true);
  });

  test("同一 source path は同じ tmpdir パスに決定的にマップ", () => {
    const src = resolve(HOME, "prj/x/note.md");
    expect(htmlPathFor(src)).toBe(htmlPathFor(src));
  });

  test("異なる source path は異なる tmpdir パスにマップ", () => {
    const a = htmlPathFor(resolve(HOME, "prj/a/note.md"));
    const b = htmlPathFor(resolve(HOME, "prj/b/note.md"));
    expect(a).not.toBe(b);
  });
});
