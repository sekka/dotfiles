# Claude Code チートシート

Claude Codeの機能を素早く参照するためのクイックリファレンス。

---

## コード品質 & レビュー

| スキル                                | 説明                                                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `/review-and-improve`                 | コードをレビューし、検出した問題をその場で修正。セッション内の変更確認・品質チェック・セキュリティ確認に使用 |
| `/superpowers:requesting-code-review` | コードレビューを依頼するための準備・フォーマット                                                             |
| `/superpowers:receiving-code-review`  | コードレビューのフィードバックを受け取り、対応する                                                           |
| `/code-review:code-review`            | コードレビュー実行                                                                                           |
| `/pr-review-toolkit:review-pr`        | PR総合レビュー（差分・影響範囲・品質チェック）                                                               |
| `/improve-html`                       | HTMLのセマンティクス・アクセシビリティ・ARIA属性を網羅的にチェックし改善提案                                 |
| `/visual-regression-test`             | コード変更前後のスクリーンショットをImageMagickで差分比較するビジュアル回帰テスト                            |

---

## Git & バージョン管理

| スキル                                        | 説明                                                       |
| --------------------------------------------- | ---------------------------------------------------------- |
| `/commit`                                     | 変更を論理単位で分析し、適切に分割してコミット             |
| `/commit-commands:commit`                     | gitコミット実行                                            |
| `/commit-commands:commit-push-pr`             | commit + push + PR作成を一括実行                           |
| `/commit-commands:clean_gone`                 | リモートで削除された（gone）ブランチをローカルから一括削除 |
| `/superpowers:finishing-a-development-branch` | ブランチのレビュー・マージ・クリーンアップまでを完了させる |
| `/superpowers:using-git-worktrees`            | git worktreeで隔離作業環境を構築                           |

---

## 開発ワークフロー

| スキル                                        | 説明                                                 |
| --------------------------------------------- | ---------------------------------------------------- |
| `/superpowers:brainstorming`                  | 実装前に意図・要件・設計を創造的に探索               |
| `/superpowers:writing-plans`                  | 仕様から実装計画を作成                               |
| `/superpowers:executing-plans`                | 実装計画をレビューチェックポイント付きで実行         |
| `/superpowers:test-driven-development`        | TDDフロー（Red→Green→Refactor）                      |
| `/superpowers:systematic-debugging`           | 体系的デバッグ（仮説立案→検証→根本原因特定）         |
| `/superpowers:verification-before-completion` | 完了前に実装が要件を満たしているか検証               |
| `/superpowers:dispatching-parallel-agents`    | 独立タスクを並列サブエージェントに割り当てて同時実行 |
| `/superpowers:subagent-driven-development`    | サブエージェント駆動で大規模タスクを分割実行         |
| `/feature-dev:feature-dev`                    | ガイド付き機能開発（要件定義から実装まで）           |
| `/superpowers:writing-skills`                 | 新しいスキルを作成・編集                             |
| `/generating-skills-from-logs`                | セッション履歴を分析してスキルを自動生成             |
| `/claude-md-management:revise-claude-md`      | CLAUDE.mdを更新                                      |
| `/claude-md-management:claude-md-improver`    | CLAUDE.mdを監査・改善                                |

---

## フロントエンド開発

| スキル                         | 説明                                                                    |
| ------------------------------ | ----------------------------------------------------------------------- |
| `/developing-frontend`         | React/Vue/Next.jsでのUI実装、パフォーマンス最適化、アクセシビリティ対応 |
| `/managing-frontend-knowledge` | CSS・JavaScript・HTMLのナレッジベース管理と参照                         |
| `/ui-ux-pro-max`               | UI/UXデザインの知識データベース（パターン・原則・実装例）               |

---

## デザイン & Figma

