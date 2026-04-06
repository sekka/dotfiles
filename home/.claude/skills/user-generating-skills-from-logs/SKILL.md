---
name: user-generating-skills-from-logs
description: Claude Codeのセッション履歴を3軸分析（WHAT/HOW/FLOW）でパターン抽出し、スキルを自動生成。「履歴からスキル生成」「パターン抽出」で起動。
allowed-tools: Task, Read, Glob, Grep, Write, Edit, Bash
disable-model-invocation: false
---

<objective>
Claude Codeのセッション履歴を統計的に分析し、反復的なタスクパターンを特定してスキル化します。手動でのスキル作成では見落としがちな、実際の使用頻度に基づいた再利用可能なパターンを発見します。

learnスキルとの補完関係: learnは現在のセッションからリアルタイムで知識を抽出するのに対し、このスキルは過去の全セッション履歴を横断的に分析して統計的なパターンを発見します。
</objective>

<iron_law>

## Iron Law

1. 1回限りの操作をスキル化しない

</iron_law>

<quick_start>
起動方法:

```
履歴からスキル生成
セッションログからパターン抽出
```

基本的な実行フロー:

1. スコープ選択（対話形式）
2. セッション履歴とCLI履歴を収集
3. 3軸分析（WHAT/HOW/FLOW）でパターン抽出
4. スキル候補の評価と重複排除
5. ユーザー選択でスキル生成

分析対象データ:
- `~/.claude/projects/*/sessions-index.json` — セッションメタデータ
- `~/.claude/projects/*/[sessionId].jsonl` — セッション詳細
- `~/.local/state/zsh/history` — CLI操作履歴（オプション）
</quick_start>

<workflow>
<phase_1>
**Phase 1: スコープ確認（対話）**

AskUserQuestionでユーザーに選択肢を提示:

**質問1: 分析対象プロジェクト**
- 選択肢:
  - "全プロジェクト（4件すべて）"
  - "dotfiles のみ"
  - "特定プロジェクトを指定"

**質問2: 分析期間**
- 選択肢:
  - "最近30日"
  - "最近7日"
  - "最近60日"
  - "最近90日"
  - "全期間"

**質問3: CLI履歴を含めるか**
- 選択肢:
  - "含めない（セッションログのみ）"
  - "含める（より詳細な分析）"

スコープ決定後、Phase 2へ進む。
</phase_1>

<phase_2>
**Phase 2: データ収集**

<step_2_1>
**Step 2-1: セッションメタデータ収集**

データソース: `~/.claude/projects/*/sessions-index.json`

フィルタリング:
- `isSidechain == true` を除外
- 期間外のセッションを除外

firstPromptの扱い: テーマ推定補助のみ、生成物に直接転記禁止
</step_2_1>

<step_2_2>
**Step 2-2: history.jsonl分析（頻出プロンプト）**

最頻出のユーザー入力を特定:

```bash
jq -r 'select(.display | test("^[^/!]")) | .display[0:80]' ~/.claude/history.jsonl \
  | sort | uniq -c | sort -rn | head -30
```

除外パターン:
- `/` で始まるスラッシュコマンド
- `!` で始まる履歴呼び出し

収集目的:
- WHAT軸（目的）との照合に使用
- summary と実際のプロンプトの一致度を確認
</step_2_2>

<step_2_3>
**Step 2-3: セッションJSONL深掘り（選択的）**

対象: WHAT軸上位3グループから各5件、合計10件まで

ツール使用頻度抽出:
```bash
jq -c 'select(.type=="assistant") | .message.content[]? | select(.type=="tool_use") | .name' \
  ~/.claude/projects/{project}/{sessionId}.jsonl \
  | sort | uniq -c | sort -rn | head -30
```
</step_2_3>

<step_2_4>
**Step 2-4: CLI履歴収集（オプション）**

データソース: `~/.local/state/zsh/history`

抽出: git/テスト/ビルドコマンドの頻度
目的: HOW軸の裏付け、セッション外パターン把握
</step_2_4>
</phase_2>

<phase_3>
**Phase 3: パターン抽出 — 3軸分析**

<what_axis>
**WHAT軸 — 目的クラスタリング**

目的: セッションを「何をするため」でグルーピング。

