---
title: メディアクエリの新しい書き方
category: css/values
tags: [media-queries, responsive, range-syntax, prefers]
browser_support: Chrome 104+, Firefox 63+, Safari 16.4+
created: 2025-01-16
updated: 2025-01-16
---

# メディアクエリの新しい書き方

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5
> 執筆日: 2024年
> 追加日: 2025-12-17

範囲構文、ホバー検出、モーション軽減など、現代的なメディアクエリ。

## 範囲構文（Range Syntax）

```css
/* 範囲構文（Chrome 104+, Firefox 63+, Safari 16.4+） */
@media (width >= 768px) {
  /* ... */
}

@media (768px <= width < 1024px) {
  /* ... */
}
```

### 従来との比較

```css
/* 従来 */
@media (min-width: 768px) { }
@media (min-width: 768px) and (max-width: 1023px) { }

/* 範囲構文 */
@media (width >= 768px) { }
@media (768px <= width < 1024px) { }
```

## ホバー可能なデバイスのみ

```css
/* ホバー可能なデバイスのみ */
@media (any-hover: hover) {
  .button:hover {
    background-color: #0055aa;
  }
}

/* プライマリー入力デバイスがホバー可能 */
@media (hover: hover) {
  .link:hover {
    text-decoration: underline;
  }
}
```

## モーション軽減設定

```css
/* モーション軽減設定を有効にしているユーザー */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## ダークモード

```css
/* ダークモード */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #1a1a1a;
    --text-color: #f0f0f0;
  }
}

/* ライトモード */
@media (prefers-color-scheme: light) {
  :root {
    --bg-color: #ffffff;
    --text-color: #333333;
  }
}
```

## その他の prefers-* クエリ

```css
/* コントラスト設定 */
@media (prefers-contrast: high) {
  .button {
    border: 3px solid currentColor;
  }
}

/* データ節約モード */
@media (prefers-reduced-data: reduce) {
  img {
    content: attr(alt);
  }
}

/* 透明度設定 */
@media (prefers-reduced-transparency: reduce) {
  .glass {
    backdrop-filter: none;
    background: solid;
  }
}
```

## 組み合わせ

```css
/* デスクトップかつダークモード */
@media (width >= 1024px) and (prefers-color-scheme: dark) {
  /* ... */
}

/* タッチデバイスかつモーション軽減 */
@media (any-hover: none) and (prefers-reduced-motion: reduce) {
  /* ... */
}
```

## ブラウザ対応

| 機能 | Chrome | Firefox | Safari |
|------|--------|---------|--------|
| 範囲構文 | 104+ | 63+ | 16.4+ |
| hover/any-hover | 38+ | 64+ | 9+ |
| prefers-reduced-motion | 74+ | 63+ | 10.1+ |
| prefers-color-scheme | 76+ | 67+ | 12.1+ |
| prefers-contrast | 96+ | 101+ | 14.1+ |

## 関連ナレッジ

- [Responsive Design](../../cross-cutting/browser-compat/responsive.md)
- [Dark Mode 実装](../theming/dark-mode.md)
