# qmd フロントエンドナレッジ 使い方ガイド

## 概要

`qmd` を使って `~/.claude/skills/user-managing-frontend-knowledge/knowledge/` の Markdown ファイルを
統一インデックスの `frontend` コレクションとして登録し、セマンティック検索を可能にする。

ファイルを直読みするより **トークンを最大 96% 削減** できる。

> qmd v2 では INDEX_PATH 環境変数は廃止され、`~/.cache/qmd/index.sqlite` を共有。
> コレクション名で論理分離する設計になっている。

---

## インストール

```bash
# qmd 本体（未インストールの場合）
bun install -g @tobilu/qmd
# または
npm install -g @tobilu/qmd
```

bun の global bin (`~/.cache/.bun/bin`) は `home/config/zsh/00_environment.zsh` で PATH に追加済み。

---

## セットアップ（初回 / 新規マシン）

```bash
~/dotfiles/setup/setup-qmd.sh
```

- 既に `frontend` コレクションが登録済みなら自動スキップ（冪等）
- `setup/06_claude.sh` から自動的に呼び出される
- 初回は埋め込みベクター生成で数分かかる
- インデックス保存先: `~/.cache/qmd/index.sqlite`（コレクション名で分離）

---

## 日常的な使い方

```bash
# セマンティック検索（推奨。qmd-fe = qmd query -c frontend のエイリアス）
qmd-fe "CSS animation performance"
qmd-fe "Grid vs Flexbox"

# キーワード検索（BM25、高速）
qmd search -c frontend "View Transitions"
qmd search -c frontend "prefers-reduced-motion"

# 単一ファイルの取得
qmd get knowledge/css/layout/container-query.md

# 状態確認
qmd status
qmd collection list
qmd ls frontend
```

---

## ナレッジ更新後の操作

```bash
# git pull でナレッジ MD が更新されたとき
qmd update      # 差分インデックス
qmd embed       # 差分埋め込み

# ナレッジを大幅削除・再編成したとき（完全再構築）
qmd collection remove frontend && ~/dotfiles/setup/setup-qmd.sh
```

---

## エイリアス

| 名前     | 値                      | 定義ファイル                     |
| -------- | ----------------------- | -------------------------------- |
| `qmd-fe` | `qmd query -c frontend` | `home/config/zsh/50_aliases.zsh` |

---

## トラブルシューティング

| 症状                       | 対処                                                                          |
| -------------------------- | ----------------------------------------------------------------------------- |
| `qmd: command not found`   | `bun install -g @tobilu/qmd` を実行。`~/.cache/.bun/bin` が PATH にあるか確認 |
| 埋め込み生成が途中で失敗   | `~/dotfiles/setup/setup-qmd.sh` を再実行（差分のみ再生成、復旧可能）          |
| 検索結果が古い             | `qmd update && qmd embed` で差分更新                                          |
| インデックスを完全リセット | `qmd collection remove frontend && ~/dotfiles/setup/setup-qmd.sh`             |
| 全コレクションをリセット   | `qmd cleanup` でキャッシュクリア後、再セットアップ                            |

---

## SQLite は git 管理しない

統一インデックスは `~/.cache/qmd/index.sqlite` に置かれる（dotfiles 外）。
各環境で `setup-qmd.sh` を実行してローカルに生成する。
