# Claude Code チートシート

Claude Codeの機能を素早く参照するためのクイックリファレンス。

> **Note**: CLAUDE.md、rules、スキルのdescriptionは英語化されています（トークン節約のため）。
> このチートシートは日本語で詳細に書かれており、どのスキルをいつ使うかの判断に使ってください。

---

## コード品質 & レビュー

| スキル                                    | 説明                            | いつ使う？                                                                                              |
| ----------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `/user-dev-review`                        | コードレビュー＋問題修正        | 実装が一段落したとき。品質・セキュリティ・正確性を5フェーズでチェックし、問題をその場で修正する         |
| `/superpowers:requesting-code-review`     | コードレビュー依頼の準備        | 機能完成後、他の人やエージェントにレビューを依頼したいとき                                              |
| `/superpowers:receiving-code-review`      | レビュー指摘への対応            | レビューフィードバックを受けて修正するとき。盲目的に同意せず技術的に検証してから対応する                |
| `/code-review:code-review`                | PRコードレビュー                | GitHub PRの差分をレビューしたいとき                                                                     |
| `/coderabbit:code-review`                 | CodeRabbit AIコードレビュー     | CodeRabbit AIで変更差分を詳細レビュー。バグ・ロジックエラー・セキュリティ問題を検出                     |
| `/coderabbit:autofix`                     | CodeRabbit指摘の自動修正        | CodeRabbitのレビューコメントを自動で修正適用。`/coderabbit:code-review`後に使う                         |
| `/difit-review`                           | diff差分レビュー（difit連携）   | difitビューアにコメント付きでレビュー結果を表示。ブランチ差分・コミット差分・PR対応                     |
| `/user-fe-html`                           | HTML品質改善                    | HTMLのセマンティクス・アクセシビリティ・ARIA属性を網羅チェック。マークアップの品質向上に                |
| `/user-fe-vrt`                            | ビジュアル回帰テスト            | コード変更前後のスクリーンショットを複数ビューポートで撮影し、ImageMagickで画像diff。見た目の崩れを検出 |
| `/user-dev-preflight`                     | コミット前の統合チェック        | lint/型チェック/変更レビュー/機密情報チェック/コミットメッセージ案を一括実行。コミット直前に使う        |
| `/user-dev-quality`                       | format→lint→typecheck自動ループ | コード整形とチェックを最大3回自動リトライ。「lint通して」で起動                                         |
| `code-simplifier:code-simplifier` (agent) | コードの簡潔化・保守性改善      | 実装後にリファクタリングしたいとき。機能を変えずに可読性・一貫性を向上。直近の変更を自動フォーカス      |

---

## Git & バージョン管理

| スキル                                        | 説明                            | いつ使う？                                                                                   |
| --------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------- |
| `/user-dev-ship`                              | preflight→commit→review→deliver | preflight・commit・レビュー後にdelivery方法を選択（push/merge/local/done）。引数で直指定も可 |
| `/user-dev-commit`                            | 論理単位でコミット              | 変更を分析し、適切な単位に分割してコミットメッセージを生成。日本語コミットメッセージ対応     |
| `/commit-commands:commit`                     | gitコミット実行                 | シンプルなコミット操作                                                                       |
| `/commit-commands:commit-push-pr`             | commit + push + PR一括          | 実装完了からPR作成まで一気に進めたいとき                                                     |
| `/commit-commands:clean_gone`                 | gone ブランチ一括削除           | リモートで削除済みだがローカルに残っているブランチをクリーンアップ                           |
| `/superpowers:finishing-a-development-branch` | ブランチ完了ガイド              | 実装とテストが終わった後、マージ・PR・クリーンアップの選択肢を提示                           |
| `/superpowers:using-git-worktrees`            | git worktree構築                | 現在の作業を汚さずに別機能を開発したいとき。隔離された作業環境を安全に構築                   |
| `/gh-fix-ci`                                  | GitHub Actions CIの修正         | PRのCIチェックが失敗したとき。`gh`でログを確認し修正案を立案。承認後に実装                   |

---

## 開発ワークフロー

