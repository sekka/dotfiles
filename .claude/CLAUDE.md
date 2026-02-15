# dotfiles プロジェクト固有ルール

このファイルは dotfiles プロジェクト固有の行動指針を定義します。グローバル CLAUDE.md の内容を補完し、矛盾する場合はこのファイルが優先されます。

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

**1. JSON injection**
```bash
# DO: 基本的なサニタイズ
safe_value="${value//[^a-zA-Z0-9_-]/}"

# DON'T: 複雑なエスケープライブラリ導入
```

**2. コマンドインジェクション**
```bash
# DO: 基本的なサニタイズ + 安全な変数展開
local safe_name="${name//[^a-zA-Z0-9_-]/}"
command --arg="$safe_name"

# DON'T: 完全なインジェクション防御フレームワーク
```

**3. 認証情報の意図しない公開**
```bash
# DO: .gitignore設定 + 安全な権限
.env*
*.key
secrets/

# ファイル作成時
(umask 077; touch "$auth_file")
chmod 600 "$auth_file"
```

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

### 手動テストのみ

**対象:**
- 新機能追加時のローカル動作確認
- dotfilesシンボリックリンク設定確認
- AI可用性検出スクリプトの実行確認

**対象外:**
- CI/CD自動テスト（個人プロジェクトのため不要）
- クロスプラットフォームテスト
- パフォーマンステスト

### 検証項目

**dotfiles設定:**
```bash
# シンボリックリンクが正しく作成されているか
ls -la ~/.zshrc ~/.gitconfig ~/.config/claude/

# 設定が読み込まれているか
echo $PATH
which claude
```

**AI可用性検出:**
```bash
# 環境変数が正しく設定されているか
echo $AI_HAS_CODEX
echo $AI_HAS_GEMINI

# スクリプトが正しく動作するか
~/.local/bin/detect-ai-capabilities
```

**新規スクリプト:**
```bash
# 基本的な動作確認
~/.local/bin/new-script --help
~/.local/bin/new-script <test-input>

# エラーケース
~/.local/bin/new-script <invalid-input>
```

### bats-core等のテストフレームワーク

参考程度の位置付け。導入は任意。

**導入する場合の基準:**
- テストコードの保守コストが低い
- 実装コードよりテストが複雑にならない
- 手動テストで十分カバーできない複雑なロジック

## AI Orchestration 固有ルール

### 環境前提

**シェル環境:**
- macOS標準 zsh（bash互換性不要）
- Homebrew パッケージ管理
- coreutils（gtimeout等）はBrewfile管理

**コマンド:**
- BSD stat: `stat -f%z "$file"`（GNU stat不要）
- BSD readlink: `readlink "$link"`（`-f`オプション無し）
- timeout: `gtimeout`（coreutils）を優先

### 実装ガイドライン

**1. macOS専用コードで十分**
```bash
# DO: BSD statを直接使用
file_size=$(stat -f%z "$file")

# DON'T: GNU statのフォールバック不要
if command -v gstat >/dev/null; then
    file_size=$(gstat -c%s "$file")
else
    file_size=$(stat -f%z "$file")
fi
```

**2. エラーハンドリングは基本的なもののみ**
```bash
# DO: 基本的なチェック
if [[ ! -f "$file" ]]; then
    echo "ERROR: File not found: $file" >&2
    exit 1
fi

# DON'T: 全エッジケースの網羅
if [[ ! -f "$file" ]]; then
    echo "ERROR: File not found" >&2
elif [[ ! -r "$file" ]]; then
    echo "ERROR: File not readable" >&2
elif [[ ! -s "$file" ]]; then
    echo "ERROR: File is empty" >&2
elif [[ ! -w "$file" ]]; then
    echo "WARNING: File not writable" >&2
fi
```

**3. タイムアウト処理**
```bash
# gtimeout（coreutils）を使用
_timeout_cmd=$(command -v timeout || command -v gtimeout || echo "")

if [[ -n "$_timeout_cmd" ]]; then
    $_timeout_cmd 5 command --arg
else
    command --arg  # タイムアウトなしで実行（個人環境では許容）
fi
```

**4. cross-platform helpers**

既存の cross-platform helpers（`_check_cli_responsiveness` 等）は維持するが、新規実装では不要:

```bash
# 既存コード: 維持（CI/CD互換性のため）
_check_cli_responsiveness() {
    # ...既存実装...
}

# 新規コード: macOS専用で十分
if ! codex --version >/dev/null 2>&1; then
    echo "ERROR: Codex not responding" >&2
    exit 1
fi
```

### AI CLI呼び出し

**基本パターン:**
```bash
# 1. 環境変数チェック（高速パス）
if [[ "$AI_HAS_CODEX" != "1" ]]; then
    # 2. 再検証（認証ファイル）
    if [[ ! -f ~/.codex/auth.json ]]; then
        echo "ERROR: Codex not authenticated" >&2
        exit 1
    fi
fi

# 3. CLI応答性確認（基本的なもののみ）
if ! codex --version >/dev/null 2>&1; then
    echo "ERROR: Codex not responding" >&2
    exit 1
fi

# 4. 実行
codex --full-auto "$prompt"
```

**完璧を求めない:**
- タイムアウト失敗時のリトライは任意（指数バックオフは過剰）
- エラーログは基本情報のみ
- フォールバックは手動で対処しても良い

## Git管理

### コミット方針

**個人プロジェクトのため:**
- PR（Pull Request）不要
- 直接 main/master ブランチへのコミット可
- コミットメッセージは簡潔で良い（1行で十分なことも）

**コミット例:**
```bash
# シンプルなコミットメッセージ
git commit -m "Add Codex implementer agent"

# 詳細が必要な場合のみ複数行
git commit -m "$(cat <<'EOF'
Add AI orchestration support

- Detect AI capabilities on shell startup
- Route tasks to specialized agents
EOF
)"
```

### ブランチ戦略

**基本:**
- main/master ブランチで直接作業
- 実験的な機能のみ feature ブランチ作成

**例外（feature ブランチ推奨）:**
- 大規模なリファクタリング
- 破壊的変更の検証
- 複数日にわたる作業

## 参考

### 優先順位

1. **このファイル（dotfiles固有）**: 最優先
2. **グローバルCLAUDE.md**: 全プロジェクト共通
3. **AI Interface Specification**: AI統合時
4. **TDD Workflow**: テスト実装時
5. **Security Rules**: セキュリティ判断時

### 関連ファイル

- グローバルCLAUDE.md: `~/.claude/CLAUDE.md`
- AI Interface: `~/.claude/rules/ai-interface.md`
- TDD Workflow: `~/.claude/rules/tdd-workflow.md`
- Security: `~/.claude/rules/security.md`
- サブエージェント定義: `~/.claude/agents/`

### 更新履歴

このセクションは Git履歴で管理するため、ファイル内での履歴記載不要。
