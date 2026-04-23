# PM/PMO Skill Guide

Claude Code を使い倒すための PM/PMO ワークフロー完全ガイド。

---

## 1. 概要と哲学

**原則: "Why と判断はPM、How と作業はAI"**

あなた（PM）が担うのは: 方向性の決定、スコープ判断、クライアントとの関係管理
Claude Code が担うのは: 構造化変換、カバレッジ検証、初稿生成、ドキュメント出力

### フェーズパイプライン全体像

```
クライアントヒアリング
      ↓
[Phase 1] /user-pm-discover
  AI対話 → Goals/Non-Goals/要件/制約/リスクを分類
  出力: ~/prj/{slug}/discovery.md + pmo.yaml（初期）
      ↓
[Phase 2] /user-pm-spec
  discovery.md → 要件定義書（RTM）+ Design Doc（10項目）
  出力: ~/prj/{slug}/spec.md + design-doc.md
      ↓
[Phase 3] プロジェクト実行
  /user-pmo-wbs   → WBS生成（discovery.mdで工数補正）
  /user-pmo-status → 進捗ダッシュボード
  /user-pm-meeting → 議事録→decisions.md構造化
      ↓
[Phase 4] /user-pm-report
  pmo.yaml + decisions.md → ステータスレポート
  出力: CSV + Notion（設定時）
```

### プロジェクトデータの場所

全ファイルは `~/prj/{slug}/` 配下に保存されます:

| ファイル                 | 内容                 | 生成スキル                     |
| ------------------------ | -------------------- | ------------------------------ |
| `pmo.yaml`               | プロジェクトマスタ   | discover (初期) / wbs / status |
| `discovery.md`           | ヒアリング構造化記録 | pm-discover                    |
| `spec.md`                | 要件定義書（RTM）    | pm-spec                        |
| `design-doc.md`          | Design Doc（10項目） | pm-spec                        |
| `meetings/YYYY-MM-DD.md` | 個別議事録           | pm-meeting                     |
| `decisions.md`           | 意思決定累積ログ     | pm-meeting                     |
| `report-YYYY-MM-DD.csv`  | ステータスレポート   | pm-report                      |

---

## 2. プロジェクト開始（Phase 1 → 2）

### /user-pm-discover — ヒアリング

**いつ使う:** 新規案件のキックオフ時

**使い方:**

```
/user-pm-discover project-name="ABC Corp コーポレートサイト" client-name="ABC株式会社" deadline="2026-09-30"
```

引数が不足していると Claude が一括で聞き返します。

**Claude がやること:**

1. プロジェクトディレクトリを作成
2. 7問のインタビューを1問ずつ実施
3. 各回答を Goals / Non-Goals / Requirements / Constraints / Risks に自動分類
4. `discovery.md` と `pmo.yaml` を生成

**あなたがやること:**

- 各質問に正直に・具体的に答える
- 不明な点は「未定」「要確認」と伝えれば OK（Open Questions として記録される）

**完了確認:** `~/prj/{slug}/discovery.md` を確認し、内容が合っているか目視チェック

---

### /user-pm-spec — 仕様書・Design Doc生成

**いつ使う:** discovery.md 完成後、仕様化フェーズ開始時

**使い方:**

```
/user-pm-spec abc-corp-site
```

スラッグ省略可（プロジェクトが1つだけなら自動検出）

**Claude がやること:**

1. discovery.md を読み込み
2. 要件を BINDING / SUPPLEMENTED / PENDING に分類
3. カバレッジマトリクスを生成（抜け漏れを🔴でフラグ）
4. `spec.md`（RTM形式）と `design-doc.md`（10項目）を生成

**あなたがやること:**

- 🔴 フラグが付いた項目 → クライアントに確認
- PENDING 項目 → 確認後に再実行

---

## 3. プロジェクト実行（Phase 3）

### /user-pmo-wbs — WBS生成

```
/user-pmo-wbs project-name="ABC Corp コーポレートサイト" deliverable-types="corporate-site" deadline="2026-09-30" team-members="PM, Designer, Developer"
```

