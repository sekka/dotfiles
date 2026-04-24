# Dotfiles Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 4件の dotfiles 改善を実施し、各作業後に empirical-prompt-tuning で検証する。

**Architecture:** setup/20_claude.sh のセキュリティ強化 + gh-fix-ci スキル登録 → user-harness-gen-skills に出力先決定ツリー追加 → 新規 PM スキル 2 本の empirical tuning。すべて独立タスクで並列実行可能だが、依存を避けるため順番に実行する。

**Tech Stack:** bash, shellcheck, SKILL.md (XML), empirical-prompt-tuning skill

---

## Task 1: setup/20_claude.sh — gh チェック + stderr 修正 + gh-fix-ci 登録

**Files:**

- Modify: `setup/20_claude.sh` (lines 225–280)

### 対象の問題点（YAGNI により Fix 1/2 のみ実装）

| # | 問題                                  | 対応                                  |
| - | ------------------------------------- | ------------------------------------- |
| 1 | gh CLI なしで実行するとサイレント失敗 | `is_installed gh` チェックでスキップ  |
| 2 | `2>/dev/null` でエラー全消し          | 削除してエラーを表示                  |
| 3 | 更新に `install -f` を使用            | スキップ（gh skill extension 未検証） |
| 4 | setup.sh が --update を渡さない       | スキップ（setup.sh リファクタ相当）   |
| 5 | 孤立スキルのクリーンアップなし        | スキップ（YAGNI）                     |

- [ ] **Step 1: GH_SKILLS に gh-fix-ci を追加**

`setup/20_claude.sh` の `GH_SKILLS=(` ブロックを以下に変更:

```bash
GH_SKILLS=(
  "yoshiko-pg/difit difit-review"
  "mattpocock/skills grill-me"
  "mizchi/chezmoi-dotfiles empirical-prompt-tuning dot_claude/skills/empirical-prompt-tuning/SKILL.md"
  "mizchi/chezmoi-dotfiles gh-fix-ci dot_claude/skills/gh-fix-ci/SKILL.md"
)
```

Note: gh skill install は SKILL.md のみ取得。スキル内で参照される `inspect_pr_checks.py` は含まれないが、`gh` CLI コマンドで代替可能。

- [ ] **Step 2: ensure_gh_skill の `2>/dev/null` を削除**

`ensure_gh_skill` 関数内の2箇所を修正:

```bash
# Before (update branch, ~line 245):
if ! gh skill install "$repo" "$path" --agent claude-code --scope user -f 2>/dev/null; then

# After:
if ! gh skill install "$repo" "$path" --agent claude-code --scope user -f; then
```

```bash
# Before (install branch, ~line 255):
if ! gh skill install "$repo" "$path" --agent claude-code --scope user -f 2>/dev/null; then

# After:
if ! gh skill install "$repo" "$path" --agent claude-code --scope user -f; then
```

- [ ] **Step 3: skill_count ループを gh チェックでガード**

`skill_count=0` 〜 for ループ終了 を以下に置換:

```bash
skill_count=0

if ! is_installed gh; then
  log_warn "gh がインストールされていません。サードパーティスキルのセットアップをスキップします"
else
  log_info "サードパーティスキルをセットアップしています..."
  for entry in "${GH_SKILLS[@]}"; do
    read -r repo skill path <<<"$entry"
    if [[ -n $repo ]] && [[ -n $skill ]]; then
      ensure_gh_skill "$repo" "$skill" "$path"
      skill_count=$((skill_count + 1)) || true
    fi
  done
fi
```

- [ ] **Step 4: 構文チェック**

```bash
bash -n setup/20_claude.sh && echo "OK"
shellcheck setup/20_claude.sh
```

Expected: エラーなし（既存の shellcheck 警告は無視可）

- [ ] **Step 5: 動作確認 (gh なし状態)**

```bash
bash -c 'PATH="" source setup/lib/common.sh 2>/dev/null; is_installed() { command -v "$1" &>/dev/null; }; ! is_installed gh && echo "gh not found — would skip"'
```

Expected: "gh not found — would skip" が表示される

---

## Task 2: user-harness-gen-skills — 出力先決定ツリー追加

**Files:**

- Modify: `home/.claude/skills/user-harness-gen-skills/SKILL.md`