| スキル                                    | 説明                                                                  |
| ----------------------------------------- | --------------------------------------------------------------------- |
| `/designing-ui`                           | UIデザイン・コンポーネント設計・レイアウト設計・レスポンシブデザイン  |
| `/working-with-figma`                     | FigmaデザインをMCP経由で取得し、既存コードベースへHigh-fidelityに実装 |
| `/figma:figma-implement-design`           | FigmaデザインノードからUIコードを生成（1:1ビジュアル忠実度）          |
| `/figma:figma-use`                        | Figma Plugin APIを実行                                                |
| `/figma:figma-generate-design`            | 既存Webページ → Figmaデザインに変換                                   |
| `/figma:figma-generate-library`           | デザインシステム・コンポーネントライブラリをFigma上に構築             |
| `/figma:figma-code-connect`               | FigmaコンポーネントとコードのCode Connect管理                         |
| `/figma:figma-create-design-system-rules` | プロジェクト固有のFigma-to-codeルールを生成                           |

### Designer Skills Collection（プラグイン）

[Owl-Listener/designer-skills](https://github.com/Owl-Listener/designer-skills) — 8プラグイン・多数のスキル

| カテゴリ                 | 代表コマンド                                                  | 用途                                                                 |
| ------------------------ | ------------------------------------------------------------- | -------------------------------------------------------------------- |
| `/design-research:*`     | `discover` / `interview` / `synthesize` / `test-plan`         | ユーザーリサーチ（ペルソナ、インタビュー、親和図、テスト計画）       |
| `/design-systems:*`      | `tokenize` / `audit-system` / `create-component`              | デザインシステム（トークン定義、監査、コンポーネント仕様書）         |
| `/ux-strategy:*`         | `strategize` / `benchmark` / `frame-problem`                  | UX戦略（北極星ビジョン、競合分析、問題定義）                         |
| `/ui-design:*`           | `type-system` / `color-palette` / `design-screen`             | UIデザイン（タイポグラフィ、カラーシステム、画面レイアウト）         |
| `/interaction-design:*`  | `design-interaction` / `map-states` / `error-flow`            | インタラクション設計（マイクロインタラクション、状態機械、エラーUX） |
| `/prototyping-testing:*` | `prototype-plan` / `experiment` / `evaluate`                  | プロトタイピング（戦略立案、A/Bテスト設計、ヒューリスティック評価）  |
| `/design-ops:*`          | `plan-sprint` / `setup-workflow` / `handoff`                  | デザインオペレーション（スプリント計画、ワークフロー、ハンドオフ）   |
| `/designer-toolkit:*`    | `write-case-study` / `build-presentation` / `write-rationale` | デザイナーツール（ケーススタディ、プレゼン資料、意思決定根拠文書）   |

---

## リサーチ & 分析

| スキル                        | 説明                                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------- |
| `/analyzing-websites`         | URLを渡すとページ構造を解析し、サイトマップとワイヤーフレームを生成                               |
| `/analyzing-animations`       | Webサイトのアニメーション・インタラクションを技術的に解析し、実装方針と技術スタックを提供         |
| `/researching-creative-cases` | アワード・トレンドから日本の最新クリエイティブ事例（Web、広告、プロダクト等）を調査・レポート生成 |
| `/evaluating-references`      | URL/記事/ツールの参考評価と採用判断                                                               |

---

## サブエージェント

Claude が内部で起動する専門エージェント（`home/.claude/agents/` で定義）:

| エージェント    | モデル | 担当領域                                                       | 使用ツール                                      |
| --------------- | ------ | -------------------------------------------------------------- | ----------------------------------------------- |
| **researcher**  | haiku  | 調査・情報収集（コードベース探索、ドキュメント検索、Web調査）  | Read, Glob, Grep, WebSearch, WebFetch, Context7 |
| **implementer** | sonnet | 実装（ファイル作成・編集、テスト実行、ビルド、Git操作）        | Read, Write, Edit, Glob, Grep, Bash             |
| **reviewer**    | haiku  | レビュー・品質チェック（セキュリティ監査、パフォーマンス分析） | Read, Glob, Grep, Bash                          |

**委譲ルール**: コードベース調査 → researcher、実装・Bash操作 → implementer、レビュー → reviewer

---

## MCP プラグイン

外部ツール連携:

| プラグイン           | 用途                                                             |
| -------------------- | ---------------------------------------------------------------- |
| **Context7**         | ライブラリ公式ドキュメント・最新コード例の取得                   |
| **Chrome DevTools**  | ブラウザ開発者ツール操作（パフォーマンス分析、ネットワーク監視） |
| **Claude in Chrome** | ブラウザ自動化（スクリーンショット、フォーム操作）               |
| **DeepWiki**         | GitHubリポジトリのドキュメント参照・質問応答                     |
| **Figma**            | Figmaデザインの読み書き                                          |
| **markitdown**       | URI → Markdown変換                                               |
| **draw.io**          | ダイアグラム・フローチャート作成                                 |

---

## Hooks（自動実行）

| Hook                         | タイミング   | 役割                                                                     |
| ---------------------------- | ------------ | ------------------------------------------------------------------------ |
| **RTK (Rust Token Killer)**  | PreToolUse   | Bashコマンドを自動プロキシして出力をフィルタリング・圧縮（トークン節約） |
| **protect-sensitive**        | PreToolUse   | 機密ファイルへの誤操作を保護（Edit/Write/Read）                          |
| **validate-command**         | PreToolUse   | 実行Bashコマンドの検証                                                   |
| **claude-notify**            | Stop / 通知  | タスク完了・権限確認等の通知                                             |
| **check-marketplace-health** | SessionStart | マーケットプレイスの健全性チェック                                       |

---

## 組み込みツール

| ツール        | 用途                                                  |
| ------------- | ----------------------------------------------------- |
| **Read**      | ファイル内容読取（画像、PDF、Jupyter notebook対応）   |
| **Edit**      | 既存ファイルの文字列置換（正確なマッチング必須）      |
| **Write**     | 新規ファイル作成・既存ファイル上書き                  |
| **Bash**      | コマンド実行（git、npm等のターミナル操作）            |
| **Grep**      | コンテンツ検索（ripgrep、正規表現、ファイルフィルタ） |
| **Glob**      | ファイルパターンマッチング（`**/*.js`等）             |
| **WebFetch**  | Webページ取得                                         |
| **WebSearch** | Web検索                                               |
| **Agent**     | サブエージェント起動                                  |

**原則**: 専用ツール優先（ファイル探索はGlob/Grep、ファイル読取はRead）。Bashはシステムコマンドや専用ツールで代替できない操作にのみ使用。

---

## クイックリファレンス: やりたいこと別

| やりたいこと           | 使うスキル/ツール                                            |
| ---------------------- | ------------------------------------------------------------ |
| コミット作成           | `/commit`                                                    |
| commit + push + PR     | `/commit-commands:commit-push-pr`                            |
| コードレビュー + 修正  | `/review-and-improve`                                        |
| PRレビュー             | `/pr-review-toolkit:review-pr`                               |
| TDDで実装              | `/superpowers:test-driven-development`                       |
| バグを体系的に調査     | `/superpowers:systematic-debugging`                          |
| 実装計画を立てる       | `/superpowers:writing-plans`                                 |
| 実装計画を実行する     | `/superpowers:executing-plans`                               |
| 並列で複数タスクを処理 | `/superpowers:dispatching-parallel-agents`                   |
| UI実装（React等）      | `/developing-frontend`                                       |
| Figmaデザインを実装    | `/working-with-figma` または `/figma:figma-implement-design` |
| UI設計                 | `/designing-ui`                                              |
| HTMLのa11y改善         | `/improve-html`                                              |
| アニメーション技術解析 | `/analyzing-animations`                                      |
| Webサイト構造分析      | `/analyzing-websites`                                        |
| クリエイティブ事例調査 | `/researching-creative-cases`                                |
| URL/記事の評価         | `/evaluating-references`                                     |
| スキルを新規作成       | `/superpowers:writing-skills`                                |
| CLAUDE.mdを改善        | `/claude-md-management:claude-md-improver`                   |
| ビジュアル回帰テスト   | `/visual-regression-test`                                    |
| カラーシステム設計     | `/ui-design:color-palette`                                   |
| タイポグラフィ設計     | `/ui-design:type-system`                                     |
| ユーザーリサーチ       | `/design-research:discover`                                  |
| ハンドオフ資料作成     | `/design-ops:handoff`                                        |

---

**最終更新**: 2026-04-03
**管理**: このファイルは定期的にメンテナンスされます。新機能追加時は随時更新。