| スキル                                        | 説明                       | いつ使う？                                                                                                    |
| --------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `/superpowers:brainstorming`                  | 実装前のブレスト           | **新機能・コンポーネント追加・動作変更の前に必須**。意図・要件・設計を創造的に探索してから実装に入る          |
| `/superpowers:writing-plans`                  | 実装計画の作成             | 仕様や要件がある程度固まったら、コードに触れる前に計画を書く。マルチステップタスク向け                        |
| `/superpowers:executing-plans`                | 計画の実行                 | 書いた計画をレビューチェックポイント付きで段階的に実行する                                                    |
| `/user-dev-prototype`                         | 高速プロトタイプ           | アイデアを素早く形にしたいとき。Opus 4.6 + worktree分離 + 並列エージェントで最速ビルド。品質より速度          |
| `/superpowers:test-driven-development`        | TDD（テスト駆動開発）      | 機能実装・バグ修正の前に使用。Red→Green→Refactorサイクル                                                      |
| `/superpowers:systematic-debugging`           | 体系的デバッグ             | バグ・テスト失敗・予期しない動作に遭遇したら最初に使う。仮説立案→検証→根本原因特定                            |
| `/superpowers:verification-before-completion` | 完了前の検証               | 「できました」と言う前に必ず使用。実際にコマンドを実行して動作を証明してからコミット・PR作成する              |
| `/superpowers:dispatching-parallel-agents`    | 並列エージェント実行       | 2つ以上の独立タスクを同時に処理したいとき。共有状態がなく依存関係もないタスク向け                             |
| `/superpowers:subagent-driven-development`    | サブエージェント駆動開発   | 実装計画の各タスクを現セッション内でサブエージェントに分担させて実行                                          |
| `/feature-dev:feature-dev`                    | ガイド付き機能開発         | コードベース理解とアーキテクチャ設計に重点を置いた機能開発フロー                                              |
| `/codex:rescue`                               | Codexへ調査・修正を委任    | スタックしたとき・第二の実装視点が欲しいとき。Codex CLIに調査や修正を委任して解決策を取り込む                 |
| `/user-harness-interview`                     | プラン・仕様のインタビュー | 実装前に計画について深掘りインタビュー。技術・UI/UX・トレードオフを議論してから仕様確定                       |
| `/grill-me`                                   | 徹底的な設計インタビュー   | `/user-harness-interview`より強度が高い。計画・設計の穴を見つけるまで容赦なく問い詰める。確信が持てないときに |
| `/ralph-loop:ralph-loop`                      | 繰り返しループ実行         | タスクをループさせて自律的に完了まで反復させる。Stopフックでセッション内に自己フィードバックループを構築      |

---

## 可視化・ドキュメント生成（visual-explainer plugin）

HTMLページとしてシステム・コード変更・計画を視覚的に説明。ターミナル出力がASCII表になりそうな場合（4行以上または3列以上）は自動的にHTMLで描画。

| コマンド                                 | 説明                               | いつ使う？                                                                                       |
| ---------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| `/visual-explainer:generate-web-diagram` | HTMLダイアグラム生成               | アーキテクチャ図・フローチャート・シーケンス図を作りたいとき                                     |
| `/visual-explainer:generate-visual-plan` | ビジュアル実装プラン生成           | 機能追加の実装計画をHTML形式で視覚化するとき                                                     |
| `/visual-explainer:generate-slides`      | スライドデッキ生成                 | プレゼン資料をHTML形式で作成するとき                                                             |
| `/visual-explainer:diff-review`          | diff差分の視覚的レビュー           | コード変更を図解付きでレビューしたいとき                                                         |
| `/visual-explainer:plan-review`          | 計画 vs コードベースの比較         | 実装計画とコードの整合性・リスクを視覚評価するとき                                               |
| `/visual-explainer:project-recap`        | プロジェクトの状況スナップショット | コンテキストスイッチ後に現在地を素早く把握するとき                                               |
| `/visual-explainer:fact-check`           | ドキュメントとコードの整合性確認   | 設計書・READMEが実際のコードと一致しているか検証するとき                                         |
| `/visual-explainer:share`                | HTMLページをVercelに公開           | 生成したHTMLページをURLで共有したいとき                                                          |
| `/graphify`                              | ナレッジグラフ生成                 | コード・ドキュメント・論文・画像を入力 → クラスタリングされたナレッジグラフ（HTML + JSON）を生成 |

---

## スキル・設定管理

