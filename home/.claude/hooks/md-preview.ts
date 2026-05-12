#!/usr/bin/env bun
export {};

import { existsSync, statSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { basename, extname, join, resolve } from "node:path";

// PostToolUse:Edit|Write|MultiEdit hook: 編集された Markdown を HTML 化してブラウザで自動表示する。
//
// 対象: dotfiles/plans/**/*.md, dotfiles/docs/**/*.md, ~/prj/**/*.md のみ。
// 流れ:
//   (1) フォールバック用の素 HTML (CDN marked.js 利用) を必ず先に書く
//   (2) MD が 50KB を超えるなら素 HTML を即 open して終了
//   (3) 50KB 以下なら setsid -f で claude -p をバックグラウンド実行。
//       生成された fancy HTML で上書きしたあと、子プロセス側で open

const ALLOWED_PREFIXES = [
  resolve(homedir(), "dotfiles", "plans") + "/",
  resolve(homedir(), "dotfiles", "docs") + "/",
  resolve(homedir(), "prj") + "/",
];

const EXCLUDED_BASENAMES = new Set([
  "README.md",
  "CLAUDE.md",
  "AGENTS.md",
  "GEMINI.md",
  "CHANGELOG.md",
  "MEMORY.md",
  "LICENSE.md",
]);

const FANCY_SIZE_LIMIT_BYTES = 50 * 1024;

export function isTargetPath(absPath: string): boolean {
  if (extname(absPath).toLowerCase() !== ".md") return false;
  if (EXCLUDED_BASENAMES.has(basename(absPath))) return false;
  if (absPath.includes("/node_modules/")) return false;
  return ALLOWED_PREFIXES.some((p) => absPath.startsWith(p));
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function plainHtml(mdSource: string, sourcePath: string): string {
  const safeMd = mdSource.replace(/<\/script/gi, "<\\/script");
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(basename(sourcePath))}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css@5/github-markdown-light.css" />
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dompurify@3/dist/purify.min.js"></script>
<style>
  body { box-sizing: border-box; max-width: 980px; margin: 0 auto; padding: 32px; }
  .source { font-family: ui-monospace, monospace; font-size: 11px; color: #888; margin-bottom: 16px; }
</style>
</head>
<body class="markdown-body">
<div class="source">${escapeHtml(sourcePath)}</div>
<div id="content"></div>
<script id="raw" type="text/markdown">${safeMd}</script>
<script>
  const raw = document.getElementById("raw").textContent;
  document.getElementById("content").innerHTML = DOMPurify.sanitize(marked.parse(raw));
</script>
</body>
</html>
`;
}

const FANCY_PROMPT = `あなたは Markdown をインフォグラフィック風 HTML に変換する専門家です。以下のルールを厳守してください:
- **応答全体は <!DOCTYPE html> で始まり </html> で終わる完全な HTML ドキュメントのみ**
- ファイル保存、コマンド実行、説明文、挨拶、コードフェンス(\`\`\`)は一切含めない。HTML 以外のテキストを 1 文字でも出力したら失敗とみなす
- draw.io スタイルの図、SVG アイコン、CSS アニメーション、グラデーションを活用
- 情報を流麗にビジュアライズしたインフォグラフィック風デザイン
- 単一 HTML ファイルで完結（外部リソース参照なし、インライン <style> のみ）
- アクセシブルなコントラストとセマンティックな <h1>-<h3>

直ちに HTML を標準出力に書き始めてください。変換対象の Markdown:

`;

function spawnFancy(htmlPath: string, mdSource: string): void {
  const ts = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const promptTmp = join(tmpdir(), `md-preview-${ts}.prompt`);
  const htmlTmp = `${htmlPath}.${ts}.tmp`;
  writeFileSync(promptTmp, FANCY_PROMPT + mdSource);

  const childScript = `
trap 'rm -f ${JSON.stringify(promptTmp)} ${JSON.stringify(htmlTmp)}' EXIT
cat ${JSON.stringify(promptTmp)} | claude -p --model haiku --output-format text --allowed-tools "" > ${JSON.stringify(htmlTmp)} 2>/dev/null || exit 0
# Haiku がコードフェンスで返すケースがあるため除去
sed -i '' -e '1{/^[[:space:]]*\`\`\`/d;}' -e '\${/^[[:space:]]*\`\`\`[[:space:]]*$/d;}' ${JSON.stringify(htmlTmp)} 2>/dev/null || true
if [ -s ${JSON.stringify(htmlTmp)} ] \\
   && head -c 128 ${JSON.stringify(htmlTmp)} | grep -qi '<!doctype' \\
   && tail -c 64 ${JSON.stringify(htmlTmp)} | grep -qi '</html>'; then
  mv ${JSON.stringify(htmlTmp)} ${JSON.stringify(htmlPath)}
fi
open ${JSON.stringify(htmlPath)}
`;

  // macOS には setsid がないため double-fork でセッションを切り離す
  const detachedScript = `( ${childScript} ) >/dev/null 2>&1 &`;
  const proc = Bun.spawn({
    cmd: ["bash", "-c", detachedScript],
    stdin: "ignore",
    stdout: "ignore",
    stderr: "ignore",
  });
  proc.unref?.();
}

async function main() {
  try {
    const stdinText = await Bun.stdin.text();
    if (!stdinText) process.exit(0);

    const input = JSON.parse(stdinText);
    const filePath: string | undefined = input.tool_input?.file_path;
    if (!filePath) process.exit(0);

    const absPath = resolve(filePath);
    if (!isTargetPath(absPath)) process.exit(0);
    if (!existsSync(absPath)) process.exit(0);

    const mdSource = await Bun.file(absPath).text();
    const htmlPath = absPath.replace(/\.md$/i, ".html");

    writeFileSync(htmlPath, plainHtml(mdSource, absPath));

    const sizeBytes = statSync(absPath).size;
    if (sizeBytes > FANCY_SIZE_LIMIT_BYTES) {
      const proc = Bun.spawn({
        cmd: ["open", htmlPath],
        stdin: "ignore",
        stdout: "ignore",
        stderr: "ignore",
      });
      proc.unref?.();
      process.exit(0);
    }

    spawnFancy(htmlPath, mdSource);
  } catch {
    process.exit(0);
  }
}

if (import.meta.main) {
  await main();
}
