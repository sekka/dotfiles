#!/usr/bin/env bun
export {};

// UserPromptSubmit hook: 毎回のプロンプトに git の現在状態を自動注入する
//
// `git status --short` と直近 5 件のコミットを収集し、additionalContext として渡す。
// Claude がターン冒頭で git コマンドを実行しなくても常に最新のリポジトリ状態を
// 把握できるようにするのが狙い。git リポジトリ外では何もせず終了する。

import { spawnSync } from "node:child_process";

function run(cmd: string[]): string {
  const result = spawnSync(cmd[0]!, cmd.slice(1), { encoding: "utf-8", timeout: 3000 });
  return result.status === 0 ? (result.stdout ?? "").trim() : "";
}

const status = run(["git", "status", "--short"]);
const log = run(["git", "log", "--oneline", "-5"]);

if (!status && !log) process.exit(0);

const lines: string[] = [];
if (status) {
  lines.push("Git status:", status);
}
if (log) {
  lines.push("Recent commits:", log);
}

console.log(JSON.stringify({ additionalContext: lines.join("\n") }));
