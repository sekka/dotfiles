# AI Orchestration Test Suite

AI可用性判定スクリプトとエージェント統合の包括的なテストスイート。

## 構成

```
tests/
├── unit/                              # ユニットテスト
│   ├── test_ai_availability.bats     # 67_ai_availability.zsh のテスト
│   ├── test_ai_check.bats            # ai-check.sh のテスト
│   └── test_ai_interface.bats        # ai-interface.md の関数テスト
├── integration/                       # 統合テスト
│   ├── test_agent_orchestration.bats # エージェント統合テスト
│   └── test_parallel_reviewer.bats   # parallel-reviewer 専用テスト
├── fixtures/                          # モックデータ
│   ├── mock_auth_files/              # モック認証ファイル
│   └── mock_cache/                   # モックキャッシュファイル
├── helpers/
│   └── test_helper.bash              # 共通ヘルパー関数
└── README.md                          # このファイル
```

## テスト項目（全77件）

### Unit Tests (42件)

#### test_ai_availability.bats (18件)

- キャッシュ生成・新鮮度チェック
- 不完全キャッシュの検出
- stat コマンドのクロスプラットフォーム対応
- 認証ファイルのパーミッション検証
- CI環境での早期終了
- シンボリックリンクの拒否
- jqによるCodex認証検証
- Gemini .env ファイルの検証
- CLIホワイトリスト検証
- タイムアウト保護

#### test_ai_check.bats (14件)

- スクリプト実行可能性
- AI状態チェック（OK/FAIL表示）
- キャッシュ年齢の計算
- パーミッションチェック（OK/WARN）
- 複数AI状態の一括チェック
- 環境変数表示
- クロスプラットフォーム stat 対応

#### test_ai_interface.bats (10件)

- ログファイルの安全な権限（600）
- ログディレクトリの安全な権限（700）
- JSON injection 防止
- 複数ログエントリの記録
- ISO 8601タイムスタンプ
- ログローテーション（1MB超過時）
- ユーザー名のサニタイズ
- 空入力での安全性
- XDG_DATA_HOMEフォールバック
- 並行書き込みの安全性

### Integration Tests (35件)

#### test_agent_orchestration.bats (15件)

- 環境変数のエクスポート・継承
- Codex/Gemini/Copilot/CodeRabbit認証再検証
- Claudeフォールバック
- 複数AI並列実行
- エージェント選択ロジック
- 環境適応ルーティング
- キャッシュ一貫性
- 認証ファイル権限の自動修正
- CI環境での早期終了
- 環境変数のサニタイズ

#### test_parallel_reviewer.bats (20件)

- command -v によるAI検出（Codex/Copilot/CodeRabbit/Gemini）
- GitHub CLI + Copilot統合検出
- 利用可能AI数のカウント
- Claudeレビュアーへのフォールバック
- レビュアーリストの構築
- 単一/全AI利用時の起動
- N/M完了ステータスの計算
- GitHub CLI認証失敗時のCopilot除外
- デバッグ出力の生成
- レビュアー起動条件
- 連想配列のデフォルト値処理
- CLI存在確認の優先順位
- 並列レビュアー数の制限
- タイムアウト設定（5分）
- レビュアー完了ステータストラッキング
- 統合レポートサマリー生成

## 使用方法

### 前提条件

```bash
# bats-core インストール
brew install bats-core
```

### 全テスト実行

```bash
# 全テスト実行
bats tests/unit/*.bats tests/integration/*.bats

# 詳細出力
bats --tap tests/unit/*.bats tests/integration/*.bats

# 特定のテストのみ
bats tests/unit/test_ai_interface.bats
```

### CI/CD統合（推奨）

`.github/workflows/test.yml`:

```yaml
name: Test AI Orchestration

on: [push, pull_request]

jobs:
  test:
    runs-on: macos-latest

    steps:
      - uses: actions/checkout@v4

      - name: Install bats-core
        run: brew install bats-core

      - name: Run unit tests
        run: bats tests/unit/*.bats

      - name: Run integration tests
        run: bats tests/integration/*.bats

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
```

## テストカバレッジ

並列レビューで指摘された全項目をカバー:

- [x] JSON injection 防止（_log_ai_event）
- [x] キャッシュの新鮮度チェック
- [x] 認証再検証パターン
- [x] stat コマンドのクロスプラットフォーム対応
- [x] 環境変数の継承・エクスポート
- [x] parallel-reviewer の AI検出ロジック

## トラブルシューティング

### jq not found

一部のテストは jq に依存します。

```bash
brew install jq
```

### タイムアウトコマンド未インストール

```bash
# GNU coreutils（gtimeout含む）
brew install coreutils
```

### パーミッションエラー

テストは一時ディレクトリ（$BATS_TMPDIR）を使用します。通常は問題ありませんが、エラーが発生する場合:

```bash
# 一時ディレクトリのクリーンアップ
rm -rf /tmp/ai_*_test_*
```

## TDD原則の遵守

このテストスイートはTDD原則に従って作成されています:

1. **Red**: テストを先に書き、失敗することを確認
2. **Green**: 最小限の実装でテストを通す
3. **実環境確認**: 全テストが実際の環境で動作検証済み
4. **即座の修正**: 失敗したテストは先送りせず即座に対応
5. **完了判定**: テスト合格 + 実環境での期待通り動作

## 参考資料

- [bats-core Documentation](https://bats-core.readthedocs.io/)
- [TDD Workflow](../.claude/rules/tdd-workflow.md)
- [AI Interface Specification](../.claude/rules/ai-interface.md)
- [Security Principles](../.claude/rules/security.md)
