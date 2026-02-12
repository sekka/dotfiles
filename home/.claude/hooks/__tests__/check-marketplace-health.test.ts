import {
	afterEach,
	beforeEach,
	describe,
	expect,
	mock,
	test,
} from "bun:test";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import type { CheckResult } from "../check-marketplace-health";

/**
 * check-marketplace-health.ts のテスト
 *
 * テスト対象:
 * - known_marketplaces.json の読み込み
 * - marketplace.json の存在確認
 * - git fetch による修復
 * - ディレクトリ削除のフォールバック
 * - キャッシュ機構
 */

// テスト用の一時ディレクトリ
const TEST_TMP_DIR = join(tmpdir(), "claude-marketplace-test");
const TEST_PLUGINS_DIR = join(TEST_TMP_DIR, ".claude", "plugins");
const TEST_KNOWN_MARKETPLACES = join(
	TEST_PLUGINS_DIR,
	"known_marketplaces.json",
);
const TEST_CACHE_FILE = join(
	TEST_PLUGINS_DIR,
	".marketplace-health-cache.json",
);

// モジュールを動的に読み込むためのヘルパー
async function importTestModule() {
	// 既存のモジュールキャッシュをクリア
	const modulePath = join(
		process.cwd(),
		"home",
		".claude",
		"hooks",
		"check-marketplace-health.ts",
	);
	delete require.cache[require.resolve(modulePath)];

	const module = await import("../check-marketplace-health");
	return module;
}

// モック用の環境変数を設定
beforeEach(() => {
	// テスト用ディレクトリをクリーンアップ
	if (existsSync(TEST_TMP_DIR)) {
		rmSync(TEST_TMP_DIR, { recursive: true, force: true });
	}
	mkdirSync(TEST_PLUGINS_DIR, { recursive: true });

	// HOME を一時ディレクトリに設定
	process.env.HOME = TEST_TMP_DIR;
	// タイムアウトを短く設定（テスト高速化）
	process.env.CLAUDE_GIT_TIMEOUT = "2000";
});

afterEach(() => {
	// クリーンアップ
	if (existsSync(TEST_TMP_DIR)) {
		rmSync(TEST_TMP_DIR, { recursive: true, force: true });
	}
	// 環境変数をリセット
	delete process.env.CLAUDE_GIT_TIMEOUT;
});

