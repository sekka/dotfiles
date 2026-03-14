# qmd フロントエンドナレッジ 使い方ガイド

## 概要

`qmd` を使って `~/.claude/skills/managing-frontend-knowledge/knowledge/` の Markdown ファイルを
SQLite インデックスに変換し、セマンティック検索を可能にする。

ファイルを直読みするより **トークンを最大 96% 削減** できる。

---

## インストール

```bash
# qmd 本体（未インストールの場合）
npm install -g @tobilu/qmd
# または
bun install -g @tobilu/qmd
```

---

## セットアップ（初回 / 新規マシン）

```bash
~/dotfiles/scripts/setup-qmd.sh
```

- 既存インデックスがある場合は自動スキップ（冪等）
- 初回は埋め込みベクター生成で数分かかる
- インデックス保存先: `~/.local/share/qmd/frontend.sqlite`

---

## 日常的な使い方

```bash
# セマンティック検索（推奨）
qmd-fe query "CSS animation performance"
qmd-fe query "Grid vs Flexbox"

# キーワード検索（高速）
qmd-fe search "View Transitions"
qmd-fe search "prefers-reduced-motion"
```

---

## ナレッジ更新後の操作

```bash
# git pull でナレッジ MD が更新されたとき（差分のみ再埋め込み、数秒〜）
qmd-fe embed

# ナレッジを大幅削除・再編成したとき（完全再構築）
rm "$QMD_FRONTEND_INDEX" && ~/dotfiles/scripts/setup-qmd.sh
```

---

## 環境変数 / エイリアス

| 名前                 | 値                                     | 定義ファイル                         |
| -------------------- | -------------------------------------- | ------------------------------------ |
| `QMD_FRONTEND_INDEX` | `~/.local/share/qmd/frontend.sqlite`   | `home/config/zsh/00_environment.zsh` |
| `qmd-fe`             | `INDEX_PATH="$QMD_FRONTEND_INDEX" qmd` | `home/config/zsh/50_aliases.zsh`     |

---

## トラブルシューティング

| 症状                       | 対処                                                           |
| -------------------------- | -------------------------------------------------------------- |
| `qmd: command not found`   | `npm install -g @tobilu/qmd` を実行                            |
| 埋め込み生成が途中で失敗   | スクリプトが自動で DB を削除するので再度 `setup-qmd.sh` を実行 |
| 検索結果が古い             | `qmd-fe embed` で差分更新                                      |
| インデックスを完全リセット | `rm "$QMD_FRONTEND_INDEX" && ~/dotfiles/scripts/setup-qmd.sh`  |

---

## SQLite は git 管理しない

`.gitignore` に `.sqlite` 除外設定済み。各環境で `setup-qmd.sh` を実行してローカルに生成する。
