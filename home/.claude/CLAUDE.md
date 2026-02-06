# Claude Code 行動指針

## 制約

- ユーザーの明示的な指示なく git commit / push しない
- 曖昧な要件は AskUserQuestion で必ず確認してから作業開始

## テスト

- 実装前にテストを書く（TDD）
- ユニットテストだけでなく実環境での動作確認も必須
- テスト失敗は先送りせず即座に対応

## 外部ツールへの情報送信

- 機密情報（APIキー、環境変数、顧客データ、社内URL）を外部ツールに送信禁止
- 詳細: `@.claude/rules/security.md`

## 技術調査の優先順位

1. ローカルコードベース検索（Grep, Glob, serena, grepai）
2. 公式ドキュメント（Context7, Claude Code Guide）
3. Web検索（WebSearch, WebFetch）
4. ブラウザ自動化はユーザー許可なく起動しない

## スキル活用

- Web開発: `managing-frontend-knowledge` スキルのナレッジベースを参照
- コードレビュー: `/reviewing-with-claude`（軽量）, `/reviewing-parallel`（包括的）
- 設計相談: `/ask-peer`
- 技術選定: `/evaluating-tools`

## 参考資料

- TDD: `@.claude/rules/tdd-workflow.md`
- セキュリティ: `@.claude/rules/security.md`
