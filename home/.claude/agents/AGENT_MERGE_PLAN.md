# エージェント統合方針（下書き）

目的: `agents` フォルダ内の役割重複を整理し、少数の優れたエージェントに統合する。ここではマッピングと統合方針のみをドキュメント化し、実ファイルの変更は行わない。

## 基本方針
- 役割が近いものは 1 エージェントに統合し、説明/能力/シナリオをマージする。
- 技術セキュリティと法務/ポリシーは分離する。
- コード品質は「設計」「レビュー」「リファクタ」の3本に分ける。

## 統合マッピング案

### コード品質
- 設計: `code-architect`（統合対象: `quality-checker` の設計ガイド部）
- レビュー: `code-reviewer`（統合対象: `quality-checker` のレビュー部）
- リファクタ: `refactoring-expert`

### セキュリティ / 法務
- 技術セキュリティ: `security-auditor`（技術的な脆弱性/設定レビューを集約）
- 法務/ポリシー: `legal-compliance-checker` + `privacy-policy-writer` + `terms-writer` → 1本化（仮称: legal-compliance-writer）

### データベース / クエリ
- `database-specialist` + `database-optimizer` + `sql-expert` → DB設計/運用/SQL最適化の1本

### パフォーマンス / 信頼性 / 運用
- パフォーマンス: `performance-engineer`（必要に応じて `performance-optimizer` があれば吸収）
- SRE/運用: `backend-reliability-engineer` + `monitoring-setup` + `deployment-troubleshooter` + `devops-automator`
- インフラ/アーキ: `cloud-architect` + `solution-architect` + `system-designer` + `tech-stack-advisor`

### フロントエンド / デザイン
- UI設計: `ui-designer` + `layout-designer` + `typography-expert` + `wireframe-creator`
- デザインシステム: `design-system-builder`（必要なら UI設計と緩やか連携）
- ブランド/アイコン: `brand-strategist` + `icon-designer`

### コンテンツ / マーケ
- コピー/コンテンツ: `ad-copy-creator` + `copywriter` + `landing-page-writer` + `blog-writer` + `content-creator` + `pr-creator`
- SNS: `social-media-creator` + `twitter-engager`
- SEO: `seo-optimizer`（上記に寄せるか単独維持を要判断）
- グロース: `growth-hacker`（マーケ横断で活用）

### プロダクト計画 / 仕様
- 要件整理: `feature-prioritizer` + `feature-spec-writer` + `user-story-writer`
- 実行管理: `project-curator` + `task-decomposer` + `task-executor` + `experiment-tracker`

### ビジネス / 戦略
- 事業モデル: `business-model-analyzer` + `financial-planner` + `pricing-strategist`
- 市場/トレンド: `market-researcher` + `trend-analyzer` + `trend-researcher`

### データ / 可視化 / レポート
- 分析・可視化: `analytics-setup` + `data-visualizer` + `dashboard-planner`
- レポート: `report-generator`（必要なら上記に統合）

### サポート / コミュニケーション
- サポート/コミュニケーション: `support-responder` + `team-communicator`

### 実装系（検討）
- Web/フロント実装: `frontend-developer` + `web-dev` + `javascript-pro` + `typescript-expert`
- モバイル: `react-native-dev` + `mobile-ux-optimizer`
- フルスタック/設計寄り: `full-stack-architect`（インフラ/アーキ統合と役割調整）

## 次ステップ（案）
1. 上記マッピングの合意（追加/除外/名称変更があれば反映）。
2. 各クラスターごとに代表エージェントの骨子を再設計（説明/中核能力/シナリオ/アウトプット）。
3. 統合対象の旧エージェントの内容をマージし、不要ファイルを削除。
4. 用語やフォーマットを全体で統一。***
