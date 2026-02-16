# parallel-reviewer タイムアウト保護 テストプラン

## 修正内容

- 各レビュアーに5分タイムアウトを実装
- 2つ以上失敗時にClaude内蔵reviewerでフォールバック
- 実行時間とステータスを含むレポート生成

## テストケース

### Test 1: 正常ケース（全レビュアー成功）

**セットアップ:**
```bash
# すべてのAI CLIが利用可能
export AI_HAS_CODEX=1
export AI_HAS_COPILOT=1
export AI_HAS_CODERABBIT=1
export AI_HAS_GEMINI=1
```

**実行:**
```bash
claude-code task --agent parallel-reviewer --prompt "Review uncommitted changes"
```

**期待結果:**
- 4/4 reviewers completed
- total_elapsed < 20分
- すべてのレビュアーがsuccessステータス
- レポートに全レビュアーの指摘が統合

### Test 2: 1つのレビュアータイムアウト

**セットアップ:**
```bash
# Geminiのみタイムアウトさせる（手動で5分以上かかるように設定）
# 例: gemini CLIを遅延ラッパーでラップ
alias gemini='sleep 400 && /usr/local/bin/gemini'
```

**実行:**
```bash
claude-code task --agent parallel-reviewer --prompt "Review uncommitted changes"
```

**期待結果:**
- 3/4 reviewers completed
- gemini-researcher: timeout ステータス
- 部分結果（Codex, Copilot, CodeRabbit）を返す
- フォールバック起動しない（失敗が1つのみ）

### Test 3: 複数レビュアー失敗（フォールバック起動）

**セットアップ:**
```bash
# Codex と CodeRabbit を失敗させる
unset AI_HAS_CODEX
unset AI_HAS_CODERABBIT
```

**実行:**
```bash
claude-code task --agent parallel-reviewer --prompt "Review uncommitted changes"
```

**期待結果:**
- 2/4 reviewers completed (Copilot, Gemini)
- フォールバック起動: claude-fallback レビュアー
- レポートに警告セクション:
  ```
  ⚠️ Multiple reviewers failed. Consider:
    1. Check AI service availability (run: ai-check.sh)
    2. Verify authentication tokens
    3. Retry individual reviewers manually
  ```

### Test 4: 全レビュアータイムアウト

**セットアップ:**
```bash
# 全レビュアーをタイムアウトさせる
export REVIEWER_FORCE_TIMEOUT=1  # 仮想フラグ
```

**実行:**
```bash
claude-code task --agent parallel-reviewer --prompt "Review uncommitted changes"
```

**期待結果:**
- 0/4 reviewers completed
- 4つ全てがtimeoutステータス
- Claude fallback reviewerのみ実行
- レポート生成成功
- total_elapsed ≈ 20分（4×5分）

### Test 5: 外部AI不可（Claude fallbackのみ）

**セットアップ:**
```bash
# すべての外部AI CLIを無効化
unset AI_HAS_CODEX
unset AI_HAS_COPILOT
unset AI_HAS_CODERABBIT
unset AI_HAS_GEMINI
```

**実行:**
```bash
claude-code task --agent parallel-reviewer --prompt "Review uncommitted changes"
```

**期待結果:**
- 1/1 reviewers completed (claude-fallback)
- 標準出力: "[parallel-reviewer] No external AI available. Using Claude built-in reviewer."
- レポート生成成功

## 検証観点

### タイムアウト保護
- [ ] 各レビュアーが300秒（5分）で強制終了
- [ ] タイムアウト発生時にexit code 124または137
- [ ] タイムアウト発生時も処理継続（他レビュアーの結果を返す）

### フォールバック動作
- [ ] 2つ以上失敗時にClaude reviewerが起動
- [ ] フォールバック結果がレポートに含まれる
- [ ] フォールバック起動時に適切なログメッセージ

### レポート品質
- [ ] total_elapsed が正確に計算される
- [ ] Reviewer Status セクションに成功/失敗が明記
- [ ] Failed Reviewers セクションに失敗理由
- [ ] Recommendations セクションに具体的なアクション

### エラーハンドリング
- [ ] 部分失敗時も処理継続
- [ ] エラーメッセージが stderr に出力
- [ ] ユーザーフレンドリーなエラー説明

## 実行方法

```bash
# Test 1-5 を順次実行
cd /Users/kei/dotfiles
for test_num in {1..5}; do
    echo "Running Test $test_num..."
    # 各テストケースのセットアップと実行
done
```

## 成功基準

✅ すべてのテストケースがパス
✅ タイムアウト保護が正常動作
✅ フォールバック機能が2つ以上失敗時に起動
✅ レポートに実行時間とステータスが表示
✅ 全体で最大20分で完了保証

## 注意事項

- テスト実行前に git stash で作業ディレクトリをクリーンに
- 各テストケース後に環境変数をリセット
- タイムアウトテストは実際に5分以上かかるため、CI環境では無効化推奨
- 実際のClaude Code Task tool起動方法は環境に依存（擬似コードで記述）