| スキル                                             | 説明                             | いつ使う？                                                                                                  |
| -------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `/superpowers:writing-skills`                      | スキルの作成・編集               | 新しいスキルを作りたい、既存スキルを修正したいとき                                                          |
| `/user-harness-gen-skills`                         | セッション履歴からスキル自動生成 | 過去の作業パターンを3軸分析（WHAT/HOW/FLOW）で抽出し、再利用可能なスキルにする                              |
| `/user-harness-config`                             | Claude Code設定の調査・適用      | ベストプラクティス調査・新スキル統合・記事URLから設定を取り込みたいとき。設定監査にも対応                   |
| `/user-harness-dual-agent`                         | Tornado：二エージェント実装      | 重い実装タスクをcodexに委任し、claudeがレビューするデュアルエージェントワークフロー                         |
| `/claude-md-management:revise-claude-md`           | CLAUDE.mdを更新                  | セッションで学んだことをCLAUDE.mdに反映                                                                     |
| `/claude-md-management:claude-md-improver`         | CLAUDE.mdを監査・改善            | 全CLAUDE.mdファイルをスキャンし、品質を評価して改善提案                                                     |
| `/user-harness-rules`                              | ルール・設定の鮮度チェック       | CLAUDE.md、rules、skills、memoryの整合性をチェックし、コードベースとの乖離を検出・更新提案                  |
| `/claude-code-setup:claude-automation-recommender` | Claude Code自動化の推薦          | コードベースを解析してhooks・サブエージェント・スケジュールなど最適なClaude Code自動化を提案                |
| `/codex:setup`                                     | Codex CLIのセットアップ確認      | ローカルのCodex CLIが使用可能かチェック。有効化・無効化の切り替えも                                         |
| `/skill-creator:skill-creator` (plugin)            | スキルの作成・eval・最適化       | 新スキル作成からevalループ・説明文チューニングまで一貫サポート。既存スキル改善にも                          |
| `/user-dotfiles-tool-config`                       | dotfilesツール設定の診断・修正   | tmux/zsh/nix/Homebrew等のツールが誤動作するとき、新機能設定時、セットアップスクリプト更新時                 |
| `/empirical-prompt-tuning`                         | プロンプトの反復チューニング     | スキル・CLAUDE.md・コード生成プロンプトを作成・改訂した後。バイアスのないエグゼキュータで実行して双方向評価 |

---

## フロントエンド開発

| スキル                    | 説明                     | いつ使う？                                                                                                                                           |
| ------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/user-fe-develop`        | フロントエンドUI実装     | React/Vue/Next.jsでのUI実装、パフォーマンス最適化、アクセシビリティ対応。TypeScript、コンポーネント設計、状態管理、Tailwind CSSまでカバー            |
| `/user-fe-knowledge`      | フロントエンド知識ベース | CSS・JS・HTMLのベストプラクティスを蓄積・参照。モダンCSS（Grid、Flexbox、@scope、View Transitions）、Core Web Vitals、WCAG等。実装中に自動参照される |
| `/ui-ux-pro-max` (plugin) | UI/UXデザイン知識DB      | プラグイン版（ui-ux-pro-max-skill）。50+スタイル、161カラーパレット、57フォントペアリング、99UXガイドライン。10スタック対応                          |

---

## ウェブ制作 上流工程

### 制作フロー全体（超上流〜コーディング）

```
0️⃣ /user-doc-discovery      初回打ち合わせ前 → 業種・案件種別に合わせたヒアリング質問リスト生成
        ↓ （打ち合わせ・ヒアリング）
① /user-doc-spec            クライアントブリーフ → RTM（要件定義・BINDING/SUPPLEMENTED/PENDING）
        ↓
② /user-doc-ia              RTM → IA・サイトマップ生成（Mermaid図 + クライアント向け提案文）
   /user-doc-copy           IA + RTM → コンテンツたたき台（ページ別コピー草案）
        ↓
③ /user-research-design-dna 競合・参考サイト → デザインDNA抽出（tokens/colors/typography/7軸評価）
   /user-research-websites  参考サイト → サイトマップ・ワイヤーフレームとSUPPLEMENTED根拠収集
④ /user-doc-design-spec           RTMを元にワイヤーフレーム・コンポーネント設計
⑤ /user-figma-build         設計をFigma上に実装（Plugin API経由）
        ↓ [GATE: /user-figma-gate — Figma ↔ RTM照合チェック]
⑥ /user-figma-implement     FigmaデザインをHTMLコードに変換
        ↓ [GATE: /user-dev-impl-review — コード ↔ Figma + 公開前品質チェック]
```

| スキル                  | 説明                              | いつ使う？                                                                                                                        |
| ----------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `/user-doc-discovery`   | ヒアリング質問リスト生成          | **初回打ち合わせ前**。案件種別・業種を渡すと、カスタマイズされたヒアリングシートを生成。Excel廃止                                 |
| `/user-doc-ia`          | IA・サイトマップ提案              | `user-doc-spec`でRTM完成後。Mermaidサイトマップ + ナビ設計 + クライアント向け提案文を生成                                         |
| `/user-doc-copy`        | コンテンツたたき台生成            | IAが確定した後。ページ別コピー草案（キャッチ・本文・CTA）を生成。トーン指定可能                                                   |
| `/user-figma-gate`      | デザインレビューゲート（RTM照合） | **コーディング開始前**。RTMファイル + FigmaURL の両方が必要（Figma MCP使用）。PASS/FAIL判定を出力。非公式のデザイン批評には不向き |
| `/user-dev-impl-review` | 実装レビューゲート                | **公開前**。vrt + html + コード品質 + 公開前チェック（フォーム・OG・リダイレクト）をオーケストレーション                          |

_ステップ①・③–⑥（`/user-doc-spec`〜`/user-figma-implement`）の詳細は「デザイン & Figma」セクション参照。_

---

## デザイン & Figma

### DESIGN.md 管理

| スキル            | 説明                        | いつ使う？                                                                                                               |
| ----------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `/user-design-md` | DESIGN.mdの作成・検証・更新 | 新規プロジェクトのデザインシステム定義、既存DESIGN.mdのlint検証、カラートークン更新。Init / Lint / Updateの3モードで動作 |

### デザイン制作フロー（この順番で使う）

> フロー全体（ヒアリング〜コーディング）は「ウェブ制作 上流工程」セクション参照。以下はFigmaフェーズ（④–⑥）の詳細。

```
④ /user-doc-design-spec           RTMを元にワイヤーフレーム・コンポーネント設計
⑤ /user-figma-build         設計をFigma上に実装（Plugin API経由）
        ↓ [GATE: /user-figma-gate — Figma ↔ RTM照合チェック]