手順:
1. 全summary列挙（firstPrompt参考）
2. キーワード重複でグルーピング（2語以上一致）
3. 代表テーマ名付与（日本語）
4. 頻度ランキング
5. プロンプト頻度と照合（summary vs 実際の入力）

例: "Docker環境構築", "Docker設定修正" → "Docker環境"グループ
</what_axis>

<how_axis>
**HOW軸 — 手段パターン**

目的: 「どのように」実現するかを特定。

手順:
1. ツール使用頻度を横断比較
2. 共通ツール組み合わせ特定（60%以上のセッションで上位3位）
3. パターン命名
   - `Task + Bash + Write` → "サブエージェント委譲"
   - `Read + Grep + Edit` → "コード調査と編集"
   - `Glob + Read + Write` → "ファイル横断処理"
4. WHAT軸グループに紐付け
</how_axis>

<flow_axis>
**FLOW軸 — 作業連鎖**

目的: 時系列パターンから反復・連鎖を発見。

手順:
1. 時系列整列（created順）
2. WHATグループラベルのシーケンス分析
3. 反復判定: 同一テーマが7日以内に3回以上 → 反復パターン
4. 連鎖判定: 特定順序が3日以内に2回以上 → 連鎖パターン
5. パターン分類:
   - 反復: 定期的タスク（候補度高）
   - 連鎖: ワークフロー（候補度中）
   - 単発: 1回のみ（候補度低）
</flow_axis>
</phase_3>

<phase_4>
**Phase 4: スキル適性評価 + 重複排除**

<evaluation_criteria>
**評価基準**

| 基準 | 採用（A） | 検討（B） | 不採用（C） |
|------|-----------|-----------|-------------|
| 頻度 | 5回以上 | 3-4回 | 2回以下 |
| 一貫性 | ツール使用差分<30% | 30-50% | >50% |
| 自動化可能率 | >70% | 40-70% | <40% |

判定: A評価2つ以上→採用、C評価2つ以上→不採用
一貫性 = 1 - (標準偏差 / 平均)
</evaluation_criteria>

<duplicate_detection>
**重複検出**

手順:
1. 既存スキル取得: `Glob: ~/dotfiles/home/.claude/skills/*/SKILL.md`
2. 先頭10行読み込み（name/description抽出）
3. キーワード照合:
   - 完全一致: name一致 → 重複確定
   - 部分一致: description 3語以上共通 → 重複の可能性
   - 意味的類似性: 同義語チェック
4. 重複時は候補除外し理由表示
</duplicate_detection>

<fallback>
**フォールバック**

候補2件未満時: 生成中止、分析結果のみ報告（WHAT/HOW/FLOWランキング）
</fallback>
</phase_4>

<phase_5>
**Phase 5: ユーザー選択**

AskUserQuestionで候補を提示:

提示情報:
```
候補1: docker-environment-setup
概要: Docker環境の構築と設定を自動化
頻度: 8回（30日間）
関連セッション例:
  - Docker Compose設定作成
  - コンテナネットワーク設定
  - イメージビルド最適化

候補2: test-implementation-workflow
概要: テスト実装の標準ワークフロー
頻度: 5回（30日間）
関連セッション例:
  - ユニットテスト作成
  - モックオブジェクト設定
  - テストカバレッジ確認
```

除外された候補も表示:
```
除外された候補:
- git-commit-automation: 既存スキル「learn」と重複
- file-editing: 頻度不足（2回）
```

選択方式:
- 複数選択可能
- 「すべて生成」オプション
- 「キャンセル」オプション
</phase_5>

<phase_6>
**Phase 6: スキル生成 + 品質検証**

<generation_format>
**生成フォーマット**

frontmatter:
```yaml
---
name: {kebab-case-name}
description: {what-it-does} {when-to-use}
allowed-tools: {extracted-from-HOW-axis}
---
```

必須XMLタグ: objective, quick_start, workflow, success_criteria

注意: firstPrompt直接転記禁止、パス抽象化、プロジェクト固有情報除去
</generation_format>

<quality_checks>
**品質チェック**

検証項目: 必須タグ、Markdown見出し不使用、kebab-case name、トリガーフレーズ、firstPrompt転記なし、機密情報なし、500行以内

