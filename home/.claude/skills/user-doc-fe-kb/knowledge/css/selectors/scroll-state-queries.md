---
title: Scroll State Queries - スクロール状態の検出
category: css/selectors
tags: [scroll-state, container-queries, scroll-detection, header, sticky]
browser_support: Chrome 144+（実験的機能）
created: 2026-01-31
updated: 2026-01-31
source: https://coliss.com/articles/build-websites/operation/css/css-scroll-state-queries.html
---

# Scroll State Queries - スクロール状態の検出

## 概要

CSS Scroll State Queries を使用すると、スクロール状態（上部、下部、スクロール中）を検出し、それに応じてスタイルを適用できます。JavaScriptなしでヘッダーの自動表示/非表示などを実装可能です。

---

## 基本構文

### container-type: scroll-state の設定

```css
html {
  container-type: scroll-state;
}
```

### @container scroll-state() クエリ

```css
@container scroll-state(条件) {
  /* スタイル */
}
```

**主な条件:**
- `scrolled: top` - ページ上部にスクロール
- `scrolled: bottom` - ページ下部にスクロール
- `snapped: x` - 水平方向にスナップ
- `snapped: y` - 垂直方向にスナップ

---

## 実装例

### ヘッダーの自動表示/非表示

#### 基本実装

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
      padding: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);

      /* トランジション */
      transition: translate 0.25s ease;
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

    /* ページコンテンツ */
    body {
      min-height: 200vh;
      padding-top: 80px;
    }
  </style>
</head>
<body>
  <header>
    <h1>自動表示/非表示ヘッダー</h1>
  </header>

  <main>
    <p>下にスクロールするとヘッダーが非表示になります。</p>
    <p>上にスクロールするとヘッダーが表示されます。</p>
  </main>
</body>
</html>
```

### アクセシビリティへの配慮

フォーカス可能な要素がヘッダーに含まれる場合、フォーカス時は非表示にしないようにします。

```css
header {
  position: fixed;
  top: 0;
  width: 100%;
  transition: translate 0.25s ease;
  translate: 0 0;
}

@container scroll-state(scrolled: bottom) {
  header:not(:focus-within) {
    translate: 0 -100%;
  }
}
```

**効果:**
- ヘッダー内の要素にフォーカスがある場合、ヘッダーは表示されたまま
- キーボードナビゲーションが正常に動作

---

## スナップ状態の検出

### カルーセルの実装

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
    flex: 0 0 100%;
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

---

## ブラウザサポート

### 現在のサポート状況

- **Chrome 144+**: 正式サポート予定
- **Chrome Canary**: `chrome://flags` で実験的機能を有効化

### フラグの有効化（Chrome Canary）

1. `chrome://flags` にアクセス
2. "Experimental Web Platform features" を検索
3. Enabled に設定
4. ブラウザを再起動

---

## プログレッシブエンハンスメント

### フォールバック

未サポート環境では、ヘッダーが固定表示されます。

```css
html {
  container-type: scroll-state;
}

header {
  position: fixed;
  top: 0;
  transition: translate 0.25s ease;

  /* デフォルト: 常に表示 */
  translate: 0 0;
}

/* Chrome 144+ のみ */
@supports (container-type: scroll-state) {
  @container scroll-state(scrolled: bottom) {
    header {
      translate: 0 -100%;
    }
  }
}
```

### JavaScript フォールバック

```javascript
if (!CSS.supports('container-type', 'scroll-state')) {
  // フォールバック処理
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    const header = document.querySelector('header');

    if (currentScroll > lastScroll) {
      // 下スクロール: ヘッダー非表示
      header.style.transform = 'translateY(-100%)';
    } else {
      // 上スクロール: ヘッダー表示
      header.style.transform = 'translateY(0)';
    }

    lastScroll = currentScroll;
  });
}
```

---

## 高度な実装

### スクロール位置に応じたスタイル変更

```css
html {
  container-type: scroll-state;
}

header {
  position: fixed;
  top: 0;
  width: 100%;
  background: white;
  transition: background 0.3s, translate 0.25s;
}

/* 上部: 透明背景 */
@container scroll-state(scrolled: top) {
  header {
    background: transparent;
    box-shadow: none;
  }
}

/* 下部: 白背景 + 影 */
@container scroll-state(scrolled: bottom) {
  header {
    background: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
}
```

### 複数の条件の組み合わせ

```css
/* スクロール中 かつ フォーカスなし */
@container scroll-state(scrolled: bottom) {
  header:not(:focus-within) {
    translate: 0 -100%;
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
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html {
      container-type: scroll-state;
    }

    body {
      font-family: system-ui, -apple-system, sans-serif;
      padding-top: 80px;
    }

    header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      padding: 1rem 2rem;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: translate 0.3s ease, background 0.3s;
      translate: 0 0;
    }

    /* ページ上部: 透明背景 */
    @container scroll-state(scrolled: top) {
      header {
        background: rgba(255,255,255,0.9);
        backdrop-filter: blur(10px);
      }
    }

    /* ページ下部: ヘッダー非表示（フォーカスがない場合） */
    @container scroll-state(scrolled: bottom) {
      header:not(:focus-within) {
        translate: 0 -100%;
      }
    }

    nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    nav a {
      margin-left: 1rem;
      text-decoration: none;
      color: #333;
    }

    nav a:focus {
      outline: 2px solid #0070f3;
      outline-offset: 4px;
    }

    main {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    section {
      margin-bottom: 4rem;
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    h2 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    p {
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    .spacer {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(to bottom, #f0f0f0, #e0e0e0);
      margin-bottom: 2rem;
    }
  </style>
</head>
<body>
  <header>
    <nav>
      <h1>ロゴ</h1>
      <div>
        <a href="#home">ホーム</a>
        <a href="#about">概要</a>
        <a href="#contact">お問い合わせ</a>
      </div>
    </nav>
  </header>

  <main>
    <section id="home">
      <h1>Scroll State Queries デモ</h1>
      <p>下にスクロールするとヘッダーが自動的に非表示になります。</p>
      <p>上にスクロールするとヘッダーが再表示されます。</p>
    </section>

    <div class="spacer">
      <p>スクロールを続けてください</p>
    </div>

    <section id="about">
      <h2>機能</h2>
      <p>JavaScriptなしでスクロール状態を検出できます。</p>
      <p>ヘッダー内の要素にフォーカスすると、ヘッダーは表示されたままになります。</p>
    </section>

    <div class="spacer">
      <p>さらにスクロール</p>
    </div>

    <section id="contact">
      <h2>お問い合わせ</h2>
      <p>ページ上部に戻るとヘッダーが表示されます。</p>
    </section>
  </main>
</body>
</html>
```

---

## 参考資料

- [CSS Scroll State Queries - Spec](https://drafts.csswg.org/css-scroll-state-1/)
- [Chrome 144 Release Notes](https://developer.chrome.com/blog/new-in-chrome-144)
- [Container Queries - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_container_queries)

---

## 関連ナレッジ

- [Chrome 144 の新機能](../modern/chrome-144-features.md)
- [CSS 2025 インタラクション](../animation/css-2025-interactions.md)
- [Container Queries](./container-queries.md)
- [Sticky Header パターン](../../cross-cutting/ux/sticky-header.md)
