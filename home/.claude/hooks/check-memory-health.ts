/**
 * メモリ健全性チェック Hook (SessionStart)
 *
 * A) 毎回実行（軽量）: MEMORY.md のリンク切れチェック
 *    ~/.claude/projects/{project}/memory/MEMORY.md を読み込み
 *    Markdownリンク [title](file.md) のリンク先ファイルが存在するか確認。
 *    存在しないファイルがあれば警告を stdout に出力。
 *
 * B) 2週間おき（重量）: コードベースとの整合性チェック
 *    前回実行から14日以上経過していれば、手動確認を促すメッセージを出力。
 *    実行後に現在日時を ~/.claude/.memory-deep-check-last に記録。
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { Glob } from "bun";

const HOME = process.env["HOME"];
if (!HOME) {
  process.exit(0);
}

const DEEP_CHECK_LAST_FILE = join(HOME, ".claude", ".memory-deep-check-last");
const DEEP_CHECK_INTERVAL_MS = 14 * 24 * 60 * 60 * 1000; // 14日

/**
 * MEMORY.md からMarkdownリンクを抽出して返す
 * 形式: [title](file.md)
 */
export function extractLinks(content: string): string[] {
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = linkPattern.exec(content)) !== null) {
    const link = match[2];
    if (link !== undefined) links.push(link);
  }
  return links;
}

/**
 * A) MEMORY.md のリンク切れチェック
 */
function checkMemoryLinks(): void {
  const glob = new Glob(`${HOME}/.claude/projects/*/memory/MEMORY.md`);
  for (const memoryPath of glob.scanSync()) {
    let content: string;
    try {
      content = readFileSync(memoryPath, "utf-8");
    } catch {
      continue;
    }

    const links = extractLinks(content);
    const dir = dirname(memoryPath);

    for (const link of links) {
      // HTTPリンクはスキップ
      if (link.startsWith("http://") || link.startsWith("https://")) {
        continue;
      }
      const targetPath = join(dir, link);
      if (!existsSync(targetPath)) {
        console.log(
          `[メモリチェック] リンク切れ: ${memoryPath} → ${link} (ファイルが存在しません)`,
        );
      }
    }
  }
}

/**
 * B) 2週間おきのコードベース整合性チェック
 */
function checkDeepInterval(): void {
  let lastRun = 0;

  if (existsSync(DEEP_CHECK_LAST_FILE)) {
    try {
      const raw = readFileSync(DEEP_CHECK_LAST_FILE, "utf-8").trim();
      lastRun = Number.parseInt(raw, 10) || 0;
    } catch {
      // 読み取り失敗は無視
    }
  }

  const elapsed = Date.now() - lastRun;
  if (elapsed >= DEEP_CHECK_INTERVAL_MS) {
    console.log(
      "[メモリ深度チェック] 前回実行から14日以上経過。MEMORY.mdの内容がコードベースの現状と合っているか確認してください。\n`/rules-maintainer` を実行すると自動チェックできます。",
    );

    try {
      writeFileSync(DEEP_CHECK_LAST_FILE, String(Date.now()), { mode: 0o600 });
    } catch {
      // 書き込み失敗は無視
    }
  }
}

checkMemoryLinks();
checkDeepInterval();
