# 調査: @ryoppippi のポスト - ccusage (Claude Code 使用量追跡 CLI)

## 調査対象

https://x.com/ryoppippi/status/2028670064254447621

## 著者・ツールについて

@ryoppippi は TypeScript・Zig 専門の OSS 開発者で、**ccusage** の作者です。

## ccusage について

**ccusage** は Claude Code（および OpenAI Codex CLI）の使用量とコストをローカルの `.jsonl` ファイルから分析する CLI ツールです。

- GitHub: https://github.com/ryoppippi/ccusage
- npm: https://www.npmjs.com/package/ccusage

## 効用・ユースケース

- Claude Code の使用量・コストをセッション別・日別・月別で追跡
- AI エージェント利用の予算管理
- 複数プロジェクト間のコスト比較
- MCP サーバーとしてリアルタイムダッシュボードとして使用可能

## メリット

- **インストール不要**: `npx ccusage@latest` で即実行
- **プライバシー安全**: ローカルのログファイルのみ使用（外部通信なし）
- **多彩なレポート**: daily、monthly、session、blocks（5 時間請求ウィンドウ）等
- **複数エージェント対応**: Claude Code、OpenAI Codex、OpenCode、Pi-agent、Amp CLI 等
- **MCP サーバー**: `npx @ccusage/mcp@latest` でリアルタイムトラッキング
- **JSON 出力**: スクリプトやダッシュボードとの統合が容易

## デメリット・注意点

- **ローカルログ依存**: `~/.claude/projects/` の `.jsonl` ファイルが必要
- **Claude Code 必要**: Claude Code を使っていない場合は不要
- **読み取り専用**: あくまで分析ツールで、コスト削減機能はない

## 使い方

```bash
npx ccusage              # 日別レポート（デフォルト）
npx ccusage monthly      # 月別レポート
npx ccusage session      # セッション別レポート
npx ccusage blocks       # 5 時間請求ウィンドウレポート
npx ccusage daily --json # JSON 形式で出力
```

## 判断のポイント

Claude Code をすでに使っており、使用量・コストを把握・管理したい場合は非常に有用。インストール不要で即使えるため、試してみる価値が高い。dotfiles での alias 設定（例: `alias ccusage='npx ccusage@latest'`）を検討できる。
