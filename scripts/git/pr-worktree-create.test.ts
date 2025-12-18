/**
 * pr-worktree-create.ts のテスト
 */

import { describe, it, expect } from "bun:test";

import { isValidPrNumber, checkDependencies } from "./pr-worktree-create";

describe("pr-worktree-create", () => {
  describe("isValidPrNumber", () => {
    it("数字のみの場合はtrueを返す", () => {
      expect(isValidPrNumber("123")).toBe(true);
      expect(isValidPrNumber("1")).toBe(true);
      expect(isValidPrNumber("999999")).toBe(true);
    });

    it("数字以外が含まれる場合はfalseを返す", () => {
      expect(isValidPrNumber("abc")).toBe(false);
      expect(isValidPrNumber("123abc")).toBe(false);
      expect(isValidPrNumber("abc123")).toBe(false);
      expect(isValidPrNumber("#123")).toBe(false);
      expect(isValidPrNumber("")).toBe(false);
    });

    it("小数点を含む場合はfalseを返す", () => {
      expect(isValidPrNumber("12.3")).toBe(false);
    });

    it("負の数はfalseを返す", () => {
      expect(isValidPrNumber("-123")).toBe(false);
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
  });

  // 注意: getPrBranchName, createPrWorktree は
  // 外部サービス（GitHub API）に依存するため、
  // ユニットテストでは実際の呼び出しをモックするか、
  // 統合テストとして別途実施することを推奨
});
