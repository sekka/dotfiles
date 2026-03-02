# ブラウザ自動化 - ツール選択基準

## ツール選択

| 場面 | ツール | 理由 |
|------|--------|------|
| トークン効率重視の操作（大量ページ巡回、スクレイピング） | **pinchtab** | compact format で最小トークン消費 |
| 変更前後の視覚比較・回帰テスト | **agent-browser** | `snapshot diff` / `screenshot diff` |
| AI向けスクリーンショット注釈 | **agent-browser** | `screenshot --annotate` |
| 既存Chromeタブの検査・DevTools | **chrome-devtools MCP** | 開いているタブへの接続 |
| Playwright テストランナー・codegen | **Playwright MCP** | テスト統合 |

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

## 共通の注意

- ref は DOM 変更後に無効 → 操作後は snapshot を再実行
- pinchtab: サーバーが既に起動中なら `pinchtab &` は不要
- agent-browser: セッション終了時は必ず `close`
