---
title: CSSのみでdetails要素のアニメーション（2025年版）
category: html
tags: [details, animation, details-content, interpolate-size, calc-size, 2025]
browser_support: Chrome 131+, Edge 131+, Safari 18.4+
created: 2026-01-19
updated: 2026-01-19
---

# CSSのみでdetails要素のアニメーション（2025年版）

> 出典: https://www.tak-dcxi.com/article/css-only-details-animation-2025
> 執筆日: 2025年
> 追加日: 2026-01-19

CSSの進化により、`<details>`要素の開閉アニメーションが**JavaScriptなしで実装可能**になりました。

## 主な技術

- **`::details-content` 疑似要素** - コンテンツコンテナをラップし、開閉アニメーションを制御
- **`interpolate-size: allow-keywords`** - `0`から`auto`への高さアニメーションを可能に
- **`calc-size()` 関数** - キーワード値の実際の数値を計算に利用
- **`grid-template-rows` トランジション** - Safariでの代替手段

## 基本実装

### フェードイン/アウト

```css
details::details-content {
  transition-property: content-visibility, opacity;
  transition-behavior: allow-discrete;
}

details:not([open])::details-content {
  opacity: 0;
}
```

### slideToggle実装（Chrome/Edge）

```css
:root {
  interpolate-size: allow-keywords;
}

details::details-content {
  transition-property: block-size;
  transition-duration: 0.3s;
}

details:not([open])::details-content {
  block-size: 0;
}
```

**ポイント**:
- `:root`に`interpolate-size: allow-keywords`を指定
- `block-size`をトランジション対象にする
- `height`ではなく`block-size`を使用（書字方向に依存しない）

### slideToggle実装（Safari対応）

Safariは`interpolate-size`をサポートしていないため、`grid-template-rows`を使用します。

```css
details::details-content {
  display: grid;
  grid-template-rows: 1fr;
  transition-property: grid-template-rows;
  transition-duration: 0.3s;
}

details:not([open])::details-content {
  grid-template-rows: 0fr;
}
```

## 完全なクロスブラウザ対応

```css
/* Chrome/Edge対応 */
@supports (interpolate-size: allow-keywords) {
  :root {
    interpolate-size: allow-keywords;
  }

  details::details-content {
    transition: block-size 0.3s;
  }

  details:not([open])::details-content {
    block-size: 0;
  }
}

/* Safari対応 */
@supports not (interpolate-size: allow-keywords) {
  details::details-content {
    display: grid;
    grid-template-rows: 1fr;
    transition: grid-template-rows 0.3s;
  }

  details:not([open])::details-content {
    grid-template-rows: 0fr;
  }
}
```

## calc-size() 関数の活用

`calc-size()`を使用すると、`auto`値を計算に利用できます。

```css
details::details-content {
  block-size: calc-size(auto, size);
  transition: block-size 0.3s;
}

details:not([open])::details-content {
  block-size: 0;
}
```

## 実装時の注意点

### 1. prefers-reduced-motion 対応

アニメーションを無効化する設定を尊重します。

```css
@media (prefers-reduced-motion: reduce) {
  details::details-content {
    transition: none;
  }
}
```

### 2. Safari の content-visibility バグ回避

Safari 18.4では`content-visibility`にバグがあります。

```css
@supports (interpolate-size: allow-keywords) {
  details::details-content {
    content-visibility: unset;
  }
}
```

### 3. ページ内検索機能への配慮

`display: none`や`height: 0`で完全に潰さないことで、ブラウザのページ内検索で自動展開が機能します。

```css
/* ✅ 推奨：検索で自動展開される */
details:not([open])::details-content {
  block-size: 0;
  overflow: hidden;
}

/* ❌ 非推奨：検索で自動展開されない */
details:not([open])::details-content {
  display: none;
}
```

### 4. フォールバック

未サポート環境では、アニメーションなしで動作を継続します。

```css
/* 基本スタイル（全環境で適用） */
details::details-content {
  overflow: hidden;
}

/* プログレッシブエンハンスメント */
@supports (interpolate-size: allow-keywords) {
  /* アニメーション対応環境のみ */
}
```

## ブラウザ対応

| ブラウザ | `::details-content` | `interpolate-size` | `calc-size()` |
|---------|--------------------|--------------------|---------------|
| Chrome/Edge | 131+ | ○ | ○ |
| Safari | 18.4+ | ✗ | ✗ |
| Firefox | 未対応 | ✗ | ✗ |

**Safari対応**: `grid-template-rows`トランジションで代替可能

**Firefox対応**: 未サポートのため、アニメーションなしで動作

## ユースケース

### アコーディオンUI

```html
<details>
  <summary>質問1: サービスの利用方法は？</summary>
  <p>回答内容がここに表示されます。</p>
</details>
```

### FAQセクション

```html
<section class="faq">
  <details>
    <summary>配送にかかる日数は？</summary>
    <p>通常2〜3営業日でお届けします。</p>
  </details>
  <details>
    <summary>返品は可能ですか？</summary>
    <p>商品到着後7日以内であれば返品可能です。</p>
  </details>
</section>
```

### 詳細情報の段階的開示

```html
<article>
  <h2>製品名</h2>
  <p>基本的な説明文...</p>
  <details>
    <summary>詳細を見る</summary>
    <div class="details-content">
      <h3>技術仕様</h3>
      <ul>
        <li>項目1</li>
        <li>項目2</li>
      </ul>
    </div>
  </details>
</article>
```

## 主要メリット

- **JavaScript不要** - パフォーマンス向上、依存性削減
- **ページ内検索との親和性** - ブラウザの検索機能で自動展開
- **アクセシビリティ** - ネイティブのキーボード操作、スクリーンリーダー対応
- **SEO** - 検索エンジンがコンテンツをインデックス可能

## 関連ナレッジ

- [details要素のアコーディオン実装](./details-accordion.md)
- [::details-content疑似要素](./details-content-pseudo.md)
- [Scroll-driven Animations](../css/animation/scroll-driven-animations.md)

## 参考リンク

- [MDN: ::details-content](https://developer.mozilla.org/en-US/docs/Web/CSS/::details-content)
- [MDN: interpolate-size](https://developer.mozilla.org/en-US/docs/Web/CSS/interpolate-size)
- [CSSWG: calc-size() function](https://drafts.csswg.org/css-values-5/#calc-size)
