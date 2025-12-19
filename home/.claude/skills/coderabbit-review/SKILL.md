---
name: coderabbit-review
description: CodeRabbit AIを使用してコードレビューを実施します。`coderabbit --prompt-only`でAIプロンプトを取得し、包括的なコードレビューを提供します。
allowed-tools: Bash, Read, Grep, Glob
---

# CodeRabbit レビュー

CodeRabbit CLIの`--prompt-only`オプションを活用して、AIと連携したコードレビューを実施します。

## 実行手順

### 1. CodeRabbitプロンプトの取得

```bash
coderabbit review --prompt-only [options]
```

利用可能なオプション：

- `--type <type>`: レビュータイプ（all, committed, uncommitted）
- `--base <branch>`: 比較対象のベースブランチ
- `--base-commit <commit>`: 比較対象のベースコミット
- `-c, --config <files>`: 追加の指示ファイル（CLAUDE.md等）

### 2. プロンプト内容の分析

CodeRabbitが生成したプロンプトを確認し、以下の観点でレビューを実施：

#### セキュリティ

- SQL インジェクション、XSS、CSRF等の脆弱性
- 認証・認可の実装
- 機密情報のハードコーディング
- 依存関係の脆弱性

#### コード品質

- 命名規則の一貫性
- 関数・クラスの責務の明確さ
- DRY原則の遵守
- SOLID原則の適用

#### パフォーマンス

- アルゴリズムの効率性
- N+1クエリ問題
- メモリ使用の最適化
- 不要な再計算

#### 保守性

- コードの可読性
- コメントとドキュメント
- テストカバレッジ
- エラーハンドリング

### 3. レビュー結果の出力

以下の形式でレビュー結果を提示：

```markdown
## CodeRabbitレビュー結果

### 🔴 クリティカル（即座の対応が必要）

- **[ファイル名:行番号]** 問題の詳細
  - 問題のあるコード（該当言語で記述）
  - **修正案:** 修正後のコード（該当言語で記述）

### 🟡 重要（優先的に対応すべき）

- ...

### 🟢 改善推奨（余裕があれば対応）

- ...

### 📊 総合評価

- **セキュリティ**: [評価]
- **コード品質**: [評価]
- **パフォーマンス**: [評価]
- **保守性**: [評価]

### 💡 推奨アクション

1. [最優先で対応すべき項目]
2. [次に対応すべき項目]
3. ...
```

## 使用例

### 全ての変更をレビュー

```bash
coderabbit review --prompt-only --type all
```

### コミット済みの変更のみレビュー

```bash
coderabbit review --prompt-only --type committed
```

### 未コミットの変更のみレビュー

```bash
coderabbit review --prompt-only --type uncommitted
```

### 特定ブランチとの差分をレビュー

```bash
coderabbit review --prompt-only --base main
```

## 注意事項

- レビュー対象のファイルが多い場合、プロンプトが長くなる可能性があります
- 機密情報が含まれるファイルは事前に除外してください
- CodeRabbitの認証が必要な場合は`coderabbit auth`を実行してください
- 生成されたプロンプトはあくまでガイドラインであり、独自の判断も加えてレビューを実施します
