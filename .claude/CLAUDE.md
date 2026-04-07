# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

グローバル CLAUDE.md の内容を補完し、矛盾する場合はこのファイルが優先されます。

## コマンド

```bash
./setup/setup.sh            # フルセットアップ実行
mise run macos:check        # macOS defaults変更検出
mise run macos:apply        # macOS設定適用
bun scripts/development/lint-format.ts  # oxlint + dprint + shfmt + shellcheck

# Nix（パッケージ管理）
cd nix && ./update-nixpkgs.sh            # nixpkgs 更新（1週間遅延、安定版取得）
cd nix && ./update-nixpkgs.sh --days 14  # 遅延日数を変更する場合
cd nix && darwin-rebuild switch --flake . # Nix パッケージ適用
cd nix && darwin-rebuild switch --rollback # ロールバック
```

## ディレクトリ構造

```
home/             # デプロイ元テンプレート → setup/04_symlinks.sh で ~/ へ symlink
  .claude/        # Claude Code設定（agents, rules, skills, hooks）→ ~/.claude/ へ
  config/         # XDG設定（ghostty, nvim, yazi, zsh等）→ ~/.config/ へ
nix/              # Nix パッケージ管理（nix-darwin + flakes, aarch64-darwin）
  flake.nix       # エントリポイント（hosts/ から全ホストを自動検出）
  flake.lock      # バージョン固定（自動生成、gitコミット対象）
  hosts/          # ホスト別設定（common.nix + ホスト固有）
setup/            # 番号付きセットアップスクリプト（01-04基盤, 10-開発, 20-AI）
  Brewfile        # Homebrew パッケージ定義（GUI/Nix未移行分）
scripts/          # 開発・運用ツール（TypeScript/Bun）
  development/    # lint-format, compare-dirs 等
  git/            # カスタムgitコマンド群
  media/          # 画像・動画変換ツール
  system/         # macOS設定・SSH・ZIP等
.claude/          # 実行時状態（セッション、メモリ、プラン）※gitignore対象
```

## ツールチェーン

- **Runtime:** Bun
- **タスクランナー:** mise
- **Lint:** oxlint (TS/JS), shellcheck (shell)
- **Format:** dprint (MD/YAML/TOML) + shfmt (shell)
- **Zsh プラグイン:** sheldon
- **パッケージ:** Nix (nix-darwin, CLIツール) + Homebrew (setup/Brewfile, GUI/Nix未移行分)

## 設計原則

macOS専用・個人用途・GitHub公開リポジトリ。Linux/Windows互換性、マルチユーザー対応、エンタープライズ要件は考慮不要。

### 1. Mac専用前提

- BSD系コマンドをそのまま使用（`stat -f%z`, `readlink`, `grep -E` 等）
- macOS標準zshのビルトイン機能を活用
- GNU coreutils の存在チェックやポータビリティ分岐は不要

### 2. YAGNI（You Aren't Gonna Need It）

明日使う予定がない機能は実装しない。過剰な抽象化・汎用化を避け、動作する最小限のコードを書く。

### 3. 実用性重視（80%ルール）

- 80%のユースケースをカバーすれば十分
- 全エッジケースの網羅、完璧なエラーハンドリング、詳細すぎるログは不要
- 例: タイムアウトは基本チェックのみ、パスバリデーションは基本サニタイズのみ

## セキュリティ方針

個人環境・単一ユーザー前提。TOCTOU、権限昇格、競合状態は対応不要。

- **認証情報保護**: .gitignore + `chmod 600` + `umask 077`
- **入力検証**: 基本的なサニタイズ（`${value//[^a-zA-Z0-9_-]/}`）で十分
- 詳細な脅威モデリング・多層防御は過剰

## テスト方針

手動テストのみ。自動テスト（CI/CD、bats-core等）は導入しない。
