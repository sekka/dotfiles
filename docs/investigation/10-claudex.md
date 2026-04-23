# 調査: EdamAme-x/claudex - Claude Code を OpenAI 互換エンドポイントで実行

## 調査対象

https://github.com/EdamAme-x/claudex

## 概要

**claudex** は Bun ベースのランチャーで、Claude Code を OpenAI 互換エンドポイントに対して実行させるツールです。OpenAI Codex の auth ファイル（`~/.codex/auth.json`）を使用し、Claude Code を別のモデルプロバイダーと組み合わせて動作させます。

## 主な機能

- Claude Code を OpenAI 互換エンドポイントで実行
- `--no-safe` フラグ: `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1` を無効化
- デフォルトはセーフモード（不要なトラフィックを無効化）
- 環境変数で柔軟に設定可能

## 環境変数

- `CLAUDEX_FORCE_MODEL`: 使用モデルを強制指定（デフォルト: `gpt-5.3-codex`）
- `CLAUDEX_DEFAULT_REASONING_EFFORT`: 推論努力レベル（デフォルト: `xhigh`）
- `CLAUDEX_UPSTREAM_BASE_URL`: エンドポイント URL の上書き
- `CLAUDEX_UPSTREAM_API_KEY`: API キーの上書き

## メリット

- **Claude Code + OpenAI Codex の組み合わせ**: Claude Code の UI/UX で Codex エンドポイントを使える
- **コスト最適化**: 別プロバイダーのエンドポイントを使うことでコストを調整できる可能性
- **Bun ベース**: 高速な起動と実行
- **バイナリ配布**: Releases からビルド済みバイナリをダウンロード可能

## デメリット・注意点

- **ニッチなユースケース**: Claude Code をすでに使っていて、かつ別エンドポイントを使いたい特定のケース向け
- **設定の複雑さ**: auth ファイルや設定ファイルの適切な設定が必要
- **メンテナンス状況**: 個人開発者のツールで長期サポートは不明
- **公式サポートなし**: Anthropic 非公式ツール

## 判断のポイント

Claude Code をすでに使っており、OpenAI Codex や他の OpenAI 互換エンドポイントと組み合わせたい特定のニーズがある場合に有用。一般的な Claude Code ユーザーには不要かもしれない。
