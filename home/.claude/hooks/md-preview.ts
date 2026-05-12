#!/usr/bin/env bun
export {};

import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { basename, extname, join, resolve } from "node:path";

// PostToolUse:Edit|Write|MultiEdit hook: 編集された Markdown を HTML 化してブラウザで自動表示する。
//
// 対象: dotfiles/plans/**/*.md, dotfiles/docs/**/*.md, ~/prj/**/*.md のみ。
// 出力先: dotfiles 配下は同階層 (.gitignore 済み)、それ以外は tmpdir に逃がす。
// 50KB 超は素 HTML のみで終了。それ以下なら double-fork した bash 経由で
// claude -p に fancy HTML を生成させ、完了後に同パスへ atomic move + open。
// Haiku が失敗しても素 HTML は必ず open される (`|| true` で継続)。

const ALLOWED_PREFIXES = [
  resolve(homedir(), "dotfiles", "plans") + "/",
  resolve(homedir(), "dotfiles", "docs") + "/",
  resolve(homedir(), "prj") + "/",
];

// basename を toLowerCase() で正規化してから比較するため、Set 側も小文字で持つ
const EXCLUDED_BASENAMES = new Set([
  "readme.md",
  "claude.md",
  "agents.md",
  "gemini.md",
  "changelog.md",
  "memory.md",
  "license.md",
]);

const FANCY_SIZE_LIMIT_BYTES = 50 * 1024;

const DOTFILES_PREFIX = resolve(homedir(), "dotfiles") + "/";

// dotfiles 配下は同階層に出力 (.gitignore 済み)。他リポジトリでは tmpdir に逃がして
// 生成 HTML が誤コミット対象にならないようにする。
export function htmlPathFor(absPath: string): string {
  if (absPath.startsWith(DOTFILES_PREFIX)) {
    return absPath.replace(/\.md$/i, ".html");
  }
  const hash = createHash("sha1").update(absPath).digest("hex").slice(0, 12);
  return join(tmpdir(), `md-preview-${hash}.html`);
}

export function isTargetPath(absPath: string): boolean {
  if (extname(absPath).toLowerCase() !== ".md") return false;
  if (EXCLUDED_BASENAMES.has(basename(absPath).toLowerCase())) return false;
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

function spawnFancy(htmlPath: string, mdSource: string, srcPath: string): void {
  const ts = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const promptTmp = join(tmpdir(), `md-preview-${ts}.prompt`);
  const htmlTmp = `${htmlPath}.${ts}.tmp`;
  writeFileSync(promptTmp, FANCY_PROMPT + mdSource);

  // パス類はすべて env 経由で渡し、shell 内では "$VAR" 形式で参照する。
  // (tmpdir/homedir 由来の文字列に bash 特殊文字が混じっても安全に扱うため。)
  // SRC_MTIME_AT_START を保存しておき、Haiku 完了時点で source mtime が
  // 変わっていたら mv をスキップする (連続編集時に古い fancy で上書きされる race を抑止)。
  const childScript = `
trap 'rm -f "$PROMPT_TMP" "$HTML_TMP"' EXIT
SRC_MTIME_AT_START=$(stat -f %m "$SRC_PATH" 2>/dev/null || echo 0)
cat "$PROMPT_TMP" | claude -p --model haiku --output-format text --allowed-tools "" > "$HTML_TMP" 2>/dev/null || true
# Haiku がコードフェンスで返すケースがあるため除去
sed -i '' -e '1{/^[[:space:]]*\`\`\`/d;}' -e '\${/^[[:space:]]*\`\`\`[[:space:]]*$/d;}' "$HTML_TMP" 2>/dev/null || true
CURRENT_MTIME=$(stat -f %m "$SRC_PATH" 2>/dev/null || echo 0)
if [ -s "$HTML_TMP" ] \\
   && head -c 128 "$HTML_TMP" | grep -qi '<!doctype' \\
   && tail -c 64 "$HTML_TMP" | grep -qi '</html>' \\
   && [ "$SRC_MTIME_AT_START" = "$CURRENT_MTIME" ]; then
  mv "$HTML_TMP" "$HTML_PATH"
fi
open "$HTML_PATH"
`;

  // macOS には setsid がないため double-fork でセッションを切り離す
  const detachedScript = `( ${childScript} ) >/dev/null 2>&1 &`;
  const proc = Bun.spawn({
    cmd: ["bash", "-c", detachedScript],
    env: {
      ...process.env,
      PROMPT_TMP: promptTmp,
      HTML_TMP: htmlTmp,
      HTML_PATH: htmlPath,
      SRC_PATH: srcPath,
    },
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

    const mdSource = await Bun.file(absPath).text();
    const htmlPath = htmlPathFor(absPath);

    writeFileSync(htmlPath, plainHtml(mdSource, absPath));

    const sizeBytes = Buffer.byteLength(mdSource, "utf8");
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

    spawnFancy(htmlPath, mdSource, absPath);
  } catch {
    process.exit(0);
  }
}

if (import.meta.main) {
  await main();
}
