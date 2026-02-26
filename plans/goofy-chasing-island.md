# dotfiles シンプル化 - 再開計画

## Context

`feat/simplifier` ブランチでdotfilesシンプル化を進行中。元プラン（`plans/nested-greeting-liskov.md`）の全30ステップ中10完了（33%）。Phase 0-A, 0-B, Memory整理は完了済み。Phase 1の残り3ステップから再開する。

## 完了済み

- **Phase 0-A**: Git Worktree ネイティブ化 (3/3)
- **Phase 0-B**: CLAUDE.md/rules 冗長性削除 (5/5)
- **Memory整理**: claude-mem プラグイン削除（`plans/luminous-toasting-coral.md`）
- **Phase 1 部分**: Step 2 (claude.zsh削除), Step 4 (ai-interface.mdリトライ削除)

## 残作業（Phase 1〜7）

### Phase 1: バグ修正と安全な削除（残り3ステップ、並列可）

#### Step 1: snapshot-after.sh の GNU find 修正

- `scripts/system/macos/snapshot-after.sh` 行16
- `-printf '%T@ %p\n'` → `ls -t` ベースに変更
- 検証: `bash -n scripts/system/macos/snapshot-after.sh`

#### Step 3: .gitconfig の [merge] セクション統合

- `home/.gitconfig` 行28と行52に `[merge]` が重複
- 行52-53を削除し `conflictStyle = zdiff3` を行28-29配下に移動
- 検証: `git config merge.ff`, `git config merge.conflictStyle`

#### Step 5: 65_tts.zsh のコメント整理

- `home/config/zsh/65_tts.zsh`
- 行149-156の未実装オプション列挙を削除
- 行269/414の重複TODOを統一（行269のみ残す）
- 検証: `zsh -n home/config/zsh/65_tts.zsh`

---

### Phase 2: macOS前提の不要コード削除（4ステップ、並列可）

#### Step 6: ai-check.sh の GNU stat フォールバック削除

- `scripts/system/ai-check.sh` 行37,50の `|| stat -c%a` / `|| stat -c%Y` を削除
- テストファイルも同様に修正

#### Step 7: check-marketplace-health.ts の USERPROFILE 削除

- `home/.claude/hooks/check-marketplace-health.ts` 行29
- `process.env.HOME || process.env.USERPROFILE` → `process.env.HOME`

#### Step 8: auto-detect-worktree.ts の簡略化（任意）

- `home/.claude/hooks/auto-detect-worktree.ts` 行42-60を4行に

#### Step 9: 08_ai_tools.sh の Linux アーキテクチャ名削除

- `setup/08_ai_tools.sh` 行99 `arm64 | aarch64)` → `arm64)`、行100 `x86_64 | amd64)` → `x86_64)`

---

### Phase 3: エージェント定義の冗長セクション削除（4ステップ、並列可）

#### Step 10-13: 4エージェントファイルのLLM既知セクション削除

- `home/.claude/agents/codex-implementer.md` 行118-207 → 5行に
- `home/.claude/agents/gemini-reviewer.md` 行171-233 → 1行に
- `home/.claude/agents/coderabbit-reviewer.md` 行143-220 → 数行に
- `home/.claude/agents/copilot-reviewer.md` 行142-214 → 2行に
- 合計約288行削減

---

### Phase 4: AI認証・可用性の整合性修正（3ステップ、依存あり: 14||15, 15→16）

#### Step 14: check-ai-auth.sh の早期リターンパターン統一

- `home/.claude/lib/check-ai-auth.sh`
- codex/copilotをgemini式ガード節に統一（`AI_HAS_*=1`で全チェックスキップ）

#### Step 15: Codex jq検証 + Copilot gh api user 削除

- `home/config/zsh/67_ai_availability.zsh`
- 行96-107のjq追加検証削除、行148の `gh api user --jq .login` 削除

#### Step 16: _detect_ai_availability と連想配列の整理（Step 15依存）

- 案A（関数廃止）vs 案B（全AI統一）は実装時判断

---

### Phase 5: fzf/tmux パターン統一（1ステップ）

#### Step 18: _fzf_cmd ヘルパー導入

- `home/config/zsh/62_fzf-functions.zsh` に定義、9箇所の tmux 分岐を置換
- `home/config/zsh/50_aliases.zsh` の prun/mrun も適用
- 約88行削減

---

### Phase 6: setup スクリプト改善（3ステップ、並列可）

#### Step 20: link_file/link_dir 統合

- `setup/02_home.sh` の2関数を `link_item` に統合

#### Step 21: 01_base.sh の zsh 検出ロジック修正

- `setup/01_base.sh` 行37 `tail -1` → `grep -qF`、行54ハードコード修正

#### Step 22: JQ_AVAILABLE フラグ廃止

- `setup/06_claude_code.sh` jq未インストール時に早期リターン

---

### Phase 7: zsh設定の細かい整理（2ステップ）

#### Step 23: 00_environment.zsh の冗長ガード削除

- `home/config/zsh/00_environment.zsh` 行119-133の外側 `if [[ -d ]]` を除去（`add_to_path` が内部チェック済み）

#### Step 24: 65_tts.zsh の不要関数削除（Step 5依存）

- `_tts_playback_and_cleanup`, `_tts_sanitize_path` を削除しインライン化

---

## 実行戦略

Phase単位で進行。各Phase内は並列実施可能なステップを最大限並列で実行し、Phase完了後にレビュー→コミットのサイクルを回す。

**再開ポイント**: Phase 1 残り3ステップ（Step 1, 3, 5）から開始

## 検証

各Phase完了時:

1. 該当ファイルの構文チェック（`bash -n`, `zsh -n`）
2. reviewer エージェントによるコードレビュー
3. ユーザーへの進捗報告
