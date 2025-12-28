#!/usr/bin/env bun

/**
 * Claude Code hooks 用スクリプト
 * .claude/settings.local.json の permissions.allow と permissions.deny を自動ソート
 *
 * 使用方法:
 *   bun scripts/development/sort-permissions.ts --file=path/to/.claude/settings.local.json
 *
 * 機能:
 *   - .claude/settings.local.json ファイルを検出
 *   - permissions.allow と permissions.deny 配列をアルファベット順にソート
 *   - 変更があった場合のみファイルに書き込む
 *   - JSON フォーマットを保持（インデント2スペース、末尾改行）
 */

import { existsSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, resolve } from "node:path";
import { parseArgs } from "node:util";
import Bun from "bun";

// ============================================
// 型定義
// ============================================

interface Options {
	file?: string;
	verbose: boolean;
}

interface SettingsFile {
	permissions?: {
		allow?: string[];
		deny?: string[];
		[key: string]: unknown;
	};
	[key: string]: unknown;
}

// ============================================
// ヘルパー関数
// ============================================

/**
 * 2つの配列が同じ内容かチェック（効率的）
 */
function arraysEqual<T>(a: T[], b: T[]): boolean {
	if (a.length !== b.length) return false;
	return a.every((val, idx) => val === b[idx]);
}

/**
 * ファイルパスの安全性をチェック（パストラバーサル対策）
 */
function validateSettingsLocalJsonPath(filePath: string): {
	valid: boolean;
	message?: string;
} {
	const resolvedPath = resolve(filePath);
	const fileName = basename(resolvedPath);
	const parentDirName = basename(dirname(resolvedPath));

	// ファイル名の確認
	if (fileName !== "settings.local.json") {
		return {
			valid: false,
			message: `File name must be "settings.local.json", got "${fileName}"`,
		};
	}

	// 親ディレクトリ名の確認
	if (parentDirName !== ".claude") {
		return {
			valid: false,
			message: `Parent directory must be ".claude", got "${parentDirName}"`,
		};
	}

	// ホームディレクトリ配下かチェック（セキュリティ）
	const homeDir = homedir();
	if (!resolvedPath.startsWith(homeDir)) {
		return {
			valid: false,
			message: `Path must be under home directory, got "${resolvedPath}"`,
		};
	}

	return { valid: true };
}

// ============================================
// メイン処理
// ============================================

/**
 * 引数をパース
 */
function parseOptions(): Options {
	const { values } = parseArgs({
		args: Bun.argv.slice(2),
		options: {
			file: {
				type: "string",
				short: "f",
			},
			verbose: {
				type: "boolean",
				short: "v",
				default: false,
			},
		},
	});

	return {
		file: values.file as string | undefined,
		verbose: values.verbose as boolean,
	};
}

/**
 * permissions をソート
 */
function sortPermissions(content: SettingsFile): boolean {
	let modified = false;

	if (!content.permissions) {
		return false;
	}

	// permissions.allow をソート
	if (content.permissions.allow && Array.isArray(content.permissions.allow)) {
		const sorted = [...content.permissions.allow].sort();
		if (!arraysEqual(sorted, content.permissions.allow)) {
			content.permissions.allow = sorted;
			modified = true;
		}
	}

	// permissions.deny をソート
	if (content.permissions.deny && Array.isArray(content.permissions.deny)) {
		const sorted = [...content.permissions.deny].sort();
		if (!arraysEqual(sorted, content.permissions.deny)) {
			content.permissions.deny = sorted;
			modified = true;
		}
	}

	return modified;
}

/**
 * ファイルの permissions をソート
 */
async function sortPermissionsFile(filePath: string): Promise<boolean> {
	try {
		// ファイルパスの安全性をチェック
		const validation = validateSettingsLocalJsonPath(filePath);
		if (!validation.valid) {
			// 対象ファイルではないため、エラーを出力せず成功として扱う
			return true;
		}

		const absolutePath = resolve(filePath);

		// ファイルが存在するかチェック
		if (!existsSync(absolutePath)) {
			return true; // ファイルが存在しない場合は何もしない
		}

		if (!statSync(absolutePath).isFile()) {
			console.error(`Not a file: ${absolutePath}`);
			return false;
		}

		// JSON を読み込む
		const fileContent = await Bun.file(absolutePath).text();
		let content: SettingsFile;

		try {
			content = JSON.parse(fileContent) as SettingsFile;
		} catch {
			console.error(`Failed to parse JSON in ${absolutePath}`);
			return false;
		}

		// ソート処理を実行
		const modified = sortPermissions(content);

		// 変更があった場合のみファイルに書き込む
		if (modified) {
			const sortedContent = JSON.stringify(content, null, 2) + "\n";
			await Bun.write(absolutePath, sortedContent);
			console.log(`✓ Sorted permissions in ${absolutePath}`);
		}

		return true;
	} catch (error) {
		console.error(
			`Error sorting permissions in ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
		);
		return false;
	}
}

/**
 * stdin から hook 入力を読み込む
 */
async function readStdinInput(): Promise<string> {
	return await Bun.stdin.text();
}

/**
 * メイン関数
 */
async function main(): Promise<void> {
	const options = parseOptions();

	if (options.verbose) {
		console.log(`📁 File: ${options.file || "stdin"}`);
	}

	let filePath: string | undefined;

	if (options.file) {
		// コマンドラインフラグで指定されたファイル
		filePath = options.file;
	} else {
		// stdin から hook 入力を読み込む
		try {
			const input = await readStdinInput();
			if (input) {
				const data = JSON.parse(input);
				filePath = data.tool_input?.file_path;
			}
		} catch {
			// stdin が空の場合や JSON パースエラーの場合は、何もしない
			process.exit(0);
		}
	}

	if (!filePath) {
		process.exit(0);
	}

	const success = await sortPermissionsFile(filePath);

	if (!success) {
		process.exit(1);
	}

	process.exit(0);
}

main().catch((error) => {
	console.error("Unexpected error:", error);
	process.exit(1);
});
