---
title: CSS のみで実装するカルーセルUI（::scroll-button, ::scroll-marker）
category: css/components
tags: [carousel, scroll-snap, pseudo-elements, accessibility, scroll-button, scroll-marker]
browser_support: Chrome 135+, Edge 135+（2025年5月時点）
created: 2025-02-01
updated: 2025-02-01
---

# CSS のみで実装するカルーセルUI（::scroll-button, ::scroll-marker）

## JavaScriptなしでカルーセルUIを構築

> 出典: https://ics.media/entry/250516/
> 執筆日: 2025-05-16
> 追加日: 2025-02-01

Chrome 135とEdge 135から、`::scroll-button()` と `::scroll-marker` 疑似要素が導入され、JavaScriptライブラリ（Swiper.jsなど）を使わずにカルーセルUIを実装できるようになった。ナビゲーションボタンとインジケーターが自動生成され、アクセシビリティ機能も組み込まれる。

### 2つの新しい疑似要素

| 疑似要素 | 役割 | 自動生成される要素 |
|---------|------|------------------|
| `::scroll-button()` | 前後のナビゲーションボタン | `<button>` |
| `::scroll-marker` | 現在位置のインジケーター | ドット（選択可能） |

### 基本的な実装パターン

#### 1. シンプルなカルーセル

```html
<div class="carousel">
  <img src="image1.jpg" alt="画像1">
  <img src="image2.jpg" alt="画像2">
  <img src="image3.jpg" alt="画像3">
</div>
```

```css
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory; /* スナップ有効化 */
  scroll-behavior: smooth; /* 滑らかなスクロール */
}

.carousel img {
  flex-shrink: 0;
  width: 100%;
  scroll-snap-align: start; /* スナップ位置 */
}

/* 前後ボタンのスタイル */
.carousel::scroll-button(left),
.carousel::scroll-button(right) {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  cursor: pointer;
}

/* インジケーターのスタイル */
.carousel::scroll-marker {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
}

.carousel::scroll-marker:checked {
  background: rgba(0, 0, 0, 0.8); /* 選択中 */
}
```

### 画像ベースのインジケーター

CSSカスタムプロパティを使ってサムネイル画像を表示：

```html
<div class="carousel">
  <img src="image1.jpg" alt="" style="--img: url(thumb1.jpg)">
  <img src="image2.jpg" alt="" style="--img: url(thumb2.jpg)">
  <img src="image3.jpg" alt="" style="--img: url(thumb3.jpg)">
</div>
```

```css
.carousel::scroll-marker {
  width: 60px;
  height: 40px;
  border: 2px solid transparent;
  background-image: var(--img);
  background-size: cover;
  background-position: center;
}

.carousel::scroll-marker:checked {
  border-color: blue; /* 選択中は枠線表示 */
}
```

### フルワイドレイアウト（ボタンをオーバーレイ）

Anchor Positioning を使ってボタンを画像上に配置：

```css
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  anchor-name: --carousel; /* アンカー名を定義 */
}

.carousel::scroll-button(left) {
  position: absolute;
  position-anchor: --carousel;
  inset-area: left; /* 左端に配置 */
  margin-left: 20px;
}

.carousel::scroll-button(right) {
  position: absolute;
  position-anchor: --carousel;
  inset-area: right; /* 右端に配置 */
  margin-right: 20px;
}

/* インジケーターを中央下部に */
.carousel::scroll-marker {
  position: absolute;
  position-anchor: --carousel;
  inset-area: bottom; /* 下部中央 */
  margin-bottom: 20px;
}
```

### カスタムボタンアイコン

```css
.carousel::scroll-button(left)::before {
  content: '‹'; /* 左矢印 */
  font-size: 24px;
}

.carousel::scroll-button(right)::before {
  content: '›'; /* 右矢印 */
  font-size: 24px;
}

/* または画像アイコン */
.carousel::scroll-button(left) {
  background-image: url('arrow-left.svg');
  background-size: 20px;
  background-repeat: no-repeat;
  background-position: center;
}
```

### アクセシビリティ機能（自動提供）

**キーボードナビゲーション**:
- Tab キーでボタン・インジケーターにフォーカス
- Enter/Space でスライド移動

