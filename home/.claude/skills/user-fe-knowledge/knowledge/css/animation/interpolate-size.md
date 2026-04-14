---
title: interpolate-size（auto と固定値のトランジション）
category: css/animation
tags: [interpolate-size, transition, auto, accordion, height, 2025]
browser_support: Safari 18.0+, Chrome 129+
created: 2025-01-16
updated: 2026-01-19
---

# interpolate-size（auto と固定値のトランジション）

> 出典: https://speakerdeck.com/clockmaker/the-latest-css-for-ui-design-2025, https://coliss.com/articles/build-websites/operation/css/css-in-2024.html
> リリース: Safari 18.0（2024年9月）、Chrome 129+
> 追加日: 2025-12-17
> 更新日: 2026-01-19

`auto` と固定値の間で滑らかなトランジションを可能にする CSS プロパティ。従来は JavaScript が必要だったアコーディオンの高さアニメーションなどが、CSS のみで実現できます。

## 問題点

### 従来の制限

CSS の `transition` プロパティは、`auto` などのキーワード値から固定値へのトランジションをサポートしていませんでした。

```css
/* ❌ 動作しない */
.accordion {
  height: 0;
  transition: height 0.3s ease;
}

.accordion.open {
  height: auto; /* トランジションしない！ */
}
```

**理由**: ブラウザは `auto` の具体的な値を事前に計算できないため、中間値を補間できませんでした。

### JavaScript による回避策

```javascript
// 従来は JavaScript で高さを計算
const accordion = document.querySelector('.accordion');
const content = accordion.querySelector('.content');

accordion.addEventListener('click', () => {
  if (accordion.classList.contains('open')) {
    // 閉じる
    accordion.style.height = content.scrollHeight + 'px';
    requestAnimationFrame(() => {
      accordion.style.height = '0';
    });
  } else {
    // 開く
    accordion.style.height = content.scrollHeight + 'px';
  }
});
```

**問題点**:
- JavaScript が必須
- リサイズ時の再計算が必要
- パフォーマンスオーバーヘッド
- メンテナンスコストが高い

## 解決策

`interpolate-size` プロパティで `auto` と固定値の補間を有効化します。

```css
* {
  interpolate-size: allow-keywords;
}

.accordion {
  height: 0;
  transition: height 0.3s ease;
  overflow: hidden;
}

.accordion.open {
  height: auto; /* ✅ 滑らかにアニメーション！ */
}
```

## 構文

```css
interpolate-size: <value>;
```

### 値

| 値 | 説明 |
|----|------|
| `numeric-only` | 数値のみ補間（デフォルト、従来の動作） |
| `allow-keywords` | `auto`, `min-content`, `max-content` などのキーワードも補間 |

## 基本実装

### グローバル設定

```css
/* サイト全体で有効化 */
* {
  interpolate-size: allow-keywords;
}
```

**推奨**: すべての要素に適用しても、パフォーマンスへの影響は最小限です。

### 個別要素での設定

```css
/* 特定の要素のみ */
.accordion,
.collapsible,
details {
  interpolate-size: allow-keywords;
}
```

## 実用パターン

### パターン1: アコーディオン

```html
<div class="accordion">
  <button class="accordion__trigger">詳細を表示</button>
  <div class="accordion__content">
    <p>ここに詳細な内容が入ります。</p>
  </div>
</div>
```

```css
* {
  interpolate-size: allow-keywords;
}

.accordion__content {
  height: 0;
  overflow: hidden;
  transition: height 0.3s ease;
}

.accordion.is-open .accordion__content {
  height: auto;
}
```

```javascript
// JavaScript は状態管理のみ
document.querySelector('.accordion__trigger').addEventListener('click', () => {
  document.querySelector('.accordion').classList.toggle('is-open');
});
```

### パターン2: `<details>` 要素

```html
<details>
  <summary>クリックして開く</summary>
  <p>詳細な内容...</p>
</details>
```

