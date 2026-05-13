---
source_url: https://zenn.dev/seekseep/articles/css-new-features-catch-up-2026
title: 最近のCSS、全然追えてなかった。ここ1〜2年で使えるようになった機能10選
author: よこやまたく
published: 2026-04-28
captured: 2026-05-13
status: inbox
---

# 最近のCSS、全然追えてなかった。ここ1〜2年で使えるようになった機能10選

## 出典

- URL: https://zenn.dev/seekseep/articles/css-new-features-catch-up-2026
- 著者: よこやまたく
- 公開: 2026-04-28
- 媒体: Zenn

## 概要

ここ1〜2年で使えるようになったCSSの10機能をBaseline状態（Widely Available / Newly Available）と合わせて紹介する catch-up 記事。

## 取り上げられている10機能

### Widely Available（広く利用可能）

1. **CSS Nesting** — `&` で親セレクタを参照、プリプロセッサ不要のネスト構文
2. **:has() セレクタ** — 子要素の状態に応じて親をスタイリング（待望の親セレクタ）
3. **Container Queries** — 親要素の幅でスタイル切り替え、コンポーネント単位レスポンシブ
4. **Subgrid** — ネストしたグリッドが親のトラック定義を継承、カード内要素の高さ統一
5. **@layer（カスケードレイヤー）** — 詳細度の競合を宣言順序で解決

### Newly Available（新しく利用可能）

6. **light-dark() 関数** — ライト/ダークモードの色を1つのプロパティで指定
7. **text-wrap: balance / pretty** — テキスト折り返しの美しい制御、見出しの行バランス自動調整
8. **@scope** — CSSスタイルを特定のDOMサブツリーに限定、クラス名衝突を回避
9. **Relative Color Syntax（相対カラー構文）** — 既存色を基準に明度・彩度・透明度を計算
10. **Popover API** — JSなしでポップオーバーUI、HTML属性で自動的に開閉

## ナレッジベース対応状況

| # | 機能 | 既存ナレッジ |
|---|------|-------------|
| 1 | CSS Nesting | `css/values/css-nesting-improvements.md`, `css/modern/css-nesting-devtools-ux.md` |
| 2 | :has() | `css/selectors/has-selector.md` |
| 3 | Container Queries | `css/layout/container-query.md` + `container-style-queries.md` |
| 4 | Subgrid | `css/layout/subgrid.md` |
| 5 | @layer | `css/modern/cascade-layers.md` |
| 6 | light-dark() | `css/theming/light-dark-function.md` |
| 7 | text-wrap: balance/pretty | **未収録 → 新規作成対象** |
| 8 | @scope | `css/selectors/scope-basics.md`, `scope.md` |
| 9 | Relative Color Syntax | `css/theming/contrast-color.md` 内で言及、`css/values/modern-color-functions.md` |
| 10 | Popover API | `html/modern-html.md`, `css/components/dialog-modal-2025.md` |

## 統合方針

- 9 機能はすでに詳細ナレッジ化済み → 新規作成不要
- text-wrap: balance/pretty を `css/typography/text-wrap-balance.md` として新規追加
- この記事自体は「2026年のCSS catch-up リスト」として `modern-css-2026.md` の参照ソースに追加することも検討

## キーポイント抜粋

各機能について、記事では「目的 / できること / 昔のやり方 / 注意点」を整理。JavaScript削減やプリプロセッサ不要化の観点が強調されている。
