#!/usr/bin/env bun

interface HookInput {
	tool_input: {
		file_path?: string;
	};
}

export function extractFilePath(input: string): string | null {
	try {
		const parsed: HookInput = JSON.parse(input);
		return parsed.tool_input?.file_path ?? null;
	} catch {
		return null;
	}
}

async function main() {
	const stdinText = await Bun.stdin.text();
	const filePath = extractFilePath(stdinText);

	if (!filePath) {
		process.exit(0);
	}

	Bun.spawnSync([
		"bun",
		`${process.env.HOME}/dotfiles/scripts/development/lint-format.ts`,
		"--mode=fix",
		`--file=${filePath}`,
	]);

	process.exit(0);
}

if (import.meta.main) {
	main();
}
