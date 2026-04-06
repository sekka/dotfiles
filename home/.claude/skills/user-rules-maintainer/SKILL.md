---
name: user-rules-maintainer
description: >
  Harness（CLAUDE.md, rules, skills, memory）の鮮度維持と整合性チェックを行うスキル。
  コードベースの実態とドキュメントの乖離を検出し、更新提案を行う。
  修正はユーザー承認後にのみ適用する。
  「ルール更新」「CLAUDE.mdチェック」「メモリ整理」「ドキュメントの鮮度チェック」
  「ルールファイルをメンテして」「設定を見直したい」等のリクエストで使用する。
---

# Rules Maintainer

Harness を実装の実態と照合し、陳腐化を検出・修正提案する。
修正はユーザー承認後にのみ適用する。

## Iron Law

1. ユーザー承認なしにルールファイルを変更しない

## フロー

```
Phase 1〜3 は独立しており並列実行可能

Phase 1: ルールファイル照合（CLAUDE.md, rules）
Phase 2: スキル description 照合（skills/*/SKILL.md）
Phase 3: メモリ整理（memory/）
    ↓
構造化レポート出力 → ユーザー承認 → 修正適用
```

## Phase 1: ルールファイル照合

対象: `.claude/CLAUDE.md`, `home/.claude/CLAUDE.md`, `home/.claude/rules/*.md`
存在しないファイルはスキップ。

### チェック観点

1. **ディレクトリ構造** — コードブロック内のパスが実在するか Glob で確認
2. **コマンド** — bash ブロック内のファイルパスが存在するか確認（実行はしない）
3. **ツールチェーン** — 記載ツールが `which` でインストール確認
4. **参照先** — harness 関連パス（`.claude/`, `home/.claude/`, `docs/`）への参照が有効か確認。コード例・コメント内の参照は除外
5. **矛盾** — グローバルとプロジェクト固有 CLAUDE.md で同一トピックの矛盾がないか

## Phase 2: スキル description 照合

対象: `home/.claude/skills/*/SKILL.md` の frontmatter を抽出し解析。
description の乖離チェックが必要なスキルのみ全文を読む。

### チェック観点

1. **description と内容の乖離** — description のトリガー条件・機能がワークフローと合っているか
2. **無効な参照** — allowed-tools やファイルパスが有効か
3. **重複スキル** — 完全に機能が重複するペアのみ報告

## Phase 3: メモリ整理

対象: `~/.claude/projects/-Users-kei-dotfiles/memory/`
ディレクトリが空なら「メモリ未使用」と報告してスキップ。

### チェック観点

1. **陳腐化** — メモリ内のファイルパス・設定名が現コードベースに存在するか
2. **重複** — 同じ情報を異なる表現で記録しているもの
3. **MEMORY.md 整合性** — インデックスと実ファイルの 1:1 対応
4. **分類の妥当性** — type（user/feedback/project/reference）が内容に合っているか

## レポート出力

```markdown
## Phase N: [フェーズ名] 結果

| # | 種別 | 対象ファイル | 問題 | 提案 |
|---|------|-----------|------|------|
| 1 | 陳腐化 | .claude/CLAUDE.md:45 | `scripts/foo.sh` が存在しない | 該当行を削除 |

問題なし: ✅ [チェック項目名]
```

問題ゼロの Phase は「✅ 全項目問題なし」と1行で報告。

## 修正適用

1. 「現在の記述」と「提案」の diff を提示
2. 一括適用 or 個別選択を確認（AskUserQuestion）
3. 承認された修正のみ適用

**修正はユーザー承認なしに実行しない。**

## スコープ外

- コードの品質レビュー（→ `/review-and-improve`）
- 新しいルールの提案（既存の整合性チェックのみ）
- Nix / Brewfile の内容検証（ツール存在確認のみ）
- メモリの新規作成（整理のみ）
