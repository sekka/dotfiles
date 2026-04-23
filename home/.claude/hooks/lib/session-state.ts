import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function sessionDir(sessionId: string): string {
  const dir = join("/tmp", `claude-hooks-${sessionId}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function readJson<T>(filePath: string, defaultVal: T): T {
  try {
    return JSON.parse(readFileSync(filePath, "utf-8")) as T;
  } catch {
    return defaultVal;
  }
}

export function writeJson(filePath: string, data: unknown): void {
  writeFileSync(filePath, JSON.stringify(data), "utf-8");
}

export function readNumber(filePath: string, defaultVal: number): number {
  try {
    const n = parseInt(readFileSync(filePath, "utf-8").trim(), 10);
    return isNaN(n) ? defaultVal : n;
  } catch {
    return defaultVal;
  }
}

export function writeNumber(filePath: string, value: number): void {
  writeFileSync(filePath, String(value), "utf-8");
}