⑥ /user-figma-implement     FigmaデザインをHTMLコードに変換
        ↓ [GATE: /user-dev-impl-review — コード ↔ Figma + 公開前品質チェック]
```

**ツール選択チートシート（Figma関連）:**

| やりたいこと                                   | ツール                                                                        |
| ---------------------------------------------- | ----------------------------------------------------------------------------- |
| Figma → コード実装                             | `/user-figma-implement`                                                       |
| コード → Figma（プログラム的に構築）           | `/user-figma-build`（Plugin API）                                             |
| コード → Figma（既存ページをスナップショット） | `/figma:figma-generate-design`（MCP、ステークホルダー確認・議論フェーズ向け） |

> **迷ったとき**: 「何を作るか決める」→ ①②③ / 「Figmaで作る」→ ⑤ / 「コードに落とす」→ ⑥ / 「実装済みページをFigmaに書き出す」→ `/figma:figma-generate-design`
> **②の使い分け**: デザインシステム・見た目の再現 → `/user-research-design-dna` / 構造・コンテンツ把握 → `/user-research-websites`

| スキル                                    | 方向                 | 説明                           | いつ使う？                                                                                                                                                                                            |
| ----------------------------------------- | -------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/user-doc-spec`                          | 指示書 → RTM         | クライアント指示→要件定義      | **プロジェクト開始時・既存RTMの精度向上時**。指示書の全要件を BINDING/SUPPLEMENTED/PENDING に分類し、行番号引用付きでRTM化。カバレッジ定量チェック付き                                                |
| `/user-research-design-dna`               | 参考サイト → DESIGN  | 競合・参考サイトのデザイン解析 | デザインDNA・カラー/タイポ/グリッドのトークン抽出・7軸評価・モーション言語化。`~/.claude/design-references/`に蓄積してDESIGN.mdを自動生成                                                             |
| `/user-research-websites`                 | 参考サイト → RTM補完 | 参考サイト分析                 | 指示書が沈黙している箇所のギャップを埋めたいとき。競合・同ジャンルサイトを調査してSUPPLEMENTED根拠を集める                                                                                            |
| `/user-doc-design-spec`                   | RTM → 設計書         | UI設計ドキュメント生成         | テキストワイヤーフレーム・レイアウト仕様・デザインシステム定義（色/タイポ/トークン）・コンポーネント状態一覧などをMarkdownで作成。コード生成は行わない（コード生成は `frontend-design` スキルを使用） |
| `/user-figma-build`                       | Code → Figma         | FigmaへPlugin API経由でビルド  | スタイルガイドとワイヤーフレームが確定した後。Figmaにコンポーネント・デザインシステム・ページを直接作成。**ローファイワイヤーフレーム（グレーボックス）の作成にも対応**（Phase 0b）                   |
| `/user-figma-implement`                   | Figma → Code         | Figmaデザインの高忠実度実装    | FigmaデザインをHTMLコードに変換するとき。「Figma通りに実装して」で起動。`generate_figma_design`（コード→Figma）のガイドも含む                                                                         |
| `/user-figma-gate`                        | Figma → RTMゲート    | デザインレビューゲート         | コーディング開始前。RTMファイル + FigmaURL の両方が必要（Figma MCP使用）。PASS/FAIL判定を出力                                                                                                         |
| `/figma:figma-implement-design`           | Figma → Code         | FigmaノードからUIコード生成    | 特定のFigmaデザインノードを1:1でコードに変換                                                                                                                                                          |
| `/figma:figma-use`                        | Code → Figma         | Figma Plugin API実行           | Figmaプラグインの低レベル操作を実行。`/user-figma-build`の内部で使用される                                                                                                                            |
| `/figma:figma-generate-design`            | Code → Figma         | コード→Figmaスナップショット   | ローカルで動作中のページをキャプチャしてFigmaに書き出す（MCP経由）。議論フェーズ・ステークホルダー確認に最適。Node.js 24必須                                                                          |
| `/figma:figma-generate-library`           | Code → Figma         | Figmaライブラリ構築            | デザインシステム・コンポーネントライブラリをFigma上に作成                                                                                                                                             |
| `/figma:figma-code-connect`               | Figma ↔ Code         | FigmaとコードのCode Connect    | FigmaコンポーネントとコードのCode Connect関連付けを管理                                                                                                                                               |
| `/figma:figma-create-design-system-rules` | Figma → Rules        | Figma-to-codeルール生成        | プロジェクト固有のFigma→コード変換ルールを作成                                                                                                                                                        |

