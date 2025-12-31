/**
 * 共通テストヘルパー関数
 * 複数のテストファイルで使用されるユーティリティ関数を一元化
 */

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { $ } from "bun";

/**
 * 一時ディレクトリの作成と自動クリーンアップ
 *
 * @param {string} prefix - 作成する一時ディレクトリのプレフィックス
 * @returns {Promise<string>} 作成された一時ディレクトリのパス
 *
 * @example
 * const tempDir = await createTempDir("test-");
 * // cleanup はテスト終了後に cleanupTempDir() で実施
 */
export async function createTempDir(prefix: string): Promise<string> {
	return await mkdtemp(join(tmpdir(), prefix));
}

/**
 * 一時ディレクトリのクリーンアップ
 *
 * @param {string} dir - クリーンアップする一時ディレクトリのパス
 * @returns {Promise<void>}
 *
 * @example
 * await cleanupTempDir(tempDir);
 */
export async function cleanupTempDir(dir: string): Promise<void> {
	await rm(dir, { recursive: true, force: true });
}

/**
 * テスト用Gitリポジトリのセットアップ
 * 既存のディレクトリをGitリポジトリとして初期化し、
 * テストユーザーの設定を構成します。
 *
 * @param {string} dir - セットアップするディレクトリのパス
 * @returns {Promise<void>}
 *
 * @remarks
 * - git init を実行
 * - ユーザー.emailを "test@example.com" に設定
 * - ユーザー.name を "Test User" に設定
 * - 現在のワーキングディレクトリを復元
 *
 * @example
 * const tempDir = await createTempDir("test-");
 * await setupGitRepo(tempDir);
 * // tempDir はGitリポジトリとして使用可能
 */
export async function setupGitRepo(dir: string): Promise<void> {
	const originalCwd = process.cwd();
	process.chdir(dir);

	try {
		await $`git init`.quiet();
		await $`git config user.email "test@example.com"`.quiet();
		await $`git config user.name "Test User"`.quiet();
	} finally {
		process.chdir(originalCwd);
	}
}

/**
 * テスト用の一時Gitリポジトリ作成（統合版）
 * createTempDir() と setupGitRepo() を組み合わせ、
 * 一度に一時Gitリポジトリを作成します。
 *
 * @param {string} prefix - 作成するリポジトリのプレフィックス
 * @returns {Promise<string>} 作成された一時Gitリポジトリのパス
 *
 * @example
 * const repoDir = await createTempGitRepo("git-test-");
 * // repoDir はGitリポジトリとして使用可能
 * await cleanupTempDir(repoDir); // テスト終了後はクリーンアップ
 */
export async function createTempGitRepo(prefix: string): Promise<string> {
	const tempDir = await createTempDir(prefix);
	await setupGitRepo(tempDir);
	return tempDir;
}
