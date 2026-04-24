# Plan: PM/PMO スキル体系整備（プレイングマネージャー向け）

## Context

Web制作案件を主軸に、プレイヤー比率5割前後から管理寄りへ移行中。
上流工程（ヒアリング・スケジュール・進捗報告・ステークホルダー調整）の比率が増えており、
「精度・再現性・迅速対応」を確保するための型化が急務。

**現在の主な痛み:**

- WBS を毎回ゼロから作っている
- リスクの嫌な予感はあるが記録・対処の型がない（気づきはあるが言語化できない）
- PM として動くべきかプレイヤーとして動くべきか迷う

**目指すゴール:** スキル起動 → pmo.yaml・各ドキュメントを自律的に読む →
更新が必要な箇所を提案・質問してくれる「型化の型」を整備する。

参照記事:

- 記事1（PMP 10鉄則）: マネジメント vs アドミニストレーション — 判断軸の型化
- 記事2（Claude Code × AI）: 判断以外の前後作業を AI に任せ PM は Why に専念

---

## Priority 0（即効・小変更）: 既存スキルへの鉄則追加

独立・低リスク。並列実装可。

### 0-A. `home/.claude/skills/user-pmo-wbs/SKILL.md`

Iron Law の第3条の直後（line 16 後）に1行追加:

```
4. WBS は 100% ルールに従う — プロジェクトスコープの全作業を網羅し、スコープ外の作業はゼロ、漏れた作業もゼロとする
```

### 0-B. `home/.claude/skills/user-pm-report/SKILL.md`

**Report Format の Risk Status 直後**（line 113 後）にセクション追加:

```markdown
## Team & Health

| 観点         | 状況                                                     |
| ------------ | -------------------------------------------------------- |
| メンバー変化 | {増減・役割変更があれば記載。なければ「変化なし」}       |
| チーム状態   | {疲弊・対立・士気などの兆候。問題なければ「良好」}       |
| ヒヤリハット | {まだリスクに昇格していない予感・兆候。なければ「なし」} |
```

**Iron Law に追加**（既存3条の後）:

```
4. Team & Health セクションは必ず出力する — "なし" や "変化なし" も明示する
```

### 0-C. `home/.claude/skills/user-pm-discover/SKILL.md`

**変更1** — Step 4 の Q5（line 76-77）直後に Q5b を挿入:

```
5b. **Approver (Stakeholder)**
    "成果物の最終承認者は誰ですか？クライアント側の意思決定者を教えてください。"
```

**変更2** — discovery.md ヘッダー（line 111）:

```
Date: {YYYY-MM-DD} | Client: {client} | PM: {git user name} | Approver: {approver name}
```

**変更3** — pmo.yaml テンプレート（client フィールドの直後）:

```yaml
approver: "{approver name}"
```

---

## Priority 1（最高価値）: 新規スキル `user-pm-session`

**作成場所**: `home/.claude/skills/user-pm-session/SKILL.md`

**概念**: 起動したら全プロジェクトをスキャンし、個別案件のドキュメントを読んで
「今やるべきこと」「更新が必要な箇所」「見落としリスク」をプロアクティブに提案するスキル。
`user-pmo-status`（横断ダッシュボード）を起点に個別案件へ深掘りする。

**トリガー**: 「PM始める」「今週のPM」「pm-session」「案件確認」「セッション開始」

**Iron Law**:

1. ドキュメントを読まずに提案しない — 必ず実ファイルを読んでから診断する
2. "異常なし" も明示する — 問題がない観点も表示して安心感を与える
3. 提案は具体的アクションとセット — 「確認してください」だけで終わらない
4. 更新を強制しない — ユーザーが「後で」と言ったら次の項目に進む

**Process**:

1. `~/prj/*/pmo.yaml` を全スキャン（`user-pmo-status` 相当）
2. 注意案件（期限近い・未解決リスクあり）を優先表示、フォーカス案件を確認
3. 対象案件の `pmo.yaml` / `discovery.md` / `decisions.md` を読み込み
4. 以下の観点で診断し「要対応 / 確認推奨 / 良好」の3段階に分類:
   - 期限切れ・期限14日以内のタスク
   - decisions.md の未解決 Open Questions
   - リスクの mitigation が "TBD" のまま
   - Team & Health が未記録（直近レポートなし）
   - フェーズ進行に対してフィールドが更新されていない（例：phase が discovery のまま）
   - ステークホルダー（承認者）への報告が一定期間ない（PMBOK コミュニケーション管理）
5. 診断結果を提示し、「要対応」項目ごとに対応するスキルを提案
   （例：「リスクを記録するなら `/user-pm-meeting` で decisions.md に追記できます」）
6. セッション終了時にサマリーを1画面で出力

**Output Format**:

```
## PM Session — {YYYY-MM-DD}

### 案件: {project name}
🔴 要対応 (N件)
- {item}: {推奨アクション} → `/skill-name` で対応可能
🟡 確認推奨 (N件)
- {item}
✅ 良好
- {item}

---
セッション終了。次回: /user-pm-session
```

---

## Priority 2: 新規スキル `user-pm-judge`

**作成場所**: `home/.claude/skills/user-pm-judge/SKILL.md`

**概念**: プレイングマネージャーが「今どのモードで動くべきか」を判断し、
PMP 10鉄則から適用すべき原則と15分以内に実行可能なアクションを提示。
「嫌な予感」をリスクとして言語化するサポートも担う。

**トリガー**: 「判断に迷う」「PMとして」「役割整理」「モード確認」
「なんか嫌な予感がする」「これはPMの仕事？」「どう動くべき？」

