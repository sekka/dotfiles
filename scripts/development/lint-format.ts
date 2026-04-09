#!/usr/bin/env bun

/**
 * 統合 Lint/Format スクリプト
 *
 * mise tasks、Claude Code hooks、pre-commitから統一的に使用できる
 * lint/formatツールを一元管理するスクリプト
 *
 * 使用方法:
 *   bun scripts/development/lint-format.ts --mode=check        # 全ファイルをチェック
 *   bun scripts/development/lint-format.ts --mode=fix          # 全ファイルを修正
 *   bun scripts/development/lint-format.ts --file=path/to/file # 単一ファイルを処理
 *   bun scripts/development/lint-format.ts --staged            # ステージされたファイルを処理
 *
 * 対応ファイル:
 *   - TypeScript/JavaScript/JSON: oxlint (linting) + oxfmt (formatting) via oxc ecosystem
 *   - Shell scripts (sh, zsh, bash): shfmt (formatting) + shellcheck (linting)
 *   - Markdown/YAML/TOML: dprint (unified formatter)
 */

import { existsSync, statSync } from "node:fs";
import { extname, resolve } from "node:path";
import { parseArgs } from "node:util";
import { spawn } from "bun";

// ============================================
// 型定義
// ============================================

type Mode = "check" | "fix";

interface Options {
  mode: Mode;
  file?: string;
  staged: boolean;
  verbose: boolean;
}

interface LintResult {
  tool: string;
  success: boolean;
  output: string;
  error?: string;
}

// ============================================
// ファイルタイプ判定
// ============================================

// 拡張子からファイルタイプを判定するマッピング
const FILE_TYPE_MAP: Record<string, string> = {
  // TypeScript/JavaScript/JSON → oxlint + oxfmt (oxc ecosystem)
  ".ts": "typescript",
  ".tsx": "typescript",
  ".js": "javascript",
  ".jsx": "javascript",
  ".mjs": "javascript",
  ".cjs": "javascript",
  ".json": "json",
  ".jsonc": "json",

  // Shell scripts → shfmt + shellcheck
  ".sh": "shell",
  ".zsh": "shell",
  ".bash": "shell",

  // Markdown → dprint (統合フォーマッター)
  ".md": "markdown",
  ".mdx": "markdown",

  // YAML → dprint (統合フォーマッター)
  ".yaml": "yaml",
  ".yml": "yaml",

  // TOML → dprint (統合フォーマッター)
  ".toml": "toml",
};

/**
 * ファイルパスからファイルタイプを取得
 */
function getFileType(filePath: string): string | null {
  const ext = extname(filePath).toLowerCase();
  return FILE_TYPE_MAP[ext] || null;
}

// ============================================
// ツール実行関数
// ============================================

/**
 * コマンドを実行して結果を返す
 */
async function runCommand(
  cmd: string[],
  options: { cwd?: string } = {},
): Promise<{ success: boolean; stdout: string; stderr: string }> {
  const proc = spawn({
    cmd,
    cwd: options.cwd || process.cwd(),
    stdout: "pipe",
    stderr: "pipe",
  });

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  return {
    success: exitCode === 0,
    stdout,
    stderr,
  };
}

/**
 * dprint で複数のファイル形式（Markdown/YAML/TOML）をフォーマット
 */
async function runDprint(files: string[], mode: Mode, verbose: boolean): Promise<LintResult> {
  if (files.length === 0) {
    return { tool: "dprint", success: true, output: "No files to process" };
  }

  // dprint fmt で修正、dprint check でチェック
  const args = mode === "fix" ? ["dprint", "fmt", ...files] : ["dprint", "check", ...files];

  if (verbose) {
    console.log(`🔧 Running: ${args.join(" ")}`);
  }

  const result = await runCommand(args);

  return {
    tool: "dprint",
    success: result.success,
    output: result.stdout,
    error: result.stderr,
  };
}

/**
 * tsc でTypeScript全体の型チェック
 * 注: 単一ファイルモード（--file）では実行しない
 */
async function runTsc(verbose: boolean): Promise<LintResult> {
  const args = ["bunx", "tsc", "--noEmit"];

  if (verbose) {
    console.log(`🔧 Running: ${args.join(" ")}`);
  }

  const result = await runCommand(args);

  return {
    tool: "tsc",
    success: result.success,
    output: result.stdout,
    error: result.stderr,
  };
}

/**
 * oxlint でTypeScript/JavaScript/JSONをLint
 */
async function runOxlint(files: string[], verbose: boolean): Promise<LintResult> {
  if (files.length === 0) {
    return { tool: "oxlint", success: true, output: "No files to process" };
  }

  const args = ["oxlint", ...files];

  if (verbose) {
    console.log(`🔧 Running: ${args.join(" ")}`);
  }

  const result = await runCommand(args);

  return {
    tool: "oxlint",
    success: result.success,
    output: result.stdout,
    error: result.stderr,
  };
}

