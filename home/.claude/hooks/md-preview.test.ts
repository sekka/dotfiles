import { describe, expect, test } from "bun:test";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { isTargetPath } from "./md-preview.ts";

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
