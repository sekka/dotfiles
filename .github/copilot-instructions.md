# GitHub Copilot Coding Agent Instructions

## プロジェクト概要

これは macOS 専用の個人 dotfiles リポジトリです。

## 重要な制約

- **macOS 専用**: BSD 系コマンドをそのまま使用（Linux 互換性不要）
- **個人用途**: マルチユーザー対応・エンタープライズ機能は不要
- **YAGNI 原則**: 現在必要な機能のみ実装、過剰な抽象化を避ける

## ディレクトリ構成

- `home/` — シンボリックリンクで `$HOME` に展開される設定ファイル群
- `scripts/` — セットアップ・ユーティリティスクリプト
- `setup/` — 環境構築スクリプト
- `tests/` — bats-core によるテスト
- `docs/` — ドキュメント

## コーディング規約

- シェルスクリプトは zsh/bash で記述
- インデントは 2 スペース
- ファイル先頭に `#!/usr/bin/env zsh` または `#!/usr/bin/env bash`
- エラーハンドリングは最低限でよい（個人用途のため）

## テスト

```bash
# bats-core でテスト実行
bats tests/unit/*.bats
bats tests/integration/*.bats
```

## セキュリティ

- 認証情報・シークレットをコミットしない
- `.gitignore` で機密ファイルを除外する
- ファイル権限は 600/700 を適切に設定する
