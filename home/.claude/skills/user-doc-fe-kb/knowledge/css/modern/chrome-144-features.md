---
title: Chrome 144 の新しい CSS 機能
category: css/modern
tags: [chrome, search-text, scroll-state, anchor-positioning, transform, overscroll-behavior]
browser_support: Chrome 144+、Android、ChromeOS、Linux、macOS、Windows
created: 2026-01-31
updated: 2026-01-31
source: https://coliss.com/articles/build-websites/operation/css/chrome-144-adds-8-new-css-feature.html
---

# Chrome 144 の新しい CSS 機能

## 概要

Chrome 144 では、`::search-text` 疑似要素、`@scroll-state` クエリ、アンカーポジショニングの強化など、8つの新機能が追加されました。

---

## ::search-text 疑似要素

### 概要

ブラウザのページ内検索（Ctrl+F / Cmd+F）の検索結果をスタイリングできます。

### 問題点

従来のブラウザデフォルトは、コントラスト不足で検索結果が見づらい場合がありました。

### 実装例

```css
::search-text {
  background-color: yellow;
  color: black;
  text-decoration: underline wavy red;
}

/* アクティブな検索結果（現在選択中） */
::search-text:current {
  background-color: orange;
  color: white;
}
```

### ユースケース

- **高コントラストテーマ**: アクセシビリティ向上
- **ブランドカラーの適用**: 検索結果を独自デザインに
- **強調表示の改善**: より目立つ検索結果

### ブラウザサポート

Chrome 144+ でサポート。他のブラウザは未サポート（仕様策定中）。

---

## @scroll-state クエリ

### 概要

スクロール方向（上下）を検知し、それに応じてスタイルを動的に変更できます。

### 基本構文

```css
html {
  container-type: scroll-state;
}

@container scroll-state(scrolled: top) {
  .scrolling-up {
    translate: 0 0;
  }
}

@container scroll-state(scrolled: bottom) {
  header {
    translate: 0 -100%;
  }
}
```

### 実装例: ヘッダーの自動表示/非表示

```html
<style>
  html {
    container-type: scroll-state;
  }

  header {
    position: fixed;
    top: 0;
    width: 100%;
    background: white;
    transition: translate 0.3s ease;
    translate: 0 0;
  }

  /* ページ下部にスクロール時: ヘッダーを非表示 */
  @container scroll-state(scrolled: bottom) {
    header {
      translate: 0 -100%;
    }
  }

  /* ページ上部にスクロール時: ヘッダーを表示 */
  @container scroll-state(scrolled: top) {
    header {
      translate: 0 0;
    }
  }
</style>

<header>
  <h1>自動表示/非表示ヘッダー</h1>
</header>
```

### 従来の JavaScript 実装との比較

**従来（JavaScript）:**

```javascript
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  if (currentScroll > lastScroll) {
    // 下スクロール: ヘッダーを隠す
    header.style.transform = 'translateY(-100%)';
  } else {
    // 上スクロール: ヘッダーを表示
    header.style.transform = 'translateY(0)';
  }
  lastScroll = currentScroll;
});
```

**新しい実装（CSS のみ）:**

```css
@container scroll-state(scrolled: bottom) {
  header { translate: 0 -100%; }
}
```

**利点:**
- JavaScript 不要
- パフォーマンス向上
- 宣言的で保守しやすい

---

## アンカーポジショニングの強化

### transform 適用後のアンカー接続

Chrome 144 では、`transform` が適用された要素にアンカーを接続する際、**トランスフォーム後の境界ボックス**を基準に `anchor()` 関数と `anchor-size()` 関数を計算します。

### 実装例

```css
.anchor-element {
  anchor-name: --my-anchor;
  transform: rotate(45deg) scale(1.5);
}

.positioned-element {
  position: absolute;
  position-anchor: --my-anchor;
  top: anchor(bottom);
  left: anchor(right);
  /* トランスフォーム後の位置を基準に配置 */
}
```

### ユースケース

- **回転した要素へのツールチップ配置**
- **スケールされた要素への吹き出し**
- **複雑なレイアウトでの動的配置**

---

## 分割ビュー機能

### 概要

Chrome 144 では、タブを右クリックして「分割ビュー」を選択すると、1つのタブ内に2ページを並べて表示できます。

### 利用シーン

- **比較作業**: 2つのページを並べて比較
- **参考資料**: ドキュメントを見ながらコーディング
- **デバッグ**: デザインと実装の比較

**注**: これは Chrome の UI 機能であり、CSS では制御できません。

---

## overscroll-behavior の強化

### キーボード操作への対応

Chrome 144 では、`overscroll-behavior` がキーボード操作（Page Up/Down、矢印キーなど）でも動作するようになりました。

### 実装例

```css
.modal {
  overscroll-behavior: contain;
}
```

**効果:**
- モーダル内でキーボードスクロールしても背後のページがスクロールしない
- ユーザー体験の向上

---

## SVG2 CSS 対応

### `<use>` 要素ツリーのセレクタ動作

Chrome 144 では、SVG の `<use>` 要素ツリーに対するセレクタ動作が仕様に準拠しました。

### 実装例

```html
<svg>
  <defs>
    <circle id="dot" r="10" fill="blue" />
  </defs>
  <use href="#dot" x="20" y="20" />
</svg>

<style>
  /* Chrome 144+ で正常に動作 */
  use circle {
    fill: red;
  }
</style>
```

---

## その他の機能

### CSS Nesting の改善

- ネスト構文のバグ修正
- パフォーマンス改善

### Web Animations API

- アニメーションのタイムライン制御改善
- スクロール駆動アニメーションの強化

---

## 実装のベストプラクティス

### プログレッシブエンハンスメント

新機能を使用する際は、古いブラウザへのフォールバックを検討してください。

```css
/* 基本スタイル（すべてのブラウザ） */
header {
  position: fixed;
  top: 0;
}

/* Chrome 144+ のみ */
@supports (container-type: scroll-state) {
  html {
    container-type: scroll-state;
  }

  @container scroll-state(scrolled: bottom) {
    header {
      translate: 0 -100%;
    }
  }
}
```

### 機能検出

```javascript
if (CSS.supports('container-type', 'scroll-state')) {
  // Chrome 144+ の機能を使用
} else {
  // JavaScript フォールバック
}
```

---

## 参考資料

- [Chrome 144 Release Notes](https://developer.chrome.com/blog/new-in-chrome-144)
- [::search-text - CSS Spec](https://drafts.csswg.org/css-pseudo/#selectordef-search-text)
- [Scroll State Queries - CSS Spec](https://drafts.csswg.org/css-scroll-state-1/)
- [Anchor Positioning - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/anchor)

---

## 関連ナレッジ

- [Chrome 143 の新機能](./chrome-143-features.md)
- [Chrome 142 の新機能](./chrome-142-features.md)
- [Scroll State Queries](../selectors/scroll-state-queries.md)
- [Anchor Positioning](../components/anchor-positioning.md)