/**
 * oxfmt でTypeScript/JavaScript/JSONをフォーマット
 */
async function runOxfmt(files: string[], mode: Mode, verbose: boolean): Promise<LintResult> {
  if (files.length === 0) {
    return { tool: "oxfmt", success: true, output: "No files to process" };
  }

  const args = mode === "fix" ? ["oxfmt", "--write", ...files] : ["oxfmt", ...files];

  if (verbose) {
    console.log(`🔧 Running: ${args.join(" ")}`);
  }

  const result = await runCommand(args);

  return {
    tool: "oxfmt",
    success: result.success,
    output: result.stdout,
    error: result.stderr,
  };
}

/**
 * shfmt でシェルスクリプトをフォーマット
 * 注: .zsh ファイルは shfmt が zsh 構文を完全に理解しないため除外
 */
async function runShfmt(files: string[], mode: Mode, verbose: boolean): Promise<LintResult> {
  // .zsh ファイルを除外（shfmt は zsh 構文を完全に理解しない）
  const shFiles = files.filter((f) => !f.endsWith(".zsh"));

  if (shFiles.length === 0) {
    if (verbose) {
      console.log("⏭️ shfmt: skipped (no .sh/.bash files)");
    }
    return {
      tool: "shfmt",
      success: true,
      output: "No .sh/.bash files to format",
    };
  }

  // shfmt -w で書き込み、-d で差分表示（チェックモード）
  // -s: シンプル化, -i 2: インデント2スペース
  const args =
    mode === "fix"
      ? ["shfmt", "-w", "-s", "-i", "2", ...shFiles]
      : ["shfmt", "-d", "-s", "-i", "2", ...shFiles];

  if (verbose) {
    console.log(`🔧 Running: ${args.join(" ")}`);
  }

  const result = await runCommand(args);

  return {
    tool: "shfmt",
    success: result.success,
    output: result.stdout,
    error: result.stderr,
  };
}

/**
 * shellcheck でシェルスクリプトをチェック
 * 注: .zsh ファイルは shellcheck が zsh 構文を理解しないため除外
 *     SC2016 (info) レベルのエラーは無視（変数展開の警告は言語的に許容）
 */
async function runShellcheck(files: string[], verbose: boolean): Promise<LintResult> {
  // .zsh ファイルを除外（shellcheck は zsh 構文を理解しない）
  // .bash ファイルは shellcheck がサポートしているため含める
  const shFiles = files.filter((f) => !f.endsWith(".zsh"));

  if (shFiles.length === 0) {
    if (verbose) {
      console.log("⏭️ shellcheck: skipped (no .sh files)");
    }
    return {
      tool: "shellcheck",
      success: true,
      output: "No .sh files to check",
    };
  }

  // SC2016 (info) を無視：シングルクォートの警告は手意的な場合があるため
  // -x (--external-sources): source で読み込むファイルを追跡する（動的パスを解決）
  // --source-path=SCRIPTDIR：スクリプトのディレクトリから source パスを解決する
  const args = ["shellcheck", "--exclude=SC2016", "-x", "--source-path=SCRIPTDIR", ...shFiles];

  if (verbose) {
    console.log(`🔧 Running: ${args.join(" ")}`);
  }

  const result = await runCommand(args);

  return {
    tool: "shellcheck",
    success: result.success,
    output: result.stdout,
    error: result.stderr,
  };
}

// ============================================
// ファイル収集
// ============================================

/**
 * Git でステージされたファイルを取得
 */
async function getStagedFiles(): Promise<string[]> {
  const result = await runCommand(["git", "diff", "--cached", "--name-only", "--diff-filter=ACMR"]);

  if (!result.success) {
    return [];
  }

  return result.stdout
    .split("\n")
    .map((f) => f.trim())
    .filter((f) => f.length > 0 && existsSync(f));
}

/**
 * プロジェクト内の対象ファイルを取得
 */
async function getAllProjectFiles(): Promise<string[]> {
  // fd コマンドを使用して高速にファイルを取得
  const result = await runCommand([
    "fd",
    "-t",
    "f",
    "-e",
    "ts",
    "-e",
    "tsx",
    "-e",
    "js",
    "-e",
    "jsx",
    "-e",
    "json",
    "-e",
    "sh",
    "-e",
    "zsh",
    "-e",
    "bash",
    "-e",
    "md",
    "-e",
    "yaml",
    "-e",
    "yml",
    "-e",
    "toml",
    "--exclude",
    "node_modules",
    "--exclude",
    ".git",
  ]);

  if (!result.success) {
    console.error("Failed to list files with fd");
    return [];
  }

  return result.stdout
    .split("\n")
    .map((f) => f.trim())
    .filter((f) => f.length > 0);
}

