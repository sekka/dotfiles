---
title: Scoped View Transitions - 部分的なビュー遷移
category: css/animation
tags: [view-transitions, scoped, element-transition, contain-layout, animation]
browser_support: Chrome 140+（実験的機能）
created: 2026-01-31
updated: 2026-01-31
source: https://coliss.com/articles/build-websites/operation/css/scoped-view-transitions-coming-soon.html
---

# Scoped View Transitions - 部分的なビュー遷移

## 概要

スコープ付きビュー遷移（Scoped View Transitions）は、**DOMのサブツリーに対してビュー遷移を開始**できる拡張機能です。複数のビュー遷移を同時実行でき、レイヤー化の問題を回避できます。

---

## 従来の View Transitions の制限

### 問題点

従来の View Transitions API は、**ドキュメント全体**に対してのみ遷移を適用できました。

```javascript
// 従来: ドキュメント全体の遷移
document.startViewTransition(() => {
  // DOM 操作
});
```

**制約:**
- 1つの遷移が終了するまで次の遷移を開始できない
- 複数の独立した遷移を並行実行できない
- ページ全体がアニメーション対象になる

---

## Scoped View Transitions の利点

### 部分的な遷移

特定の要素のサブツリーに対してのみ遷移を適用できます。

```javascript
// 新しい: 特定の要素のサブツリーに対する遷移
document.querySelector('nav').startViewTransition({
  callback: () => {
    // nav 要素内の DOM 操作
  },
});
```

### 複数の遷移を同時実行

```javascript
// ナビゲーションの遷移
document.querySelector('nav').startViewTransition({
  callback: () => {
    // ナビゲーション更新
  },
});

// サイドバーの遷移（並行実行可能）
document.querySelector('aside').startViewTransition({
  callback: () => {
    // サイドバー更新
  },
});
```

---

## element.startViewTransition() の使い方

### 基本構文

```javascript
element.startViewTransition({
  callback: () => {
    // 要素内容の操作コード
  },
});
```

### 実装例

#### 1. ナビゲーションメニューの遷移

```html
<nav id="main-nav">
  <ul>
    <li><a href="#home">ホーム</a></li>
    <li><a href="#about">概要</a></li>
    <li><a href="#contact">お問い合わせ</a></li>
  </ul>
</nav>

<script>
  const nav = document.getElementById('main-nav');

  function updateNav(newContent) {
    nav.startViewTransition({
      callback: () => {
        nav.querySelector('ul').innerHTML = newContent;
      },
    });
  }
</script>
```

#### 2. カードの展開/折りたたみ

```html
<div class="card" id="my-card">
  <h2>カードタイトル</h2>
  <p class="summary">要約文</p>
  <div class="details" style="display: none;">
    <p>詳細な内容...</p>
  </div>
</div>

<script>
  const card = document.getElementById('my-card');

  function toggleCard() {
    card.startViewTransition({
      callback: () => {
        const details = card.querySelector('.details');
        details.style.display =
          details.style.display === 'none' ? 'block' : 'none';
      },
    });
  }
</script>
```

---

## contain: layout 要件

### 概要

スコープ付き遷移を使用する要素には、**`contain: layout` が適用されている**必要があります。

### 基本実装

```css
nav {
  contain: layout;
}
```

**効果:**
- その要素がアニメーション・コンテナとして機能
- レイアウトの独立性を保証
- パフォーマンスの向上

### CSS Containment の理解

```css
.container {
  contain: layout;
  /* 他のコンテンツとレイアウトが独立 */
}
```

**`contain: layout` の効果:**
- 要素内のレイアウト変更が外部に影響しない
- ブラウザの最適化が可能
- ビュー遷移のスコープを明確化

---

## DOM ツリーと ::view-transition

### 疑似要素ツリーの挿入

スコープ付き遷移では、選択した要素のサブツリーに `::view-transition` 疑似要素ツリーが挿入されます。

```html
<nav>
  ::view-transition
  └─ ::view-transition-group(root)
      ├─ ::view-transition-image-pair(root)
      │   ├─ ::view-transition-old(root)
      │   └─ ::view-transition-new(root)
      └─ (他のグループ)
</nav>
```

### CSS でのスタイリング

```css
nav {
  contain: layout;
}

nav::view-transition-group(root) {
  animation-duration: 0.5s;
}

nav::view-transition-old(root) {
  animation: fade-out 0.3s ease;
}

nav::view-transition-new(root) {
  animation: fade-in 0.3s ease;
}

@keyframes fade-out {
  to { opacity: 0; }
}

@keyframes fade-in {
  from { opacity: 0; }
}
```

---

## 実装例

### カルーセルのスムーズな遷移

