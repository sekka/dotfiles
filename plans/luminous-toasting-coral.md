# Memory 機能の整理: 組み込み /memory への統合

## Context

Claude Code v2.1.59 で auto-memory（自動メモリ保存）と `/memory` コマンド（手動管理）が組み込み機能として成熟した。これにより、同等の目的で自作・導入していた以下が冗長になった:

1. **memorizing スキル** - 自作の永続メモリ（`/memory` と同じ目的）
2. **claude-mem プラグイン** - サードパーティ MCP（auto-memory と同じ目的）
3. **関連する権限・フック・エイリアス・セットアップ設定**

**目標**: これらを削除し、Claude Code 組み込みの memory 機能に一本化する。

---

## Step 1: memorizing スキル削除

- **削除**: `home/.claude/skills/memorizing/` ディレクトリごと削除
  - `SKILL.md` + 空の `memories/plugin-issues/` ディレクトリ
- **検証**: `ls home/.claude/skills/ | grep memoriz` でヒットしないこと

## Step 2: claude-mem 設定ファイル削除

- **削除**: `home/.claude-mem/settings.json`（ディレクトリごと）
- **検証**: `ls home/.claude-mem/` で存在しないこと

## Step 3: claude.zsh 削除

- **削除**: `home/config/zsh/claude.zsh`（claude-mem エイリアスの重複ファイル）
- **検証**: `ls home/config/zsh/claude.zsh` で存在しないこと

## Step 4: 50_aliases.zsh から claude-mem エイリアス削除

- **ファイル**: `home/config/zsh/50_aliases.zsh`
- **変更**: 26-27行目の claude-mem エイリアスとコメントを削除
  ```
  # Claude Code メモリプラグインのワーカーサービス起動
  alias claude-mem='bun "$HOME/.claude/plugins/marketplaces/thedotmack/plugin/scripts/worker-service.cjs"'
  ```
- **検証**: `grep claude-mem home/config/zsh/50_aliases.zsh` でヒットしないこと

## Step 5: settings.json から claude-mem 関連を全削除

- **ファイル**: `home/.claude/settings.json`
- **変更**:
  1. `permissions.allow` から削除:
     - `"Skill(agent-memory)"` (行100) — 実体なし
     - `"Skill(memorizing)"` (行107)
     - `"mcp__plugin_claude-mem_mem-search__*"` (行121)
  2. `hooks` から全 `ccm hook` エントリを削除:
     - PreToolUse の `ccm hook PreToolUse` (行186-194)
     - PostToolUse の `ccm hook PostToolUse` (行210-218)
     - Stop の `ccm hook Stop` (行229-237)
     - Notification の `ccm hook Notification` (行249-257)
     - UserPromptSubmit の `ccm hook UserPromptSubmit` (行259-267) — **セクションごと空になるので `UserPromptSubmit` キー自体を削除**
  3. `enabledPlugins` から削除:
     - `"claude-mem@thedotmack": true` (行308)
  4. `extraKnownMarketplaces` から削除:
     - `"thedotmack"` ブロック (行338-343)
     - `"claude-mem-jp"` ブロック (行362-367)
- **検証**: `grep -c "claude-mem\|ccm hook\|memorizing\|agent-memory" home/.claude/settings.json` → 0

## Step 6: setup/02_home.sh から claude-mem セクション削除

- **ファイル**: `setup/02_home.sh`
- **変更**:
  - claude-mem 設定セクション削除 (行218-226):
    ```bash
    # claude-mem 設定
    echo ""
    echo "claude-mem 設定のシンボリックリンクを作成..."
    ensure_dir "$HOME/.claude-mem"
    link_file "$HOME/dotfiles/home/.claude-mem/settings.json" "$HOME/.claude-mem/settings.json" "settings.json"
    ```
  - 完了メッセージから `.claude-mem/` 行を削除 (行301)
- **検証**: `grep claude-mem setup/02_home.sh` でヒットしないこと

## Step 7: learn スキルから memorizing 参照を削除

- **ファイル**: `home/.claude/skills/learn/SKILL.md`
- **変更**: 行281 `- \`memorizing\`スキル: メモリ保存の既存実装` を削除
- **検証**: `grep memorizing home/.claude/skills/learn/SKILL.md` でヒットしないこと

## Step 8: settings.local.json から claude-mem ドメイン権限削除

- **ファイル**: `.claude/settings.local.json`
- **変更**: `"WebFetch(domain:docs.claude-mem.ai)"` を `permissions.allow` から削除
- **検証**: `grep claude-mem .claude/settings.local.json` でヒットしないこと

