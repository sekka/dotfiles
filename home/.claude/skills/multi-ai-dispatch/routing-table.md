# AI Routing Table

タスクタイプと優先AIのマッピング表。

## ルーティング決定表

| タスクタイプ                 | 優先AI                               | 環境変数チェック                                                               | フォールバック       | 理由                                           |
| ---------------------------- | ------------------------------------ | ------------------------------------------------------------------------------ | -------------------- | ---------------------------------------------- |
| **実装**                     | codex-implementer                    | `AI_HAS_CODEX`                                                                 | implementer (Claude) | Codex利用可能時は全実装を委譲（CLAUDE.md準拠） |
| **レビュー（包括的）**       | parallel-reviewer                    | 複数チェック                                                                   | reviewer (Claude)    | 利用可能な全AIで多角的レビュー                 |
| **レビュー（セキュリティ）** | coderabbit:code-reviewer             | `AI_HAS_CODERABBIT`                                                            | reviewer (Claude)    | OWASP Top 10に特化                             |
| **レビュー（品質）**         | codex-reviewer                       | `AI_HAS_CODEX`                                                                 | reviewer (Claude)    | コード品質とベストプラクティス                 |
| **調査**                     | gemini-researcher                    | `AI_HAS_GEMINI`                                                                | researcher (Claude)  | 1Mトークンで大規模コードベース分析             |
| **アーキテクチャ分析**       | gemini-reviewer                      | `AI_HAS_GEMINI`                                                                | reviewer (Claude)    | 大規模コンテキストでアーキテクチャ理解         |
| **GitHub/CI/CD**             | copilot-reviewer                     | `AI_HAS_COPILOT`                                                               | reviewer (Claude)    | GitHub統合とCI最適化                           |
| **プランレビュー**           | parallel-reviewer (review_type=plan) | .md ファイル指定 or "プランをレビュー"/"設計レビュー"/"plan review" キーワード | reviewer (Claude)    | 設計・計画の多角的検証                         |

## タスクタイプの判定キーワード

ユーザーの要求から以下のキーワードでタスクタイプを判定:

### レビュー系

- **レビュー（包括的）**: "包括的", "詳細に", "並列", "全AI", "parallel", "comprehensive"
- **レビュー（セキュリティ）**: "セキュリティ", "脆弱性", "OWASP", "security", "vulnerability"
- **レビュー（品質）**: "品質", "ベストプラクティス", "quality", "best practices"

### 調査系

- **調査**: "大規模", "横断", "全体", "アーキテクチャ", "large-scale", "cross-file"
- **アーキテクチャ分析**: "アーキテクチャ", "設計", "構造", "architecture", "design"

### 特殊系

- **GitHub/CI/CD**: "GitHub", "Actions", "CI", "CD", "パイプライン", "workflow"
- **プランレビュー**: "プランをレビュー", "設計をレビュー", "計画をレビュー", "plan review", "review plan", "review this plan"

## ルーティング実装例

```bash
# タスク分類関数
classify_task() {
    local user_request="$1"

    # プランレビュー（review より前に評価）
    if [[ "$user_request" =~ \.md$ ]] || [[ "$user_request" =~ (プランをレビュー|設計をレビュー|計画をレビュー|plan\ review|review\ plan|review\ this\ plan) ]]; then
        echo "plan-review"
        return
    fi

    # セキュリティレビュー
    if [[ "$user_request" =~ (セキュリティ|脆弱性|OWASP|security|vulnerability) ]]; then
        echo "security-review"
        return
    fi

    # 包括的レビュー
    if [[ "$user_request" =~ (包括的|詳細に|並列|全AI|parallel|comprehensive) ]]; then
        echo "comprehensive-review"
        return
    fi

    # 大規模調査
    if [[ "$user_request" =~ (大規模|横断|全体|large-scale|cross-file) ]]; then
        echo "large-research"
        return
    fi

    # アーキテクチャ分析
    if [[ "$user_request" =~ (アーキテクチャ|設計|構造|architecture|design) ]]; then
        echo "architecture"
        return
    fi

    # GitHub/CI/CD
    if [[ "$user_request" =~ (GitHub|Actions|CI|CD|パイプライン|workflow) ]]; then
        echo "github-cicd"
        return
    fi

    # 深い推論実装
    if [[ "$user_request" =~ (複雑|アルゴリズム|Codex|深い推論) ]]; then
        echo "deep-implementation"
        return
    fi

    # デフォルト: 通常実装/レビュー/調査
    if [[ "$user_request" =~ (実装|作成|追加|書いて|create|implement) ]]; then
        echo "normal-implementation"
    elif [[ "$user_request" =~ (レビュー|確認|チェック|review|check) ]]; then
        echo "normal-review"
    elif [[ "$user_request" =~ (調査|探して|検索|research|find|search) ]]; then
        echo "normal-research"
    else
        echo "unknown"
    fi
}

# ルーティング決定関数
route_task() {
    local task_type="$1"

    case "$task_type" in
        "plan-review")
            # parallel-reviewerがreview_type=planで多角的な設計レビューを実施
            echo "parallel-reviewer"
            ;;
        "security-review")
            if [[ "$AI_HAS_CODERABBIT" == "1" ]]; then
                echo "coderabbit:code-reviewer"
            else
                echo "reviewer" # fallback
                echo "[AI-DISPATCH] Fallback: CodeRabbit unavailable, using Claude reviewer" >&2
            fi
            ;;
        "comprehensive-review")
            # parallel-reviewerが内部でAI_HAS_*をチェック
            echo "parallel-reviewer"
            ;;
        "large-research")
            if [[ "$AI_HAS_GEMINI" == "1" ]]; then
                echo "gemini-researcher"
            else
                echo "researcher" # fallback
                echo "[AI-DISPATCH] Fallback: Gemini unavailable, using Claude researcher" >&2
            fi
            ;;
        "architecture")
            if [[ "$AI_HAS_GEMINI" == "1" ]]; then
                echo "gemini-reviewer"
            else
                echo "reviewer" # fallback
                echo "[AI-DISPATCH] Fallback: Gemini unavailable, using Claude reviewer" >&2
            fi
            ;;
        "github-cicd")
            if [[ "$AI_HAS_COPILOT" == "1" ]]; then
                echo "copilot-reviewer"
            else
                echo "reviewer" # fallback
                echo "[AI-DISPATCH] Fallback: Copilot unavailable, using Claude reviewer" >&2
            fi
            ;;
        "deep-implementation"|"normal-implementation")
            if [[ "$AI_HAS_CODEX" == "1" ]]; then
                echo "codex-implementer"
            else
                echo "implementer" # fallback
                echo "[AI-DISPATCH] Fallback: Codex unavailable, using Claude implementer" >&2
            fi
            ;;
        "normal-review")
            echo "reviewer"
            ;;
        "normal-research")
            echo "researcher"
            ;;
        *)
            echo "researcher" # default fallback
            echo "[AI-DISPATCH] Unknown task type, defaulting to researcher" >&2
            ;;
    esac
}
```

## 使用例

```bash
# ユーザー要求: "このコードのセキュリティレビューして"
task_type=$(classify_task "このコードのセキュリティレビューして")
# → "security-review"

agent=$(route_task "$task_type")
# AI_HAS_CODERABBIT=1 の場合 → "coderabbit:code-reviewer"
# AI_HAS_CODERABBIT=0 の場合 → "reviewer" + fallback通知

# Task tool起動
# Task(subagent_type="$agent", prompt="...")
```
