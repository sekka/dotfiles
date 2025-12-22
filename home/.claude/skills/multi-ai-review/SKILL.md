---
name: multi-ai-review
description: 複数のAIエンジン（Codex、Gemini、Copilot、CodeRabbit）で並行コードレビューを実施します。各AIの強みを活かした包括的な分析を提供します。
allowed-tools: Bash, Read, Grep
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
/multi-ai-review

未コミット変更をレビューしてください
```

または

```
/multi-ai-review --uncommitted
```

### 特定ブランチとの差分をレビュー

```
/multi-ai-review --base origin/master

origin/masterとの差分をレビューしてください
```

### コミット範囲のレビュー

```
/multi-ai-review --range origin/master..HEAD

origin/masterからHEADまでの変更をレビューしてください
```

```
/multi-ai-review --range HEAD~3..HEAD

最新3コミットをレビューしてください
```

### PR内容のレビュー

```
/multi-ai-review --pr 123

PR #123の変更内容をレビューしてください
```

```
/multi-ai-review --pr https://github.com/owner/repo/pull/456

PR URLを指定してレビューしてください
```

## 実装ガイドライン

### 1. 引数の解析

スキル実行時に以下のパターンを検出：

- `--uncommitted`: 未コミット変更をレビュー
- `--base <branch>`: 指定ブランチとの差分をレビュー
- `--range <range>`: 指定範囲（例: `origin/master..HEAD`）をレビュー
- `--pr <number>` または `--pr <url>`: PR番号またはURLでレビュー
- 引数なし: デフォルトで`--uncommitted`として扱う

### 2. 各AIツールのコマンド構築

引数に応じて適切なコマンドを構築：

#### 未コミット変更の場合

```bash
codex review --uncommitted
gemini --yolo "$(git diff HEAD)をレビューしてください"
copilot -p "$(git diff HEAD)をレビューしてください" --allow-all-tools
coderabbit review --prompt-only --type uncommitted
```

#### ブランチ比較の場合

```bash
codex review --base <branch>
gemini --yolo "$(git diff <branch>..HEAD)をレビューしてください"
copilot -p "$(git diff <branch>..HEAD)をレビューしてください" --allow-all-tools
coderabbit review --prompt-only --base <branch>
```

#### 範囲指定の場合

```bash
# Codexは範囲を直接サポートしないため、baseオプションで代用
codex review --base <range-start>
gemini --yolo "$(git diff <range>)をレビューしてください"
copilot -p "$(git diff <range>)をレビューしてください" --allow-all-tools
coderabbit review --prompt-only --base <range-start>
```

#### PR指定の場合

```bash
# PR番号またはURLからdiffを取得
# PR番号の場合
PR_DIFF=$(gh pr diff <pr-number>)

# PR URLの場合（URLから番号を抽出）
PR_NUM=$(echo "<pr-url>" | grep -oE '[0-9]+$')
PR_DIFF=$(gh pr diff $PR_NUM)

# 各AIツールでレビュー
codex review --uncommitted  # PRをチェックアウト後に実行
gemini --yolo "以下のPR差分をレビューしてください：

$PR_DIFF"
copilot -p "以下のPR差分をレビューしてください：

$PR_DIFF" --allow-all-tools
coderabbit review --prompt-only --type uncommitted  # PRをチェックアウト後に実行
```

### 3. 並行実行の実装

Bashのバックグラウンドジョブを使用して並行実行：

```bash
# 各コマンドを並行実行
codex review <options> > /tmp/codex_review.txt 2>&1 &
CODEX_PID=$!

gemini --yolo "$(git diff <target>)をレビュー" > /tmp/gemini_review.txt 2>&1 &
GEMINI_PID=$!

copilot -p "$(git diff <target>)をレビュー" --allow-all-tools > /tmp/copilot_review.txt 2>&1 &
COPILOT_PID=$!

coderabbit review --prompt-only <options> > /tmp/coderabbit_review.txt 2>&1 &
CODERABBIT_PID=$!

# すべての完了を待機
wait $CODEX_PID $GEMINI_PID $COPILOT_PID $CODERABBIT_PID
```

### 4. 結果の統合と表示

各AIの出力を読み込んで統合表示：

```markdown
## 🔍 マルチAIレビュー結果

**レビュー対象**: [未コミット変更 / origin/masterとの差分 / コミット範囲 / PR #123 / etc.]

---

### 🤖 Codex (OpenAI o1/o3)

[Codexの出力]

---

### 🤖 Gemini (Google)

[Geminiの出力]

---

### 🤖 Copilot (GitHub)

[Copilotの出力]

---

### 🤖 CodeRabbit

[CodeRabbitの出力]

---

## 📊 共通の指摘事項

[複数のAIが指摘した重要な問題をピックアップ]

## ✅ 推奨アクション

[優先順位付けされた改善提案]

1. [高優先度の問題]
2. [中優先度の問題]
3. [低優先度の改善提案]
```

### 5. エラーハンドリング

- 各AIツールが利用できない場合はスキップ
- エラーメッセージを適切に表示
- 少なくとも1つのAIが成功すればレビュー結果を表示

```bash
# コマンド存在確認の例
if ! command -v codex >/dev/null 2>&1; then
    echo "⚠️ Codex not available, skipping..."
else
    # Codex実行
fi
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
  - `copilot` の認証設定
  - `coderabbit` の認証設定
- 並行実行のため、初回は時間がかかる場合があります
- 各AIツールの利用制限に注意してください
- Copilotは`--interactive`モードが必要な場合があります（エラー時は削除）
- 大量の変更がある場合、一部のAIがタイムアウトする可能性があります
