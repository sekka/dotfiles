# PM/PMO Quick Reference

| やりたいこと           | コマンド              | 主な引数                                             |
| ---------------------- | --------------------- | ---------------------------------------------------- |
| 新規案件ヒアリング開始 | `/user-pm-discover`   | project-name client-name deadline                    |
| 仕様書・Design Doc生成 | `/user-pm-spec`       | (slug)                                               |
| WBS作成                | `/user-pmo-wbs`       | project-name deliverable-types deadline team-members |
| 全案件の状況確認       | `/user-pmo-status`    | —                                                    |
| メンバー工数確認       | `/user-pmo-workload`  | —                                                    |
| フェーズゲート確認     | `/user-pmo-checklist` | —                                                    |
| 議事録を記録・構造化   | `/user-pm-meeting`    | (slug) → メモ貼付け                                  |
| ステータスレポート生成 | `/user-pm-report`     | (slug)                                               |

## フェーズ別クイックスタート

### 案件開始時

1. `/user-pm-discover` でヒアリング
2. `/user-pm-spec` で仕様書生成
3. `/user-pmo-wbs` でWBS作成

### 実行中（毎週）

1. `/user-pm-meeting` で議事録記録
2. `/user-pmo-status` で全案件確認
3. `/user-pm-report` で週次レポート生成

## pmo.yaml フェーズ値

`discovery` → `spec` → `design` → `development` → `qa` → `launch`

## 参考

詳細ガイド: `docs/pm-pmo-guide.md`
設計仕様: `docs/superpowers/specs/2026-04-23-pm-pmo-pipeline-design.md`
