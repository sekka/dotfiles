#!/usr/bin/env bun
// Sort permissions in .claude/settings.json and .claude/settings.local.json

import { copyFileSync, existsSync, lstatSync, symlinkSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Recursively sort all arrays in a JSON value alphabetically.
 * Objects and primitives are left unchanged.
 */
export function sortArraysInJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return [...value].sort().map(sortArraysInJson);
  }
  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result[k] = sortArraysInJson(v);
    }
    return result;
  }
  return value;
}

/**
 * If Claude Code overwrote ~/.claude/settings.json with a regular file,
 * copy content back to dotfiles source and recreate the symlink.
 */
export function repairSymlinkIfNeeded(filePath: string): void {
  const home = process.env.HOME ?? "";
  const liveFile = resolve(home, ".claude/settings.json");
  const dotfilesSource = resolve(home, "dotfiles/home/.claude/settings.json");

  // Only repair the well-known live path
  if (resolve(filePath) !== liveFile) {
    return;
  }

  try {
    const stat = lstatSync(liveFile);
    const isRegularFile = stat.isFile() && !stat.isSymbolicLink();

    if (isRegularFile && existsSync(dotfilesSource)) {
      copyFileSync(liveFile, dotfilesSource);
      unlinkSync(liveFile);
      symlinkSync(dotfilesSource, liveFile);
      console.log(`✓ Repaired symlink: ~/.claude/settings.json -> ${dotfilesSource}`);
    }
  } catch (e) {
    console.error(`⚠ Symlink repair failed: ${e}`);
  }
}

/**
 * Sort permission arrays in a JSON settings file.
 * Returns 0 on success, 1 on error.
 */
export async function sortPermissions(filePath: string): Promise<number> {
  repairSymlinkIfNeeded(filePath);

  // Validate target file name
  if (!/.claude\/settings(\.local)?\.json$/.test(filePath)) {
    return 0; // Not a target file, skip silently
  }

  // Skip if file does not exist
  if (!existsSync(filePath)) {
    return 0;
  }

  let original: string;
  let parsed: unknown;

  try {
    original = await Bun.file(filePath).text();
    parsed = JSON.parse(original);
  } catch {
    return 1;
  }

  const sorted = sortArraysInJson(parsed);

  // Preserve trailing newline behaviour: add one if original had one
  const trailingNewline = original.endsWith("\n") ? "\n" : "";
  const result = JSON.stringify(sorted, null, 2) + trailingNewline;

  if (result === original) {
    console.log(`✓ Already sorted: ${filePath}`);
    return 0;
  }

  try {
    await Bun.write(filePath, result);
    console.log(`✓ Sorted permissions in ${filePath}`);
  } catch {
    console.error(`✗ Failed to update ${filePath}`);
    return 1;
  }

  return 0;
}

if (import.meta.main) {
  const args = process.argv.slice(2);

  let filePath = "";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--file" && args[i + 1]) {
      filePath = args[i + 1];
      break;
    }
    if (args[i]?.startsWith("--file=")) {
      filePath = args[i].slice("--file=".length);
      break;
    }
  }

  if (!filePath) {
    process.exit(0);
  }

  const code = await sortPermissions(filePath);
  process.exit(code);
}