`discovery.md` があれば自動で工数を補正します:

- 要件数20件超 → 工数×1.3
- 高確率×高影響リスクあり → 全体に10%バッファ
- PENDING要件3件超 → 警告表示

---

### /user-pmo-status — 進捗ダッシュボード

```
/user-pmo-status
```

引数不要。`~/prj/*/pmo.yaml` を全読み込みし、全案件を一覧表示。
`decisions.md` があれば、期限切れ・期限間近のアクションアイテムも統合表示します。

---

### /user-pmo-workload — メンバー工数確認

```
/user-pmo-workload
```

引数不要。全プロジェクトのタスクをメンバー別に集計表示。

---

### /user-pmo-checklist — フェーズゲート確認

```
/user-pmo-checklist
```

現在のフェーズに応じたゲートチェックリストを表示。

---

### /user-pm-meeting — 議事録の記録

```
/user-pm-meeting abc-corp-site
（プロンプトに促されたらメモを貼り付け）
```

または:

```
/user-pm-meeting abc-corp-site meeting-notes="2026-04-23のメモ..."
```

**Claude がやること:**

- 決定事項 / アクションアイテム / 未解決事項 / 新リスクを抽出
- `decisions.md` に追記（最新が先頭）
- `meetings/2026-04-23.md` として保存
- アクションアイテムとリスクを `pmo.yaml` に自動追記

---

## 4. 報告・共有（Phase 4）

### /user-pm-report — ステータスレポート生成

```
/user-pm-report abc-corp-site
```

または引数省略（プロジェクトが1つなら自動検出）

**出力:**

- チャットにレポート表示
- `~/prj/{slug}/report-YYYY-MM-DD.csv` を保存（Excel対応）
- `pmo.yaml` に `notion_page_id` が設定されていれば Notion にも出力

**Notion 連携の設定:**
`~/prj/{slug}/pmo.yaml` の `notion_page_id` に Notion ページの UUID を記入:

```yaml
notion_page_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

---

## 5. pmo.yaml フィールドリファレンス

```yaml
project:
  name: "プロジェクト正式名称" # 必須
  slug: "kebab-case-slug" # 必須、30文字以内
  client: "クライアント名" # pm-discoverが設定
  deadline: "YYYY-MM-DD" # 必須
  phase: "discovery" # discovery / spec / design / development / qa / launch
  discovery_file: discovery.md # pm-discoverが設定
  spec_file: spec.md # pm-specが設定
  design_doc_file: design-doc.md # pm-specが設定
  decisions_file: decisions.md # pm-meetingが設定
  notion_page_id: "" # 任意、Notion出力用ページUUID

tasks:
  - id: T-001 # T-{3桁連番}
    phase: "要件定義"
    name: "RTM作成"
    assignee: "PM"
    est_hours: 3
    deadline: "YYYY-MM-DD"
    status: pending # pending / in_progress / done
    source: "" # 任意、meeting YYYY-MM-DD など

risks:
  - id: K-001 # K-{3桁連番}
    description: "リスク内容"
    severity: high # high / medium / low
    mitigation: "対応方針"
    source: "" # 任意
```

---

## 6. トラブルシューティング

| 症状                                                      | 対処                                                             |
| --------------------------------------------------------- | ---------------------------------------------------------------- |
| `/user-pm-spec` が "discovery.md が見つかりません" と言う | 先に `/user-pm-discover` を実行                                  |
| `/user-pm-report` の Notion 出力が失敗する                | `notion_page_id` が正しいか確認。問題があっても CSV は保存される |
| `/user-pmo-status` でプロジェクトが表示されない           | `~/prj/{slug}/pmo.yaml` が存在するか確認                         |
| WBS の工数が大きく補正される                              | `discovery.md` の要件数や高リスク数を確認。見直して再実行        |
| PENDING 要件が多くて仕様書が作れない                      | クライアントに確認後、`discovery.md` を手動で編集して再実行      |
| 同日に2回目の議事録を記録したい                           | 自動的に `meetings/YYYY-MM-DD-2.md` として保存される             |
