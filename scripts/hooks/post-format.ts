#!/usr/bin/env bun
export {};

// PostToolUse hook: auto-format files after Edit|Write
// stdin: { tool_name, tool_input: { file_path } }

const FORMATTABLE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".sh",
  ".bash",
  ".md",
  ".mdx",
  ".yaml",
  ".yml",
  ".toml",
]);

function getExtension(filePath: string): string {
  const dot = filePath.lastIndexOf(".");
  return dot === -1 ? "" : filePath.slice(dot).toLowerCase();
}

async function main() {
  try {
    const stdinText = await Bun.stdin.text();
    if (!stdinText) process.exit(0);

    const input = JSON.parse(stdinText);
    const filePath: string | undefined = input.tool_input?.file_path;

    if (!filePath) process.exit(0);

    const ext = getExtension(filePath);
    if (!FORMATTABLE_EXTENSIONS.has(ext)) process.exit(0);

    // Exclude settings.json (handled by sort-permissions.ts)
    if (
      filePath.endsWith(".claude/settings.json") ||
      filePath.endsWith(".claude/settings.local.json")
    ) {
      process.exit(0);
    }

    const proc = Bun.spawnSync({
      cmd: [
        "bun",
        `${process.env["HOME"]}/dotfiles/scripts/development/lint-format.ts`,
        "--file",
        filePath,
        "--mode=fix",
      ],
      stdout: "ignore",
      stderr: "pipe",
    });

    if (proc.exitCode !== 0) {
      const stderr = new TextDecoder().decode(proc.stderr);
      if (stderr) console.error(`[post-format] ${stderr.slice(0, 200)}`);
    }
  } catch {
    // Format failure is non-fatal — exit silently
    process.exit(0);
  }
}

await main();