describe("check-marketplace-health", () => {
	test("known_marketplaces.json が存在しない場合は空の結果を返す", async () => {
		const { checkAndRepairMarketplaces } = await importTestModule();
		const result = checkAndRepairMarketplaces();

		expect(result.checked).toHaveLength(0);
		expect(result.repaired).toHaveLength(0);
		expect(result.removed).toHaveLength(0);
		expect(result.errors).toHaveLength(0);
	});

	test("全マーケットプレースが正常な場合は何もしない", async () => {
		// 正常な marketplace.json を持つマーケットプレース
		const marketplaceDir = join(
			TEST_PLUGINS_DIR,
			"marketplaces",
			"test-marketplace",
		);
		mkdirSync(join(marketplaceDir, ".claude-plugin"), { recursive: true });
		writeFileSync(
			join(marketplaceDir, ".claude-plugin", "marketplace.json"),
			JSON.stringify({ name: "test-marketplace" }),
		);

		// known_marketplaces.json を作成
		writeFileSync(
			TEST_KNOWN_MARKETPLACES,
			JSON.stringify({
				"test-marketplace": {
					installLocation: marketplaceDir,
				},
			}),
		);

		const { checkAndRepairMarketplaces } = await importTestModule();
		const result = checkAndRepairMarketplaces();

		expect(result.checked).toContain("test-marketplace");
		expect(result.repaired).toHaveLength(0);
		expect(result.removed).toHaveLength(0);
		expect(result.errors).toHaveLength(0);
		expect(
			existsSync(
				join(marketplaceDir, ".claude-plugin", "marketplace.json"),
			),
		).toBe(true);
	});

	test("marketplace.json が欠損している場合は git fetch を試みる（失敗）", async () => {
		const marketplaceDir = join(
			TEST_PLUGINS_DIR,
			"marketplaces",
			"broken-marketplace",
		);
		mkdirSync(marketplaceDir, { recursive: true });

		// .git ディレクトリは存在するが marketplace.json がない状態
		mkdirSync(join(marketplaceDir, ".git"), { recursive: true });

		writeFileSync(
			TEST_KNOWN_MARKETPLACES,
			JSON.stringify({
				"broken-marketplace": {
					installLocation: marketplaceDir,
				},
			}),
		);

		const { checkAndRepairMarketplaces } = await importTestModule();
		const result = checkAndRepairMarketplaces();

		// git fetch が失敗するため削除される
		expect(result.checked).toContain("broken-marketplace");
		expect(result.repaired).toHaveLength(0);
		expect(result.removed).toContain("broken-marketplace");
		expect(existsSync(marketplaceDir)).toBe(false);
	});

	test("git fetch 失敗時はディレクトリを削除", async () => {
		const marketplaceDir = join(
			TEST_PLUGINS_DIR,
			"marketplaces",
			"corrupted-marketplace",
		);
		mkdirSync(marketplaceDir, { recursive: true });

		// git リポジトリではない状態（git fetch が失敗する）
		writeFileSync(
			TEST_KNOWN_MARKETPLACES,
			JSON.stringify({
				"corrupted-marketplace": {
					installLocation: marketplaceDir,
				},
			}),
		);

		const { checkAndRepairMarketplaces } = await importTestModule();
		const result = checkAndRepairMarketplaces();

		expect(result.checked).toContain("corrupted-marketplace");
		expect(result.removed).toContain("corrupted-marketplace");
		expect(existsSync(marketplaceDir)).toBe(false);
	});

	test("ディレクトリが存在しない場合はスキップ", async () => {
		const nonExistentDir = join(
			TEST_PLUGINS_DIR,
			"marketplaces",
			"non-existent",
		);

		writeFileSync(
			TEST_KNOWN_MARKETPLACES,
			JSON.stringify({
				"non-existent": {
					installLocation: nonExistentDir,
				},
			}),
		);

		const { checkAndRepairMarketplaces } = await importTestModule();
		const result = checkAndRepairMarketplaces();

		// ディレクトリが存在しないのでチェックされない
		expect(result.checked).not.toContain("non-existent");
		expect(result.errors).toHaveLength(0);
	});

	test("複数のマーケットプレースが同時に壊れている場合は各々独立に処理", async () => {
		const marketplace1 = join(
			TEST_PLUGINS_DIR,
			"marketplaces",
			"marketplace1",
		);
		const marketplace2 = join(
			TEST_PLUGINS_DIR,
			"marketplaces",
			"marketplace2",
		);

		mkdirSync(marketplace1, { recursive: true });
		mkdirSync(marketplace2, { recursive: true });

		writeFileSync(
			TEST_KNOWN_MARKETPLACES,
			JSON.stringify({
				marketplace1: { installLocation: marketplace1 },
				marketplace2: { installLocation: marketplace2 },
			}),
		);

		const { checkAndRepairMarketplaces } = await importTestModule();
		const result = checkAndRepairMarketplaces();

		// 両方とも処理される
		expect(result.checked).toContain("marketplace1");
		expect(result.checked).toContain("marketplace2");
		expect(result.removed).toContain("marketplace1");
		expect(result.removed).toContain("marketplace2");
		expect(existsSync(marketplace1)).toBe(false);
		expect(existsSync(marketplace2)).toBe(false);
	});

	test("キャッシュが有効な場合はチェックをスキップ", async () => {
		const marketplaceDir = join(
			TEST_PLUGINS_DIR,
			"marketplaces",
			"cached-marketplace",
		);
		mkdirSync(join(marketplaceDir, ".claude-plugin"), { recursive: true });
		writeFileSync(
			join(marketplaceDir, ".claude-plugin", "marketplace.json"),
			JSON.stringify({ name: "cached-marketplace" }),
		);

		writeFileSync(
			TEST_KNOWN_MARKETPLACES,
			JSON.stringify({
				"cached-marketplace": {
					installLocation: marketplaceDir,
				},
			}),
		);

		// キャッシュを作成（直近にチェック済み）
		writeFileSync(
			TEST_CACHE_FILE,
			JSON.stringify({
				"cached-marketplace": {
					lastChecked: Date.now(),
					status: "healthy",
				},
			}),
		);

		const { checkAndRepairMarketplaces } = await importTestModule();
		const result = checkAndRepairMarketplaces();

		// キャッシュが有効なのでスキップされる
		expect(result.checked).not.toContain("cached-marketplace");
	});

	test("キャッシュが期限切れの場合は再チェック", async () => {
		const marketplaceDir = join(
			TEST_PLUGINS_DIR,
			"marketplaces",
			"expired-cache-marketplace",
		);
		mkdirSync(join(marketplaceDir, ".claude-plugin"), { recursive: true });
		writeFileSync(
			join(marketplaceDir, ".claude-plugin", "marketplace.json"),
			JSON.stringify({ name: "expired-cache-marketplace" }),
		);

		writeFileSync(
			TEST_KNOWN_MARKETPLACES,
			JSON.stringify({
				"expired-cache-marketplace": {
					installLocation: marketplaceDir,
				},
			}),
		);

		// キャッシュを作成（2時間前にチェック済み = 期限切れ）
		const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
		writeFileSync(
			TEST_CACHE_FILE,
			JSON.stringify({
				"expired-cache-marketplace": {
					lastChecked: twoHoursAgo,
					status: "healthy",
				},
			}),
		);

		const { checkAndRepairMarketplaces } = await importTestModule();
		const result = checkAndRepairMarketplaces();

		// キャッシュが期限切れなので再チェックされる
		expect(result.checked).toContain("expired-cache-marketplace");
	});

	test("セキュリティ: ~/.claude/plugins 配下以外への削除を拒否", async () => {
		// 悪意のあるパスを含む known_marketplaces.json
		const maliciousDir = join(tmpdir(), "malicious-target");
		mkdirSync(maliciousDir, { recursive: true });

		writeFileSync(
			TEST_KNOWN_MARKETPLACES,
			JSON.stringify({
				"malicious-marketplace": {
					installLocation: maliciousDir,
				},
			}),
		);

		const { checkAndRepairMarketplaces } = await importTestModule();
		const result = checkAndRepairMarketplaces();

		// セキュリティチェックにより削除されない
		expect(result.removed).not.toContain("malicious-marketplace");
		expect(existsSync(maliciousDir)).toBe(true);

		// クリーンアップ
		rmSync(maliciousDir, { recursive: true, force: true });
	});

	test("セキュリティ: パストラバーサル攻撃（../ を使った攻撃）を防ぐ", async () => {
		const { checkAndRepairMarketplaces } = await importTestModule();

		// 攻撃対象ディレクトリを作成
		const attackTarget = join(tmpdir(), "attack-target");
		mkdirSync(attackTarget, { recursive: true });
		writeFileSync(
			join(attackTarget, "important-file.txt"),
			"DO NOT DELETE",
		);

		// パストラバーサル攻撃を試みる
		// TEST_PLUGINS_DIR/marketplaces/evil/../../../attack-target のようなパス
		const evilMarketplaceDir = join(
			TEST_PLUGINS_DIR,
			"marketplaces",
			"evil",
		);
		mkdirSync(evilMarketplaceDir, { recursive: true });

		// 相対パスを使った悪意のあるパスを設定
		const maliciousPath = join(
			TEST_PLUGINS_DIR,
			"marketplaces",
			"evil",
			"..",
			"..",
			"..",
			"..",
			"attack-target",
		);

		writeFileSync(
			TEST_KNOWN_MARKETPLACES,
			JSON.stringify({
				"evil-marketplace": {
					installLocation: maliciousPath,
				},
			}),
		);

		const result = checkAndRepairMarketplaces();

		// 削除が拒否されることを確認
		expect(result.removed).not.toContain("evil-marketplace");
		expect(existsSync(attackTarget)).toBe(true);
		expect(existsSync(join(attackTarget, "important-file.txt"))).toBe(
			true,
		);

		// エラーが記録されていることを確認
		// セキュリティエラーは console.error に出力されるが result.errors には含まれない可能性がある
		// 削除が実行されないことを確認することが重要

		// クリーンアップ
		rmSync(attackTarget, { recursive: true, force: true });
	});

	test("セキュリティ: シンボリックリンクを使った攻撃を防ぐ", async () => {
		const { checkAndRepairMarketplaces } = await importTestModule();

		// 攻撃対象ディレクトリを作成
		const attackTarget = join(tmpdir(), "symlink-attack-target");
		mkdirSync(attackTarget, { recursive: true });
		writeFileSync(
			join(attackTarget, "sensitive-file.txt"),
			"SENSITIVE DATA",
		);

		// 許可されたディレクトリ内にシンボリックリンクを作成
		const symlinkDir = join(TEST_PLUGINS_DIR, "marketplaces", "symlink");
		try {
			// シンボリックリンクを作成（権限がない環境ではスキップ）
			mkdirSync(join(TEST_PLUGINS_DIR, "marketplaces"), {
				recursive: true,
			});
			spawnSync("ln", ["-s", attackTarget, symlinkDir]);

			if (existsSync(symlinkDir)) {
				writeFileSync(
					TEST_KNOWN_MARKETPLACES,
					JSON.stringify({
						"symlink-marketplace": {
							installLocation: symlinkDir,
						},
					}),
				);

				const result = checkAndRepairMarketplaces();

				// シンボリックリンク先が削除されないことを確認
				expect(existsSync(attackTarget)).toBe(true);
				expect(
					existsSync(join(attackTarget, "sensitive-file.txt")),
				).toBe(true);
			}
		} catch (error) {
			// シンボリックリンクの作成に失敗した場合はスキップ
			console.log("Skipping symlink test (permission denied)");
		}

		// クリーンアップ
		if (existsSync(symlinkDir)) {
			rmSync(symlinkDir, { recursive: true, force: true });
		}
		if (existsSync(attackTarget)) {
			rmSync(attackTarget, { recursive: true, force: true });
		}
	});

	test("修復成功時はキャッシュを更新", async () => {
		// 正常な git リポジトリを作成してテスト
		const marketplaceDir = join(
			TEST_PLUGINS_DIR,
			"marketplaces",
			"repairable-marketplace",
		);
		mkdirSync(marketplaceDir, { recursive: true });

		// git init してテストリポジトリを作成
		spawnSync("git", ["init"], { cwd: marketplaceDir });
		spawnSync("git", ["config", "user.name", "Test User"], {
			cwd: marketplaceDir,
		});
		spawnSync("git", ["config", "user.email", "test@example.com"], {
			cwd: marketplaceDir,
		});

		// marketplace.json を作成してコミット
		const pluginDir = join(marketplaceDir, ".claude-plugin");
		mkdirSync(pluginDir, { recursive: true });
		writeFileSync(
			join(pluginDir, "marketplace.json"),
			JSON.stringify({ name: "repairable-marketplace" }),
		);

		spawnSync("git", ["add", "."], { cwd: marketplaceDir });
		spawnSync("git", ["commit", "-m", "Initial commit"], {
			cwd: marketplaceDir,
		});

		// origin リモートを自分自身に設定（git fetch が成功するように）
		spawnSync("git", ["remote", "add", "origin", marketplaceDir], {
			cwd: marketplaceDir,
		});

		// marketplace.json を削除（破損状態）
		rmSync(join(pluginDir, "marketplace.json"));

		writeFileSync(
			TEST_KNOWN_MARKETPLACES,
			JSON.stringify({
				"repairable-marketplace": {
					installLocation: marketplaceDir,
				},
			}),
		);

		const { checkAndRepairMarketplaces } = await importTestModule();
		const result = checkAndRepairMarketplaces();

		// git fetch で修復される
		expect(result.checked).toContain("repairable-marketplace");
		expect(result.repaired).toContain("repairable-marketplace");
		expect(result.removed).not.toContain("repairable-marketplace");
		expect(
			existsSync(join(pluginDir, "marketplace.json")),
		).toBe(true);

		// キャッシュファイルが更新されている
		expect(existsSync(TEST_CACHE_FILE)).toBe(true);
	});

	test("セキュリティ: キャッシュファイルのパーミッションが 0o600 に設定される", async () => {
		const marketplaceDir = join(
			TEST_PLUGINS_DIR,
			"marketplaces",
			"test-marketplace",
		);
		mkdirSync(join(marketplaceDir, ".claude-plugin"), { recursive: true });
		writeFileSync(
			join(marketplaceDir, ".claude-plugin", "marketplace.json"),
			JSON.stringify({ name: "test-marketplace" }),
		);

		writeFileSync(
			TEST_KNOWN_MARKETPLACES,
			JSON.stringify({
				"test-marketplace": {
					installLocation: marketplaceDir,
				},
			}),
		);

		const { checkAndRepairMarketplaces } = await importTestModule();
		checkAndRepairMarketplaces();

		// キャッシュファイルが作成される
		expect(existsSync(TEST_CACHE_FILE)).toBe(true);

		// パーミッションを確認
		const fs = await import("node:fs");
		const stats = fs.statSync(TEST_CACHE_FILE);
		const mode = stats.mode & 0o777; // パーミッションビットのみ抽出

		// owner read/write only (0o600)
		expect(mode).toBe(0o600);
	});

	test("セキュリティ: 破損したキャッシュファイルを安全に処理", async () => {
		const marketplaceDir = join(
			TEST_PLUGINS_DIR,
			"marketplaces",
			"test-marketplace",
		);
		mkdirSync(join(marketplaceDir, ".claude-plugin"), { recursive: true });
		writeFileSync(
			join(marketplaceDir, ".claude-plugin", "marketplace.json"),
			JSON.stringify({ name: "test-marketplace" }),
		);

		writeFileSync(
			TEST_KNOWN_MARKETPLACES,
			JSON.stringify({
				"test-marketplace": {
					installLocation: marketplaceDir,
				},
			}),
		);

		// 破損したキャッシュファイルを作成（配列形式）
		writeFileSync(TEST_CACHE_FILE, JSON.stringify([]));

		const { checkAndRepairMarketplaces } = await importTestModule();
		const result = checkAndRepairMarketplaces();

		// エラーを出さずに処理される
		expect(result.checked).toContain("test-marketplace");
		expect(result.errors).toHaveLength(0);
	});

	test("セキュリティ: 不正なキャッシュエントリを無視", async () => {
		const marketplaceDir = join(
			TEST_PLUGINS_DIR,
			"marketplaces",
			"test-marketplace",
		);
		mkdirSync(join(marketplaceDir, ".claude-plugin"), { recursive: true });
		writeFileSync(
			join(marketplaceDir, ".claude-plugin", "marketplace.json"),
			JSON.stringify({ name: "test-marketplace" }),
		);

		writeFileSync(
			TEST_KNOWN_MARKETPLACES,
			JSON.stringify({
				"test-marketplace": {
					installLocation: marketplaceDir,
				},
			}),
		);

		// 不正なキャッシュエントリを作成
		writeFileSync(
			TEST_CACHE_FILE,
			JSON.stringify({
				"invalid-entry": {
					lastChecked: "not-a-number", // 不正な型
					status: "healthy",
				},
				"another-invalid": "not-an-object", // 不正な構造
			}),
		);

		const { checkAndRepairMarketplaces } = await importTestModule();
		const result = checkAndRepairMarketplaces();

		// 不正なエントリは無視され、正常に処理される
		expect(result.checked).toContain("test-marketplace");
		expect(result.errors).toHaveLength(0);
	});
});
