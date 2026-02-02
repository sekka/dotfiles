---
title: Container Scroll-State Queries - スクロール状態によるスタイル切り替え
category: css/layout
tags: [container-queries, scroll-state, sticky, scrollable, snapped, scroll-snap]
browser_support: Chrome 133+, Edge 133+（2026年1月時点）
created: 2025-02-01
updated: 2025-02-01
---

# Container Scroll-State Queries - スクロール状態によるスタイル切り替え

## JavaScriptなしでスクロール状態に応じたスタイル変更

> 出典: https://ics.media/entry/250602/
> 執筆日: 2026-01
> 追加日: 2025-02-01

`@container scroll-state()` により、スクロールの状態変化をCSSのみで検知してスタイルを切り替えられる。`position: sticky` の固定状態、スクロール可能性、スナップ状態の3つを検出可能。

### 3つのスクロール状態クエリ

| 状態 | トリガー条件 | ユースケース |
|------|------------|-------------|
| `stuck` | `position: sticky` 要素が固定された時 | ヘッダーの背景色変更 |
| `scrollable` | 特定方向にスクロール可能な時 | スクロールヒントの表示 |
| `snapped` | スクロールスナップが発生した時 | カルーセルアイテムのサイズ変更 |

### 基本的な実装パターン

#### 1. Sticky Header の背景色変更

```css
.header {
  container-type: scroll-state;
  position: sticky;
  top: 0;
  background: transparent;
  transition: background-color 0.3s ease;
}

@container scroll-state(stuck: top) {
  .header {
    background-color: rgba(255, 255, 255, 0.95);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}
```

**HTML**:
```html
<header class="header">
  <nav>サイトナビゲーション</nav>
</header>
```

#### 2. セクションナビゲーションの展開

```css
.section-nav {
  container-type: scroll-state;
  position: sticky;
  top: 0;
}

.nav-button {
  width: 50px;
  overflow: hidden;
  transition: width 0.3s ease;
}

@container scroll-state(stuck: top) {
  .nav-button {
    width: 150px; /* 固定時に展開 */
  }
}
```

### スクロール可能状態（scrollable）

#### 3. スクロールヒントの表示

```css
.scroll-container {
  container-type: scroll-state;
  overflow-y: auto;
  max-height: 400px;
}

.scroll-hint {
  opacity: 0;
  transition: opacity 0.3s ease;
}

@container scroll-state(scrollable: block) {
  .scroll-hint.down {
    opacity: 1; /* 下方向にスクロール可能 */
  }
}

@container scroll-state(scrollable: inline) {
  .scroll-hint.right {
    opacity: 1; /* 横方向にスクロール可能 */
  }
}
```

**HTML**:
```html
<div class="scroll-container">
  <div class="content">長いコンテンツ...</div>
  <div class="scroll-hint down">↓ さらに表示</div>
</div>
```

### スクロールスナップ状態（snapped）

#### 4. カルーセルアイテムのサイズ変更

```css
.carousel {
  container-type: scroll-state;
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.carousel-item {
  scroll-snap-align: center;
  flex-shrink: 0;
  width: 250px;
  transition: transform 0.3s ease;
}

@container scroll-state(snapped: inline) {
  .carousel-item {
    transform: scale(1.1); /* スナップ時に拡大 */
  }
}
```

### 複合的な状態検出

```css
.sidebar {
  container-type: scroll-state;
  position: sticky;
  top: 0;
  overflow-y: auto;
}

/* 固定されている かつ スクロール可能 */
@container scroll-state(stuck: top) and scroll-state(scrollable: block) {
  .sidebar::after {
    content: '↓';
    position: absolute;
    bottom: 0;
    right: 0;
  }
}
```

### stuck の詳細な状態

```css
/* 上端に固定 */
@container scroll-state(stuck: top) { }

/* 下端に固定 */
@container scroll-state(stuck: bottom) { }

/* 左端に固定 */
@container scroll-state(stuck: left) { }

/* 右端に固定 */
@container scroll-state(stuck: right) { }

/* いずれかの方向で固定 */
@container scroll-state(stuck) { }
```

### scrollable の方向指定

```css
/* 縦方向（上下）にスクロール可能 */
@container scroll-state(scrollable: block) { }

/* 横方向（左右）にスクロール可能 */
@container scroll-state(scrollable: inline) { }

/* いずれかの方向にスクロール可能 */
@container scroll-state(scrollable) { }
```

### 実践例: ページ内目次ナビゲーション

```css
.toc {
  container-type: scroll-state;
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

/* 通常状態 */
.toc-title {
  font-size: 1rem;
  padding: 0.5rem;
}

/* 固定された時 */
@container scroll-state(stuck: top) {
  .toc {
    background: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .toc-title {
    font-weight: bold;
    border-bottom: 1px solid #ddd;
  }
}

/* スクロール可能な時 */
@container scroll-state(scrollable: block) {
  .toc::after {
    content: '';
    position: sticky;
    bottom: 0;
    height: 40px;
    background: linear-gradient(transparent, white);
  }
}
```

### パフォーマンス最適化

```css
/* will-change でアニメーション最適化 */
.sticky-header {
  container-type: scroll-state;
  will-change: background-color, box-shadow;
}

@container scroll-state(stuck: top) {
  .sticky-header {
    background-color: white;
  }
}
```

### アクセシビリティ配慮

```css
/* モーション軽減対応 */
@media (prefers-reduced-motion: reduce) {
  .carousel-item {
    transition: none;
  }
}

/* フォーカス可視性 */
@container scroll-state(stuck: top) {
  .nav-link:focus {
    outline: 2px solid blue;
    outline-offset: 2px;
  }
}
```

### ブラウザサポート

**対応状況**（2026年1月時点）:
- ✅ Chrome 133+
- ✅ Edge 133+
- ❌ Safari（未対応）
- ❌ Firefox（未対応）

### フォールバック対応

```css
/* Intersection Observerのフォールバック（JS必要） */
.header.is-stuck {
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 対応ブラウザではCSSのみ */
@supports (container-type: scroll-state) {
  .header {
    container-type: scroll-state;
  }

  @container scroll-state(stuck: top) {
    .header {
      background-color: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
}
```

### ユースケース

- **Sticky Header**: 固定時の背景色・影の追加
- **セクションナビゲーション**: 固定時にボタンを展開
- **スクロールヒント**: スクロール可能時に方向表示
- **カルーセル**: スナップ時のアイテム強調
- **サイドバー**: 固定とスクロール状態の組み合わせ

### 注意点

- **container-type 必須**: `scroll-state` を明示的に指定
- **パフォーマンス**: 大量の要素での使用は注意
- **デバッグ**: DevToolsで状態変化を確認

### 参考資料

- [CSS Containment Module Level 3 - W3C Draft](https://drafts.csswg.org/css-contain-3/)
- [Container Queries - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries)

---