変更点: Phase 4 に「出力先タイプ判定」セクションを追加し、Phase 5/6 の表示を更新。

- [ ] **Step 1: Phase 4 に output_type_determination セクションを追加**

`</duplicate_detection>` タグの直後（`<fallback>` の前）に挿入:

```xml
<output_type_determination>
**Output Type Determination**

After duplicate detection, classify each surviving candidate by the following decision tree. Apply before Phase 5 to avoid generating the wrong artifact type.

Decision tree:
1. **Syntactically detectable** — Pattern is mechanical and expressible as an AST rule (e.g., "always use `X` instead of `Y`") → classify as **ast-grep candidate**, not a skill. Propose in Phase 5 under "Rule candidates."
2. **Short always-apply directive** — 1–3 line rule with no workflow steps or judgment calls → classify as **CLAUDE.md candidate**, not a skill. Before classifying, grep `~/dotfiles/home/.claude/CLAUDE.md` and `~/dotfiles/home/.claude/rules/*.md` for matching directives to check for existing coverage.
3. **Multi-step procedure requiring judgment** → classify as **Skill candidate** (proceed to Phase 5 as normal).

A candidate that passes the frequency threshold but maps to types 1 or 2 is NOT a skill — list it under "Rule candidates" in Phase 5.
</output_type_determination>
```

- [ ] **Step 2: Phase 5 の表示フォーマットを更新**

`Phase 5: User Selection` の `Also show excluded candidates:` ブロックの直後に追加:

```
Rule candidates (non-skill outputs):
- {pattern-name}: ast-grep rule — detects {pattern}
- {pattern-name}: CLAUDE.md addition — "Always do X"
```

- [ ] **Step 3: Phase 6 の next steps を更新**

`file_output` セクションの `Include next steps` を以下に更新（rule candidates も含む形に）:

```xml
Include next steps in the completion message:
1. Run `empirical-prompt-tuning` to verify self-sufficiency (unclear_points = 0 is the target)
2. Manual adjustments based on eval report
3. For any rule candidates: add to `~/dotfiles/home/.claude/CLAUDE.md` or create ast-grep rule in the relevant project
4. git add
```

- [ ] **Step 4: empirical-prompt-tuning で検証**

スキル `empirical-prompt-tuning` を起動して `user-harness-gen-skills` を検証する。
目標: iter 1 で unclear_points = 0（または即修正可能な指摘のみ）。

---

## Task 3: user-pm-session — empirical-prompt-tuning 検証

**Files:**

- Modify: `home/.claude/skills/user-pm-session/SKILL.md` (tuning で修正が必要な場合)

- [ ] **Step 1: empirical-prompt-tuning を起動**

スキル `empirical-prompt-tuning` を起動して `user-pm-session` を検証する。

目標シナリオ（最低3件）:

- A: `~/prj/` に複数プロジェクト + argument なし（プロジェクト選択フロー）
- B: `~/prj/` に1プロジェクト + `project-slug` 引数あり（Step 1-2 スキップ）
- C: pmo.yaml に overdue tasks あり（🔴 表示）

- [ ] **Step 2: 指摘があれば修正して再検証**

unclear_points > 0 の場合: 指摘に応じて SKILL.md を修正し、追加イテレーション実施。
CONVERGED（unclear_points = 0）になったら完了。

---

## Task 4: user-pm-judge — empirical-prompt-tuning 検証

**Files:**

- Modify: `home/.claude/skills/user-pm-judge/SKILL.md` (tuning で修正が必要な場合)

- [ ] **Step 1: empirical-prompt-tuning を起動**

スキル `empirical-prompt-tuning` を起動して `user-pm-judge` を検証する。

目標シナリオ（最低3件）:

- A: 通常ケース（PM/プレイヤー判断）
- B: 境界ケース
- C: ホールドアウトシナリオ

- [ ] **Step 2: 指摘があれば修正して再検証**

CONVERGED になったら完了。

---

## Risks

1. **gh skill install の挙動変更** — gh skill extension が将来更新された場合、フラグが変わる可能性。Accepted（現時点では検証不可）。
2. **user-harness-gen-skills の決定ツリー追加** — 既存のエバリュエーションフローと矛盾する可能性。empirical tuning で検証する。
3. **user-pm-session/judge が多数イテレーション必要** — 10+ iters の可能性。時間がかかる場合は別セッションに分割。
