---
title: Modern CSS Code (modern-css.com) - 古い CSS とモダン CSS / Tailwind 比較サイト
category: design-resources/ui-trends
tags: [tool, reference, modern-css, tailwind, comparison]
source: https://coliss.com/articles/build-websites/operation/css/modern-css-code.html
upstream: https://modern-css.com/
created: 2026-05-18
---

# Modern CSS Code

「古い CSS の書き方 vs モダン CSS vs Tailwind CSS」を 1 ページに並べて比較できるリファレンスサイト。各テクニックにブラウザサポート表記あり。

- 公式: https://modern-css.com/

## 紹介されているテクニック例

| トピック | 古い書き方 | モダン CSS | Tailwind |
|---|---|---|---|
| 要素の中央配置 | `position: absolute; transform: translate(-50%, -50%)` | `display: grid; place-items: center;` | `grid place-items-center` |
| スクロールバー由来のレイアウトシフト | `overflow-y: scroll` 固定 | `scrollbar-gutter: stable;` | (対応 utility) |
| 鮮やかな色彩 | HEX / RGB | OKLCH | `bg-[oklch(...)]` |
| ダークモード | `:root` + `@media (prefers-color-scheme: dark)` | `light-dark(white, black)` | `dark:` プレフィックス |
| 高さアニメ | JS で計測 | `interpolate-size: allow-keywords` + `calc-size()` | utility 待ち |

その他、複数のモダン CSS パターンを掲載。

## 使いどころ

- 既存コードの「これ書き換えられる？」判定
- Tailwind 派 / 素 CSS 派の両方に対応した提案
- レビュー時の根拠リンクとして

## 関連知識

- [[outdated-techniques]]: 時代遅れの CSS テクニックと現代的代替（包括版）
- [[light-dark-function]]: ダークモードの新書法
- [[modern-color-syntax]]: OKLCH 等の新色構文
- [[interpolate-size-auto]]: height auto への transition

## 参考

- [Coliss 紹介記事（2026-04-02）](https://coliss.com/articles/build-websites/operation/css/modern-css-code.html)
