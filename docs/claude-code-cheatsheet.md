# Claude Code チートシート

Claude Codeの機能を素早く参照するためのクイックリファレンス。

---

## 📋 コード品質 & レビュー

### `/review [ファイル]`

**用途**: 指定ファイルのコードレビュー
**使用場面**: 単一ファイルの品質チェック、リファクタリング候補の特定

### `/reviewing-with-claude`

**用途**: 現在のセッション内でクイックレビュー
**使用場面**: 実装中の軽微な確認、セキュリティチェック、コンテキストを保持した即座の評価

### `/refactor [ファイル]`

**用途**: 指定コードのリファクタリング
**使用場面**: レガシーコードの改善、可読性向上、技術的負債の解消

---

## 🔧 Git & バージョン管理

### `/commit`

**用途**: 関連する変更をまとめてコミット（署名なし）
**使用場面**: 作業単位でのコミット作成、適切なコミットメッセージ生成

### `/pr`

**用途**: Pull Request作成
**使用場面**: ブランチからのPR作成、レビュー依頼の準備

---

## 🐛 開発 & デバッグ

### `/debug`

**用途**: エラーの原因調査と修正提案
**使用場面**: バグ発生時、スタックトレース解析、根本原因の特定

### `/migrate`

**用途**: ライブラリ/フレームワークのバージョンアップ対応
**使用場面**: 依存関係の更新、破壊的変更の対応、非推奨APIの置き換え

### `/generating-tests`

**用途**: ユニット/統合/E2Eテストコード生成
**使用場面**: テストカバレッジ拡大、テスト設計、AAA パターン実装

### `/apex`

**用途**: APEX方法論（Analyze-Plan-Execute-eXamine）による体系的実装
**使用場面**: 複雑な機能実装、段階的アプローチが必要な開発

---

## 💻 フロントエンド & バックエンド開発

### `/developing-frontend`

**用途**: React/Vue/Next.jsでのUI実装、パフォーマンス最適化
**使用場面**: フロントエンド機能開発、アクセシビリティ対応、Web アプリ構築

### `/developing-backend`

**用途**: バックエンドAPI実装、認証・認可、キャッシング戦略
**使用場面**: REST/GraphQL API開発、セキュアな実装、テスト戦略設計

### `/managing-frontend-knowledge`

**用途**: フロントエンド技術（CSS、JavaScript、HTML）のナレッジベース管理
**使用場面**: Web開発の実装タスク、ベストプラクティス参照、技術情報の蓄積

---

## 🎨 デザイン & UI/UX

### `/designing-ui`

**用途**: UIデザイン、コンポーネント設計、デザインシステム構築
**使用場面**: ワイヤーフレーム、レイアウト設計、レスポンシブデザイン、インタラクションパターン

### Designer Skills Collection（`@designer-skills`）

