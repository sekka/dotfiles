# パフォーマンス最適化

画像最適化、遅延読み込み、Core Web Vitals、レンダリング最適化に関するナレッジ集。

---

## HTML Lazy Load のブラウザ別挙動

> 出典: https://zenn.dev/iototaku/articles/3a495a8939bd9b
> 執筆日: 不明
> 追加日: 2025-12-17

`loading="lazy"` 属性の挙動はブラウザごとに大きく異なる。
「ビューポートに入ったら読み込む」という単純な仕様ではない。

### 基本的な使い方

```html
<!-- 画像の遅延読み込み -->
<img src="image.jpg" loading="lazy" alt="説明" />

<!-- iframeの遅延読み込み -->
<iframe src="embed.html" loading="lazy"></iframe>
```

### ブラウザ別の挙動

| ブラウザ | 挙動 | 特徴 |
|----------|------|------|
| **Safari（Mac/iOS）** | 最も保守的 | ビューポート直前まで遅延、メモリ節約重視 |
| **Chrome/Edge** | 先読み優先 | ビューポートから2000px以上先でも読み込み開始 |
| **Firefox 121+** | 中間的 | ChromeとSafariの中間、適度な先読み |
| **Android Chrome** | 不安定 | 先に読み込まれた画像があるとlazyが無視される場合あり |

### Chrome/Edge の詳細挙動

Chromium系ブラウザは回線速度に応じて読み込み開始距離を調整:

| 回線速度 | 読み込み開始距離（目安） |
|----------|-------------------------|
| 4G | ビューポートから約1250px |
| 3G | ビューポートから約2500px |
| 2G | ビューポートから約4000px |

遅い回線ほど早めに読み込みを開始し、ユーザー体験を確保する戦略。

### 確実な制御が必要な場合

ブラウザ間の挙動差が問題になる場合は `IntersectionObserver` で自前実装:

```javascript
/**
 * カスタム Lazy Load 実装
 * ブラウザ間で一貫した挙動を保証
 */
function setupLazyLoad(options = {}) {
  const {
    rootMargin = "200px 0px", // ビューポートから200px手前で読み込み開始
    threshold = 0,
  } = options;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target;

          // data-src から src へ
          if (element.dataset.src) {
            element.src = element.dataset.src;
            element.removeAttribute("data-src");
          }

          // data-srcset から srcset へ
          if (element.dataset.srcset) {
            element.srcset = element.dataset.srcset;
            element.removeAttribute("data-srcset");
          }

          observer.unobserve(element);
        }
      });
    },
    { rootMargin, threshold }
  );

  // lazy クラスを持つ要素を監視
  document.querySelectorAll("[data-src]").forEach((el) => {
    observer.observe(el);
  });

  return observer;
}

// 使用例
document.addEventListener("DOMContentLoaded", () => {
  setupLazyLoad({ rootMargin: "300px 0px" });
});
```

```html
<!-- カスタム実装用のHTML -->
<img
  data-src="image.jpg"
  data-srcset="image-400.jpg 400w, image-800.jpg 800w"
  src="placeholder.jpg"
  alt="説明"
/>
```

### ビューポートからの距離を計測するユーティリティ

```javascript
/**
 * 要素のビューポート中央からの距離を計算
 * デバッグや挙動確認に便利
 */
function getDistanceToViewportCenter(element) {
  const rect = element.getBoundingClientRect();
  const viewportCenter = window.innerHeight / 2;
  const elementCenter = rect.top + rect.height / 2;
  return elementCenter - viewportCenter;
}

// 使用例: 画像読み込み時の距離をログ
document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
  img.addEventListener("load", () => {
    console.log(`Loaded at distance: ${getDistanceToViewportCenter(img)}px`);
  });
});
```

### 使い分けの指針

| 状況 | 推奨 |
|------|------|
| 一般的なWebサイト | `loading="lazy"` で十分 |
| 厳密な制御が必要 | IntersectionObserver で自前実装 |
| LCP対象の画像 | `loading="lazy"` を使わない（遅延させない） |
| ファーストビュー内の画像 | `loading="eager"`（デフォルト）を使用 |

### 注意点

- **LCP（Largest Contentful Paint）への影響**: ファーストビューの重要な画像に `lazy` を付けると LCP が悪化
- **CLS（Cumulative Layout Shift）対策**: 幅・高さを明示するか、`aspect-ratio` を指定

```html
<!-- CLS 対策: サイズを明示 -->
<img
  src="image.jpg"
  loading="lazy"
  width="800"
  height="600"
  alt="説明"
/>

<!-- または aspect-ratio を使用 -->
<img
  src="image.jpg"
  loading="lazy"
  style="aspect-ratio: 4/3; width: 100%;"
  alt="説明"
/>
```

- **印刷時の問題**: 一部ブラウザでは `lazy` 画像が印刷されない場合がある
- **JavaScript無効環境**: ネイティブ `lazy` は動作するが、IntersectionObserver 実装は動作しない

---

## サイト高速化チェックリスト

> 出典: https://zenn.dev/necscat/articles/cdd4c17d52f1bc
> 執筆日: 2023-06-15
> 追加日: 2025-12-17

コーダーが実装可能なサイト表示速度向上の施策一覧。
Googleの調査では、読み込み1〜3秒で32%、1〜10秒で123%のユーザーが離脱する。

