# 調査: googleworkspace/cli (gws) - Google Workspace CLI

## 調査対象

https://github.com/googleworkspace/cli

## 概要

**gws** は Google Workspace の全 API を一つの CLI で操作できるツールです。Drive、Gmail、Calendar などの Workspace API をゼロボイラープレートで扱えます。人間と AI エージェントの両方向けに設計されており、40 以上のエージェントスキルが付属しています。

Google 自身の Discovery Service をランタイムで読み込み、コマンドセット全体を動的に生成します。Google Workspace が新しい API エンドポイントを追加すると、gws が自動的に取得します。

## 効用・ユースケース

- コマンドラインから Gmail、Drive、Calendar を直接操作できる
- AI エージェント（Claude Code など）のスキルとして組み込める
- スクリプトやパイプラインとの統合が容易（JSON 形式の構造化出力）
- 複数の Google Workspace サービスを統一インターフェースで操作

## メリット

- **セットアップが簡単**: `npm install -g @googleworkspace/cli` でインストール可能
- **包括的な API カバレッジ**: Google Workspace の全 API を一つの CLI で操作
- **AI エージェント統合**: 40 以上の組み込みエージェントスキルで Claude Code 等と連携しやすい
- **自動更新**: Google が新 API エンドポイントを追加すると自動的に取得
- **Node.js 18+ のみ必要**: 依存関係が少ない

## デメリット・注意点

- **非公式**: これは Google の公式サポートプロダクトではない
- **Google Cloud Project が必要**: OAuth 認証のために GCP プロジェクトを作成する必要がある
- **v1.0 未満**: 現在も活発に開発中のため破壊的変更が起こりうる
- **認証設定**: OAuth の初期設定に手間がかかる可能性がある
- **dotfiles での活用**: 個人の dotfiles リポジトリで使う場合、認証情報の管理に注意が必要

## 判断のポイント

Google Workspace を日常的に使っている場合、特に自動化や AI エージェントとの統合を検討しているなら導入価値が高い。ただし非公式ツールのため、本番用途での使用は慎重に。
