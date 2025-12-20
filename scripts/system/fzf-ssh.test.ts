/**
 * fzf-ssh.ts のテスト
 */

import { describe, expect, it } from "bun:test";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { getHosts, sshConfigExists } from "./fzf-ssh";

describe("fzf-ssh", () => {
	// 注意: これらのテストは実際の~/.ssh/configに依存する
	// モックするには環境変数やDIが必要になるため、
	// 存在チェックのみをテスト

	describe("sshConfigExists", () => {
		it("SSH設定ファイルの存在を確認できる", () => {
			const result = sshConfigExists();
			const expected = existsSync(join(homedir(), ".ssh", "config"));
			expect(result).toBe(expected);
		});
	});

	describe("getHosts", () => {
		it("ホスト一覧を取得できる（設定ファイルが存在する場合）", async () => {
			if (!sshConfigExists()) {
				// SSH設定がない場合はスキップ
				return;
			}

			const hosts = await getHosts();
			// 配列が返ることを確認（中身は環境依存）
			expect(Array.isArray(hosts)).toBe(true);
		});

		it("ワイルドカード(*)ホストは除外される", async () => {
			if (!sshConfigExists()) {
				return;
			}

			const hosts = await getHosts();
			expect(hosts.every((h) => h !== "*")).toBe(true);
		});
	});
});
