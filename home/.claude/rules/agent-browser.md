# agent-browser - ブラウザ操作の第一選択

## いつ使うか（自発的に提案してよい場面）

以下の場面では agent-browser の使用をユーザーに提案する:

- フロントエンド変更後の**視覚的検証**（スクリーンショット・diff）
- Web UIのデバッグ（要素の状態確認、ネットワーク通信）
- フォーム操作やログインフローのテスト
- ページからのデータ抽出
- E2Eテスト的な動作確認

## 基本ワークフロー

Navigate → Snapshot → Interact → Re-snapshot → Verify → **Close**

```bash
agent-browser open <url>         # ページを開く
agent-browser snapshot -i        # 対話要素を取得（@ref付き、トークン効率最良）
agent-browser click @e1          # ref指定で操作
agent-browser snapshot -i        # DOM変更後は必ず再取得（refが無効化するため）
agent-browser screenshot         # 結果を視覚的に確認
agent-browser close              # 必ず閉じる
```

## ツール選択基準

| 場面 | ツール | 理由 |
|------|--------|------|
| 新規ページ操作・検証・スクレイピング | **agent-browser** | トークン効率最良 |
| 変更前後の視覚比較 | **agent-browser** | `diff snapshot` / `diff screenshot` |
| 既存Chromeタブの検査・DevTools | **chrome-devtools MCP** | 開いているタブへの接続 |
| Playwright テストランナー・codegen | **Playwright MCP** | テスト統合 |

## 注意

- ref は DOM 変更後に無効 → 操作後は必ず `snapshot -i` を再実行
- `snapshot -i` を基本とする。`-s "#selector"` でスコープ限定も可
- 各セッション終了時は必ず `agent-browser close` を実行する
