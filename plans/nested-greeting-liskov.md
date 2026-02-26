# dotfiles シンプル化改善プラン

## Context

最近のAI認証ロジック集約化リファクタリング（`check-ai-auth.sh`への統合）を経て、dotfiles全体の品質を向上させる。code-simplifierエージェントによる包括調査で以下を発見:

- 11箇所のtmux分岐パターンの重複
- AI認証チェックの3箇所での不整合（ファイルパス・ロジック・パターン）
- エージェント定義の約300行の冗長セクション（LLM既知の一般知識）
- macOS専用なのにLinux/Windows向けフォールバックコード
- setupスクリプトの重複関数・脆弱なロジック

**目標**: 不整合の解消、macOS専用前提の徹底、不要な複雑性の除去（行数削減は手段であり目的ではない）

## セルフレビュー: トレードオフ判定

各ステップが「構造のシンプル化」なのか「行数削減のための行数削減」なのかを評価した結果:

| Step  | 判定         | 理由                                                                                                                                                 |
| ----- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 14    | **要注意**   | 現在: `AI_HAS_*=1` でも CLI存在・応答性は常時チェック（防御的）。変更後: 全チェックスキップ。セッション中にCLI削除された場合、下流で不明瞭なエラーに |
| 17    | **削除**     | parallel-reviewerはディスパッチャー。軽量な `command -v` は適切。各起動エージェントが自身で `check-ai-auth.sh` を実行するため、二重チェックは無駄    |
| 16    | **要注意**   | 汎用関数廃止で4箇所にインライン展開 → 検出パターン変更時に4箇所修正。ただし現状で2/4AIしか使えない半端な抽象                                         |
| 19    | **削除**     | EMOJI_CLI_FILTER/ANYFRAME_SELECTORは別プラグインセクション所属。統合は論理構造を壊す。削減4行のみ                                                    |
| 8     | **任意**     | 味の問題。元コードは明示的で読みやすい。短縮版は慣れたJS開発者向き                                                                                   |
| 10-13 | **注記追加** | LLMの一般知識でもレビューチェックリストとしての一貫性は有用。「ドキュメント整理」であり「バグ削減」ではない                                          |

## 進捗管理

ステータス: `[ ]` pending / `[>]` in_progress / `[x]` done

## 実行ワークフロー

各Phaseは以下のサイクルで進行する:

1. **実装**: Phase内の全Stepを実施（並列可能なものは並列で）
2. **レビュー**: Phase完了後にコードレビューを実施（reviewer エージェント）
3. **修正**: レビュー指摘があれば対応
4. **コミット**: Phase単位または Step単位でコミット
5. **次Phase**: レビュー完了後に次のPhaseへ進行

**Phase間の区切り**: 各Phase完了時にユーザーに進捗報告し、次Phase進行の確認を取る。

---

## Phase 1: バグ修正と安全な削除（リスク低、即効性高）

各ステップは独立しており並列実施可能。

### Step 1: snapshot-after.sh の GNU find 修正 `[ ]`

- **ファイル**: `scripts/system/macos/snapshot-after.sh`
- **問題**: 行16の `-printf` は GNU find 拡張。macOS BSD find では動作しない（実バグ）
- **変更**: `find ... -printf '%T@ %p\n' | sort -rn | head -1 | cut -d' ' -f2-` → `ls -t "${SNAPSHOT_DIR}"/before_*.txt 2>/dev/null | head -1`
- **検証**: `bash -n scripts/system/macos/snapshot-after.sh`

### Step 2: claude.zsh の削除 `[ ]`

- **ファイル**: `home/config/zsh/claude.zsh`（削除）
- **問題**: `claude-mem` エイリアスが `50_aliases.zsh:27` と完全重複。`.zshrc` のグロブで拾われるだけで特別な参照なし
- **変更**: ファイル削除
- **検証**: `zsh -c 'source ~/.zshrc && type claude-mem'`

