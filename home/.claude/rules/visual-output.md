# Visual Output Policy (Karpathy Frame)

最終消費者が人間なら、テキスト返答ではなくビジュアル形式 (HTML / slide / diagram) を検討する。AI 間通信なら markdown / JSON のままで良い。

## Why this matters

Karpathy (2026-05-09, https://x.com/karpathy/status/2053872850101285137): 人間の脳の約 1/3 は視覚処理に専有されており、視覚は脳への 10 車線高速道路。メディア進化は `raw text → markdown → HTML → interactive neural video` で、現在は markdown → HTML の転換点。AI 間通信は markdown でよいが、人間が最終消費する成果物は HTML / visual 形式が最適。

## When to invoke visual-explainer skills

人間が最終消費する成果物を作るときは、以下のいずれかを起動する:

| 用途 | Skill |
|---|---|
| 実装プラン / 仕様 | `visual-explainer:generate-visual-plan` |
| Before/After のコードレビュー | `visual-explainer:diff-review` |
| プラン vs 現状 のレビュー | `visual-explainer:plan-review` |
| プロジェクト現状の整理 | `visual-explainer:project-recap` |
| アーキテクチャ / フロー図 | `visual-explainer:generate-web-diagram` |
| スライド形式のブリーフィング | `visual-explainer:generate-slides` |
| ドキュメントのファクトチェック | `visual-explainer:fact-check` |

## When NOT to use HTML output

トークン / レイテンシ損が明確に勝つケースは markdown のまま:

- 1 行で済む事実問い合わせ
- 会話の往復 (clarification, back-and-forth)
- AI-to-AI / subagent への入出力
- コード差分・コミットメッセージ (markdown が標準)
- ターン途中の進捗報告

## Decision rule

1. 途中経過か最終成果物か → 途中なら markdown
2. AI 消費か人間消費か → AI なら markdown / JSON
3. 構造データ (比較 / プロセス / 状態遷移 / 階層) を含む人間向け成果物なら HTML 系 skill を選ぶ
4. 該当 skill がない場合のみ、プロンプト末尾に `structure your response as HTML` を加える運用に切り替える

## Anti-pattern

- 単純質問にも HTML を強要する (Karpathy も全クエリ末尾追加までは推奨していない)
- AI-to-AI 通信や subagent prompt に HTML を要求する (パース効率が落ちる)
- 「とりあえず HTML」で skill 選定をスキップする (各 skill は固有の生成ロジックを持つ)
