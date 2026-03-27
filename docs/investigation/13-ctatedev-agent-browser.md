# 調査: @ctatedev のポスト - Vercel agent-browser (AI エージェント用ブラウザ CLI)

## 調査対象

https://x.com/ctatedev/status/2028960626685386994

## 著者・ツールについて

@ctatedev (Chris Tate) は Vercel のエンジニアで、**agent-browser** プロジェクトの作者です。このポストは agent-browser の `--native` フラグの追加について言及していると考えられます。

## agent-browser について

**Vercel agent-browser** は AI エージェント専用のヘッドレスブラウザ自動化 CLI です。

- GitHub: https://github.com/vercel-labs/agent-browser
- ドキュメント: https://agent-browser.dev/

## 効用・ユースケース

- AI エージェント（Claude、Gemini、OpenAI Codex など）がブラウザを操作できる
- Web アプリの自動テスト・QA
- AI によるブラウザ操作タスクの自動化
- LLM に Web の「目と手」を与える

## メリット

- **トークン効率**: フル HTML/DOM の代わりにアクセシビリティツリー（スナップショット+refs）を出力。Playwright MCP 比で 90-93% のトークン削減
- **高速**: Rust 製 CLI で即時起動、永続的なブラウザデーモンで繰り返しコマンドが高速
- **クロスプラットフォーム**: macOS、Linux、Windows 対応
- **50 以上のコマンド**: ナビゲーション、クリック、入力、スクリーンショット、セッション管理等
- **セッション分離**: 並列セッションで独立したブラウザ環境
- **npm でインストール可能**: `npm install -g agent-browser`
- **`--native` フラグ**: Node.js なしで直接 CDP と通信（実験的）

## デメリット・注意点

- **AI エージェント専用設計**: 従来の Web テスト自動化ツールとは異なるアプローチ
- **Rust ネイティブデーモンは実験的**: ほとんどのユースケースは Node.js デーモン経由
- **Chromium 必要**: `agent-browser install` で Chromium をダウンロードする必要あり

## インストール方法

```bash
npm install -g agent-browser
agent-browser install  # Chromium をダウンロード
agent-browser open example.com
agent-browser snapshot -i
agent-browser click @e2
```

## 判断のポイント

Claude Code 等の AI エージェントにブラウザ操作能力を持たせたい場合、または AI を使った Web テスト自動化を検討している場合は導入価値が高い。dotfiles での alias 設定や shell 関数として組み込むことができる。
