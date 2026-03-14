# ブラウザ自動化 - ツール選択基準

## いつブラウザ自動化を使うか

以下の場合、確認なしでブラウザ自動化ツールを使用する：

- ユーザーがURL（x.com, twitter.com, その他Webページ）を共有し、内容の確認・参照を求めた場合
- WebFetchで取得できないページ（SPA、認証壁、JS描画）の内容が必要な場合
- Webページの視覚的な確認が必要な場合

**「アクセスできません」「確認できません」と返答してはならない。** ブラウザツールで取得を試みること。

## ツール選択

| 場面 | ツール | 理由 |
|------|--------|------|
| トークン効率重視の操作（大量ページ巡回、スクレイピング） | **pinchtab** | compact format で最小トークン消費 |
| 変更前後の視覚比較・回帰テスト | **agent-browser** | `snapshot diff` / `screenshot diff` |
| AI向けスクリーンショット注釈 | **agent-browser** | `screenshot --annotate` |
| 既存Chromeタブの検査・DevTools（ヘッドレス） | **chrome-devtools MCP** (`--headless`) | 開いているタブへの接続、UIなし |
| Playwright テストランナー・codegen | **Playwright MCP** | テスト統合 |
| ログイン済みセッションでの操作 | **chrome-devtools MCP** (`--autoConnect`) | Chrome 144+、ライブセッションに接続 |
| Node.jsスクリプトからの操作 | **Playwright（ヘッドレス）** → MCP fallback | スキル等のスクリプト内使用、MCPはフォールバック |

迷ったら **pinchtab** を使う（トークン効率が高い）。

## pinchtab 基本ワークフロー

Start → Navigate → Snapshot → Interact → Re-snapshot → Verify

```bash
pinchtab &                  # サーバー起動（ポート 9867）
pinchtab health             # 起動確認（失敗時はサーバーがまだ起動中）
pinchtab nav <url>          # ページを開く
pinchtab snap -i -c         # 対話要素を取得（interactive + compact）
pinchtab click e5           # ref指定で操作
pinchtab snap -i -c         # DOM変更後は再取得
pinchtab text               # テキスト取得（~800 tokens）
pinchtab ss -o page.jpg     # スクリーンショット
```

## agent-browser 基本ワークフロー

Navigate → Snapshot → Interact → Re-snapshot → Verify → **Close**

```bash
agent-browser open <url>         # ページを開く
agent-browser snapshot -i        # 対話要素を取得（@ref付き）
agent-browser click @e1          # ref指定で操作
agent-browser snapshot -i        # DOM変更後は必ず再取得
agent-browser screenshot         # 結果を視覚的に確認
agent-browser close              # 必ず閉じる
```

## chrome-devtools MCP

**ヘッドレスモードを使用すること。** chrome-devtools MCPを使う際は、UIが不要な場合（URL閲覧、スクレイピング、スナップショット取得等）は必ずヘッドレスで起動する。

**セットアップ（ヘッドレス・デフォルト）:**
```bash
claude mcp add chrome-devtools -- npx -y chrome-devtools-mcp@latest --headless
```

**ライブセッション接続（`--autoConnect`）:**
Chrome 144+のリモートデバッグ経由でログイン済みセッションに接続する場合のみ。

**有効化:**
`chrome://inspect/#remote-debugging` → "Allow remote debugging" を有効化

```bash
claude mcp add chrome-devtools -- npx -y chrome-devtools-mcp@latest --autoConnect
```

## Node.jsスクリプト内でのブラウザ操作

Playwright（ヘッドレス）を優先。`require('playwright')` が利用不可の場合はMCPにフォールバック。

```javascript
// Playwright ヘッドレス（優先）
const { chromium } = require('playwright');
const browser = await chromium.launch({ headless: true });
// ... 操作 ...
await browser.close();

// MCP フォールバック（Playwright利用不可時）
// mcp__plugin_playwright_playwright__browser_navigate を使用
```

## 共通の注意

- ref は DOM 変更後に無効 → 操作後は snapshot を再実行
- pinchtab: サーバーが既に起動中なら `pinchtab &` は不要
- agent-browser: セッション終了時は必ず `close`
