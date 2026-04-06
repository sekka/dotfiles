# フロントエンドナレッジ運用フロー

`user-managing-frontend-knowledge` スキルと qmd を使った日常運用の手順書。

設計思想: md だけを git 管理し、qmd DB (`~/.cache/qmd/index.sqlite`) は各マシンでローカル生成。
詳細は [design spec](./superpowers/specs/2026-04-06-llm-wiki-knowledge-base-design.md) を参照。

---

## 最小記憶フロー

```
保存     : Claude に「保存して <URL>」 → コミット → push
処理     : Claude に「inbox 処理して」 → コミット → push → qmd embed
検索     : Claude が自動で qmd-fe を使う（手動なら qmd-fe "..."）
別マシン : git pull → qmd update && qmd embed
整理     : 定期的に Claude に「ナレッジを整理して」
```

あなたが手動でやるのは **push 後の `qmd embed`** と **マシン間同期時の `git pull → qmd update && qmd embed`** だけ。それ以外は Claude に依頼すれば `SKILL.md` のロジックに従って動く。

---

## 1. 初回セットアップ（新規マシン）

```bash
cd ~/dotfiles
git pull
./setup/06_claude.sh
```

`06_claude.sh` が `scripts/setup-qmd.sh` を呼び出し:

- qmd CLI インストール（bun経由、未インストールの場合）
- `frontend` コレクション登録
- 埋め込み生成（初回は数分、2回目以降は差分のみ）

確認:

```bash
qmd status                                  # インデックス状態
qmd query -c frontend "container query"     # 動作テスト
```

---

## 2. 日常: ナレッジを検索

```bash
qmd-fe "CSS animation performance"      # セマンティック検索（推奨）
qmd search -c frontend "@container"     # BM25 キーワード検索
qmd get <path>                          # 特定ファイル取得
```

Claude Code セッション内では自動で `SKILL.md` の「検索の優先順位」に従って `qmd-fe` を最優先で使う。Read 直読みは最終手段。

---

## 3. 日常: 記事を保存する（収集モード）

Claude に依頼:

```
この記事保存して https://example.com/article
```

内部動作:

1. `WebFetch` で取得
2. `~/.claude/skills/user-managing-frontend-knowledge/raw/_inbox/YYYY-MM-DD-{slug}.md` に原文保存
3. knowledge/ には**書き込まれない**（コンパイルは別作業）

保存後にコミット:

```bash
cd ~/dotfiles
git add home/.claude/skills/user-managing-frontend-knowledge/raw/_inbox/
git commit -m "chore(inbox): save <title>"
git push
```

---

## 4. 定期: inbox を処理する（コンパイルモード）

溜まったタイミングで Claude に依頼:

```
inbox 処理して
```

内部動作:

1. `_inbox/` の各ファイルを順に処理
2. 要約 → カテゴリ判定 → 重複チェック → `knowledge/` に統合
3. 元ファイルを `_archived/` に移動
4. 判断に迷ったら `AskUserQuestion` で確認

処理後:

```bash
cd ~/dotfiles
git add home/.claude/skills/user-managing-frontend-knowledge/
git commit -m "feat(knowledge): compile inbox — <summary>"
git push

qmd update && qmd embed   # ローカル DB を差分更新
```

---

## 5. 定期: knowledge を整理する（整理モード）

Claude に依頼:

```
ナレッジを整理して
```

整理モードで以下をチェック（全て**提案のみ**、自動変更なし）:

- #### 1. 類似ナレッジの統合
- #### 2. 古い情報の更新
- #### 3. カテゴリ再編成
- #### 4. フォーマット統一
- #### 5. **ドリフトチェック**（raw 原文と wiki の乖離）
- #### 6. **欠損補完候補**（TBD/不明箇所）
- #### 7. **新記事候補**（未統合の archived）

承認した提案だけ適用 → コミット → `qmd embed`。

---

## 6. マシン間同期

```bash
cd ~/dotfiles
git pull                   # raw/_inbox/, raw/_archived/, knowledge/ が全て同期される
qmd update && qmd embed    # ローカル DB を差分更新（最新 md を反映）
```

**重要**: `git pull` しても DB は自動更新されない。検索結果が古いと感じたら `qmd update && qmd embed`。

`qmd embed` は生成済みエントリをコンテンツハッシュでスキップするので、毎回実行しても安全（0.2 秒程度）。

---

## 7. 状態確認

```bash
# inbox/archived 件数
ls ~/.claude/skills/user-managing-frontend-knowledge/raw/_inbox/*.md 2>/dev/null | wc -l
ls ~/.claude/skills/user-managing-frontend-knowledge/raw/_archived/*.md 2>/dev/null | wc -l

# qmd DB の状態
qmd status
qmd collection list
qmd ls frontend | wc -l    # インデックス済みファイル数
```

---

## 8. トラブルシューティング

| 症状                     | 対処                                                                      |
| ------------------------ | ------------------------------------------------------------------------- |
| `qmd: command not found` | `bun install -g @tobilu/qmd` / zsh 再起動                                 |
| 検索結果が古い           | `qmd update && qmd embed`                                                 |
| 完全リセット             | `qmd collection remove frontend && ~/dotfiles/scripts/setup-qmd.sh`       |
| インデックス破損疑い     | `qmd cleanup && ~/dotfiles/scripts/setup-qmd.sh`                          |
| `_inbox/` 肥大化         | 処理停滞サイン。「inbox 処理して」を Claude に依頼                        |
| 埋め込み生成途中で失敗   | `scripts/setup-qmd.sh` が自動でコレクション削除。再度 `setup-qmd.sh` 実行 |

---

## 関連ドキュメント

- `scripts/setup-qmd.md` — qmd セットアップの詳細・コマンドリファレンス
- `home/.claude/skills/user-managing-frontend-knowledge/SKILL.md` — Claude セッション内のモード定義（収集/コンパイル/整理）
- `home/.claude/skills/user-managing-frontend-knowledge/raw/README.md` — raw/ 層の構造・命名規則
- `docs/superpowers/specs/2026-04-06-llm-wiki-knowledge-base-design.md` — 設計思想（Karpathy 式 LLM Wiki パターン）