**スクリーンリーダー対応**:
- ボタンに `role="button"` が自動付与
- インジケーターに `role="tablist"`, `role="tab"` が自動付与
- 現在位置の読み上げ（"1 / 3"）

**ARIA属性**:
- `aria-label`: ボタンの説明（"Previous slide", "Next slide"）
- `aria-selected`: 選択中のインジケーター
- `aria-controls`: ボタンとコンテンツの関連付け

### ホバーエフェクト

```css
.carousel::scroll-button(left):hover,
.carousel::scroll-button(right):hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

.carousel::scroll-marker:hover {
  transform: scale(1.2);
  transition: transform 0.2s ease;
}
```

### レスポンシブ対応

```css
/* モバイル: ボタンを非表示 */
@media (max-width: 768px) {
  .carousel::scroll-button(left),
  .carousel::scroll-button(right) {
    display: none;
  }

  .carousel::scroll-marker {
    width: 8px;
    height: 8px;
  }
}

/* デスクトップ: ボタンを大きく */
@media (min-width: 769px) {
  .carousel::scroll-button(left),
  .carousel::scroll-button(right) {
    width: 50px;
    height: 50px;
  }
}
```

### スクロールスナップのカスタマイズ

```css
.carousel {
  scroll-snap-type: x mandatory; /* 必ずスナップ */
  /* または */
  scroll-snap-type: x proximity; /* 近い場合のみスナップ */
}

.carousel img {
  scroll-snap-align: start; /* 左端揃え */
  /* または */
  scroll-snap-align: center; /* 中央揃え */
}

/* スクロールパディング（余白調整） */
.carousel {
  scroll-padding: 20px; /* 左右に余白 */
}
```

### 自動再生（JavaScript必要）

```javascript
const carousel = document.querySelector('.carousel');
let autoplayInterval;

function startAutoplay() {
  autoplayInterval = setInterval(() => {
    carousel.scrollBy({
      left: carousel.offsetWidth,
      behavior: 'smooth'
    });
  }, 3000); // 3秒ごと
}

function stopAutoplay() {
  clearInterval(autoplayInterval);
}

// ホバー時に停止
carousel.addEventListener('mouseenter', stopAutoplay);
carousel.addEventListener('mouseleave', startAutoplay);

startAutoplay();
```

### ブラウザサポート

**対応状況**（2025年5月時点）:
- ✅ Chrome 135+
- ✅ Edge 135+
- ❌ Safari（未対応）
- ❌ Firefox（未対応）

### 制限事項

- **無限ループ**: 未対応（最初/最後で停止）
- **サムネイルナビゲーション**: `::scroll-marker` のみ（カスタムナビゲーションは不可）
- **複雑なアニメーション**: 基本的なフェード・スライドのみ

### フォールバック（対応外ブラウザ向け）

```css
/* Swiper.jsなどのライブラリを使用 */
@supports not (selector(::scroll-button(left))) {
  /* CSSのみのカルーセルは非表示 */
  .carousel::scroll-button(left),
  .carousel::scroll-button(right),
  .carousel::scroll-marker {
    display: none;
  }

  /* JavaScriptライブラリでカルーセル実装 */
  .carousel.swiper {
    /* Swiper.jsのスタイル */
  }
}
```

### ユースケース

- **商品ギャラリー**: ECサイトの画像カルーセル
- **ヒーローバナー**: トップページのスライドショー
- **レビュー**: お客様の声のスライド
- **ポートフォリオ**: 作品のギャラリー
- **ニュース**: 最新情報のスライド

### 注意点

- **パフォーマンス**: 大量の画像では遅延読み込み（`loading="lazy"`）を併用
- **アクセシビリティ**: 自動再生時は一時停止ボタンを提供
- **モーション軽減**: `prefers-reduced-motion` への配慮

```css
@media (prefers-reduced-motion: reduce) {
  .carousel {
    scroll-behavior: auto; /* 滑らかなスクロールを無効化 */
  }
}
```

### 参考資料

- [CSS Overflow Module Level 4 - W3C Draft](https://drafts.csswg.org/css-overflow-4/)
- [CSS Scroll Snap Module Level 1 - W3C Recommendation](https://www.w3.org/TR/css-scroll-snap-1/)

---
