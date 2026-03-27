# 調査: @yoshiko_pg のポスト - difit (GitHub スタイルのローカル diff ビューア)

## 調査対象

https://x.com/yoshiko_pg/status/2029938566516855172

## 著者・ツールについて

@yoshiko_pg (よしこ) は東京在住のフロントエンド開発者で、React/TypeScript を専門としています。**difit** というツールの作者として知られています。

## difit について

**difit** は Git diff をブラウザ上で GitHub スタイルで表示するための軽量 CLI ツールです。

- GitHub: https://github.com/yoshiko-pg/difit

## 効用・ユースケース

- プッシュ前にローカルで GitHub 風の diff を確認できる
- AI コードレビュー（ChatGPT、Claude、Copilot）のためのプロンプト生成
- セルフレビューを視覚的・快適に実施
- PR 前のコード品質向上

## メリット

- **即座に使える**: `npx difit` で即座に起動、インストール不要
- **GitHub スタイル**: 馴染みのある UI でローカル diff を確認
- **AI 連携**: レビューコメントを AI プロンプトとしてエクスポート
- **多機能**: Markdown、Jupyter Notebook 対応
- **完全ローカル**: コードがマシン外に出ないのでプライバシー安全
- **MIT ライセンス**: オープンソース

## デメリット・注意点

- **Node.js 必要**: npm/npx が必要
- **特定の用途向け**: diff 確認以外の用途には使えない
- **ブラウザ起動**: ターミナルだけで完結しない（ブラウザが起動する）

## 使い方

```bash
npx difit          # 最新コミットの diff を表示
npx difit HEAD~3   # 特定コミットの diff
npx difit staged   # ステージ済みの変更を表示
npx difit working  # 未ステージの変更を表示
```

## 判断のポイント

PR 前のセルフレビューや AI レビューのワークフローに組み込みたい場合は非常に便利。dotfiles での git alias 設定や git hook への組み込みを検討できる。
