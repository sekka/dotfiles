---
title: Webサイトパフォーマンス最適化
category: cross-cutting/performance
tags: [performance, optimization, lcp, cls, fid, loading, lazy-load, image-optimization]
browser_support: モダンブラウザ全般
created: 2025-01-16
updated: 2025-01-16
---

# Webサイトパフォーマンス最適化

> 出典: https://zenn.dev/necscat/articles/cdd4c17d52f1bc
> 追加日: 2025-01-16

Core Web Vitals指標（LCP、CLS、FID）を改善する実践的な最適化手法。

## パフォーマンス最適化の4つの軸

1. **リクエスト回数の削減**
2. **リクエストサイズの縮小**
3. **リクエストタイミングの最適化**
4. **HTMLパース速度の向上**

---

## 1. 画像圧縮

### 概要

画像のファイルサイズを減らすことで、LCPを改善。

### 実装方法

**外部サービス:**
- TinyPNG
- ILoveIMG

**ビルドツール:**
- Gulp
- Webpack

### フォーマット選択

- **JPG**: 写真（グラデーション）
- **PNG**: ベタ塗り、透過が必要な画像
- **SVG**: アイコン、ベクター画像

### 関連指標

- **LCP** (Largest Contentful Paint)

---

## 2. 画像遅延読み込み

### 基本実装

```html
<img src="path/to/img.png"
     alt="説明テキスト"
     width="600"
     height="300"
     loading="lazy"
     decoding="async" />
```

### ファーストビュー戦略

**ファーストビュー画像:**
```html
<img src="hero.jpg" alt=""
     width="1200" height="800"
     decoding="async" />
```

**スクロール後に表示される画像:**
```html
<img src="content.jpg" alt=""
     width="800" height="600"
     loading="lazy"
     decoding="async" />
```

### CLS対策

```html
<!-- ❌ NGパターン: width/height未指定 -->
<img src="image.jpg" loading="lazy" />

<!-- ✅ 正しい: 明示的なサイズ指定 -->
<img src="image.jpg"
     width="800"
     height="600"
     loading="lazy" />
```

**重要:** `width`と`height`属性でレイアウトシフトを防止。

### 関連指標

- **LCP**: 画像読み込み速度
- **CLS**: レイアウトシフト防止

---

## 3. ファイル読み込みの見直し

### CSS統合

**❌ 避けるべき:**
```css
/* style.css */
@import url("reset.css");
@import url("layout.css");
@import url("components.css");
```

**✅ 推奨:**
- 単一ファイルに統合
- Sass/SCSSでのモジュール管理

### JavaScript統合

**ビルドツール活用:**
- Gulp
- Webpack + Babel

**外部ライブラリ:**
- npm経由でインストール
- CDN配信の利用

---

## 4. スクリプト非同期化

### defer 属性

```html
<script src="path/to/script.js" defer></script>
```

**効果:**
- HTMLパース停止を防止
- DOMContentLoaded前に実行
- スクリプト順序を保証

### async vs defer

```html
<!-- async: ダウンロード後即実行（順序不定） -->
<script src="analytics.js" async></script>

<!-- defer: HTMLパース後に実行（順序保証） -->
<script src="main.js" defer></script>
```

---

## 5. JavaScript処理の最適化

### DOM要素の重複取得を避ける

**❌ 非効率:**
```javascript
document.querySelector('.modal').classList.add('open');
document.querySelector('.modal').setAttribute('aria-hidden', 'false');
document.querySelector('.modal').focus();
```

**✅ 効率的:**
```javascript
const modal = document.querySelector('.modal');
modal.classList.add('open');
modal.setAttribute('aria-hidden', 'false');
modal.focus();
```

### Async/Await活用

**❌ 避けるべき:**
```javascript
setTimeout(() => {
  fetchData();
}, 1000);
```

**✅ 推奨:**
```javascript
async function loadData() {
  await new Promise(resolve => setTimeout(resolve, 1000));
  await fetchData();
}
```

### Intersection Observer API

**❌ 従来のスクロールイベント:**
```javascript
window.addEventListener('scroll', () => {
  // スクロールごとに実行（パフォーマンス悪化）
  checkVisibility();
});
```

**✅ Intersection Observer:**
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // 要素が表示されたときだけ実行
      loadContent(entry.target);
    }
  });
});