### Step 3: .gitconfig の [merge] セクション統合 `[ ]`

- **ファイル**: `home/.gitconfig`
- **問題**: `[merge]` が行28-29と行52-53に分散（機能的には動くが保守性低下）
- **変更**: 行52-53を削除し、`conflictStyle = zdiff3` を行28-29配下に追加
- **検証**: `git config merge.ff` → false, `git config merge.conflictStyle` → zdiff3

### Step 4: ai-interface.md の未実装リトライ仕様削除 `[ ]`

- **ファイル**: `home/.claude/rules/ai-interface.md`
- **問題**: 「指数バックオフ (1s, 2s, 4s, 8s max)」が一切未実装。YAGNI
- **変更**: エラー処理テーブルからリトライ行を削除
- **検証**: Markdown構文の目視確認

### Step 5: 65_tts.zsh のコメント整理 `[ ]`

- **ファイル**: `home/config/zsh/65_tts.zsh`
- **問題**: 行149-156の未実装オプション列挙（YAGNI）、行269/414の重複TODO
- **変更**: 将来拡張コメント6行削除、重複TODO統一（行269のみ残す）
- **検証**: `zsh -n home/config/zsh/65_tts.zsh`

---

## Phase 2: macOS前提の不要コード削除（リスク低、独立性高）

各ステップは独立しており並列実施可能。

### Step 6: ai-check.sh の GNU stat フォールバック削除 `[ ]`

- **ファイル**: `scripts/system/ai-check.sh`、`tests/unit/test_ai_check.bats`、`tests/unit/test_ai_interface.bats`
- **変更**: 行37, 50の `|| stat -c%a` / `|| stat -c%Y` フォールバックを削除。テストファイルの同パターン（`stat -f%z`/`stat -c%s`, `stat -f%A`/`stat -c%a`）も同様に修正
- **検証**: `bash scripts/system/ai-check.sh`

### Step 7: check-marketplace-health.ts の USERPROFILE 削除 `[ ]`

- **ファイル**: `home/.claude/hooks/check-marketplace-health.ts`
- **変更**: 行29 `process.env.HOME || process.env.USERPROFILE` → `process.env.HOME`
- **検証**: TypeScript構文確認

### Step 8: auto-detect-worktree.ts の isWorktree() 簡略化 `[ ]` **(任意)**

- **ファイル**: `home/.claude/hooks/auto-detect-worktree.ts`
- **変更**: 行42-60の19行を4行に:
  ```typescript
  function isWorktree(): boolean {
    const gitPath = path.join(process.cwd(), '.git');
    return fs.existsSync(gitPath) && fs.statSync(gitPath).isFile();
  }
  ```
- **注意**: 元コードは各条件を明示的に分岐しており、「なぜ .git がファイルだと worktree なのか」が読みやすい。短縮版はJS慣れた人向き。好みの問題であり、バグ削減効果は薄い
- **検証**: TypeScript構文確認

### Step 9: 08_ai_tools.sh の Linux アーキテクチャ名削除 `[ ]`

- **ファイル**: `setup/08_ai_tools.sh`
- **変更**: 行99 `arm64 | aarch64)` → `arm64)`、行100 `x86_64 | amd64)` → `x86_64)`
  - `ARCH_NAME` マッピング（arm64→aarch64）はダウンロードURL用に維持
- **検証**: `bash -n setup/08_ai_tools.sh`

---

## Phase 3: エージェント定義の冗長セクション削除（リスク低、約300行削減）

LLMが既知の一般知識の列挙を削除。各ステップ独立。
**注意**: これらは「ドキュメント整理」であり「バグ削減」ではない。レビューチェックリストとしての一貫性確保の役割はあるが、個人用dotfilesでは一貫性要件が低く、コンテキストウィンドウ節約の方が有益と判断。

### Step 10: codex-implementer.md エラーハンドリング削減 `[ ]`

