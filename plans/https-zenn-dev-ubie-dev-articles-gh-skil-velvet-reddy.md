# Plan: 20_claude.sh — gh skill 管理の堅牢化

## Context

`setup/20_claude.sh` にサードパーティスキルを `gh skill` で管理する仕組みを追加した。
記事（[gh skill - GitHub's Official Agent Skills Manager](https://zenn.dev/ubie_dev/articles/gh-skill-install-agent-skills)）のレビューと実装分析で、以下の問題が発覚した：

1. **`gh` CLI チェックがない** — `jq`・`claude` は確認しているが `gh` は無チェック。失敗がサイレント。
2. **`2>/dev/null` でエラーを全消し** — `gh skill install` の失敗原因が一切わからない。
3. **更新に `gh skill install -f` を使っている** — `gh skill update` という専用コマンドがある。
4. **`--update` が `setup.sh` から渡されない** — `setup.sh` は引数なしでスクリプトを呼ぶため `UPDATE_MODE` は常に `false`。スキルは初回以降更新されない。
5. **孤立スキルのクリーンアップがない** — `GH_SKILLS` から削除しても `~/.claude/skills/<name>/` が残る。

---

## Implementation Plan

### Step 1: `gh` CLI の事前チェックを追加

**File:** `setup/20_claude.sh`

`jq` チェック（line 56）と同じパターンで追加。スキルセクションの直前（line 224 付近）に配置。

```bash
if ! is_installed gh; then
  log_warn "gh がインストールされていません。サードパーティスキルのセットアップをスキップします"
  # スキルループに入らず後続のサマリーへ
fi
```

スキルループ全体を `if is_installed gh; then ... fi` でガードする形にする。

---

### Step 2: エラー出力を表示するよう修正

**File:** `setup/20_claude.sh` — `ensure_gh_skill` 関数（lines 237–261）

`2>/dev/null` を削除し、失敗時は stderr を表示する。

```bash
# Before
if ! gh skill install "$repo" "$path" --agent claude-code --scope user -f 2>/dev/null; then
  log_warn "スキルのインストールに失敗しました: $skill（続行します）"

# After
if ! gh skill install "$repo" "$path" --agent claude-code --scope user -f; then
  log_warn "スキルのインストールに失敗しました: $skill（続行します）"
```

---

### Step 3: 更新時は `gh skill update` を使う

**File:** `setup/20_claude.sh` — `ensure_gh_skill` 関数（line 245）

`gh skill` には専用の update コマンドがある。`--update` モード時のみ切り替え。

```bash
# Before (update branch)
gh skill install "$repo" "$path" --agent claude-code --scope user -f 2>/dev/null

# After
gh skill update "$skill" --scope user
```

> **注意:** `gh skill update` の引数がスキル名なのかリポジトリ名なのか要動作確認。
> 実装時に `gh skill update --help` で確認してから適用する。
> 確認できない場合は `gh skill install -f` のまま維持する（後退しない）。

---

### Step 4: `setup.sh` から `--update` を伝播させる

**File:** `setup/setup.sh`

現在はすべてのスクリプトを引数なしで呼んでいる。`--update` を受け取ったら転送する。

```bash
# setup.sh の引数解析に追加
UPDATE_FLAG=""
for arg in "$@"; do
  [[ "$arg" == "--update" ]] && UPDATE_FLAG="--update"
done

# スクリプト呼び出し時に渡す
if ! /bin/bash "$script" $UPDATE_FLAG; then
```

これにより `./setup/setup.sh --update` で全スキル・プラグインの更新が動くようになる。

---

### Step 5: 孤立スキルのクリーンアップ（オプション）

`GH_SKILLS` の管理下スキルのみを対象に、配列に存在しないディレクトリを検出して警告する。
実際の削除は行わない（安全側に倒す）。

```bash
# GH_SKILLS のスキル名一覧を収集
managed_skills=()
for entry in "${GH_SKILLS[@]}"; do
  read -r _ skill _ <<<"$entry"
  managed_skills+=("$skill")
done

# ~/.claude/skills/ の各ディレクトリを確認
while IFS= read -r skill_dir; do
  skill_name=$(basename "$skill_dir")
  if [[ ! " ${managed_skills[*]} " =~ " $skill_name " ]]; then
    log_warn "孤立スキルを検出: $skill_name（GH_SKILLS に未登録。手動で確認してください）"
  fi
done < <(find "$HOME/.claude/skills" -mindepth 1 -maxdepth 1 -type d 2>/dev/null)
```

---

## Files to Modify

| File                 | Changes                                                            |
| -------------------- | ------------------------------------------------------------------ |
| `setup/20_claude.sh` | Step 1〜3・5（gh チェック・エラー表示・update コマンド・孤立検出） |
| `setup/setup.sh`     | Step 4（`--update` フラグの伝播）                                  |

---

## Verification

```bash
# 通常のセットアップ（初回インストールのみ）
./setup/setup.sh

# 更新モード（スキル・プラグインを最新化）
./setup/setup.sh --update

# gh がない環境のシミュレーション
PATH_BAK=$PATH; export PATH=${PATH/\/usr\/local\/bin/}  # gh を除外
./setup/20_claude.sh  # [WARN] が出てスキップされることを確認
export PATH=$PATH_BAK

# エラーが表示されることの確認
# GH_SKILLS に存在しないリポジトリを一時追加して実行し、エラー文が出るか確認
```

---

## Risks

| リスク                                    | 対処                                                          |
| ----------------------------------------- | ------------------------------------------------------------- |
| `gh skill update` の引数仕様が不明        | 実装時に `--help` で確認。不明なら install -f を維持          |
| `setup.sh` の引数変更が他スクリプトに影響 | `$UPDATE_FLAG` は 20_claude.sh 以外では無視されるので影響なし |
| stderr 表示でログが増える                 | 失敗時のみ出力されるので通常実行への影響なし                  |