```html
<div class="carousel" id="my-carousel">
  <div class="item active">スライド1</div>
  <div class="item">スライド2</div>
  <div class="item">スライド3</div>
</div>

<style>
  .carousel {
    contain: layout;
    position: relative;
    overflow: hidden;
  }

  .item {
    display: none;
  }

  .item.active {
    display: block;
  }

  .carousel::view-transition-old(root),
  .carousel::view-transition-new(root) {
    animation-duration: 0.5s;
  }
</style>

<script>
  const carousel = document.getElementById('my-carousel');
  const items = carousel.querySelectorAll('.item');
  let currentIndex = 0;

  function nextSlide() {
    carousel.startViewTransition({
      callback: () => {
        items[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % items.length;
        items[currentIndex].classList.add('active');
      },
    });
  }

  setInterval(nextSlide, 3000);
</script>
```

### タブ切り替え

```html
<div class="tabs" id="my-tabs">
  <div class="tab-buttons">
    <button class="active" data-tab="tab1">タブ1</button>
    <button data-tab="tab2">タブ2</button>
    <button data-tab="tab3">タブ3</button>
  </div>
  <div class="tab-content">
    <div id="tab1" class="tab-pane active">コンテンツ1</div>
    <div id="tab2" class="tab-pane">コンテンツ2</div>
    <div id="tab3" class="tab-pane">コンテンツ3</div>
  </div>
</div>

<style>
  .tabs {
    contain: layout;
  }

  .tab-pane {
    display: none;
  }

  .tab-pane.active {
    display: block;
  }

  .tabs .tab-content::view-transition-old(root),
  .tabs .tab-content::view-transition-new(root) {
    animation-duration: 0.3s;
  }
</style>

<script>
  const tabs = document.getElementById('my-tabs');
  const tabContent = tabs.querySelector('.tab-content');

  tabs.querySelectorAll('.tab-buttons button').forEach((button) => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;

      tabContent.startViewTransition({
        callback: () => {
          // ボタンの状態更新
          tabs.querySelectorAll('.tab-buttons button').forEach((btn) => {
            btn.classList.remove('active');
          });
          button.classList.add('active');

          // タブコンテンツの切り替え
          tabs.querySelectorAll('.tab-pane').forEach((pane) => {
            pane.classList.remove('active');
          });
          document.getElementById(tabId).classList.add('active');
        },
      });
    });
  });
</script>
```

---

## ブラウザサポート

### 現在のサポート状況

- **Chrome 140+**: テスト可能（フラグ有効化が必要）
- **Chrome Canary**: 実験的機能として利用可能
- **他のブラウザ**: 未サポート

### フラグの有効化（Chrome Canary）

1. `chrome://flags` にアクセス
2. "Experimental Web Platform features" を検索
3. **Enabled** に設定
4. ブラウザを再起動

---

## プログレッシブエンハンスメント

### フォールバック

未サポート環境では、通常のDOM操作として動作します。

```javascript
function updateNav(newContent) {
  const nav = document.getElementById('main-nav');

  if (nav.startViewTransition) {
    // スコープ付き遷移（Chrome 140+）
    nav.startViewTransition({
      callback: () => {
        nav.querySelector('ul').innerHTML = newContent;
      },
    });
  } else {
    // フォールバック（通常のDOM操作）
    nav.querySelector('ul').innerHTML = newContent;
  }
}
```

---

## 完全な実装例

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 2rem;
    }

    .gallery {
      contain: layout;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }

    .gallery-item {
      aspect-ratio: 1;
      background: #f0f0f0;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .gallery-item:hover {
      transform: scale(1.05);
    }

    .gallery::view-transition-old(root),
    .gallery::view-transition-new(root) {
      animation-duration: 0.4s;
    }
  </style>
</head>
<body>
  <h1>Scoped View Transitions デモ</h1>
  <button id="shuffle">ギャラリーをシャッフル</button>

  <div class="gallery" id="my-gallery">
    <div class="gallery-item">1</div>
    <div class="gallery-item">2</div>
    <div class="gallery-item">3</div>
    <div class="gallery-item">4</div>
    <div class="gallery-item">5</div>
    <div class="gallery-item">6</div>
  </div>

  <script>
    const gallery = document.getElementById('my-gallery');
    const shuffleBtn = document.getElementById('shuffle');

    shuffleBtn.addEventListener('click', () => {
      const items = Array.from(gallery.children);
      const shuffled = items.sort(() => Math.random() - 0.5);

      if (gallery.startViewTransition) {
        gallery.startViewTransition({
          callback: () => {
            shuffled.forEach((item) => {
              gallery.appendChild(item);
            });
          },
        });
      } else {
        shuffled.forEach((item) => {
          gallery.appendChild(item);
        });
      }
    });
  </script>
</body>
</html>
```

---

## 参考資料

- [Scoped View Transitions - Chrome Platform Status](https://chromestatus.com/feature/5209044034240512)
- [View Transitions API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- [CSS Containment - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Containment)

---

## 関連ナレッジ

- [View Transitions 基礎](./view-transitions.md)
- [CSS 2025 インタラクション](./css-2025-interactions.md)
- [contain プロパティ](../modern/contain.md)
- [Chrome 140 の新機能](../modern/chrome-140-features.md)