- **ファイル**: `home/.claude/agents/codex-implementer.md`
- **変更**: 行118-207（90行）→ 簡潔な5行に統合。CLI Not Installed/Auth Failureはcheck-ai-auth.sh重複のため削除
- **削減**: 約85行

### Step 11: gemini-reviewer.md Design Principles 削除 `[ ]`

- **ファイル**: `home/.claude/agents/gemini-reviewer.md`
- **変更**: 行171-233（63行）→ 1行の概要に置換（SOLID/DDD等はLLM既知）
- **削減**: 約60行

### Step 12: coderabbit-reviewer.md OWASP+Performance 削除 `[ ]`

- **ファイル**: `home/.claude/agents/coderabbit-reviewer.md`
- **変更**: 行143-220（77行）→ 各2行の概要に置換
- **削減**: 約73行

### Step 13: copilot-reviewer.md GitHub Review Focus 削除 `[ ]`

- **ファイル**: `home/.claude/agents/copilot-reviewer.md`
- **変更**: 行142-214（73行）→ 2行の概要に置換
- **削減**: 約70行

---

## Phase 4: AI認証・可用性の整合性修正（リスク中、依存関係あり）

**依存関係**: Step 15→16（同一ファイル）、Step 14→17（check-ai-auth.sh利用）。Step 14とStep 15は独立で並列可

### Step 14: check-ai-auth.sh の早期リターンパターン統一 `[ ]`

- **ファイル**: `home/.claude/lib/check-ai-auth.sh`
- **問題**: 早期リターンが2パターン混在（codex/copilot: AND条件、gemini/coderabbit: ガード節）
- **変更**: gemini式のガード節パターンに統一（geminiは既にこの形）:
  ```bash
  codex)
      if [[ "${AI_HAS_CODEX:-}" != "1" ]]; then
          # CLI存在・認証ファイル・応答性の全チェック
      fi
      ;;
  ```
  現在のcodex/copilotでは `AI_HAS_*=1` の場合でもCLI存在・応答性チェックが走るが、gemini/coderabbitでは全スキップ。この不整合をgemini式に統一する
- **トレードオフ**: `AI_HAS_*=1` で全チェックスキップ → セッション中にCLIが削除された場合、下流で不明瞭なエラー。ただし:
  - `AI_HAS_*` はシェル起動時にCLI存在+認証+応答性を全検証済み
  - セッション中のCLI削除は極めて稀（個人環境）
  - 下流のCLI呼び出し自体がエラーを返すため、最終的にはキャッチされる
- **効果**: B-5（認証ファイルパス不整合）が自然解消
- **検証**: `AI_HAS_CODEX=1 bash home/.claude/lib/check-ai-auth.sh codex && echo OK`

### Step 15: Codex jq検証 + Copilot gh api user 削除 `[ ]`

- **ファイル**: `home/config/zsh/67_ai_availability.zsh`
- **変更**:
  - 行96-107: jq追加検証を削除。`_detect_ai_availability` 成功で `AI_HAS_CODEX=1` に直結
  - 行147-148: `gh api user --jq .login` を削除。`gh auth status` のみに簡略化（ネットワーク通信不要に）
- **削減**: 約20行
- **検証**: `zsh -n home/config/zsh/67_ai_availability.zsh && source home/config/zsh/67_ai_availability.zsh`

### Step 16: _detect_ai_availability と連想配列の整理 `[ ]` **← Step 15 に依存**

