# gh skill Exploration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `gh skill` をインストールし、公開スキルを探索して動作確認する

**Architecture:** GitHub CLI 拡張として gh skill をインストール後、公開スキルを検索・インストール・動作確認する。既存の `home/.claude/skills/` には変更しない（読み取り専用で比較参考にする）。

**Tech Stack:** GitHub CLI (`gh`), Claude Code

---

### Task 1: gh skill インストールと動作確認

**Files:**

- なし（CLI ツールのインストールのみ）

- [ ] **Step 1: gh CLI がインストール済みか確認**

```bash
gh --version
```

Expected: `gh version X.X.X` が表示される

- [ ] **Step 2: gh skill 拡張をインストール**

```bash
gh extension install github/gh-skill
```

Expected: `✓ Installed extension github/gh-skill`

- [ ] **Step 3: インストール確認**

```bash
gh skill --help
```

Expected: usage, サブコマンド一覧が表示される

---

### Task 2: 公開スキルの探索

**Files:**

- なし

- [ ] **Step 1: 公開スキルを検索**

```bash
gh skill search
```

Expected: 公開スキルの一覧が表示される

- [ ] **Step 2: 検索結果をメモとして記録**

ターミナルの出力をそのまま報告する。カテゴリ・件数・注目スキル名を読み取る。

---

### Task 3: スキル 1 件を試験インストール（任意）

> 検索結果で気になるスキルがあれば試す。なければスキップ。

**Files:**

- `~/.claude/skills/<skill-name>/` に新規ファイル生成される可能性がある

- [ ] **Step 1: インストール対象スキルを選ぶ**

Task 2 の検索結果から 1 件選ぶ。基準：自分の環境に既存スキルと重複しないもの。

- [ ] **Step 2: スキルをインストール**

```bash
gh skill install <owner>/<skill-name>
```

- [ ] **Step 3: インストール済みスキル一覧を確認**

```bash
gh skill list
```

Expected: インストールしたスキルが一覧に表示される

- [ ] **Step 4: インストールされたファイルを確認**

```bash
ls ~/.claude/skills/
```

既存スキルに混ざっていないか確認する。

---

### 完了条件

- `gh skill` コマンドが動作する
- 公開スキルの検索結果が得られ、エコシステムの現状が把握できる
- （任意）スキル 1 件をインストールして動作確認済み

### 注意事項

- `home/.claude/skills/` は **変更しない**（symlink 先の `~/.claude/skills/` が対象）
- インストールしたスキルが既存スキルと競合した場合はアンインストールして元に戻す
- `apm compile` は **実行しない**（既存 CLAUDE.md を上書きするリスクがある）
