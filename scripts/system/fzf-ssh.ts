#!/usr/bin/env bun

/**
 * fzf-ssh
 *
 * SSH接続先をfzfで選択して接続する
 *
 * Usage:
 *   fzf-ssh.ts
 */

import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { $ } from "bun";

const SSH_CONFIG_PATH = join(homedir(), ".ssh", "config");

/**
 * SSH設定ファイルが存在するか確認
 */
export function sshConfigExists(): boolean {
	return existsSync(SSH_CONFIG_PATH);
}

/**
 * SSH設定からホスト一覧を取得
 */
export async function getHosts(): Promise<string[]> {
	const result = await $`awk '/^Host / {print $2}' ${SSH_CONFIG_PATH} | grep -v '*'`
		.quiet()
		.nothrow();

	if (result.exitCode !== 0 || !result.stdout.length) {
		return [];
	}

	return result.stdout
		.toString()
		.trim()
		.split("\n")
		.filter((h) => h.length > 0);
}

/**
 * fzfでホストを選択
 */
export async function selectHostWithFzf(hosts: string[]): Promise<string | null> {
	if (hosts.length === 0) {
		return null;
	}

	// tmuxセッション内ならpopup表示、外なら通常のfzf
	const input = hosts.join("\n");
	let result: Awaited<ReturnType<typeof $>>;
	if (process.env.TMUX) {
		result = await $`echo ${input} | fzf-tmux -p 90%,90% -- \
    --preview "grep -A 10 '^Host {}' ${SSH_CONFIG_PATH}" \
    --preview-window=right:40%:wrap \
    --header "Select SSH host"`
			.quiet()
			.nothrow();
	} else {
		result = await $`echo ${input} | fzf \
    --preview "grep -A 10 '^Host {}' ${SSH_CONFIG_PATH}" \
    --preview-window=right:40%:wrap \
    --header "Select SSH host"`
			.quiet()
			.nothrow();
	}

	if (result.exitCode !== 0 || !result.stdout.length) {
		return null;
	}

	return result.stdout.toString().trim();
}

/**
 * SSHで接続
 */
export async function connectToHost(host: string): Promise<void> {
	// execで現在のプロセスを置き換え
	const proc = Bun.spawn(["ssh", host], {
		stdin: "inherit",
		stdout: "inherit",
		stderr: "inherit",
	});
	await proc.exited;
}

/**
 * メイン処理
 */
export async function main(): Promise<number> {
	if (!sshConfigExists()) {
		console.error("SSH config file not found");
		return 1;
	}

	const hosts = await getHosts();
	if (hosts.length === 0) {
		console.error("No SSH hosts found in config");
		return 1;
	}

	const selectedHost = await selectHostWithFzf(hosts);
	if (!selectedHost) {
		return 0;
	}

	await connectToHost(selectedHost);
	return 0;
}

if (import.meta.main) {
	const exitCode = await main();
	process.exit(exitCode);
}
