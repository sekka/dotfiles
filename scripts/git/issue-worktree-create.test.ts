/**
 * issue-worktree-create.ts のテスト
 */

import { describe, it, expect } from "bun:test";

import { isValidIssueNumber, checkDependencies } from "./issue-worktree-create";

describe("issue-worktree-create", () => {
  describe("isValidIssueNumber", () => {
    it("数字のみの場合はtrueを返す", () => {
      expect(isValidIssueNumber("123")).toBe(true);
      expect(isValidIssueNumber("1")).toBe(true);
      expect(isValidIssueNumber("999999")).toBe(true);
    });

    it("数字以外が含まれる場合はfalseを返す", () => {
      expect(isValidIssueNumber("abc")).toBe(false);
      expect(isValidIssueNumber("123abc")).toBe(false);
      expect(isValidIssueNumber("abc123")).toBe(false);
      expect(isValidIssueNumber("#123")).toBe(false);
      expect(isValidIssueNumber("")).toBe(false);
    });

    it("小数点を含む場合はfalseを返す", () => {
      expect(isValidIssueNumber("12.3")).toBe(false);
    });

    it("負の数はfalseを返す", () => {
      expect(isValidIssueNumber("-123")).toBe(false);
    });
  });

  describe("checkDependencies", () => {
    it("存在するコマンドの場合はtrueを返す", async () => {
      // gitは必ず存在するはず
      const result = await checkDependencies(["git"]);
      expect(result).toBe(true);
    });

    it("存在しないコマンドの場合はfalseを返す", async () => {
      const result = await checkDependencies(["nonexistent-command-12345"]);
      expect(result).toBe(false);
    });

    it("複数のコマンドをチェックできる", async () => {
      // git と ls は存在するはず
      const result = await checkDependencies(["git", "ls"]);
      expect(result).toBe(true);
    });

    it("1つでも存在しないコマンドがあればfalseを返す", async () => {
      const result = await checkDependencies(["git", "nonexistent-command-12345"]);
      expect(result).toBe(false);
    });
  });

  // 注意: fetchIssueJson, generateBranchSlug, createIssueWorktree は
  // 外部サービス（GitHub API, Claude）に依存するため、
  // ユニットテストでは実際の呼び出しをモックするか、
  // 統合テストとして別途実施することを推奨
});