失敗時: エラー表示、修正案提示、再生成
</quality_checks>

<file_output>
**ファイル出力**

生成先: `~/dotfiles/home/.claude/skills/{skill-name}/SKILL.md`

手順: mkdir → Write → chmod 644

完了メッセージに次のステップを含める（テスト実行、手動調整、git add）
</file_output>
</phase_6>
</workflow>

<success_criteria>
スキル生成が成功したと判定する基準:

**データ収集完了:**
- [ ] sessions-index.json を正常に読み込み
- [ ] 期間とプロジェクトフィルタを適用
- [ ] 10件以上のセッションを収集

**パターン抽出成功:**
- [ ] WHAT軸で3つ以上のグループを特定
- [ ] HOW軸で2つ以上のパターンを特定
- [ ] FLOW軸で反復または連鎖を1つ以上特定

**スキル生成品質:**
- [ ] 2件以上の候補を生成
- [ ] 重複検出で既存スキルと照合
- [ ] 生成されたスキルがXML構造に準拠
- [ ] 品質チェックをすべて通過

**ユーザビリティ:**
- [ ] ユーザーが候補から選択できた
- [ ] 生成されたスキルがファイルに保存された
- [ ] 次のステップが明確に提示された
</success_criteria>

<anti_patterns>
<pitfall name="firstPrompt_transcription">
❌ firstPromptをそのまま転記:

```yaml
description: Docker環境を構築してネットワーク設定してください
```

✅ 一般化して記述:

```yaml
description: Docker環境の構築と設定を自動化。Docker Compose、ネットワーク設定、イメージビルド最適化に使用。
```
</pitfall>

<pitfall name="project_specific_paths">
❌ プロジェクト固有のパスを含む:

```xml
<workflow>
/Users/kei/dotfiles/scripts/setup.sh を実行
</workflow>
```

✅ 抽象化:

```xml
<workflow>
プロジェクトルートの scripts/setup.sh を実行
</workflow>
```
</pitfall>

<pitfall name="overfit_to_single_session">
❌ 単一セッションに過剰適合:

```xml
<objective>
tmux設定ファイルのステータスバー色を変更します。
</objective>
```

✅ パターンとして一般化:

```xml
<objective>
設定ファイルの編集と検証を標準化します。構文チェック、バックアップ、ロールバック機能を含みます。
</objective>
```
</pitfall>

<pitfall name="insufficient_filtering">
❌ isSidechain=true を除外し忘れ:

```
全100セッションを分析 → 80件がサブエージェント実行
```

✅ 適切にフィルタ:

```
メインセッションのみ抽出（20件）→ 意味のあるパターン発見
```
</pitfall>

<pitfall name="ignoring_tool_consistency">
❌ ツール使用の一貫性を無視:

```
候補: "ファイル処理"
ツール: あるセッションではRead+Edit、別のセッションではBash+Write
→ 一貫性なし（自動化困難）
```

✅ 一貫性を評価:

```
ツール使用差分が50%超 → 不採用
明確なパターンがある候補のみ採用
```
</pitfall>

<pitfall name="cli_history_overload">
❌ CLI履歴を無制限に読み込み:

```bash
Read: ~/.local/state/zsh/history
→ 100万行、Bash出力30K制限でトランケート
```

✅ 集計して読み込み:

```bash
tail -10000 ~/.local/state/zsh/history | \
  awk '{print $2}' | sort | uniq -c | sort -rn | head -50
→ 上位50コマンドのみ
```
</pitfall>
</anti_patterns>

<reference_guides>
関連する参照資料:

**スキル作成規約:**
- [creating-agent-skills/SKILL.md](../creating-agent-skills/SKILL.md) — スキル作成の全体像
- [creating-agent-skills/references/skill-structure.md](../creating-agent-skills/references/skill-structure.md) — XML構造要件

**補完スキル:**
- [learn/SKILL.md](../learn/SKILL.md) — 現在のセッションからのリアルタイム抽出

**データソース:**
- `~/.claude/projects/*/sessions-index.json` — セッションメタデータ
- `~/.claude/history.jsonl` — プロンプト履歴
- `~/.local/state/zsh/history` — CLI操作履歴
</reference_guides>