/**
 * ファイルをタイプ別にグループ化
 */
function groupFilesByType(files: string[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();

  for (const file of files) {
    const fileType = getFileType(file);
    if (fileType) {
      const existing = groups.get(fileType) || [];
      existing.push(file);
      groups.set(fileType, existing);
    }
  }

  return groups;
}

// ============================================
// メイン処理
// ============================================

/**
 * 引数をパース
 */
function parseOptions(): Options {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      mode: {
        type: "string",
        short: "m",
        default: "check",
      },
      file: {
        type: "string",
        short: "f",
      },
      staged: {
        type: "boolean",
        short: "s",
        default: false,
      },
      verbose: {
        type: "boolean",
        short: "v",
        default: false,
      },
    },
  });

  const mode = values.mode === "fix" ? "fix" : "check";

  return {
    mode,
    file: values.file,
    staged: values.staged ?? false,
    verbose: values.verbose ?? false,
  };
}

/**
 * ファイルリストに対してlint/formatを実行
 */
async function processFiles(files: string[], options: Options): Promise<boolean> {
  const groups = groupFilesByType(files);
  const results: LintResult[] = [];

  // TypeScript/JavaScript/JSON → oxlint + oxfmt (並列実行)
  const tsJsJsonFiles = [
    ...(groups.get("typescript") || []),
    ...(groups.get("javascript") || []),
    ...(groups.get("json") || []),
  ];
  if (tsJsJsonFiles.length > 0) {
    // tsc は全体チェック時のみ実行（単一ファイルモードでは対象外）
    const tsJsPromises: Promise<LintResult>[] = [
      runOxlint(tsJsJsonFiles, options.verbose),
      runOxfmt(tsJsJsonFiles, options.mode, options.verbose),
    ];
    if (!options.file) {
      tsJsPromises.push(runTsc(options.verbose));
    }
    results.push(...(await Promise.all(tsJsPromises)));
  }

  // Shell scripts → shfmt + shellcheck (並列実行)
  const shellFiles = groups.get("shell") || [];
  if (shellFiles.length > 0) {
    const [shfmtResult, shellcheckResult] = await Promise.all([
      runShfmt(shellFiles, options.mode, options.verbose),
      runShellcheck(shellFiles, options.verbose),
    ]);
    results.push(shfmtResult, shellcheckResult);
  }

  // Markdown/YAML/TOML → dprint (統合フォーマッター)
  const dprintFiles = [
    ...(groups.get("markdown") || []),
    ...(groups.get("yaml") || []),
    ...(groups.get("toml") || []),
  ];
  if (dprintFiles.length > 0) {
    results.push(await runDprint(dprintFiles, options.mode, options.verbose));
  }

  // 結果を出力
  let allSuccess = true;
  for (const result of results) {
    if (!result.success) {
      allSuccess = false;
      console.error(`ERROR [Lint:${result.tool}] Failed to check/fix`);
      if (result.output) console.log(result.output);
      if (result.error) console.error(result.error);
    } else if (options.verbose) {
      console.log(`✅ ${result.tool} passed`);
    }
  }

  return allSuccess;
}

/**
 * メイン関数
 */
async function main(): Promise<void> {
  const options = parseOptions();

  if (options.verbose) {
    console.log(`🔍 Mode: ${options.mode}`);
    console.log(`📁 File: ${options.file || "all"}`);
    console.log(`📋 Staged: ${options.staged}`);
  }

  let files: string[];

  if (options.file) {
    // 単一ファイルモード（hooks用）
    const filePath = resolve(options.file);

    // .claude/settings.local.json は除外（sort-permissions.ts が処理する）
    if (filePath.endsWith(".claude/settings.local.json")) {
      if (options.verbose) {
        console.log("⏭️ Skipped: .claude/settings.local.json (handled by sort-permissions)");
      }
      process.exit(0);
    }

    if (!existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }
    if (!statSync(filePath).isFile()) {
      console.error(`Not a file: ${filePath}`);
      process.exit(1);
    }
    files = [filePath];
  } else if (options.staged) {
    // ステージされたファイルモード（pre-commit用）
    files = await getStagedFiles();
    if (files.length === 0) {
      console.log("No staged files to process");
      process.exit(0);
    }
  } else {
    // 全ファイルモード（mise tasks用）
    files = await getAllProjectFiles();
    if (files.length === 0) {
      console.log("No files to process");
      process.exit(0);
    }
  }

  if (options.verbose) {
    console.log(`📄 Processing ${files.length} file(s)`);
  }

  const success = await processFiles(files, options);

  if (!success) {
    process.exit(1);
  }

  if (options.verbose || !options.file) {
    console.log(`✨ ${options.mode === "fix" ? "Format" : "Check"} completed successfully`);
  }
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
