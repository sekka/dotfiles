---
name: codex-review
description: OpenAI Codexを使用してコードレビューを実施します。codex review コマンドで直接レビューを実行し、AIによる包括的な分析を提供します。
allowed-tools: Bash, Read, Grep, Glob
---

# OpenAI Codex レビュー

OpenAI Codexの`codex review`コマンドを使用して、AIによる高度なコードレビューを実施します。

## 特徴

- **OpenAI o1/o3モデル**: 最先端の推論能力を活用
- **直接実行型**: Codex CLIが直接レビューを実行
- **柔軟なターゲット指定**: 未コミット変更、特定ブランチ、特定コミットをレビュー可能
- **カスタム指示**: 独自のレビュー観点を追加可能

## 使用場面

- 複雑なロジックの詳細な分析が必要な場合
- OpenAIモデルの推論能力を活用したい場合
- 未コミット変更を素早くレビューしたい場合
- 特定のブランチやコミットとの差分をレビューしたい場合

## 実行手順

### 1. レビュー対象の選択

以下のいずれかの方法でレビュー対象を指定：

#### 未コミット変更のレビュー

```bash
codex review --uncommitted
```

staged、unstaged、untrackedの全ての変更をレビューします。

#### 特定ブランチとの差分をレビュー

```bash
codex review --base main
codex review --base develop
```

指定したブランチとの差分をレビューします。

#### 特定コミットのレビュー

```bash
codex review --commit <sha>
```

特定のコミットで導入された変更をレビューします。

### 2. カスタムレビュー指示（オプション）

特定の観点に絞ったレビューを実施する場合：

```bash
codex review --uncommitted "セキュリティ脆弱性に焦点を当ててレビューしてください"
```

```bash
codex review --base main "パフォーマンスの観点からレビューしてください"
```

標準入力からの指示も可能：

```bash
echo "TypeScriptの型安全性に問題がないか確認してください" | codex review --uncommitted -
```

### 3. レビュー結果の解釈

Codexは以下の観点でレビューを実施します：

- **コード品質**: 可読性、保守性、設計パターン
- **セキュリティ**: 脆弱性、認証・認可の問題
- **パフォーマンス**: アルゴリズム効率、リソース使用
- **ベストプラクティス**: 言語・フレームワーク固有の推奨事項
- **テスト**: カバレッジ、エッジケースの考慮

### 4. 結果の活用

レビュー結果に基づいて：

1. 指摘された問題を修正
2. 必要に応じて他のAIレビューも実施（多角的検証）
3. 重要な変更の場合は code-reviewer agent で深掘り

## 使用例

### 基本的な使い方

```
/codex-review

未コミット変更をレビューしてください
```

### ブランチ比較

```
/codex-review

mainブランチとの差分をレビューしてください
```

### カスタム観点

```
/codex-review

セキュリティとパフォーマンスの観点から未コミット変更をレビューしてください
```

### 特定コミットのレビュー

```
/codex-review

コミット abc123 をレビューしてください
```

## 実装ガイドライン

### レビュー実行時の処理

1. ユーザーの指示から適切な`codex review`コマンドを構築
2. オプションを解析：
   - 「未コミット」「uncommitted」→ `--uncommitted`
   - 「mainブランチ」「vs main」→ `--base main`
   - 「コミット xxx」→ `--commit xxx`
3. カスタム指示があれば引数として渡す
4. コマンドを実行し、結果を整形して表示

### 結果の整形

Codexの出力をそのまま表示し、以下を追加：

```markdown
## OpenAI Codexレビュー結果

[Codexの出力]

---

### 📊 レビュー実施情報

- **レビュー対象**: [未コミット変更 / mainブランチとの差分 / コミット xxx]
- **実行コマンド**: `codex review [options]`
- **AIモデル**: OpenAI Codex (o1/o3)

### 🔄 次のステップ

他のAIの視点も参考にする場合：
- /claude-review - 現在のセッションでクイックレビュー
- /copilot-review - GitHub Copilotの視点
- /gemini-review - Google Geminiの視点
- /coderabbit-review - CodeRabbitの構造化レビュー
```

## 高度な使用法

### 設定のカスタマイズ

`~/.codex/config.toml`でCodexの動作をカスタマイズ可能：

```bash
codex review -c model="o3" --uncommitted
```

### 特定のレビュー観点

```
/codex-review

以下の観点のみレビューしてください：
1. SQL インジェクションの脆弱性
2. XSS の脆弱性
3. 認証・認可の問題
```

## 注意事項

- Codexの実行には認証が必要です（`codex login`で認証）
- 大量の変更がある場合、レビューに時間がかかる可能性があります
- Codexは英語での出力が最適化されていますが、日本語での指示も理解します
- レビュー結果はAIによる提案であり、最終的な判断は開発者が行ってください
- 機密情報が含まれるコードは事前に除外してください

## トラブルシューティング

### 認証エラー

```bash
codex login
```

### コマンドが見つからない

```bash
mise install npm-openai-codex
```

### レビューが実行されない

- Git リポジトリ内で実行しているか確認
- レビュー対象の変更が存在するか確認
