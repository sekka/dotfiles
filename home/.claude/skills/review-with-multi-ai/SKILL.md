---
name: review-with-multi-ai
description: 複数のAIエンジン（Codex、Gemini、Copilot、CodeRabbit）で並行コードレビューを実施します。各AIの強みを活かした包括的な分析を提供します。
allowed-tools: Bash, Read
---

# マルチAIレビュー

複数のAIレビューツールを並行実行して、多角的な視点でコードをレビューします。

## 特徴

- **並行実行**: すべてのAIレビューを同時に実行して時間を節約
- **多角的分析**: 各AIエンジンの強みを活かした包括的なレビュー
- **統合結果**: すべてのレビュー結果を見やすく統合表示
- **柔軟な対象指定**: 未コミット変更、特定ブランチ、コミット範囲に対応

## 対応AIエンジン

1. **Codex (OpenAI)**: o1/o3モデルによる深い推論と分析
2. **Gemini (Google)**: 大規模コンテキスト理解とアーキテクチャ分析
3. **Copilot (GitHub)**: GitHubエコシステムとの統合による実践的な提案
4. **CodeRabbit**: コードパターン分析と詳細なフィードバック

## 使用例

### 未コミット変更のレビュー

```
/review-with-multi-ai

未コミット変更をレビューしてください
```

または

```
/review-with-multi-ai --uncommitted
```

### 特定ブランチとの差分をレビュー

```
/review-with-multi-ai --base origin/master

origin/masterとの差分をレビューしてください
```

### コミット範囲のレビュー

```
/review-with-multi-ai --range origin/master..HEAD

origin/masterからHEADまでの変更をレビューしてください
```

```
/review-with-multi-ai --range HEAD~3..HEAD

最新3コミットをレビューしてください
```

### PR内容のレビュー

```
/review-with-multi-ai --pr 123

PR #123の変更内容をレビューしてください
```

```
/review-with-multi-ai --pr https://github.com/owner/repo/pull/456

PR URLを指定してレビューしてください
```

## 実行手順

このスキルを実行する際は、以下の手順に従ってください：

### 1. 引数の解析

ユーザーの引数から レビュー対象を特定：

- コミット範囲（例: `HEAD~4`, `HEAD~3..HEAD`, `origin/master..HEAD`）
- ブランチ名（例: `origin/master`）
- 引数なしの場合は未コミット変更

### 2. レビュー対象の文字列化

以下のいずれかの方法でレビュー対象を取得：

- コミット範囲: `git log --oneline -N` と `git diff <range>`
- ブランチ比較: `git diff <branch>..HEAD`
- 未コミット: `git diff HEAD`

### 3. 4つのAIツールで並行レビュー実行

**注意**: Copilotは事前にインタラクティブモードでモデルを有効化する必要があります（`copilot --model <model-name>`を一度実行）。有効化されていない場合、Copilotはスキップされます。

**重要**: Bashツールの `timeout` パラメータを `300000`（5分）に設定してください。CodeRabbitのレビューには時間がかかる場合があります。

Bashツールを使って、以下のコマンドを**1回の呼び出しで**並行実行してください：

```bash
# 一時ファイルのクリーンアップ
rm -f /tmp/codex_review_$$.txt /tmp/gemini_review_$$.txt /tmp/copilot_review_$$.txt /tmp/coderabbit_review_$$.txt

# 並行実行（$$ でプロセスIDを使い、ファイル名の衝突を回避）
(codex review --base <range-start> > /tmp/codex_review_$$.txt 2>&1) &
CODEX_PID=$!

(gemini --yolo "以下の変更をレビューしてください：

$(git log --oneline <commits>)

差分:
$(git diff <range>)" > /tmp/gemini_review_$$.txt 2>&1) &
GEMINI_PID=$!

(copilot -p "以下の変更をレビューしてください：

$(git log --oneline <commits>)

差分:
$(git diff <range>)" --allow-all-tools > /tmp/copilot_review_$$.txt 2>&1) &
COPILOT_PID=$!

(coderabbit review --prompt-only --base <range-start> > /tmp/coderabbit_review_$$.txt 2>&1) &
CODERABBIT_PID=$!

# すべての完了を待機
wait $CODEX_PID $GEMINI_PID $COPILOT_PID $CODERABBIT_PID

echo "✅ 並行レビュー完了"
echo "REVIEW_FILES=/tmp/codex_review_$$.txt:/tmp/gemini_review_$$.txt:/tmp/copilot_review_$$.txt:/tmp/coderabbit_review_$$.txt"
```

### 4. 各AIツールの結果を読み込み

Readツールを使って、各一時ファイルの内容を読み込んでください：

- `/tmp/codex_review_$$.txt`
- `/tmp/gemini_review_$$.txt`
- `/tmp/copilot_review_$$.txt`
- `/tmp/coderabbit_review_$$.txt`

### 5. 統合レビュー結果の表示

以下の形式で統合結果を表示してください：

```markdown
## 🔍 マルチAIレビュー結果

**レビュー対象**: <コミット範囲またはブランチ>

---

### 🤖 Codex (OpenAI)

<Codexの出力内容>

---

### 🤖 Gemini (Google)

<Geminiの出力内容>

---

### 🤖 Copilot (GitHub)

<Copilotの出力内容>

---

### 🤖 CodeRabbit

<CodeRabbitの出力内容>

---

## 📊 共通の指摘事項

<複数のAIが指摘した重要な問題>

## ✅ 推奨アクション

<優先順位付けされた改善提案>
```

### 6. クリーンアップ

レビュー完了後、一時ファイルを削除：

```bash
rm -f /tmp/codex_review_$$.txt /tmp/gemini_review_$$.txt /tmp/copilot_review_$$.txt /tmp/coderabbit_review_$$.txt
```

## 使用タイミング

- コード変更後のレビュー依頼時
- プルリクエスト作成前
- 重要なリファクタリング後
- コミット前の最終チェック
- 複数の視点からの検証が必要な場合

## 出力形式

統合されたマークダウン形式で、各AIのレビュー結果を明確に区分して表示します。

## 注意事項

- すべてのAIツールが認証済みである必要があります
  - `codex login`
  - `gemini` の認証設定
  - `copilot` の認証設定（事前に`copilot --model <model-name>`をインタラクティブモードで一度実行してモデルを有効化）
  - `coderabbit` の認証設定
- 並行実行のため、初回は時間がかかる場合があります
- 各AIツールの利用制限に注意してください
- Copilotが有効化されていない場合、エラーが記録されますが他のAIレビューは継続されます
- CodeRabbitのレビューには時間がかかるため、Bashツールのタイムアウトを300000ms（5分）に設定してください
- 大量の変更がある場合、さらに時間がかかる可能性があります（その場合はタイムアウトを600000ms（10分）まで延長可能）
