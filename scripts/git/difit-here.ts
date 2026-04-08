#!/usr/bin/env bun

/**
 * カレントディレクトリのgit状態を自動検出し、difitでブラウザ表示する
 *
 * cmux環境ではブラウザペインで、それ以外はシステムブラウザで開く。
 *
 * 参考: https://gist.github.com/azu/cef84c98aeef832d43dfb640c7e321f5
 */

import { $ } from "bun";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// ---- Types ----------------------------------------------------------------

export type BranchContext =
  | { ok: true; currentBranch: string; defaultBranch: string; mergeBase: string | null }
  | { ok: false; error: string };

export interface BranchContextInput {
  currentBranch: string;
  defaultBranch: string;
  mergeBase: string | null;
}

// ---- Exported utility functions -------------------------------------------

/**
 * 指定ディレクトリのブランチ状態を検出する
 */
export async function detectBranchContext(cwd: string): Promise<BranchContext> {
  // Gitリポジトリかどうか確認
  const check = await $`git -C ${cwd} rev-parse --git-dir`.quiet().nothrow();
  if (check.exitCode !== 0) {
    return { ok: false, error: `not a git repository: ${cwd}` };
  }

  // デフォルトブランチを検出
  let defaultBranch = "";
  const symref = await $`git -C ${cwd} symbolic-ref refs/remotes/origin/HEAD`.quiet().nothrow();
  if (symref.exitCode === 0) {
    defaultBranch = symref.text().trim().replace("refs/remotes/origin/", "");
  }
  if (!defaultBranch) {
    const branches = await $`git -C ${cwd} branch --list main master`.quiet().nothrow();
    defaultBranch =
      branches
        .text()
        .trim()
        .replace(/^\*?\s+/, "")
        .split("\n")[0]
        ?.trim() ?? "";
  }
  if (!defaultBranch) {
    defaultBranch = "main";
  }

  // カレントブランチを取得
  const current = await $`git -C ${cwd} rev-parse --abbrev-ref HEAD`.quiet().nothrow();
  const currentBranch = current.exitCode === 0 ? current.text().trim() : "";

  // mergeBase を計算（フィーチャーブランチの場合のみ意味を持つ）
  let mergeBase: string | null = null;
  if (currentBranch && currentBranch !== defaultBranch) {
    const mb = await $`git -C ${cwd} merge-base ${defaultBranch} HEAD`.quiet().nothrow();
    if (mb.exitCode === 0) {
      mergeBase = mb.text().trim();
    }
  }

  return { ok: true, currentBranch, defaultBranch, mergeBase };
}

/**
 * ブランチ文脈から difit に渡す引数を決定する
 */
export function buildDifitArgs(ctx: BranchContextInput): string[] {
  const { currentBranch, defaultBranch, mergeBase } = ctx;

  if (!currentBranch || currentBranch === defaultBranch) {
    return ["working"];
  }
  if (mergeBase) {
    return [mergeBase, "HEAD"];
  }
  return ["working"];
}

// ---- Main -----------------------------------------------------------------

async function main(): Promise<number> {
  const cwd = process.cwd();

  const cmuxBin =
    (await $`command -v cmux`
      .quiet()
      .nothrow()
      .then((r) => (r.exitCode === 0 ? r.text().trim() : null))) ??
    "/Applications/cmux.app/Contents/Resources/bin/cmux";

  // ブランチ文脈を検出
  const ctx = await detectBranchContext(cwd);
  if (!ctx.ok) {
    console.error(`エラー: ${ctx.error}`);
    return 1;
  }

  const difitArgs = buildDifitArgs(ctx);
  const difitExtraArgs = difitArgs[0] === "working" ? ["--include-untracked"] : [];

  console.log(`difit-here: branch=${ctx.currentBranch}, args=${difitArgs.join(" ")}`);

  // 一時ログファイルを作成
  const logFile = join(await mkdtemp(join(tmpdir(), "difit-here-")), "difit.log");
  await Bun.write(logFile, "");

  let difitProc: ReturnType<typeof Bun.spawn> | null = null;

  try {
    // difitサーバーをバックグラウンドで起動
    difitProc = Bun.spawn(["difit", ...difitArgs, "--no-open", ...difitExtraArgs], {
      stdout: Bun.file(logFile),
      stderr: Bun.file(logFile),
    });

    // ログから URL を取得（最大 6 秒、0.3s×20 回）
    let difitUrl = "";
    for (let i = 0; i < 20; i++) {
      // プロセスが死んでいたら中断
      if (difitProc.exitCode !== null) break;

      const log = await readFile(logFile, "utf-8");
      const match = log.match(/http:\/\/localhost:\d+/);
      if (match) {
        difitUrl = match[0];
        break;
      }
      await Bun.sleep(300);
    }

    if (!difitUrl) {
      console.error("エラー: difit の起動に失敗しました");
      const log = await readFile(logFile, "utf-8").catch(() => "");
      if (log) process.stderr.write(log);
      return 1;
    }

    console.log(`difit-here: server at ${difitUrl}`);

    // cmux が使える場合はブラウザペインで開く、それ以外はシステムブラウザ
    const cmuxPingOk = await $`${cmuxBin} ping`
      .quiet()
      .nothrow()
      .then((r) => r.exitCode === 0);

    if (cmuxPingOk) {
      const paneResult = await $`${cmuxBin} new-pane --type browser --url ${difitUrl + "/"}`
        .quiet()
        .nothrow();
      if (paneResult.exitCode !== 0) {
        await $`open ${difitUrl + "/"}`.nothrow();
      }
    } else {
      await $`open ${difitUrl + "/"}`.nothrow();
    }

    // difit プロセスが終了するまで待機
    await difitProc.exited;
  } finally {
    if (difitProc && difitProc.exitCode === null) {
      difitProc.kill();
    }
    await rm(logFile, { force: true }).catch(() => {});
    // mkdtemp で作った親ディレクトリも削除
    await rm(logFile.replace(/\/[^/]+$/, ""), { recursive: true, force: true }).catch(() => {});
  }

  return 0;
}

if (import.meta.main) {
  const exitCode = await main();
  process.exit(exitCode);
}
