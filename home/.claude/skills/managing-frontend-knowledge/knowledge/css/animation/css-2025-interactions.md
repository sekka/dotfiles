---
title: CSS 2025 インタラクション機能
category: css/animation
tags: [css-2025, scroll-state, sibling-index, moveBefore, view-transitions, interactions]
browser_support: Chrome 133+（段階的に実装中）
created: 2026-01-31
updated: 2026-01-31
source: https://coliss.com/articles/build-websites/operation/css/css-in-2025-interactions.html
---

# CSS 2025 インタラクション機能

## 概要

CSS 2025 では、JavaScriptに頼らずにインタラクティブなUI実装が可能になります。scroll-stateクエリ、sibling-index()/sibling-count()、moveBefore()メソッド、ネストされたビュー遷移グループなどの機能をまとめます。

---

## scroll-state クエリ

### 概要

スクロール可能か、固定か、スナップ状態かを判定し、スタイルを適用できます。

**ブラウザサポート:** Chrome 133+

### 基本構文

```css
.parent {
  container-type: scroll-state;
}

@container scroll-state(条件) {
  /* スタイル */
}
```

### 実装例

#### 1. スナップ状態の検出

```html
<div class="carousel">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
</div>

<style>
  .carousel {
    container-type: scroll-state;
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
  }

  .item {
    scroll-snap-align: center;
    opacity: 1;
    transition: opacity 0.3s;
  }

  /* スナップしていない要素を半透明に */
  @container not scroll-state(snapped: x) {
    .item {
      opacity: 0.25;
    }
  }
</style>
```

#### 2. スクロール方向の検出

```css
html {
  container-type: scroll-state;
}

header {
  position: fixed;
  top: 0;
  transition: translate 0.3s ease;
}

/* 下スクロール時: ヘッダー非表示 */
@container scroll-state(scrolled: bottom) {
  header {
    translate: 0 -100%;
  }
}

/* 上スクロール時: ヘッダー表示 */
@container scroll-state(scrolled: top) {
  header {
    translate: 0 0;
  }
}
```

### 利点

- **JavaScript不要**: スクロール状態を宣言的に指定
- **パフォーマンス向上**: ブラウザネイティブの実装
- **保守性**: CSS のみで完結

---

## sibling-index() / sibling-count()

### 概要

兄弟要素内での位置を認識し、段階的アニメーションなどを実装できます。

### 基本構文

```css
要素 {
  プロパティ: calc(値 * sibling-index());
}
```

### 実装例

#### 1. 段階的アニメーション

```html
<ul>
  <li>アイテム 1</li>
  <li>アイテム 2</li>
  <li>アイテム 3</li>
  <li>アイテム 4</li>
</ul>

<style>
  li {
    opacity: 1;
    transition: opacity 0.3s;
    transition-delay: calc(0.1s * (sibling-index() - 1));

    @starting-style {
      opacity: 0;
    }
  }
</style>
```

**効果:**
- 1番目の要素: 0s 後に表示
- 2番目の要素: 0.1s 後に表示
- 3番目の要素: 0.2s 後に表示
- 4番目の要素: 0.3s 後に表示

#### 2. 動的な要素数対応

```css
li {
  /* 要素数に応じて幅を自動調整 */
  width: calc(100% / sibling-count());
}
```

**利点:**
- DOM の要素数が動的に変化しても自動適応
- JavaScript 不要

#### 3. カラーグラデーション

```css
.item {
  --index: sibling-index();
  --count: sibling-count();
  --hue: calc(360 * var(--index) / var(--count));

  background: hsl(var(--hue), 70%, 60%);
}
```

### 従来の JavaScript 実装との比較

**従来（JavaScript）:**

```javascript
const items = document.querySelectorAll('li');
items.forEach((item, index) => {
  item.style.transitionDelay = `${index * 0.1}s`;
});
```

**新しい実装（CSS のみ）:**

```css
li {
  transition-delay: calc(0.1s * (sibling-index() - 1));
}
```

---

## moveBefore() メソッド

### 概要

要素をDOM内で移動する際、動画や`iframe`の再読み込みを防止します。

### 問題点（従来）

従来の方法では、要素を移動すると再読み込みが発生していました。

```javascript
// 従来の方法（再読み込みが発生）
const iframe = document.querySelector('iframe');
const newParent = document.querySelector('.new-parent');
newParent.appendChild(iframe);
// → iframe が再読み込みされる
```

### 新しい実装

