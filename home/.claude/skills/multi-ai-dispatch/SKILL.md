---
name: multi-ai-dispatch
description: Routes tasks to optimal AI based on environment and task type
---

# Multi-AI Dispatch Skill

環境に応じて最適なAIにタスクをルーティングするスキル。

## 実行フロー

### 1. 環境検出

```bash
# 環境変数から利用可能AIを判定
echo "Available AIs: $AI_AVAILABLE_MODELS"

# 個別AI可用性
echo "Codex: $AI_HAS_CODEX"
echo "Gemini: $AI_HAS_GEMINI"
echo "Copilot: $AI_HAS_COPILOT"
echo "CodeRabbit: $AI_HAS_CODERABBIT"
```

### 2. タスク分類

ユーザーの要求から以下のいずれかに分類:

- **実装（通常）**: 一般的なコード作成・編集
- **実装（深い推論）**: 複雑なアルゴリズム、セカンドオピニオン
- **レビュー（軽量）**: 単一ファイルのクイックレビュー
- **レビュー（包括的）**: 複数AIによる多角的レビュー
- **レビュー（セキュリティ）**: OWASP Top 10、脆弱性スキャン
- **レビュー（品質）**: コード品質、ベストプラクティス
- **調査（通常）**: ファイル検索、定義確認
- **調査（大規模）**: 大規模コードベース横断分析
- **アーキテクチャ分析**: システム設計の理解
- **GitHub/CI/CD**: GitHub Actions、CI最適化

### 3. ルーティング決定

`routing-table.md`を参照してタスクタイプに応じた優先AIを決定:

```bash
# 例: セキュリティレビュー
if [[ "$AI_HAS_CODERABBIT" == "1" ]]; then
    # 優先: CodeRabbit
    Task tool with subagent_type="coderabbit:code-reviewer"
else
    # フォールバック: Claude内蔵reviewer
    Task tool with subagent_type="reviewer"
    echo "[AI-DISPATCH] Fallback triggered: CodeRabbit unavailable, using Claude reviewer" >&2
fi
```

### 4. エージェント起動

Task toolで適切なエージェントを起動:

```markdown
- **prompt**: 詳細なタスク説明（ファイルパス、制約、成功基準）
- **subagent_type**: ルーティングテーブルで決定したエージェント名
- **model**: 必要に応じてhaiku/sonnet/opusを指定
```

### 5. 結果報告

エージェントの結果をユーザーに報告:

- 使用したAI名
- ステータス（success/partial/failure）
- 主要な発見事項
- フォールバックが発生した場合はその理由

### 6. ログ記録

```bash
source ~/dotfiles/home/.claude/rules/ai-interface.md
_log_ai_event "INFO" "dispatch" "route_to_${selected_ai}"
```

## 環境適応ルーティング例

### Personal環境（2+ AI利用可能）

```
ユーザー: "このコードのセキュリティレビューして"
→ AI_HAS_CODERABBIT=1 確認
→ Task(subagent_type="coderabbit:code-reviewer")
→ "CodeRabbitでセキュリティレビューを実行します..."
```

### Work環境（Claude のみ）

```
ユーザー: "このコードのセキュリティレビューして"
→ AI_HAS_CODERABBIT=0 確認
→ Task(subagent_type="reviewer")
→ "[AI-DISPATCH] Fallback triggered: CodeRabbit unavailable, using Claude reviewer"
```

### CI環境（外部AI無効）

```
CI=1
→ AI_AVAILABLE_MODELS="claude"
→ 全タスクがClaude内蔵エージェントにルーティング
→ 外部AI呼び出しなし
```

## エラー処理

- **タイムアウト**: 5分でAI実行を打ち切り、フォールバック
- **リトライ**: 指数バックオフ（1s, 2s, 4s, 8s max）
- **フォールバック**: 常にClaude内蔵エージェントが最終フォールバック
- **ユーザー通知**: stderr経由で`[AI-DISPATCH]`プレフィックス付き通知

## 参照ファイル

- **ルーティングテーブル**: `@multi-ai-dispatch/routing-table.md`
- **インターフェース仕様**: `@.claude/rules/ai-interface.md`
- **環境検出スクリプト**: `~/dotfiles/home/config/zsh/67_ai_availability.zsh`