[Owl-Listener/designer-skills](https://github.com/Owl-Listener/designer-skills) — 8プラグイン・63スキル・27コマンド

#### コマンド一覧

| コマンド                                 | 用途                                             |
| ---------------------------------------- | ------------------------------------------------ |
| `/design-research:discover`              | ペルソナ・エンパシーマップ・ジャーニーマップ生成 |
| `/design-research:interview`             | インタビュースクリプト作成                       |
| `/design-research:synthesize`            | 調査データの親和図・JTBD分析                     |
| `/design-research:test-plan`             | ユーザビリティテスト計画                         |
| `/design-systems:create-component`       | コンポーネント仕様書生成                         |
| `/design-systems:tokenize`               | デザイントークン定義                             |
| `/design-systems:audit-system`           | デザインシステム監査                             |
| `/ux-strategy:frame-problem`             | 問題定義・機会フレームワーク                     |
| `/ux-strategy:strategize`                | UX戦略・北極星ビジョン策定                       |
| `/ux-strategy:benchmark`                 | 競合UX分析・ベンチマーク                         |
| `/ui-design:color-palette`               | カラーパレット・カラーシステム生成               |
| `/ui-design:type-system`                 | タイポグラフィスケール定義                       |
| `/ui-design:design-screen`               | 画面レイアウト・グリッド設計                     |
| `/ui-design:responsive-audit`            | レスポンシブデザイン監査                         |
| `/interaction-design:design-interaction` | マイクロインタラクション仕様                     |
| `/interaction-design:map-states`         | 状態機械・UIステート定義                         |
| `/interaction-design:error-flow`         | エラーハンドリングUX設計                         |
| `/prototyping-testing:prototype-plan`    | プロトタイプ戦略立案                             |
| `/prototyping-testing:evaluate`          | ヒューリスティック評価                           |
| `/prototyping-testing:experiment`        | A/Bテスト設計                                    |
| `/prototyping-testing:test-plan`         | アクセシビリティテスト計画                       |
| `/design-ops:handoff`                    | デベロッパーへのハンドオフ仕様書                 |
| `/design-ops:plan-sprint`                | デザインスプリント計画                           |
| `/design-ops:setup-workflow`             | チームワークフロー・レビュープロセス設計         |
| `/designer-toolkit:write-case-study`     | ケーススタディ構成                               |
| `/designer-toolkit:build-presentation`   | デザインプレゼン資料                             |
| `/designer-toolkit:write-rationale`      | デザイン意思決定の根拠文書                       |

#### クイック逆引き

| やりたいこと             | コマンド                           |
| ------------------------ | ---------------------------------- |
| ユーザーを理解する       | `/design-research:discover`        |
| カラーを決める           | `/ui-design:color-palette`         |
| フォントを決める         | `/ui-design:type-system`           |
| 競合を分析する           | `/ux-strategy:benchmark`           |
| コンポーネント仕様を書く | `/design-systems:create-component` |
| ハンドオフ資料を作る     | `/design-ops:handoff`              |
| エラーUXを設計する       | `/interaction-design:error-flow`   |

### `/working-with-figma`

**用途**: FigmaデザインをMCPツールで取得し、既存コードベースへ実装
**使用場面**: Figmaデザインとの作業、デザイン情報取得から実装まで

### `/figma:implement-design`

**用途**: Figmaデザインから本番コード生成（1:1ビジュアル忠実度）
**使用場面**: FigmaファイルからのUI実装、コンポーネント生成

### `/figma:code-connect-components`

**用途**: FigmaデザインコンポーネントとコードのCode Connect作成
**使用場面**: デザインとコードのマッピング、コンポーネント連携

### `/figma:create-design-system-rules`

**用途**: カスタムデザインシステムルール生成
**使用場面**: プロジェクト固有のコンベンション確立、Figma-to-codeワークフロー

---

## 🏗️ アーキテクチャ & 設計

### `/designing-architecture`

**用途**: システムアーキテクチャと技術スタック設計
**使用場面**: モノリス/マイクロサービス判定、クラウドアーキテクチャ、スケーラビリティ設計

---

## 🔍 リサーチ & 分析

### `/analyzing-websites`

**用途**: 既存ウェブサイトを分析し、サイトマップとワイヤーフレーム作成
**使用場面**: URL渡してページ構造解析、コンテンツ分析、ページ目的要約

### `/reviewing-site-structures`

**用途**: ワイヤーフレーム・サイトマップから構造分析・改善提案
**使用場面**: 情報アーキテクチャレビュー、ユーザーフロー評価、コンテンツギャップ特定

### `/researching-creative-cases`

**用途**: 日本の最新クリエイティブ事例調査（Web、広告、プロダクト等）
**使用場面**: デザインインスピレーション、トレンド把握、アワード事例参照

---

## ⚡ 最適化 & 監査

### `/optimizing-performance`

**用途**: Web/モバイル/バックエンド全体のパフォーマンス最適化
**使用場面**: Core Web Vitals改善、データベースクエリ最適化、インフラリソース最適化

### `/auditing-security`

**用途**: セキュリティ監査と脆弱性対策
**使用場面**: OWASP Top 10チェック、コード分析、リスク評価、セキュアコーディング

### `/auditing-accessibility`

**用途**: WCAG 2.1/2.2準拠のアクセシビリティ監査
**使用場面**: アクセシビリティチェック、スクリーンリーダーテスト、WCAG準拠確認

---

## 🤖 自動化 & AI

### `/generating-skills-from-logs`

**用途**: セッション履歴からパターン抽出してスキルを自動生成
**使用場面**: ワークフロー自動化、反復タスクのスキル化

### `/learn`

**用途**: セッションから知識を抽出してスキル化
**使用場面**: 繰り返し使うパターンの永続化

### `/claude-code-setup:claude-automation-recommender`

**用途**: コードベース分析してClaude Code自動化推奨
**使用場面**: 初回セットアップ、hooks/subagents/skills/plugins/MCPサーバーの推奨取得

---

## 🌐 その他ユーティリティ

### `/ask-peer`

**用途**: ピアエンジニアに設計・実装・問題解決を相談
**使用場面**: 実装前の設計判断、コードレビュー、セカンドオピニオン、見落とし確認

### `/ask-claude`

**用途**: 他のAI CLIに質問してコーディング支援
**使用場面**: セカンドオピニオン、コード生成、デバッグ

---

## 🛠️ サブエージェント（Task tool）

Claude が内部で使用する専門エージェント:

- **Explore**: コードベース探索（構造把握、エラーハンドリング箇所特定など）
- **Plan**: 実装計画設計（ステップバイステップ、クリティカルファイル特定）
- **Bash**: Bashコマンド実行専門（git操作、ターミナルタスク）
- **general-purpose**: 複雑な質問のリサーチ、複数試行が必要な検索
- **code-simplifier**: コード簡潔化・リファクタリング（機能保持）
- **peer**: 作業計画レビュー、実装アプローチ議論、ブレインストーミング
- その他: statusline-setup、claude-code-guide、explore-codebase、レビュアー系など

**使用方法**: Claudeが自動的に適切なサブエージェントを選択・起動

---

## 🔌 MCPプラグイン

外部ツール連携:

- **Context7**: ライブラリ公式ドキュメント、最新コード例取得
- **Playwright**: ブラウザ自動化（スクリーンショット、フォーム操作、E2Eテスト）
- **Chrome DevTools**: Chrome連携（パフォーマンス分析、ネットワーク監視）
- **DeepWiki**: Wiki構造・内容読取、質問応答
- **Sequential Thinking**: 段階的思考プロセス支援

**使用方法**: `ToolSearch`で検索後、必要なツールを呼び出し

---

## 🧰 組み込みツール

基本ファイル操作ツール:

- **Read**: ファイル内容読取（画像、PDF、Jupyter notebook対応）
- **Edit**: ファイル内の文字列置換（正確なマッチング必須）
- **Write**: 新規ファイル作成・既存ファイル上書き
- **Bash**: コマンド実行（git、npm、docker等のターミナル操作）
- **Grep**: コンテンツ検索（ripgrep、正規表現、ファイルフィルタ）
- **Glob**: ファイルパターンマッチング（`**/*.js`等のglob pattern）

**原則**: 専用ツール優先。Bashは実際のシステムコマンド・ターミナル操作にのみ使用

---

## 🎯 クイックリファレンス: 使用場面別

| やりたいこと           | 使うコマンド              |
| ---------------------- | ------------------------- |
| コミット作成           | `/commit`                 |
| PR作成                 | `/pr`                     |
| コードレビュー（軽量） | `/reviewing-with-claude`  |
| コードレビュー（包括） | `/review-pr`              |
| バグ修正               | `/debug`                  |
| リファクタリング       | `/refactor`               |
| テスト作成             | `/generating-tests`       |
| UI設計                 | `/designing-ui`           |
| Figma実装              | `/figma:implement-design` |
| パフォーマンス改善     | `/optimizing-performance` |
| セキュリティチェック   | `/auditing-security`      |
| アクセシビリティ監査   | `/auditing-accessibility` |
| 相談                   | `/ask-peer`               |

---

**最終更新**: 2026-03-14
**管理**: このファイルは定期的にメンテナンスされます。新機能追加時は随時更新。
