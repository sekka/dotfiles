# Playwright MCP 使用ルール

## 絶対的な禁止事項

### 1. いかなる形式のコード実行も禁止

- Python、JavaScript、Bash 等でのブラウザ操作
- MCP ツールを調査するためのコード実行
- subprocess やコマンド実行によるアプローチ

### 2. 利用可能なのは MCP ツールの直接呼び出しのみ

- `playwright:browser_navigate`
- `playwright:browser_screenshot`
- 他の Playwright MCP ツール

### 3. エラー時は即座に報告

- 回避策を探さない
- 代替手段を実行しない
- エラーメッセージをそのまま伝える
