/**
 * difit-here.ts のテスト
 */

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { $ } from "bun";

import { buildDifitArgs, detectBranchContext } from "./difit-here";
import { cleanupTempDir, createTempDir, setupGitRepo } from "../__tests__/test-helpers";

describe("difit-here", () => {
  let tempDir: string;
  let repoDir: string;
  let originalCwd: string;

  beforeAll(async () => {
    originalCwd = process.cwd();
    tempDir = await createTempDir("difit-here-test-");
    repoDir = join(tempDir, "repo");

    // Gitリポジトリを作成
    await $`mkdir -p ${repoDir}`.quiet();
    await setupGitRepo(repoDir);

    // 初期コミット (main ブランチ)
    process.chdir(repoDir);
    await writeFile(join(repoDir, "README.md"), "# Test");
    await $`git add README.md`.quiet();
    await $`git commit -m "Initial commit"`.quiet();

    // origin を設定してデフォルトブランチを refs/remotes/origin/HEAD に反映
    await $`git branch -M main`.quiet();
  });

  afterAll(async () => {
    process.chdir(originalCwd);
    await cleanupTempDir(tempDir);
  });

  describe("detectBranchContext", () => {
    it("Gitリポジトリでないディレクトリではエラーを返す", async () => {
      const result = await detectBranchContext(tempDir);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("git repository");
      }
    });

    it("Gitリポジトリではブランチ情報を返す", async () => {
      const result = await detectBranchContext(repoDir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.currentBranch).toBeDefined();
        expect(result.defaultBranch).toBeDefined();
      }
    });

    it("main ブランチにいるときは currentBranch が default と一致する", async () => {
      process.chdir(repoDir);
      const result = await detectBranchContext(repoDir);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.currentBranch).toBe("main");
      }
    });
  });

  describe("buildDifitArgs", () => {
    it("current === default のとき working を返す", () => {
      const args = buildDifitArgs({
        currentBranch: "main",
        defaultBranch: "main",
        mergeBase: null,
      });
      expect(args).toEqual(["working"]);
    });

    it("mergeBase がある場合は [mergeBase, HEAD] を返す", () => {
      const sha = "abc1234";
      const args = buildDifitArgs({
        currentBranch: "feat/foo",
        defaultBranch: "main",
        mergeBase: sha,
      });
      expect(args).toEqual([sha, "HEAD"]);
    });

    it("mergeBase が null の場合は working を返す", () => {
      const args = buildDifitArgs({
        currentBranch: "feat/foo",
        defaultBranch: "main",
        mergeBase: null,
      });
      expect(args).toEqual(["working"]);
    });

    it("currentBranch が空の場合は working を返す", () => {
      const args = buildDifitArgs({
        currentBranch: "",
        defaultBranch: "main",
        mergeBase: "abc1234",
      });
      expect(args).toEqual(["working"]);
    });
  });

  describe("buildDifitArgs with feature branch", () => {
    it("フィーチャーブランチでは mergeBase..HEAD 形式の引数を返す", async () => {
      // feature ブランチを作成してコミット
      process.chdir(repoDir);
      await $`git checkout -b feat/test-difit`.quiet();
      await writeFile(join(repoDir, "feature.md"), "# Feature");
      await $`git add feature.md`.quiet();
      await $`git commit -m "Add feature"`.quiet();

      const mergeBase = (await $`git merge-base main HEAD`.quiet()).text().trim();

      const args = buildDifitArgs({
        currentBranch: "feat/test-difit",
        defaultBranch: "main",
        mergeBase,
      });

      expect(args).toEqual([mergeBase, "HEAD"]);

      // main に戻す
      await $`git checkout main`.quiet();
    });
  });
});
