import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

/**
 * rtk-rewrite.ts のテスト
 *
 * フック自体は stdin から JSON を読み込み、stdout に JSON を出力する。
 * テストでは bun rtk-rewrite.ts を子プロセスとして起動し、
 * stdin に入力を渡して stdout を検証する。
 */

const hookPath = join(import.meta.dir, "..", "rtk-rewrite.ts");

/**
 * フックを実行して、書き換え後のコマンドを返す。
 * 書き換えが発生しなかった場合（空 stdout）は null を返す。
 */
function runHook(command: string): string | null {
  const input = JSON.stringify({ tool_input: { command } });
  const result = spawnSync("bun", [hookPath], {
    input,
    encoding: "utf-8",
    timeout: 5000,
  });
  const stdout = result.stdout?.toString().trim();
  if (!stdout) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    return null;
  }
  return (
    (parsed as { hookSpecificOutput?: { updatedInput?: { command?: string } } })?.hookSpecificOutput
      ?.updatedInput?.command ?? null
  );
}

describe("rtk-rewrite hook", () => {
  describe("Git", () => {
    test("git status → rtk git status", () => {
      expect(runHook("git status")).toBe("rtk git status");
    });

    test("git --no-pager log --oneline (standalone flag preserved)", () => {
      expect(runHook("git --no-pager log --oneline")).toBe("rtk git --no-pager log --oneline");
    });

    test("git -C /tmp status (value-bearing flag preserved)", () => {
      expect(runHook("git -C /tmp status")).toBe("rtk git -C /tmp status");
    });

    test("git remote add origin ... → null (not a rewritable subcmd)", () => {
      expect(runHook("git remote add origin https://example.com/repo.git")).toBeNull();
    });
  });

  describe("GitHub CLI", () => {
    test("gh pr list → rtk gh pr list", () => {
      expect(runHook("gh pr list")).toBe("rtk gh pr list");
    });

    test("gh auth login → null (not matched)", () => {
      expect(runHook("gh auth login")).toBeNull();
    });
  });

  describe("Cargo", () => {
    test("cargo test --release → rtk cargo test --release", () => {
      expect(runHook("cargo test --release")).toBe("rtk cargo test --release");
    });

    test("cargo +nightly build → rtk cargo +nightly build", () => {
      expect(runHook("cargo +nightly build")).toBe("rtk cargo +nightly build");
    });
  });

  describe("File ops", () => {
    test("cat README.md → rtk read README.md", () => {
      expect(runHook("cat README.md")).toBe("rtk read README.md");
    });

    test('rg "pattern" src/ → rtk grep "pattern" src/', () => {
      expect(runHook('rg "pattern" src/')).toBe('rtk grep "pattern" src/');
    });

    test('grep -r "foo" → rtk grep -r "foo"', () => {
      expect(runHook('grep -r "foo"')).toBe('rtk grep -r "foo"');
    });

    test("ls -la → rtk ls -la", () => {
      expect(runHook("ls -la")).toBe("rtk ls -la");
    });

    test("tree → rtk tree", () => {
      expect(runHook("tree")).toBe("rtk tree");
    });

    test('find . -name "*.ts" → rtk find . -name "*.ts"', () => {
      expect(runHook('find . -name "*.ts"')).toBe('rtk find . -name "*.ts"');
    });

    test("head -20 file.txt → rtk read file.txt --max-lines 20", () => {
      expect(runHook("head -20 file.txt")).toBe("rtk read file.txt --max-lines 20");
    });

    test("head --lines=50 file.txt → rtk read file.txt --max-lines 50", () => {
      expect(runHook("head --lines=50 file.txt")).toBe("rtk read file.txt --max-lines 50");
    });
  });

  describe("JS/TS", () => {
    test("npx vitest run → rtk vitest run", () => {
      expect(runHook("npx vitest run")).toBe("rtk vitest run");
    });

    test("pnpm test → rtk vitest run", () => {
      expect(runHook("pnpm test")).toBe("rtk vitest run");
    });

    test("npm test → rtk npm test", () => {
      expect(runHook("npm test")).toBe("rtk npm test");
    });

    test("npm run build → rtk npm build", () => {
      expect(runHook("npm run build")).toBe("rtk npm build");
    });

    test("tsc --noEmit → rtk tsc --noEmit", () => {
      expect(runHook("tsc --noEmit")).toBe("rtk tsc --noEmit");
    });

    test("npx eslint src/ → rtk lint src/", () => {
      expect(runHook("npx eslint src/")).toBe("rtk lint src/");
    });

    test("npx playwright test → rtk playwright test", () => {
      expect(runHook("npx playwright test")).toBe("rtk playwright test");
    });
  });

  describe("Containers", () => {
    test("docker compose up → rtk docker compose up", () => {
      expect(runHook("docker compose up")).toBe("rtk docker compose up");
    });

    test("docker ps → rtk docker ps", () => {
      expect(runHook("docker ps")).toBe("rtk docker ps");
    });

    test("docker -H unix:///var/run/docker.sock ps (value-bearing flag preserved)", () => {
      expect(runHook("docker -H unix:///var/run/docker.sock ps")).toBe(
        "rtk docker -H unix:///var/run/docker.sock ps",
      );
    });

    test("kubectl get pods → rtk kubectl get pods", () => {
      expect(runHook("kubectl get pods")).toBe("rtk kubectl get pods");
    });
  });

  describe("Python", () => {
    test("pytest -v → rtk pytest -v", () => {
      expect(runHook("pytest -v")).toBe("rtk pytest -v");
    });

    test("python -m pytest → rtk pytest", () => {
      expect(runHook("python -m pytest")).toBe("rtk pytest");
    });

    test("ruff check . → rtk ruff check .", () => {
      expect(runHook("ruff check .")).toBe("rtk ruff check .");
    });
  });

  describe("Go", () => {
    test("go test ./... → rtk go test ./...", () => {
      expect(runHook("go test ./...")).toBe("rtk go test ./...");
    });

    test("golangci-lint run → rtk golangci-lint run", () => {
      expect(runHook("golangci-lint run")).toBe("rtk golangci-lint run");
    });
  });

  describe("Skip conditions", () => {
    test("rtk git status → null (already rtk)", () => {
      expect(runHook("rtk git status")).toBeNull();
    });

    test("command with <<EOF → null (heredoc)", () => {
      expect(runHook("cat <<EOF\nhello\nEOF")).toBeNull();
    });

    test("TEST_VAR=1 git status → TEST_VAR=1 rtk git status (env prefix preserved)", () => {
      expect(runHook("TEST_VAR=1 git status")).toBe("TEST_VAR=1 rtk git status");
    });
  });

  describe("Edge cases", () => {
    test("empty command → null", () => {
      expect(runHook("")).toBeNull();
    });

    test("unknown command (curl) → null", () => {
      expect(runHook("curl https://example.com")).toBeNull();
    });
  });
});