```css
* {
  interpolate-size: allow-keywords;
}

details {
  transition: height 0.3s ease;
}

details[open] {
  height: auto;
}

details summary {
  cursor: pointer;
  user-select: none;
}
```

**利点**: JavaScript 不要で完全にアクセシブル

### パターン3: 動的なモーダル

```html
<dialog class="modal">
  <h2>タイトル</h2>
  <div class="modal__content">
    <!-- 動的に変わる内容 -->
  </div>
  <button class="modal__close">閉じる</button>
</dialog>
```

```css
* {
  interpolate-size: allow-keywords;
}

.modal {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease;
}

.modal[open] {
  max-height: 80vh; /* または auto */
}
```

### パターン4: 展開可能なカード

```html
<div class="card">
  <div class="card__header">
    <h3>カードタイトル</h3>
    <button class="card__toggle">展開</button>
  </div>
  <div class="card__body">
    <p>詳細な説明...</p>
  </div>
</div>
```

```css
* {
  interpolate-size: allow-keywords;
}

.card__body {
  max-height: 100px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.card.is-expanded .card__body {
  max-height: none; /* または auto */
}
```

## ユースケース

- FAQ アコーディオン
- 読み続ける / 折りたたむ機能
- ナビゲーションメニュー（モバイル）
- 画像ギャラリーのキャプション
- `<details>` 要素のアニメーション

## ブラウザサポート

| ブラウザ | バージョン | リリース日 |
|---------|----------|----------|
| Safari | 18.0+ | 2024年9月 |
| Chrome | 129+ | 2024年9月 |
| Edge | 129+ | 2024年9月（Chromium ベース） |
| Firefox | 未対応 | 検討中 |

## フォールバック

```css
/* フォールバック: max-height で近似 */
.accordion__content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.accordion.is-open .accordion__content {
  max-height: 1000px; /* 十分に大きい値 */
}

/* 対応ブラウザ */
@supports (interpolate-size: allow-keywords) {
  * {
    interpolate-size: allow-keywords;
  }

  .accordion__content {
    height: 0;
  }

  .accordion.is-open .accordion__content {
    height: auto;
  }
}
```

## 注意点

### 1. overflow の設定必須

```css
.collapsible {
  height: 0;
  overflow: hidden; /* 必須 */
  transition: height 0.3s ease;
}
```

### 2. パフォーマンス考慮

`height` や `max-height` のアニメーションは、`transform` よりもパフォーマンスが低い場合があります。少数の要素なら問題ありませんが、大量の要素では `transform` を検討してください。

## 比較

### interpolate-size vs max-height ハック

| 項目 | max-height ハック | interpolate-size |
|------|------------------|------------------|
| 実装 | `max-height: 1000px` | `height: auto` |
| 精度 | 低い（過剰な値が必要） | 高い（正確） |
| タイミング | 不正確（早く終わる） | 正確 |
| メンテナンス | 困難（値の調整が必要） | 容易 |
| ブラウザサポート | 全ブラウザ | Safari 18+, Chrome 129+ |

## まとめ

### 利点

✅ JavaScript 不要でアコーディオン実装
✅ `height: auto` への滑らかなトランジション
✅ リサイズ時も自動対応
✅ コードがシンプルでメンテナンス容易

### 制限

❌ Firefox 未対応（2026年1月時点）
❌ `height`/`max-height` はパフォーマンスコストあり

## 関連ナレッジ

- [@starting-style](./starting-style.md)
- [CSS Transitions](./transitions.md)
- [2025年の最新CSS機能](../modern-css-2025.md)

## 参考リソース

- [CSS Values and Units Module Level 4: interpolate-size](https://drafts.csswg.org/css-values-4/#interpolate-size)
- [MDN: interpolate-size](https://developer.mozilla.org/en-US/docs/Web/CSS/interpolate-size)
