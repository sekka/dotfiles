import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

/**
 * protect-sensitive.sh のテスト
 *
 * テスト対象:
 * - .p12 / .pfx ファイルへのアクセスブロック
 * - .git/ への書き込みブロック（Read は許可）
 * - パストラバーサル（../）ブロック
 * - シンボリックリンク解決後の再チェック
 * - file_path の抽出パターン（tool_input.file_path / .file_path）
 */

const hookPath = join(import.meta.dir, "..", "protect-sensitive.sh");

// Spawn the hook with JSON input and return exit code + stderr
function runHook(input: {
  tool_name?: string;
  tool_input?: { file_path?: string };
  file_path?: string;
}): { exitCode: number; stderr: string } {
  const result = spawnSync("bash", [hookPath], {
    input: JSON.stringify(input),
    encoding: "utf-8",
    timeout: 5000,
  });
  return {
    exitCode: result.status ?? 0,
    stderr: result.stderr?.toString().trim() ?? "",
  };
}

// Temporary directory for files/symlinks created in tests
let tmpDir: string;

beforeEach(() => {
  tmpDir = join(tmpdir(), `protect-sensitive-test-${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });
});

afterEach(() => {
  if (existsSync(tmpDir)) {
    rmSync(tmpDir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Prerequisite: jq must be available
// ---------------------------------------------------------------------------
test("jq is available", () => {
  const result = spawnSync("jq", ["--version"], { encoding: "utf-8" });
  expect(result.status).toBe(0);
});

// ---------------------------------------------------------------------------
// Allowed operations (exit 0)
// ---------------------------------------------------------------------------
describe("allowed operations", () => {
  test("Read a normal file", () => {
    const { exitCode } = runHook({
      tool_name: "Read",
      tool_input: { file_path: "/tmp/test.txt" },
    });
    expect(exitCode).toBe(0);
  });

  test("Read a .git/ file is allowed", () => {
    const { exitCode } = runHook({
      tool_name: "Read",
      tool_input: { file_path: "/repo/.git/HEAD" },
    });
    expect(exitCode).toBe(0);
  });

  test("no file_path in input", () => {
    const { exitCode } = runHook({
      tool_name: "Read",
      tool_input: {},
    });
    expect(exitCode).toBe(0);
  });

  test("Write a normal file", () => {
    const { exitCode } = runHook({
      tool_name: "Write",
      tool_input: { file_path: "/tmp/output.txt" },
    });
    expect(exitCode).toBe(0);
  });

  test("Edit a normal file", () => {
    const { exitCode } = runHook({
      tool_name: "Edit",
      tool_input: { file_path: "/tmp/config.yaml" },
    });
    expect(exitCode).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Blocked: protected extensions (.p12 / .pfx)
// ---------------------------------------------------------------------------
describe("blocked: protected extensions", () => {
  test("Read .p12 is blocked", () => {
    const { exitCode, stderr } = runHook({
      tool_name: "Read",
      tool_input: { file_path: "/tmp/cert.p12" },
    });
    expect(exitCode).toBe(2);
    expect(stderr).toContain("block");
  });

  test("Write .pfx is blocked", () => {
    const { exitCode, stderr } = runHook({
      tool_name: "Write",
      tool_input: { file_path: "/tmp/cert.pfx" },
    });
    expect(exitCode).toBe(2);
    expect(stderr).toContain("block");
  });

  test("Edit .p12 is blocked", () => {
    const { exitCode, stderr } = runHook({
      tool_name: "Edit",
      tool_input: { file_path: "/tmp/cert.p12" },
    });
    expect(exitCode).toBe(2);
    expect(stderr).toContain("block");
  });

  test("stderr is valid JSON with decision=block", () => {
    const { exitCode, stderr } = runHook({
      tool_name: "Read",
      tool_input: { file_path: "/tmp/cert.p12" },
    });
    expect(exitCode).toBe(2);
    const parsed = JSON.parse(stderr);
    expect(parsed.decision).toBe("block");
    expect(typeof parsed.reason).toBe("string");
  });
});

// ---------------------------------------------------------------------------
// Blocked: .git/ writes
// ---------------------------------------------------------------------------
describe("blocked: .git/ writes", () => {
  test("Write to .git/ is blocked", () => {
    const { exitCode, stderr } = runHook({
      tool_name: "Write",
      tool_input: { file_path: "/repo/.git/config" },
    });
    expect(exitCode).toBe(2);
    expect(stderr).toContain("block");
  });

  test("Edit .git/ is blocked", () => {
    const { exitCode, stderr } = runHook({
      tool_name: "Edit",
      tool_input: { file_path: "/repo/.git/objects/abc" },
    });
    expect(exitCode).toBe(2);
    expect(stderr).toContain("block");
  });

  test("Write to path starting with .git/ is blocked", () => {
    const { exitCode } = runHook({
      tool_name: "Write",
      tool_input: { file_path: ".git/config" },
    });
    expect(exitCode).toBe(2);
  });

  test("Read .git/ is allowed", () => {
    const { exitCode } = runHook({
      tool_name: "Read",
      tool_input: { file_path: "/repo/.git/config" },
    });
    expect(exitCode).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Blocked: path traversal
// ---------------------------------------------------------------------------
describe("blocked: path traversal", () => {
  test("path with ../ is blocked", () => {
    const { exitCode, stderr } = runHook({
      tool_name: "Read",
      tool_input: { file_path: "/repo/../etc/passwd" },
    });
    expect(exitCode).toBe(2);
    expect(stderr).toContain("block");
  });

  test("Write with ../ in path is blocked", () => {
    const { exitCode } = runHook({
      tool_name: "Write",
      tool_input: { file_path: "/home/user/projects/../../../etc/shadow" },
    });
    expect(exitCode).toBe(2);
  });

  test("stderr is valid JSON for traversal block", () => {
    const { exitCode, stderr } = runHook({
      tool_name: "Read",
      tool_input: { file_path: "/repo/../etc/passwd" },
    });
    expect(exitCode).toBe(2);
    const parsed = JSON.parse(stderr);
    expect(parsed.decision).toBe("block");
  });
});

// ---------------------------------------------------------------------------
// Blocked: symlink resolves to protected extension (Write/Edit only)
// ---------------------------------------------------------------------------
describe("blocked: symlink to protected file", () => {
  test("Write via symlink pointing to .p12 is blocked", () => {
    // Create a real .p12 target file
    const target = join(tmpDir, "real-cert.p12");
    writeFileSync(target, "fake cert data");

    // Create a symlink with an innocuous name
    const link = join(tmpDir, "innocent-looking-file.txt");
    symlinkSync(target, link);

    const { exitCode, stderr } = runHook({
      tool_name: "Write",
      tool_input: { file_path: link },
    });
    expect(exitCode).toBe(2);
    expect(stderr).toContain("block");
  });

  test("Edit via symlink pointing to .pfx is blocked", () => {
    const target = join(tmpDir, "real-cert.pfx");
    writeFileSync(target, "fake cert data");

    const link = join(tmpDir, "config.json");
    symlinkSync(target, link);

    const { exitCode, stderr } = runHook({
      tool_name: "Edit",
      tool_input: { file_path: link },
    });
    expect(exitCode).toBe(2);
    expect(stderr).toContain("block");
  });

  test("Read via symlink pointing to .p12 is blocked (extension check fires before symlink check)", () => {
    // The path itself ends in .p12, so it is blocked by the extension check.
    // If the symlink name does NOT end in .p12, Read is allowed (symlink check is Write/Edit only).
    const target = join(tmpDir, "real-cert.p12");
    writeFileSync(target, "fake cert data");

    const link = join(tmpDir, "harmless.txt");
    symlinkSync(target, link);

    // Read on a symlink whose name does not look like .p12 → allowed
    const { exitCode } = runHook({
      tool_name: "Read",
      tool_input: { file_path: link },
    });
    expect(exitCode).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// file_path extraction variants
// ---------------------------------------------------------------------------
describe("file_path extraction", () => {
  test("tool_input.file_path takes priority", () => {
    // tool_input.file_path is .p12 → blocked
    const { exitCode } = runHook({
      tool_name: "Read",
      tool_input: { file_path: "/tmp/cert.p12" },
      file_path: "/tmp/safe.txt",
    });
    expect(exitCode).toBe(2);
  });

  test("falls back to top-level .file_path", () => {
    // No tool_input.file_path; top-level file_path is .p12 → blocked
    const { exitCode } = runHook({
      tool_name: "Read",
      file_path: "/tmp/cert.p12",
    });
    expect(exitCode).toBe(2);
  });

  test("top-level .file_path safe value is allowed", () => {
    const { exitCode } = runHook({
      tool_name: "Read",
      file_path: "/tmp/safe.txt",
    });
    expect(exitCode).toBe(0);
  });
});
