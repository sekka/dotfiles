---
url: https://techblog.lycorp.co.jp/ja/20260409b
fetched_at: 2026-04-15
title: HTML/CSS仕様で表示速度を劇的改善：content-visibility、Lazy loading、contain を分かりやすくコード付きで解説
---

# LYCorp Tech Blog: HTML/CSS仕様で表示速度を劇的改善

## Lazy Loading (`loading` 属性)

`<img>` と `<iframe>` にビューポートに近づくまで読み込みを遅延させる属性。

```html
<img src="image.jpg" loading="lazy" alt="説明" />
<iframe src="embed.html" loading="lazy"></iframe>
```

- `srcset` や `<picture>` でも使用可能
- LCP 対象画像には使わない（遅延させるとスコアが下がる）

## content-visibility

Chrome 85（2020年8月）実装。ビューポート外の要素のレンダリングをスキップし、スクロールして初めて描画させる。

```css
.section {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px; /* スクロールバーのずれ防止 */
}
```

- `contain-intrinsic-size` でビューポート外要素の推定サイズを指定
- 長いページほど効果大
- ページ内検索（Ctrl+F）ではスキップされた要素も対象になる（Chrome 90+）

## contain プロパティ

Chrome 52 実装。要素の内部変化を外部レイアウトに波及させないことで reflow を削減。

```css
.card {
  contain: content; /* layout + paint + style の組み合わせ */
}

/* 各値 */
.strict    { contain: strict;  } /* size + layout + paint + style */
.content   { contain: content; } /* layout + paint + style */
.size-only { contain: size;    }
.layout    { contain: layout;  }
.paint     { contain: paint;   }
.style     { contain: style;   }
```

- `content-visibility: auto` は内部的に `contain` を自動適用する
- カードUI、リストアイテムなど独立したコンポーネントに適する