#### `/user-doc-spec` が解決する問題

| 問題                                                         | 解決方法                                                       |
| ------------------------------------------------------------ | -------------------------------------------------------------- |
| 「この要件はクライアントが言ったの？それとも勝手に足した？」 | 全要件にBINDING/SUPPLEMENTED/PENDINGを付与し、行番号で引用     |
| 「指示書の要件が全部specに入っているか分からない」           | カバレッジマトリクスで 指示書リーフ要件/RTM行数 を定量チェック |
| 「調査で補完した根拠が残っていない」                         | SUPPLEMENTEDテーブルに調査サイト名・観察内容を記録             |
| 「既存のRTMが指示書と乖離してきた」                          | `/user-doc-spec`の「既存RTM監査モード」で乖離を検出            |

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

## プロジェクト管理 (PMO)

データストア: `~/prj/{name}/pmo.yaml`（案件ごと）/ `~/prj/members.yaml`（メンバー定義・共通）

### プロジェクト追跡（user-pmo-*）

| スキル                | 説明                         | いつ使う？                                                                                                                            |
| --------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `/user-pmo-wbs`       | WBS生成（領域横断）          | **案件キックオフ時**。案件種別（コーポレート/LP/動画/ブランディング等）を渡すと標準タスク分解を生成。未経験領域も対応。会話で調整可能 |
| `/user-pmo-checklist` | フェーズゲートチェックリスト | **各フェーズ移行時**。`kickoff` / `pre-launch` / `handoff` のいずれかを指定し、必須確認項目をMarkdownで出力                           |
| `/user-pmo-status`    | 複数案件進捗ダッシュボード   | **週次確認時**。`~/prj/*/pmo.yaml`を読んで全案件の進捗・期限・アラートを一覧表示。2週以内の期限は🔴                                   |
| `/user-pmo-workload`  | メンバー稼働可視化           | アサイン調整時。メンバー別の週次割当時間・負荷率（%）を表示し、過負荷メンバーの調整案を提示                                           |
| `/user-pmo-excel`     | Excel ⇄ YAML 双方向同期      | クライアント用 WBS.xlsm と `pmo.yaml` を列所有権モデルで同期。`sync` / `pull` / `push` / `doctor` の 4 モード                         |

**PMO データフロー:**

```
/user-pmo-wbs      → ~/prj/{name}/pmo.yaml を作成・更新
/user-pmo-status   ← ~/prj/*/pmo.yaml を読み取り
/user-pmo-workload ← ~/prj/*/pmo.yaml + ~/prj/members.yaml を読み取り
/user-pmo-excel    ⇄ ~/prj/{name}/pmo.yaml ⇄ ~/prj/{name}/WBS.xlsm
```

### PMセッション・案件管理（user-pm-*）

データストア: `~/prj/{slug}/discovery.md` / `spec.md` / `design-doc.md` / `decisions.md` / `pmo.yaml`

| スキル              | 説明                        | いつ使う？                                                                                                      |
| ------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `/user-pm-session`  | PMセッション開始・診断      | **PM作業開始時**。全プロジェクトをスキャンし、期限・リスク・未解決事項を自動診断してアクション優先順位を提示    |
| `/user-pm-discover` | 要件ヒアリング（Discovery） | **新案件開始時**。7質問インタビューを実施し、`discovery.md`と初期`pmo.yaml`を生成。ゴール・制約・リスクを収集   |
| `/user-pm-spec`     | 仕様書・設計書生成          | `discovery.md`完成後。RTM（要件トレーサビリティ）`spec.md`とデザインドキュメント`design-doc.md`を生成           |
| `/user-pm-meeting`  | 議事録の構造化              | 会議後にメモを渡すと決定事項・アクション・未解決・リスクを抽出し`decisions.md`と`pmo.yaml`を更新                |
| `/user-pm-report`   | 週次ステータスレポート生成  | 週次報告・マイルストーン確認時。`pmo.yaml`と`decisions.md`を集計しCSV＋Notion出力（notion_page_id設定時）       |
| `/user-pm-judge`    | PMとして何をすべきか判断    | 役割が曖昧なとき・「嫌な予感がする」とき。Player/PM/Mixedモードを判定し10のPM鉄則から15分以内のアクションを提示 |

**PM データフロー:**

