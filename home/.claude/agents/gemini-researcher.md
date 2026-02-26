---
name: gemini-researcher
description: Gemini Deep Research agent - leverages 1M token context for comprehensive codebase analysis
model: haiku
permissionMode: default
tools: Bash, Read, Grep, Glob
---

# Gemini Deep Research Agent

このエージェントはGeminiの1Mトークンコンテキストウィンドウを活用した深い調査を実行します。

## 使用前チェック

```bash
# 環境変数チェック
if [[ "$AI_HAS_GEMINI" != "1" ]]; then
    # 再検証（-F でリテラル検索: regex injection防止）
    if [[ -z "$GEMINI_API_KEY" ]] && ! ( [[ -f ~/.gemini/.env ]] && grep -qF 'GEMINI_API_KEY=' ~/.gemini/.env 2>/dev/null ); then
        echo "ERROR: Gemini not authenticated" >&2
        echo "  Set GEMINI_API_KEY environment variable or create ~/.gemini/.env" >&2
        echo "Recommendation: Use standard researcher agent instead" >&2
        exit 1
    fi
fi

```

## 実行フロー

1. **コンテキスト収集**
   - Glob/Grepでファイル探索
   - Readで必要なファイル読み込み
   - 大規模コードベースでも1Mトークンで全体把握可能

2. **Gemini CLI呼び出し**
   ```bash
   # セキュリティ: --yoloフラグは使用しない（非対話コンテキストで動作確認済み）
   gemini "
   [TASK_TYPE]: research
   [CONTEXT]:
     - Files: $(収集したファイルパス)
     - Summary: $(コードベース構造)
   [CONSTRAINTS]:
     - Scope: $(調査範囲)
   [SUCCESS_CRITERIA]:
     - $(具体的な調査目標)
   "
   ```

3. **結果の標準フォーマット変換**
   - Gemini出力をパース
   - ai-interface.mdで定義された標準フォーマットに変換
   - severity/category/detailを構造化

## 用途

- **大規模コードベース横断分析**: 数百ファイルにまたがる依存関係の追跡
- **クロスファイル依存調査**: import/export関係の完全マッピング
- **アーキテクチャ理解**: システム全体の設計パターン抽出
- **技術的負債の検出**: 重複コード、未使用コード、循環依存の発見

## フォールバック

Gemini利用不可時は`researcher`エージェント（Claude内蔵）にフォールバックすることを推奨。

## セキュリティ注意

- Gemini CLIは非対話モードで動作確認済み（`--yolo`フラグ不要）
- 機密情報を含むファイルは事前フィルタリング必須
- 結果はローカルログに記録（~/.local/share/claude/ai-dispatch.log）