```javascript
// moveBefore() を使用（再読み込みなし）
const iframe = document.querySelector('iframe');
const newSibling = document.querySelector('.new-sibling');
document.body.moveBefore(iframe, newSibling);
// → iframe の状態を保持
```

### 実装例

#### 1. 動画の移動

```html
<div class="sidebar">
  <iframe id="video" src="https://www.youtube.com/embed/..."></iframe>
</div>
<div class="main"></div>

<button id="moveBtn">動画をメインエリアに移動</button>

<script>
  document.getElementById('moveBtn').addEventListener('click', () => {
    const video = document.getElementById('video');
    const main = document.querySelector('.main');

    // 再生中の動画を再読み込みせずに移動
    main.moveBefore(video, null);
  });
</script>
```

#### 2. フォーカス状態の保持

```javascript
const input = document.querySelector('input');
const newContainer = document.querySelector('.new-container');

// フォーカス状態を保持したまま移動
newContainer.moveBefore(input, null);
```

### メリット

- **再生中の動画を中断しない**
- **フォーカス状態を保持**
- **ユーザー体験の向上**

---

## ネストされたビュー遷移グループ

### 概要

`::view-transition-group` を互いにネストし、3D効果やクリッピング効果を維持できます。

### 問題点（従来）

従来の View Transitions では、親子関係のあるアニメーションで制約がありました。

### 実装例

#### カードのネストされた遷移

```html
<div class="card">
  <img src="image.jpg" alt="画像">
  <h2>タイトル</h2>
  <p>説明文</p>
</div>

<style>
  .card {
    view-transition-name: card;
    overflow: clip;
  }

  .card img {
    view-transition-group: nearest;
  }

  /* 遷移グループの子要素でクリッピング */
  ::view-transition-group-children(card) {
    overflow: clip;
  }
</style>
```

### 構文

```css
::view-transition-group-children(名前) {
  /* スタイル */
}
```

### ユースケース

- **カードの拡大アニメーション**: 画像が境界を超えないようクリッピング
- **モーダルの開閉**: ネストされた要素の遷移
- **複雑なレイアウト変更**: 親子関係を保ったアニメーション

---

## JavaScript 負担軽減の実例

### Before（JavaScript ベース）

```javascript
// スクロール検出
window.addEventListener('scroll', () => {
  if (window.scrollY > 100) {
    header.classList.add('hidden');
  }
});

// 段階的アニメーション
items.forEach((item, index) => {
  setTimeout(() => {
    item.classList.add('visible');
  }, index * 100);
});

// 要素の移動
const video = document.querySelector('video');
newParent.appendChild(video);
// → 動画が再読み込み
```

### After（CSS 2025）

```css
/* スクロール検出 */
@container scroll-state(scrolled: bottom) {
  header { translate: 0 -100%; }
}

/* 段階的アニメーション */
li {
  transition-delay: calc(0.1s * (sibling-index() - 1));
  @starting-style { opacity: 0; }
}
```

```javascript
// 要素の移動（再読み込みなし）
newParent.moveBefore(video, null);
```

---

## 統合例

すべての機能を組み合わせた実装例：

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
    }

    @container scroll-state(scrolled: bottom) {
      header {
        translate: 0 -100%;
      }
    }

    .carousel {
      container-type: scroll-state;
      display: flex;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
    }

    .item {
      scroll-snap-align: center;
      opacity: 1;
      transition: opacity 0.3s, transform 0.3s;
      transition-delay: calc(0.1s * (sibling-index() - 1));

      @starting-style {
        opacity: 0;
        transform: translateY(20px);
      }
    }

    @container not scroll-state(snapped: x) {
      .item {
        opacity: 0.25;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>インタラクティブヘッダー</h1>
  </header>

  <div class="carousel">
    <div class="item">1</div>
    <div class="item">2</div>
    <div class="item">3</div>
  </div>

  <div style="height: 200vh;"></div>
</body>
</html>
```

---

## 参考資料

- [CSS Scroll State Queries - Spec](https://drafts.csswg.org/css-scroll-state-1/)
- [sibling-index() - CSS Spec](https://drafts.csswg.org/css-values-5/#funcdef-sibling-index)
- [moveBefore() - DOM Spec](https://github.com/whatwg/dom/pull/1255)
- [View Transitions - MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)

---

## 関連ナレッジ

- [CSS 2025 エルゴノミクス](../modern/css-2025-ergonomics.md)
- [CSS 2025 コンポーネント](../components/css-2025-components.md)
- [Scroll State Queries](../selectors/scroll-state-queries.md)
- [View Transitions](./view-transitions.md)