```text
/user-pm-discover  → ~/prj/{slug}/discovery.md + pmo.yaml を作成
/user-pm-spec      → ~/prj/{slug}/spec.md + design-doc.md + pmo.yaml を作成
/user-pm-meeting   → ~/prj/{slug}/decisions.md + meetings/ + pmo.yaml を更新
/user-pm-report    ← ~/prj/{slug}/pmo.yaml + decisions.md を読み取り → report-YYYY-MM-DD.csv
/user-pm-session   ← ~/prj/*/pmo.yaml + decisions.md を読み取り
```

---

## リサーチ & 分析

| スキル                      | 説明                         | いつ使う？                                                                                                                                             |
| --------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/user-research-websites`   | Webサイト構造分析            | URLを渡すとページ構造を解析し、サイトマップ・ワイヤーフレームを生成。ターゲット・目的の要約も可能                                                      |
| `/user-research-design-dna` | デザインインテリジェンス解析 | 競合・参考サイトのデザインDNA/カラー/タイポ/グリッドを抽出し7軸評価。`~/.claude/design-references/`に蓄積。→ デザイン & Figmaセクションも参照          |
| `/user-research-animations` | アニメーション技術解析       | Webサイトのアニメーション・インタラクションを技術的に解析。トリガー・プロパティ変化・イージング・タイミングを分解し、実装方針と技術スタックを提示      |
| `/user-research-creative`   | クリエイティブ事例調査       | アワード・トレンドから日本の最新クリエイティブ事例（Web、広告、MV、LP、タイポ、パッケージ、空間、UI/UX等）を調査。Markdownレポート生成。隣接分野も提案 |
| `/user-research-eval-ref`   | URL・記事の参考評価          | URLや記事が「参考になるか」「導入すべきか」を評価。Quick評価（3行+星5段階）またはDeep調査（詳細分析+採用プラン）で判断                                 |
| `/user-research-queue`      | リサーチキュー管理           | Inbox / Deep Research 待ちの二段キューを管理。`add` / `add-deep` で追加、`quick [N]` / `deep [N]` で順次評価、`done` で Done 移動                      |
| `/user-doc-notion`          | Notion操作ガイド自動生成     | アプリ/サイトの全機能をスクリーンショットして、Notionページに操作説明ガイドを自動作成。`NOTION_TOKEN`が必要                                            |
| `/user-research-x-posts`    | X(Twitter)投稿の取得         | X/TwitterのURLを渡すと投稿内容を抽出。agent-browser CLI経由                                                                                            |
| `/user-doc-parse`           | ドキュメント読み取り         | PDF・PPTX・DOCX・XLSXファイルをliteparse CLIでテキスト変換して処理。ドキュメントを渡すと自動起動                                                       |

---

## サブエージェント

Claude が内部で起動する専門エージェント（`home/.claude/agents/` で定義）:

| エージェント          | モデル | 担当領域                                                                      | 使用ツール                                      |
| --------------------- | ------ | ----------------------------------------------------------------------------- | ----------------------------------------------- |
| **researcher**        | haiku  | 調査・情報収集（コード探索、ドキュメント検索、Web調査）                       | Read, Glob, Grep, WebSearch, WebFetch, Context7 |
| **implementer**       | sonnet | 実装（ファイル作成・編集、テスト実行、ビルド、Git操作）                       | Read, Write, Edit, Glob, Grep, Bash             |
| **reviewer**          | haiku  | 機械的レビュー（lint・format・typecheck・テスト結果のパターンマッチ）         | Read, Glob, Grep, Bash                          |
| **reviewer-judgment** | opus   | 判断重視レビュー（セキュリティ監査、アーキテクチャ判定、commit前の go/no-go） | Read, Glob, Grep, Bash                          |
| **chaos-engineer**    | sonnet | 障害実験設計・Game Day 演習（制御された失敗実験で耐性検証）                   | Read, Write, Edit, Bash, Glob, Grep             |

**委譲ルール**: コードベース調査 → researcher、実装・Bash操作 → implementer、機械的レビュー → reviewer、判断系レビュー (security / architecture / pre-commit go-nogo) → **reviewer-judgment** (opus・別コンテキストで独立判断)

---

## MCP プラグイン

外部ツール連携:

| プラグイン           | 用途                                                      | 使い方のヒント                                                                      |
| -------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **Context7**         | ライブラリ公式ドキュメント・最新コード例の取得            | 公開OSSのみ。社内ライブラリ名は一般化して問い合わせ                                 |
| **sem**              | 関数・クラス単位のセマンティックコード解析                | `sem_diff` でエンティティ差分、`sem_impact` で影響範囲、`sem_context` で依存解析    |
| **Chrome DevTools**  | ブラウザ開発者ツール操作                                  | パフォーマンス分析、ネットワーク監視、コンソール確認                                |
| **Claude in Chrome** | ブラウザ自動化                                            | スクリーンショット、フォーム操作、ページ内容取得                                    |
| **Playwright**       | ブラウザ自動化（Playwright）                              | `mcp__plugin_playwright_playwright__*` ツール群。Claude in Chromeの代替。CI環境向け |
| **DeepWiki**         | GitHubリポジトリのドキュメント参照                        | リポジトリ構造の理解、質問応答                                                      |
| **Figma**            | Figmaデザインの読み書き                                   | MCP経由でデザインデータを取得・操作                                                 |
| **markitdown**       | URI → Markdown変換                                        | Webページやファイルをマークダウンとして取得                                         |
| **draw.io**          | ダイアグラム・フローチャート作成                          | アーキテクチャ図やフロー図の作成・編集                                              |
| **Cloudflare**       | Cloudflare Workers/Pages/KV/D1/R2の操作・ドキュメント検索 | Workers開発・Pagesデプロイ時。`cloudflare-docs`で最新ドキュメント参照               |

---

## Hooks（自動実行）

| Hook                         | タイミング   | 役割                                                                             |
| ---------------------------- | ------------ | -------------------------------------------------------------------------------- |
| **RTK (Rust Token Killer)**  | PreToolUse   | Bashコマンドを自動プロキシして出力をフィルタリング・圧縮（トークン節約60-90%）   |
| **protect-sensitive**        | PreToolUse   | 機密ファイルへの誤操作を保護（Edit/Write/Read）                                  |
| **validate-command**         | PreToolUse   | 実行Bashコマンドの検証                                                           |
| **post-format**              | PostToolUse  | Edit/Write後にdprint/shfmtで自動フォーマット                                     |
| **auto-lint-hook**           | PostToolUse  | Edit/Write後にoxlint+tscで自動lint（プロジェクトローカル）                       |
| **circuit-breaker**          | PostToolUse  | Bash実行後の異常検知・ブレーカー                                                 |
| **commit-reminder**          | Stop         | セッション終了時にコミット漏れを警告                                             |
| **claude-notify**            | Stop / 通知  | タスク完了・権限確認等の通知                                                     |
| **check-marketplace-health** | SessionStart | マーケットプレイスの健全性チェック                                               |
| **check-memory-health**      | SessionStart | MEMORY.mdのリンク切れ確認 + 2週間ごとのコードベース整合性リマインダー            |
| **sync-external-skills**     | SessionStart | 外部GitHubリポジトリからスキルを24時間キャッシュ付きで自動同期（difit-review等） |
| **save-progress**            | PreCompact   | コンテキスト圧縮前に進行状況を保存                                               |

---

## Opus 4.7 で追加されたコマンド

| Command   | Purpose                                                                                    | 使いどき                                                   |
| --------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `/effort` | interactive slider で effort level を切替 (low/medium/high/xhigh/max。max は session-only) | task 中に深さを動的調整したい時                            |
| `/focus`  | transcript を「prompt + tool 要約 (edit diffstat 付) + 最終 response」だけに圧縮表示       | 長い session で見通しを確保したい時 (fullscreen mode のみ) |
| `/recap`  | 現セッションの 1 行サマリを生成 (席を外した後の自動 recap も別途あり)                      | 復帰時 / 中盤で経緯を要約したい時                          |

`effortLevel` は `home/.claude/settings.json` で永続化済 (`xhigh`)。一時的に下げる時は `/effort` から。

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

### 開発の流れ

| やりたいこと              | 使うスキル                                    | 補足                                               |
| ------------------------- | --------------------------------------------- | -------------------------------------------------- |
| アイデア・設計を探索      | `/superpowers:brainstorming`                  | 新機能の前に必須。何を作るか・なぜ作るかを明確化   |
| 実装計画を書く            | `/superpowers:writing-plans`                  | 仕様がある程度固まったら                           |
| 計画について深堀り質問    | `/user-harness-interview`                     | 計画の穴を見つけ、技術的判断を整理                 |
| 計画を徹底的に問い詰める  | `/grill-me`                                   | 確信が持てないとき。容赦なく設計の穴をえぐる       |
| 計画を実行する            | `/superpowers:executing-plans`                | レビューチェックポイント付き                       |
| 素早くプロトタイプを作る  | `/user-dev-prototype`                         | Opus 4.6 + worktree + 並列エージェントで最速ビルド |
| TDDで実装                 | `/superpowers:test-driven-development`        | テスト先行で安全に実装                             |
| バグを調査する            | `/superpowers:systematic-debugging`           | 仮説→検証→根因特定のサイクル                       |
| スタックしたらCodexに頼む | `/codex:rescue`                               | 第二の視点で調査・修正を委任                       |
| 並列でタスク処理          | `/superpowers:dispatching-parallel-agents`    | 独立した2+タスクを同時実行                         |
| レビュー + 修正           | `/user-dev-review`                            | 一段落したらまずこれ                               |
| 完了前に検証              | `/superpowers:verification-before-completion` | コミット前に動作を証明                             |
| コミット                  | `/user-dev-commit`                            | 論理単位で分割コミット                             |
| commit + push + PR        | `/commit-commands:commit-push-pr`             | ワンストップ                                       |
| ブランチを完了させる      | `/superpowers:finishing-a-development-branch` | マージ/PR/クリーンアップの判断                     |
| アウトプットを可視化する  | `/visual-explainer:generate-visual-plan`      | 計画・図解・スライドをHTMLで生成                   |
| 現在地を素早く確認する    | `/visual-explainer:project-recap`             | コンテキストスイッチ後の状況スナップショット       |

### フロントエンド開発

| やりたいこと              | 使うスキル                      | 補足                                           |
| ------------------------- | ------------------------------- | ---------------------------------------------- |
| UI実装（React等）         | `/user-fe-develop`              | TypeScript、状態管理、パフォーマンスまでカバー |
| Figmaデザインを実装       | `/user-figma-implement`         | MCP経由でデザインデータ取得→コード化           |
| Figmaノードを直接コード化 | `/figma:figma-implement-design` | 1:1の忠実度で変換                              |
| UI設計                    | `/user-doc-design-spec`         | ワイヤーフレーム→コンポーネント→レスポンシブ   |
| HTMLのa11y改善            | `/user-fe-html`                 | セマンティクス・ARIA属性の網羅チェック         |
| CSS/JS知識を調べる        | `/user-fe-knowledge`            | 蓄積されたナレッジベースから検索               |
| カラーシステム設計        | `/ui-design:color-palette`      | デザインシステムのカラー定義                   |
| タイポグラフィ設計        | `/ui-design:type-system`        | フォント・サイズ・行間のシステム               |

### リサーチ・分析

| やりたいこと                 | 使うスキル                  | 補足                                                            |
| ---------------------------- | --------------------------- | --------------------------------------------------------------- |
| Webサイトの構造を分析        | `/user-research-websites`   | サイトマップ・ワイヤーフレーム生成                              |
| 競合サイトのデザインを解析   | `/user-research-design-dna` | デザインDNA/トークン/7軸評価。設計の根拠収集に                  |
| アニメーション技術解析       | `/user-research-animations` | 実装方針・技術スタック・UX評価                                  |
| クリエイティブ事例調査       | `/user-research-creative`   | アワード・トレンドから最新事例をレポート                        |
| URL/記事の評価               | `/user-research-eval-ref`   | Quick評価またはDeep調査で採用判断                               |
| ビジュアル回帰テスト         | `/user-fe-vrt`              | スクリーンショット比較でレイアウト崩れ検出                      |
| ドキュメント読み取り         | `/user-doc-parse`           | PDF/PPTX/DOCX/XLSXを自動テキスト変換                            |
| アプリをNotionに操作ガイド化 | `/user-doc-notion`          | スクリーンショット自動撮影→Notionページに構造化ドキュメント生成 |

### 設計・デザインリサーチ

| やりたいこと         | 使うスキル                           | 補足                                     |
| -------------------- | ------------------------------------ | ---------------------------------------- |
| ユーザーリサーチ     | `/design-research:discover`          | ペルソナ・インタビュー・親和図           |
| デザインシステム監査 | `/design-systems:audit-system`       | トークン・コンポーネントの一貫性チェック |
| UX戦略立案           | `/ux-strategy:strategize`            | 北極星ビジョン・競合分析                 |
| ハンドオフ資料作成   | `/design-ops:handoff`                | デザイン→開発の引き継ぎ文書              |
| ケーススタディ作成   | `/designer-toolkit:write-case-study` | プロジェクトのまとめ資料                 |

### PM・案件管理

| やりたいこと               | 使うスキル          | 補足                                      |
| -------------------------- | ------------------- | ----------------------------------------- |
| PM作業の優先順位を確認する | `/user-pm-session`  | 全プロジェクトスキャン→アクション優先順位 |
| 新案件の要件をヒアリング   | `/user-pm-discover` | 7質問インタビュー→discovery.md生成        |
| 仕様書・設計書を生成       | `/user-pm-spec`     | discovery.md → spec.md + design-doc.md    |
| 議事録を構造化             | `/user-pm-meeting`  | メモ → 決定事項・アクション・pmo.yaml更新 |
| 週次レポートを生成         | `/user-pm-report`   | pmo.yaml集計 → CSV + Notion出力           |
| 役割・判断を整理           | `/user-pm-judge`    | Player/PM/Mixed判定 → 15分以内アクション  |

---

**最終更新**: 2026-05-12
**管理**: このファイルは定期的にメンテナンスされます。新機能追加時は随時更新。
