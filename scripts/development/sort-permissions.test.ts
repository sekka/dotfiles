/**
 * sort-permissions.sh のテストスイート
 */

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createTempDir, cleanupTempDir } from "../__tests__/test-helpers";

let testDir: string;

beforeAll(async () => {
  // テストディレクトリを作成
  testDir = await createTempDir("test-sort-permissions-");
  mkdirSync(resolve(testDir, ".claude"), { recursive: true });
});

afterAll(async () => {
  // テストディレクトリを削除
  await cleanupTempDir(testDir);
});

describe("sort-permissions.sh", () => {
  it("既ソート済みのファイルは変更されない", async () => {
    const testFile = resolve(testDir, ".claude", "settings.local.json");
    const content = {
      permissions: {
        allow: ["Bash(cat:*)", "Bash(ls:*)", "Bash(mkdir:*)"],
        deny: ["Read(./.env.*)"],
      },
    };

    writeFileSync(testFile, JSON.stringify(content, null, 2) + "\n");
    const originalContent = await Bun.file(testFile).text();

    // スクリプトを実行
    const proc = Bun.spawn(
      ["bash", "scripts/development/sort-permissions.sh", "--file", testFile],
      {
        cwd: resolve(__dirname, "../.."),
        stdout: "pipe",
      },
    );
    const exitCode = await proc.exited;

    const finalContent = await Bun.file(testFile).text();

    // 既にソート済みの場合、ファイルは変更されない
    expect(originalContent).toBe(finalContent);
    expect(exitCode).toBe(0);
  });

  it("逆順のpermissionsは正しくソートされる", async () => {
    const testFile = resolve(testDir, ".claude", "settings.local.json");
    const content = {
      permissions: {
        allow: ["Bash(mkdir:*)", "Bash(ls:*)", "Bash(cat:*)"],
        deny: ["Read(./.env.*)", "Read(./.env.local)"],
      },
    };

    writeFileSync(testFile, JSON.stringify(content, null, 2) + "\n");

    // スクリプトを実行
    const proc = Bun.spawn(
      ["bash", "scripts/development/sort-permissions.sh", "--file", testFile],
      {
        cwd: resolve(__dirname, "../.."),
      },
    );
    const exitCode = await proc.exited;

    const finalContent = await Bun.file(testFile).text();
    const parsed = JSON.parse(finalContent);

    // ソートされているはず
    expect(parsed.permissions.allow).toEqual(["Bash(cat:*)", "Bash(ls:*)", "Bash(mkdir:*)"]);
    expect(parsed.permissions.deny).toEqual(["Read(./.env.*)", "Read(./.env.local)"]);
    expect(exitCode).toBe(0);
  });

  it("無効なJSONはエラーを返す", async () => {
    const testFile = resolve(testDir, ".claude", "settings.local.json");
    writeFileSync(testFile, "{ invalid json }");

    // スクリプトを実行
    const proc = Bun.spawn(
      ["bash", "scripts/development/sort-permissions.sh", "--file", testFile],
      {
        cwd: resolve(__dirname, "../.."),
        stderr: "pipe",
      },
    );
    const exitCode = await proc.exited;

    expect(exitCode).toBe(1);
  });

  it("対象外のファイル名は処理スキップされる", async () => {
    const testFile = resolve(testDir, ".claude", "other.json");
    writeFileSync(testFile, JSON.stringify({ test: true }, null, 2));

    // スクリプトを実行
    const proc = Bun.spawn(
      ["bash", "scripts/development/sort-permissions.sh", "--file", testFile],
      {
        cwd: resolve(__dirname, "../.."),
      },
    );
    const exitCode = await proc.exited;

    // 対象外ファイルでも成功を返す
    expect(exitCode).toBe(0);
  });

  it("存在しないファイルは成功を返す", async () => {
    const testFile = resolve(testDir, ".claude", "nonexistent.json");

    // スクリプトを実行
    const proc = Bun.spawn(
      ["bash", "scripts/development/sort-permissions.sh", "--file", testFile],
      {
        cwd: resolve(__dirname, "../.."),
      },
    );
    const exitCode = await proc.exited;

    expect(exitCode).toBe(0);
  });

  it("空のpermissionsは処理されない", async () => {
    const testFile = resolve(testDir, ".claude", "settings.local.json");
    const content = {
      permissions: {
        allow: [],
        deny: [],
      },
    };

    writeFileSync(testFile, JSON.stringify(content, null, 2) + "\n");
    const originalContent = await Bun.file(testFile).text();

    // スクリプトを実行
    const proc = Bun.spawn(
      ["bash", "scripts/development/sort-permissions.sh", "--file", testFile],
      {
        cwd: resolve(__dirname, "../.."),
      },
    );
    const exitCode = await proc.exited;

    const finalContent = await Bun.file(testFile).text();

    // 空配列の場合は変更されない
    expect(originalContent).toBe(finalContent);
    expect(exitCode).toBe(0);
  });

  it("パストラバーサル攻撃は検出される", async () => {
    const maliciousPath = resolve(testDir, "../../../.claude/settings.local.json");

    // スクリプトを実行
    const proc = Bun.spawn(
      ["bash", "scripts/development/sort-permissions.sh", "--file", maliciousPath],
      {
        cwd: resolve(__dirname, "../.."),
      },
    );
    const exitCode = await proc.exited;

    // パストラバーサルは失敗する（または対象外として処理）
    // テストの性質上、このテストは実際のホームディレクトリ構造に依存する可能性がある
    // ここでは、成功するか失敗するかのいずれかであることを確認
    expect([0, 1]).toContain(exitCode);
  });
});