### 最も効果的: 画像最適化

サイト容量の半分以上は画像。画像最適化だけで大幅な改善が期待できる。

#### 1. 画像の圧縮

```bash
# ツール例
# - TinyPNG (https://tinypng.com/)
# - ILoveIMG (https://www.iloveimg.com/)
# - Squoosh (https://squoosh.app/)
# - Gulp/Webpack で自動化
```

#### 2. 適切なフォーマット選択

| 用途 | 推奨フォーマット |
|------|------------------|
| 写真・グラデーション | JPG / WebP / AVIF |
| 透過が必要 | PNG / WebP |
| アイコン・ロゴ | SVG |
| アニメーション | WebP / MP4（GIF は避ける） |

#### 3. 画像の遅延読み込み

```html
<!-- ファーストビュー以外の画像 -->
<img
  src="image.jpg"
  alt="説明"
  width="600"
  height="300"
  loading="lazy"
  decoding="async"
/>
```

- `loading="lazy"`: ビューポート外の画像を遅延読み込み
- `decoding="async"`: 画像デコードを非同期化（レンダリングブロックを回避）
- **ファーストビューの画像には付けない**（LCP悪化の原因）

#### 4. レスポンシブ画像

**画面幅に応じた切り替え（picture タグ）:**

```html
<picture>
  <source srcset="large.webp" media="(min-width: 768px)" type="image/webp" />
  <source srcset="large.jpg" media="(min-width: 768px)" />
  <source srcset="small.webp" type="image/webp" />
  <img src="small.jpg" alt="説明" />
</picture>
```

`display: none` での切り替えは非表示画像も読み込まれるため NG。

**解像度別配信（srcset 属性）:**

```html
<img
  srcset="small.jpg 640w, medium.jpg 1024w, large.jpg 1920w"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
  src="large.jpg"
  alt="説明"
/>
```

### JavaScript 最適化

#### 5. defer 属性でレンダリングブロック回避

```html
<!-- ❌ レンダリングをブロック -->
<script src="script.js"></script>

<!-- ✅ HTMLパースをブロックしない -->
<script src="script.js" defer></script>
```

| 属性 | 読み込み | 実行タイミング |
|------|----------|----------------|
| なし | 同期 | 即座（パース中断） |
| `async` | 非同期 | 読み込み完了後すぐ |
| `defer` | 非同期 | DOMContentLoaded 前 |

#### 6. JavaScript 処理の最適化

```javascript
// ❌ 同じ要素を何度も取得
document.querySelector(".btn").addEventListener("click", handler1);
document.querySelector(".btn").addEventListener("click", handler2);

// ✅ 変数にキャッシュ
const btn = document.querySelector(".btn");
btn.addEventListener("click", handler1);
btn.addEventListener("click", handler2);

// ❌ ループ内で毎回計算
for (let i = 0; i < items.length; i++) {
  /* ... */
}

// ✅ 長さをキャッシュ
for (let i = 0, len = items.length; i < len; i++) {
  /* ... */
}
```

### CSS 最適化

#### 7. CSS の非同期読み込み（注意が必要）

```html
<!-- 非同期でCSSを読み込む -->
<link
  rel="stylesheet"
  href="non-critical.css"
  media="print"
  onload="this.media='all'"
/>
<noscript>
  <link rel="stylesheet" href="non-critical.css" />
</noscript>
```

**注意:** レイアウトシフト（CLS悪化）の原因になりうる。クリティカルCSSはインライン化推奨。

#### 8. CSS/JS の Minify

```bash
# 本番ビルドでは必ず圧縮
# - 空白・改行の削除
# - 変数名の短縮（JS）
# - 未使用コードの削除
```

### その他の施策

#### 9. iframe の遅延読み込み

```html
<iframe
  src="https://www.youtube.com/embed/xxxxx"
  loading="lazy"
  width="560"
  height="315"
  title="YouTube video"
></iframe>
```

YouTube、Google Maps などの埋め込みは特に重い。

#### 10. Web フォントの最適化

```html
<!-- サブセット化されたフォントを使用 -->
<link
  rel="preload"
  href="font-subset.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

```css
/* font-display で読み込み中の挙動を制御 */
@font-face {
  font-family: "MyFont";
  src: url("font.woff2") format("woff2");
  font-display: swap; /* フォールバックフォントを先に表示 */
}
```

### クイックチェックリスト

実装時に確認すべき項目:

- [ ] 画像は圧縮されているか
- [ ] 適切な画像フォーマットを使用しているか（WebP/AVIF検討）
- [ ] ファーストビュー外の画像に `loading="lazy"` を付けているか
- [ ] ファーストビューの画像には `lazy` を付けていないか
- [ ] 画像に `width`/`height` または `aspect-ratio` を指定しているか
- [ ] `<script>` タグに `defer` を付けているか
- [ ] 不要な CSS/JS ファイルを読み込んでいないか
- [ ] CSS/JS は Minify されているか
- [ ] iframe に `loading="lazy"` を付けているか
- [ ] Web フォントはサブセット化されているか

### 計測ツール

- [PageSpeed Insights](https://pagespeed.web.dev/) - Google公式
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/) - Chrome DevTools内蔵
- [WebPageTest](https://www.webpagetest.org/) - 詳細な分析
- Chrome DevTools > Network タブ - 個別リソースの確認

---
