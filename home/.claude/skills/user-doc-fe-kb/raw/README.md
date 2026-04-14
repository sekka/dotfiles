# raw/ 層

フロントエンドナレッジの**生データ保管庫**。`knowledge/`（コンパイル済みwiki）と分離されている。

## 構造

- `_inbox/` — 未処理。コンパイル待ちの原文を置く
- `_archived/` — コンパイル済み。原文として保管（再コンパイル・ドリフト検出用）

## 命名規則

`YYYY-MM-DD-{slug}.md`

例: `2026-04-06-modern-css-grid-tricks.md`

## ファイルフォーマット

```markdown
---
url: https://example.com/article
fetched_at: 2026-04-06
title: 記事タイトル
---

[原文または抜粋をそのまま貼り付け]
```

## ライフサイクル

1. 「この記事保存して https://...」依頼 → `_inbox/` に保存
2. 「inbox 処理して」依頼 → SKILL.md コンパイルモードが起動
3. 内容を要約・分類して `knowledge/` に統合
4. 元ファイルを `_archived/` に移動

## 注意

- このディレクトリは `qmd embed` の対象**外**（未整理データのノイズ防止）
- `_inbox/` が肥大化したら処理が停滞しているサイン

## 状態確認

```bash
# 未処理件数
ls ~/.claude/skills/user-doc-fe-kb/raw/_inbox/*.md 2>/dev/null | wc -l

# アーカイブ件数
ls ~/.claude/skills/user-doc-fe-kb/raw/_archived/*.md 2>/dev/null | wc -l
```
