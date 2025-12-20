import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	copyHook,
	getHookFiles,
	hasGithooksDir,
	isGitRepository,
} from "./setup-git-hooks";

describe("setup-git-hooks", () => {
	let testDir: string;
	let originalCwd: string;

	beforeEach(() => {
		testDir = join(tmpdir(), `setup-git-hooks-test-${Date.now()}`);
		mkdirSync(testDir, { recursive: true });
		originalCwd = process.cwd();
		process.chdir(testDir);
	});

	afterEach(() => {
		process.chdir(originalCwd);
		if (existsSync(testDir)) {
			rmSync(testDir, { recursive: true, force: true });
		}
	});

	describe("isGitRepository", () => {
		test(".gitディレクトリが存在する場合はtrueを返す", () => {
			mkdirSync(join(testDir, ".git"), { recursive: true });
			expect(isGitRepository()).toBe(true);
		});

		test(".gitディレクトリが存在しない場合はfalseを返す", () => {
			expect(isGitRepository()).toBe(false);
		});
	});

	describe("hasGithooksDir", () => {
		test(".githooksディレクトリが存在する場合はtrueを返す", () => {
			mkdirSync(join(testDir, ".githooks"), { recursive: true });
			expect(hasGithooksDir()).toBe(true);
		});

		test(".githooksディレクトリが存在しない場合はfalseを返す", () => {
			expect(hasGithooksDir()).toBe(false);
		});
	});

	describe("getHookFiles", () => {
		test(".githooksディレクトリ内のファイルを取得する", () => {
			const githooksDir = join(testDir, ".githooks");
			mkdirSync(githooksDir, { recursive: true });
			writeFileSync(join(githooksDir, "pre-commit"), "#!/bin/bash\necho test");
			writeFileSync(join(githooksDir, "commit-msg"), "#!/bin/bash\necho msg");

			const files = getHookFiles();
			expect(files.sort()).toEqual(["commit-msg", "pre-commit"]);
		});

		test(".githooksディレクトリが存在しない場合は空配列を返す", () => {
			const files = getHookFiles();
			expect(files).toEqual([]);
		});

		test("空の.githooksディレクトリの場合は空配列を返す", () => {
			const githooksDir = join(testDir, ".githooks");
			mkdirSync(githooksDir, { recursive: true });

			const files = getHookFiles();
			expect(files).toEqual([]);
		});
	});

	describe("copyHook", () => {
		test("フックファイルをコピーする", async () => {
			// .githooksディレクトリを作成
			const githooksDir = join(testDir, ".githooks");
			mkdirSync(githooksDir, { recursive: true });
			writeFileSync(join(githooksDir, "pre-commit"), "#!/bin/bash\necho test");

			// .git/hooksディレクトリを作成
			const gitHooksDir = join(testDir, ".git", "hooks");
			mkdirSync(gitHooksDir, { recursive: true });

			const result = await copyHook("pre-commit");
			expect(result).toBe(true);

			// コピーされたファイルを確認
			const copiedFile = join(gitHooksDir, "pre-commit");
			expect(existsSync(copiedFile)).toBe(true);
			expect(readFileSync(copiedFile, "utf-8")).toBe("#!/bin/bash\necho test");

			// 実行権限を確認（Unix系のみ）
			if (process.platform !== "win32") {
				const stats = statSync(copiedFile);
				const isExecutable = (stats.mode & 0o111) !== 0;
				expect(isExecutable).toBe(true);
			}
		});

		test("存在しないファイルの場合はfalseを返す", async () => {
			// .git/hooksディレクトリを作成
			const gitHooksDir = join(testDir, ".git", "hooks");
			mkdirSync(gitHooksDir, { recursive: true });

			const result = await copyHook("nonexistent");
			expect(result).toBe(false);
		});
	});
});