- **ファイル**: `home/config/zsh/67_ai_availability.zsh`
- **問題**: 汎用関数をCodex/CodeRabbitのみ使用、Gemini/Copilotは独自実装。連想配列も部分的にしか参照されない
- **変更**: 2つの選択肢（実装時に判断）:
  - **案A（関数廃止）**: 4AI全てを個別インラインに統一。`_check_cli_responsiveness` ヘルパーは残す
    - 利点: 各AIの検出ロジックが自己完結。読みやすい
    - 欠点: 検出パターン変更時に4箇所修正（anti-DRY）
  - **案B（関数を全AIで使用に拡張）**: Gemini/Copilotも `_detect_ai_availability` を使うように修正
    - 利点: DRY維持。新AI追加時に関数呼び出しのみ
    - 欠点: 関数に各AI固有の特殊要件を吸収する必要あり（複雑化リスク）
  - いずれの場合も未使用の連想配列エントリは整理
- **削減**: 案Aで約20行、案Bで約10行
- **検証**: `source home/config/zsh/67_ai_availability.zsh && echo $AI_AVAILABLE_MODELS`

### ~~Step 17: parallel-reviewer.md の可用性チェック統一~~ **削除**

- **理由**: parallel-reviewerはディスパッチャー役。軽量な `command -v` チェックはこの役割に適切。各起動エージェント（codex-reviewer等）が自身のline 16で `check-ai-auth.sh` を実行するため、ディスパッチャーでの重複チェックは無駄。さらにサブエージェント内では `AI_HAS_*` が未設定で毎回フルチェック（CLI応答性含む、最大8秒のオーバーヘッド）が走る

---

## Phase 5: fzf/tmux パターン統一（リスク中、影響11箇所）

### Step 18: _fzf_cmd ヘルパー導入 + fzf関連ファイル適用 `[ ]`

- **ファイル**: `home/config/zsh/62_fzf-functions.zsh`（定義+適用）、`home/config/zsh/50_aliases.zsh`（適用）
- **変更**:
  - `62_fzf-functions.zsh` 冒頭に `_fzf_cmd` ヘルパーを定義:
    ```zsh
    _fzf_cmd() {
        if [[ -n "$TMUX" ]]; then fzf-tmux -p 90%,90% -- "$@"
        else fzf "$@"; fi
    }
    ```
  - 同ファイル内6関数（`fzf-select-history`, `fzf-src`, `fcd`, `fzf-git-branch`, `gifit`）のtmux分岐を `_fzf_cmd` に置換
  - 特に `fcd` は tmux x fd の4パターン → fd有無の2パターンに半減
  - `50_aliases.zsh` の `prun`(行62-70) / `mrun`(行72-83) も `_fzf_cmd` に置換
  - **注**: `50_aliases.zsh` は `62_fzf-functions.zsh` より先にsourceされるが、`prun`/`mrun` は関数定義のみでsource時には実行されない。ユーザーがランタイムで呼び出す時点ではすべてのファイルがsource済みのため `_fzf_cmd` は利用可能
- **削減**: 約88行
- **検証**: `zsh -n home/config/zsh/62_fzf-functions.zsh && zsh -c 'source ~/.zshrc; type _fzf_cmd'`、手動で `prun` / `mrun` を実行

### ~~Step 19: 61_plugins.zsh の tmux 判定統合~~ **削除**

- **理由**: `EMOJI_CLI_FILTER`(行57-61)と`ANYFRAME_SELECTOR`(行107-111)は別プラグインセクション（emoji-cli / anyframe）に所属。統合すると「各セクションが自プラグインを設定する」というファイル構造が崩れる。削減は4行のみで、構造破壊のコストに見合わない

---

## Phase 6: setup スクリプト改善（リスク中、初期セットアップに影響）

### Step 20: link_file/link_dir 統合 `[ ]`

- **ファイル**: `setup/02_home.sh`
- **変更**: `link_file`(行20-49) と `link_dir`(行53-82) を `link_item` に統合（`-f`/`-d` → `-e`）。呼び出し箇所10箇所を更新
- **削減**: 約30行
- **検証**: `bash -n setup/02_home.sh && bash setup/02_home.sh`

### Step 21: 01_base.sh の zsh 検出ロジック修正 `[ ]`

