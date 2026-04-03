# dotfiles プロジェクト固有ルール

このファイルは dotfiles プロジェクト固有の行動指針を定義します。グローバル CLAUDE.md の内容を補完し、矛盾する場合はこのファイルが優先されます。

## コマンド

```bash
./setup/setup.sh            # フルセットアップ実行
mise run macos:check        # macOS defaults変更検出
mise run macos:apply        # macOS設定適用
bun scripts/development/lint-format.ts  # oxlint + dprint + shfmt + shellcheck

# Nix（パッケージ管理）
cd nix && ./update-nixpkgs.sh            # nixpkgs 更新（2週間遅延、安定版取得）
cd nix && ./update-nixpkgs.sh --days 7   # 遅延日数を変更する場合
cd nix && darwin-rebuild switch --flake . # Nix パッケージ適用
cd nix && darwin-rebuild switch --rollback # ロールバック
```

## ディレクトリ構造

```
home/             # デプロイ元テンプレート → ~/ へ symlink
  .claude/        # Claude Code設定テンプレート（agents, rules, skills, hooks）
  config/         # XDG設定（ghostty, nvim, yazi, zsh等）
nix/              # Nix パッケージ管理（nix-darwin + flakes）
  flake.nix       # エントリポイント
  flake.lock      # バージョン固定（自動生成、gitコミット対象）
  hosts/          # ホスト別設定
setup/            # 番号付きセットアップスクリプト（01〜09、順序通りに実行）
scripts/          # 開発・運用ツール（TypeScript/Bun）
.claude/          # 実行時状態（セッション、メモリ、プラン）※gitignore対象
```

## ツールチェーン

- **Runtime:** Bun
- **タスクランナー:** mise
- **Lint:** oxlint (TS/JS), shellcheck (shell)
- **Format:** dprint (MD/YAML/TOML) + shfmt (shell)
- **Zsh プラグイン:** sheldon
- **パッケージ:** Nix (nix-darwin, CLIツール) + Homebrew (Brewfile, GUI/Nix未移行分)

## プロジェクト特性

### macOS専用
- このdotfilesはmacOSでの使用のみを想定
- Linux、Windows等への互換性は考慮不要
- BSD系コマンド（`stat -f`, `readlink` 等）をそのまま使用可能

### 個人用途
- 単一ユーザー環境を前提
- マルチテナント機能不要
- エンタープライズ要件は無視

### 公開リポジトリ
- GitHub公開を前提とした基本的なセキュリティ対策
- 認証情報の意図しない公開を防ぐ .gitignore 設定
- 社内情報・顧客データは含まない

## 設計原則

### 1. Mac専用前提

**DO:**
- BSD系コマンドをそのまま使用（`stat -f%z`, `readlink`, `grep -E` 等）
- macOS標準zshのビルトイン機能を活用
- Homebrewでインストール可能なツールに依存

**DON'T:**
- GNU coreutils の存在チェック（`command -v gstat` 等）を追加
- ポータビリティのための冗長な分岐処理
- macOS以外のOS用のフォールバック実装

**例外:**
CI/CD互換性が必要な場合のみ cross-platform helpers を維持（既存コードに存在する場合）

### 2. YAGNI（You Aren't Gonna Need It）

**DO:**
- 現在必要な機能のみを実装
- 動作する最小限のコード
- 単純な解決策を優先

**DON'T:**
- 「将来必要になるかも」という機能追加
- 過剰な抽象化・汎用化
- 使われていない設定オプション

**判断基準:**
明日使う予定がない機能は実装しない。必要になったら追加する。

### 3. 個人用途前提

**対象外の機能:**
- マルチユーザー対応
- 権限分離・アクセス制御
- エンタープライズ向け監査ログ
- 組織ポリシー管理

**対象の機能:**
- 個人環境での快適な開発体験
- ツール間の連携
- 個人的な生産性向上

### 4. 実用性重視（80%ルール）

**DO:**
- 動作する最小限の実装を優先
- 80%のユースケースをカバーすれば十分
- エラーメッセージは最低限の情報で良い

**DON'T:**
- 全エッジケースの網羅
- 完璧なエラーハンドリング
- 詳細すぎるログ出力

**例:**
- タイムアウト処理: 基本的な timeout/gtimeout チェックのみ
- パスバリデーション: 基本的なサニタイズのみ
- ログローテーション: 1MB超過時に1世代保持で十分

## セキュリティ方針

### 対応する脅威（公開dotfiles標準レベル）

- **JSON injection / コマンドインジェクション**: 基本的なサニタイズ（`${value//[^a-zA-Z0-9_-]/}`）で十分。複雑なフレームワーク不要
- **認証情報の公開防止**: .gitignore + `chmod 600` + `umask 077`

### 対応しない脅威（過剰対策）

**1. TOCTOU（Time-of-check to time-of-use）脆弱性**
- 個人環境では現実的な脅威でない
- ファイルチェックと操作の間に他ユーザーの干渉はない

**2. 高度な権限昇格攻撃**
- 信頼できる環境を前提
- sudoを使うスクリプトでも基本的なチェックのみ

**3. マルチユーザー環境での競合状態**
- 単一ユーザー環境のため考慮不要

### 実装方針まとめ

**セキュリティの優先度:**
1. 認証ファイルの適切な権限（600/700）
2. .gitignoreで機密情報除外
3. 基本的な入力検証とエスケープ
4. ~~詳細な脅威モデリング~~（不要）
5. ~~多層防御~~（過剰）

## テスト方針

手動テストのみ。自動テスト（CI/CD、bats-core等）は導入しない。