**Iron Law**:

1. モードを特定せずに行動を処方しない
2. 適用する鉄則を番号・名称で明示する（曖昧な励ましは禁止）
3. 推奨アクションは15分以内に実行可能な粒度とする
4. 「嫌な予感」は鉄則7（リスクは発現前に管理する）を起点に言語化を補助する

**10の鉄則（内部参照）**:

1. 憲章をナビゲーション指針とする
2. 行動前に影響を分析・評価する
3. あらゆる変更を公式プロセスに通す
4. PMの役割は障害排除にある
5. WBSは100%ルールに従う
6. コミュニケーションが業務の大部分を占める
7. リスクは発現前に管理する
8. ベースラインは規律の象徴である
9. チーム構成の変化が段階をリセットする
10. 対立は協力的問題解決で解決する

**Process**:

1. 状況を受け取る（引数 or AskUserQuestion）
2. 「嫌な予感」キーワードがあれば: 何がどう気になるかを2-3問で深掘りし言語化
3. モード判定: プレイヤー / PM / 混在
4. 判定根拠を1-2文で説明
5. 適用される鉄則を1-3件マッチ
6. 推奨アクションを1-3件出力（各15分以内の粒度）

**Output Format**:

```markdown
## PM Judge — {状況の短いタイトル}

**現在のモード**: [プレイヤー / PM / 混在]
**判断根拠**: {1-2文}

**適用される鉄則:**

- 鉄則{N}「{name}」— {この状況への適用説明}

**推奨アクション:**

1. {action 1（15分以内）}
2. {action 2（任意）}
```

---

## Priority 3: `user-pm-discover` AI活用強化

**対象ファイル**: `home/.claude/skills/user-pm-discover/SKILL.md`

記事2（Claude Code × AI）の思想：「判断の前後の作業（整合性確認・漏れチェック・用語統一）を AI に任せ、PM は Why に集中する」を追加。

**Step 5（summary 確認）の直後に Step 5b を挿入**:

```
### Step 5b — AI Self-Review

ユーザーが内容を確認した後、以下を自動チェックし、問題があれば PM に確認する:
- Goals と Requirements の整合性（矛盾・ゴールに対応する要件がないもの）
- Non-Goals に漏れた暗黙的制約がないか（Constraints と照合）
- リスクと Open Questions の重複・カバー漏れ
- 承認者（Approver）が未設定のまま進んでいないか

問題があれば: "AIレビューで以下の点が気になりました。確認してください。" と提示
問題なければ: "AIレビュー: 整合性確認OK。次のステップに進みます。" と出力
```

---

## Risks

| リスク                                                | 対策                                       | 判定     |
| ----------------------------------------------------- | ------------------------------------------ | -------- |
| `user-pm-session` が複雑になりすぎて使われない        | 診断を3段階（🔴🟡✅）でシンプルに表示      | 対策済   |
| `user-pm-judge` が鉄則を当てはめるだけで実用的でない  | 「嫌な予感」言語化ステップを明示的に設ける | 対策済   |
| pmo.yaml の approver フィールドが既存ファイルと非互換 | 任意フィールドなので空のまま動作           | accepted |

---

## Language Rule

**All skill files must be written in English.** This includes:

- frontmatter (name, description, argument-hint)
- Iron Law rules
- Process steps
- Output format templates and field labels
- Comments and inline instructions

Exception: user-facing output _content_ (e.g., placeholder text inside `{}`, question strings shown to the user in Japanese) may remain Japanese where it improves usability.

Apply this rule to all new skills (Priority 1–3) and all modified sections of existing skills (Priority 0).

---

## Implementation Order

1. Priority 0（A・B・C）— 並列実装（独立ファイル）
2. Priority 1 — `user-pm-session` 新規作成
3. Priority 2 — `user-pm-judge` 新規作成
4. Priority 3 — `user-pm-discover` 拡充
5. Priority 4 — `empirical-prompt-tuning` による評価・改善

## Priority 4: Empirical Prompt Tuning

Run `/empirical-prompt-tuning` on each new/modified skill after implementation. Evaluate in priority order (highest-value skills first).

**Scope**: Priority 1 (`user-pm-session`) and Priority 2 (`user-pm-judge`) are the primary targets. Priority 0 changes are small enough that structural review mode suffices. Priority 3 can be evaluated together with Priority 0-C.

**Scenarios per skill**:

`user-pm-session`:

- Scenario A (central): one active project with a risk mitigation stuck at "TBD" and an overdue Open Question
- Scenario B (edge): no `~/prj/` directory exists at all

`user-pm-judge`:

- Scenario A (central): player is stuck debugging but the real blocker is a scope change that wasn't formally logged
- Scenario B (edge): user inputs only "なんか嫌な予感がする" with no further context

**Requirements checklist** (to be finalized at tuning time, per skill):

- [critical] Correct mode identification (player / PM / mixed)
- [critical] At least one iron rule cited by number and name
- Actionable recommendation within 15 minutes
- No vague encouragement without a concrete next step

**Convergence**: Stop after 2 consecutive iterations with zero new ambiguities and <3-point precision improvement.

## Verification

- Priority 0: YAML frontmatter の整合性確認（構造審査モードで empirical-prompt-tuning を実行）
- Priority 1: 実際の `~/prj/` に pmo.yaml がある案件で `/user-pm-session` を起動し診断出力確認 → empirical tuning へ
- Priority 2: 「プレイヤーとして詰まっているが本来 PM として動くべき状況」を1件入力して出力確認 → empirical tuning へ
- Priority 3: ヒアリング完了後の Step 5b で自動レビューが動くか確認