- **ファイル**: `setup/01_base.sh`
- **変更**:
  - 行37: `tail -1 /etc/shells` → `grep -qF "$WHICH_ZSH" /etc/shells`
  - 行54: `chsh -s /opt/homebrew/bin/zsh` → `chsh -s "$WHICH_ZSH"`（ハードコード修正）
  - 行6: `set -e` コメントアウト理由を追記
- **検証**: `bash -n setup/01_base.sh`

### Step 22: JQ_AVAILABLE フラグ廃止 `[ ]`

- **ファイル**: `setup/06_claude_code.sh`
- **変更**: 行70-76のフラグ設定 → jq未インストール時は `exit 0` で早期リターン。行83/95の `JQ_AVAILABLE` チェックを削除
- **削減**: 約10行
- **検証**: `bash -n setup/06_claude_code.sh`

---

## Phase 7: zsh設定の細かい整理 + TTS改善（リスク低）

### Step 23: 00_environment.zsh の冗長ガード削除 `[ ]`

- **ファイル**: `home/config/zsh/00_environment.zsh`
- **変更**: 行119-133の `if [[ -d ... ]]; then add_to_path ...; fi` → `add_to_path ...` 直接呼び出し（`add_to_path` が内部で存在チェック済み）
- **削減**: 15行 → 3行（-12行）
- **検証**: `zsh -n home/config/zsh/00_environment.zsh && zsh -c 'source ~/.zshrc; echo $PATH'`

### Step 24: 65_tts.zsh の不要関数削除 `[ ]` **← Step 5 に依存**

- **ファイル**: `home/config/zsh/65_tts.zsh`
- **変更**:
  - `_tts_playback_and_cleanup`(行118-130) 削除 → 呼び出し箇所(行279, 431)を `_tts_playback + _tts_cleanup` に直接置換
  - `_tts_sanitize_path`(行33-35) 削除 → 呼び出し箇所(行217, 384)を `_tts_sanitize "$1"` に置換
- **削減**: 約18行
- **検証**: `zsh -n home/config/zsh/65_tts.zsh`

---

## サマリー

| Phase                         | Steps                         | 削減見込み           | リスク | 並列可                  |
| ----------------------------- | ----------------------------- | -------------------- | ------ | ----------------------- |
| 1: バグ修正・安全な削除       | 1-5                           | ~12行 + ファイル削除 | 低     | 全て                    |
| 2: macOS前提の不要コード      | 6-9                           | ~18行                | 低     | 全て（8は任意）         |
| 3: エージェント冗長セクション | 10-13                         | ~288行               | 低     | 全て                    |
| 4: AI認証整合性修正           | 14-16                         | ~40行                | 中     | 14\|\|15, 15→16         |
| 5: fzf/tmux統一               | 18                            | ~88行                | 中     | -                       |
| 6: setupスクリプト            | 20-22                         | ~40行                | 中     | 全て                    |
| 7: zsh/TTS整理                | 23-24                         | ~30行                | 低     | 23は独立, 24はStep5依存 |
| **合計**                      | **22 steps** (実施21 + 任意1) | **~516行**           |        |                         |

**削除したステップ（トレードオフ不利）:**

- ~~Step 17~~: parallel-reviewerのディスパッチャー役に `check-ai-auth.sh` は過剰（各起動エージェントが自身でチェック済み）
- ~~Step 19~~: 61_plugins.zshのtmux統合はファイル構造を壊す（削減4行のみ）

## コミット戦略

各ステップを1コミット。タイプ: `fix`(バグ修正) / `refactor`(整理) / `docs`(ドキュメント)

## Phase完了チェックリスト

各Phase完了時に確認:

- [ ] 全Stepの検証コマンドが成功
- [ ] reviewer エージェントによるコードレビュー実施
- [ ] レビュー指摘の修正完了
- [ ] ユーザーへの進捗報告
- [ ] 次Phase進行の承認取得