## Step 9: ドキュメントから claude-mem / memorizing 参照を削除

- **ファイル**:
  - `README.md`: claude-mem API キー説明 3行を削除（行138, 143-144）
  - `docs/claude-code-cheatsheet.md`: `/memorizing` の説明セクション（行308付近）とテーブル行（行394）を削除
  - `docs/CHEATSHEET.md`: `claude-mem` エイリアスのテーブル行（行82）を削除
- **検証**: `grep -r "claude-mem\|memorizing" README.md docs/` でヒットしないこと

---

## セルフレビュー

### 漏れチェック（grep -r 結果との突合）

| ファイル                                  | 対応 Step                    |
| ----------------------------------------- | ---------------------------- |
| `home/.claude/skills/memorizing/SKILL.md` | Step 1 ✓                     |
| `home/.claude-mem/settings.json`          | Step 2 ✓                     |
| `home/config/zsh/claude.zsh`              | Step 3 ✓                     |
| `home/config/zsh/50_aliases.zsh`          | Step 4 ✓                     |
| `home/.claude/settings.json`              | Step 5 ✓                     |
| `setup/02_home.sh`                        | Step 6 ✓                     |
| `home/.claude/skills/learn/SKILL.md`      | Step 7 ✓                     |
| `.claude/settings.local.json`             | Step 8 ✓                     |
| `README.md`                               | Step 9 ✓                     |
| `docs/claude-code-cheatsheet.md`          | Step 9 ✓                     |
| `docs/CHEATSHEET.md`                      | Step 9 ✓                     |
| `plans/nested-greeting-liskov.md`         | 計画ファイル自体（変更不要） |
| `plans/luminous-toasting-coral.md`        | 本計画（変更不要）           |

### 副作用チェック

- **hooks 構造**: ccm hook 削除後、PreToolUse/PostToolUse/Stop/Notification は他のフックが残る。UserPromptSubmit のみ空になるためキー自体を削除 ✓
- **JSON 妥当性**: settings.json の配列・オブジェクトから要素削除時にカンマの調整が必要。検証で `python3 -m json.tool` チェック ✓
- **ランタイムのシンボリックリンク**: `~/.claude-mem/settings.json` は実環境にシンボリックリンクとして残る可能性あり。手動削除の注意を記載 ✓

### トレードオフ

- **失うもの**: claude-mem の自動 observation 記録（セッション冒頭のコンテキスト情報）
- **得るもの**: フック実行のオーバーヘッド削減（全ツール呼び出し時の ccm hook 5箇所）、コンテキストウィンドウ節約、依存関係の簡素化
- **代替**: Claude Code 組み込み auto-memory が同等機能を提供

---

## 既存プランとの関係

`plans/nested-greeting-liskov.md` の以下ステップは本プランに吸収:

- **Step 2 (claude.zsh の削除)** → 本プラン Step 3 に統合

---

## 検証（全体）

```bash
# 削除されたファイル・ディレクトリ
test ! -d home/.claude/skills/memorizing && echo "OK: memorizing skill removed"
test ! -d home/.claude-mem && echo "OK: claude-mem settings dir removed"
test ! -f home/config/zsh/claude.zsh && echo "OK: claude.zsh removed"

# 全ファイルで残存参照がないこと
grep -r "claude-mem\|memorizing\|agent-memory\|ccm hook" \
  home/.claude/settings.json \
  .claude/settings.local.json \
  home/config/zsh/50_aliases.zsh \
  setup/02_home.sh \
  home/.claude/skills/learn/SKILL.md \
  README.md \
  docs/claude-code-cheatsheet.md \
  docs/CHEATSHEET.md \
  && echo "FAIL: references remain" || echo "OK: all references cleaned"

# settings.json が有効な JSON であること
python3 -m json.tool home/.claude/settings.json > /dev/null && echo "OK: valid JSON"
python3 -m json.tool .claude/settings.local.json > /dev/null && echo "OK: valid local JSON"

# zsh 構文チェック
zsh -n home/config/zsh/50_aliases.zsh && echo "OK: aliases syntax"

# setup スクリプト構文チェック
bash -n setup/02_home.sh && echo "OK: setup syntax"
```

## 実環境の手動クリーンアップ（実装後に案内）

```bash
# dotfiles 管理外のシンボリックリンク・データを削除
rm -f ~/.claude-mem/settings.json
rm -rf ~/.claude-mem/  # データディレクトリ（observations 等）
```