observer.observe(document.querySelector('.lazy-section'));
```

---

## 6. レスポンシブ画像配信

### picture要素

```html
<picture>
  <source srcset="path/to/desktop.png"
          media="(min-width: 768px)">
  <source srcset="path/to/tablet.png"
          media="(min-width: 480px)">
  <img src="path/to/mobile.png"
       alt="レスポンシブ画像" />
</picture>
```

### display: none との違い

**重要:** `display: none`は画像を隠すだけで読み込みは発生する。`picture`要素は不要な画像を読み込まない。

---

## 7. 解像度対応（srcset）

### 基本実装

```html
<img srcset="path/to/sm.jpg 640w,
             path/to/md.jpg 767w,
             path/to/lg.jpg 1080w"
     src="path/to/lg.jpg"
     sizes="(max-width: 1080px) 100vw, 1080px"
     alt="高解像度対応画像" />
```

### sizes属性の指定

```html
<!-- ビューポート幅に応じた画像サイズ -->
<img srcset="image-320.jpg 320w,
             image-640.jpg 640w,
             image-1280.jpg 1280w"
     sizes="(max-width: 640px) 100vw,
            (max-width: 1280px) 50vw,
            33vw"
     src="image-1280.jpg" />
```

### 注意点

複数解像度の画像準備が必要（ビルドツールで自動化推奨）。

---

## 8. CSS非同期化

### 実装方法

```html
<link rel="stylesheet"
      href="path/to/style.css"
      media="print"
      onload="this.media='all'">
```

### CLS対策

**推奨:** ヘッダーのCSSはインライン化してレイアウトシフトを防止。

```html
<head>
  <style>
    /* クリティカルCSS */
    header { background: #000; }
    .hero { min-height: 500px; }
  </style>
  <link rel="stylesheet"
        href="non-critical.css"
        media="print"
        onload="this.media='all'">
</head>
```

### 注意点

初期表示時にスタイルが適用されず、レイアウト崩れが発生する可能性。クリティカルCSSの適切な選定が重要。

---

## 9. iframe遅延読み込み

### 実装方法

```html
<iframe src="https://www.youtube.com/embed/VIDEO_ID"
        loading="lazy"
        width="560"
        height="315"
        title="埋め込み動画"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture">
</iframe>
```

### 適用例

- YouTube埋め込み
- Google Map
- SNS埋め込みウィジェット

---

## パフォーマンス指標との関連

| 指標 | 関連手法 | 影響度 |
|------|---------|-------|
| **LCP** | 画像圧縮、遅延読み込み、レスポンシブ画像 | 高 |
| **CLS** | width/height属性、CSS非同期化 | 中 |
| **FID** | JavaScript処理最適化、スクリプト非同期化 | 中 |

---

## 実装優先度

### 最優先（即効性あり）

1. **画像圧縮**: ファイルサイズ削減
2. **loading="lazy"**: 遅延読み込み
3. **width/height属性**: CLS防止

### 次点（中〜長期）

4. **ファイル統合**: リクエスト回数削減
5. **script defer**: HTMLパース改善
6. **JavaScript最適化**: 処理速度向上

### 高度な最適化

7. **picture要素**: デバイス別最適化
8. **srcset**: 解像度対応
9. **CSS非同期化**: レンダリング改善

---

## 重要な考え方

> 「点数が低い＝絶対悪ではない」

パフォーマンス指標は重要だが、ユーザー体感時間を優先する場合もある。数値だけでなく、実際のユーザー体験を考慮した最適化が重要。

---

## ブラウザ対応

| 機能 | 対応状況 |
|------|---------|
| `loading="lazy"` | Chrome 77+, Safari 15.4+, Firefox 75+ |
| `srcset` | 全モダンブラウザ |
| Intersection Observer | Chrome 51+, Safari 12.1+, Firefox 55+ |
| `defer` | 全モダンブラウザ |

---

## 関連ナレッジ

- [Lazy Loading](./lazy-loading.md)
- [Core Web Vitals](./core-web-vitals.md)
- [画像最適化](./image-optimization.md)
- [レスポンシブ画像](../../html/responsive-images.md)
- [Intersection Observer](../../javascript/api/intersection-observer.md)
