---
title: 実践的 Web フロントエンドパフォーマンスチューニング
category: cross-cutting/performance
tags: [performance, optimization, image, compression, cache, brotli, webp, avif, 2025]
browser_support: 全モダンブラウザ
created: 2026-01-31
updated: 2026-01-31
---

# 実践的 Web フロントエンドパフォーマンスチューニング

> 出典: https://speakerdeck.com/cp20/shi-jian-webhurontopahuomansutiyuningu
> 発表日: 2025年4月28日
> 発表者: しーぴー (@cp20) - traP代表・SysAd班長
> 追加日: 2026-01-31

## 概要

5分のライトニングトーク形式で発表された、実践的なパフォーマンスチューニング手法。画像、テキスト、フォント、JavaScript、キャッシュの5つの最適化領域をカバーします。

---

## 1. 画像の軽量化

### 圧縮（フォーマット変換）

**PNG → WEBP または AVIF**

| フォーマット | サイズ | 品質 | ブラウザサポート |
|------------|--------|------|-----------------|
| PNG | 62.1KB | 高品質 | 全ブラウザ |
| WEBP | 13.5KB | 高品質 | Chrome 23+, Safari 14+ |
| AVIF | 14.9KB | 高品質 | Chrome 85+, Safari 16.4+ |

**削減率**: 約 78%（PNG → WEBP）

---

### 推奨設定

**品質設定**: `quality=95` を推奨

```bash
# sharp-cli での変換例
npx sharp-cli -i input.png -o output.webp --webp-quality 95
```

**理由**:
- `quality=80` 以下: 劣化が目立つ場合がある
- `quality=95`: 劣化を最小化しつつ、高い圧縮率

---

### ツール

| ツール | 用途 |
|--------|------|
| [sharp](https://sharp.pixelplumbing.com/) | Node.js での自動変換 |
| [ImageMagick](https://imagemagick.org/) | コマンドラインツール |
| [Squoosh](https://squoosh.app/) | ブラウザベースの変換ツール |

---

### リサイズ（適切なサイズへの縮小）

**問題**: 1440×810px の画像を 299×168px で表示

**削減効果**: 約 80% のサイズ削減

```html
<!-- ❌ 大きすぎる画像 -->
<img src="large-image.jpg" width="299" height="168">

<!-- ✅ 適切なサイズ -->
<img src="small-image.jpg" width="299" height="168">
```

---

### レスポンシブ画像（srcset / sizes）

```html
<img
  src="image-800.jpg"
  srcset="
    image-400.jpg 400w,
    image-800.jpg 800w,
    image-1200.jpg 1200w
  "
  sizes="
    (max-width: 640px) 100vw,
    (max-width: 1024px) 50vw,
    33vw
  "
  alt="説明文"
>
```

**動作**:
- モバイル（640px以下）: 400w 画像を使用
- タブレット（641px〜1024px）: 800w 画像を使用
- デスクトップ（1025px以上）: 1200w 画像を使用

---

### picture タグ（フォーマット分岐）

```html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="説明文">
</picture>
```

**動作**:
- AVIF 対応ブラウザ → AVIF を使用
- WEBP 対応ブラウザ → WEBP を使用
- 未対応ブラウザ → JPEG を使用

---

## 2. テキスト圧縮

### Minify（無意味な空白削除）

**削減効果**: 95.5KB → 72.8KB（約 24%）

```javascript
// Minify 前
function helloWorld() {
  console.log('Hello, World!');
}

// Minify 後
function helloWorld(){console.log('Hello, World!');}
```

**ツール**: ESBuild、Rollup、Parcel、Webpack（標準搭載）

---

### 圧縮形式（gzip → Brotli）

| 形式 | サイズ | 圧縮率 |
|------|--------|--------|
| 無圧縮 | 72.8KB | - |
| gzip | 16.0KB | 78% |
| **Brotli** | **12.5KB** | **83%** |

**Brotli の優位性**: gzip より 22% 小さい

---

### サーバー設定例（Brotli）

**Nginx:**

```nginx
http {
  brotli on;
  brotli_types text/css application/javascript application/json;
  brotli_comp_level 6;
}
```

**Cloudflare**: デフォルトで Brotli 有効

---

### ブラウザサポート

**Brotli**: Chrome 50+、Firefox 44+、Safari 11+

**フォールバック**:

```nginx
# Accept-Encoding: br, gzip のリクエスト
# → Brotli を返す

# Accept-Encoding: gzip のリクエスト
# → gzip を返す
```

---

## 3. フォント最適化

### ウェブセーフフォントの優先

**推奨**: システムフォントスタック

```css
font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

**利点**:
- ダウンロード不要
- 瞬時に表示
- OS ネイティブの見た目

---

### カスタムフォント使用時のサブセット化

**日本語フォント**: 通常 10MB 以上 → サブセット化で 1MB 以下

```bash
# pyftsubset（fonttools）での例
pyftsubset NotoSansJP-Regular.otf \
  --unicodes-file=subset.txt \
  --output-file=NotoSansJP-Subset.woff2 \
  --flavor=woff2
```

**subset.txt の例**:
```
U+0020-007E  # ASCII
U+3040-309F  # ひらがな
U+30A0-30FF  # カタカナ
U+4E00-9FFF  # 常用漢字
```

---

### Variable Fonts より Weight 種類削減を優先

**問題**: Variable Fonts はファイルサイズが大きい

**推奨アプローチ**:

```css
/* ❌ 全ウェイトを含む Variable Font */
@font-face {
  font-family: 'Inter Variable';
  src: url('Inter-Variable.woff2');
  font-weight: 100 900; /* 全ウェイト */
}

/* ✅ 使用するウェイトのみ */
@font-face {
  font-family: 'Inter';
  src: url('Inter-Regular.woff2');
  font-weight: 400;
}

@font-face {
  font-family: 'Inter';
  src: url('Inter-Bold.woff2');
  font-weight: 700;
}
```

---

## 4. JavaScript 削減

### 圧縮手法

**Minify**: 空白・改行削除

```javascript
// 圧縮前
function add(a, b) {
  return a + b;
}

// 圧縮後
function add(a,b){return a+b;}
```

**Mangling**: 変数名短縮

```javascript
// Mangling 前
function calculateTotal(price, quantity) {
  return price * quantity;
}

// Mangling 後
function a(b,c){return b*c;}
```

**削減効果**: 約 20%

**ツール**: [Terser](https://terser.org/)

---

### Tree Shaking（未使用コードの削除）

```javascript
// utils.js
export function used() { /* ... */ }
export function unused() { /* ... */ }

// main.js
import { used } from './utils';
used();
// unused はバンドルに含まれない
```

**対応ライブラリ選択**:
- ✅ Lodash-es（Tree Shaking 対応）
- ❌ Lodash（全体バンドル）

---

### 遅延ロード（Lazy Loading）

**問題**: SPA で全ページを一括ロード

**解決策**: ページごとに遅延ロード

```javascript
// React Router の例
const HomePage = lazy(() => import('./pages/Home'));
const AboutPage = lazy(() => import('./pages/About'));

<Routes>
  <Route path="/" element={<Suspense><HomePage /></Suspense>} />
  <Route path="/about" element={<Suspense><AboutPage /></Suspense>} />
</Routes>
```

---

### ライブラリサイズの確認

**ツール**: [bundlephobia](https://bundlephobia.com/)

**例**:
- moment.js: 289KB（gzip: 71KB）
- date-fns: 78KB（gzip: 13KB）

**推奨**: 軽量な代替ライブラリを選択

---

## 5. キャッシュ活用

### Cache-Control ディレクティブ

**静的リソース（CSS、JS、画像）:**

```
Cache-Control: public, max-age=31536000, immutable
```

- `max-age=31536000`: 1年間キャッシュ
- `immutable`: 再検証不要（確実に変更されない）

---

**動的リソース（HTML）:**

```
Cache-Control: private, max-age=0, must-revalidate
```

- `max-age=0`: 即座に再検証
- `must-revalidate`: 必ず再検証

---

### stale-while-revalidate（バックグラウンド更新）

```
Cache-Control: max-age=60, stale-while-revalidate=86400
```

**動作**:
1. 60秒以内: キャッシュを返す
2. 60秒〜86400秒: 古いキャッシュを返しつつ、バックグラウンドで更新
3. 86400秒以降: 再検証必須

**利点**: レスポンスを速く返しつつ、最新データを取得

---

### ETag / 304 Not Modified

**ETag**: コンテンツのハッシュ値

```
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

**動作**:
1. クライアント: `If-None-Match: "33a..."` でリクエスト
2. サーバー: コンテンツが同じなら `304 Not Modified` を返す
3. クライアント: キャッシュを使用

**削減効果**: データ転送量の大幅削減

---

### ファイル名固定時のキャッシュ戦略

**問題**: `main.css` のようなファイル名固定

**対策**:

```
Cache-Control: max-age=0, stale-while-revalidate=86400
```

**動作**:
- 初回アクセス: 古いキャッシュを返し、バックグラウンドで更新
- 次回アクセス: 更新されたキャッシュを使用

---

## ツール・ベストプラクティス まとめ

| 項目 | 推奨ツール/手法 |
|------|----------------|
| 画像処理 | sharp-cli、ImageMagick、Squoosh |
| 画像フォーマット | WEBP（推奨）、AVIF（次世代） |
| テキスト圧縮 | Brotli（gzip フォールバック） |
| JS 圧縮 | Terser（Minify + Mangling） |
| ライブラリ選定 | bundlephobia でサイズ確認 |
| バンドル分析 | Webpack Bundle Analyzer |
| キャッシュ戦略 | stale-while-revalidate |

---

## パフォーマンス測定

### ツール

- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [Chrome DevTools Performance タブ](https://developer.chrome.com/docs/devtools/performance/)

### Core Web Vitals

| 指標 | 目標 |
|------|------|
| LCP（最大コンテンツフル ペイント） | < 2.5秒 |
| FID（初回入力遅延） | < 100ms |
| CLS（累積レイアウトシフト） | < 0.1 |

---

## 注意点

### WEBP / AVIF 未対応ユーザー

**対応率（2025年時点）**:
- WEBP: 97%（ほぼ無視可能）
- AVIF: 85%（picture タグでフォールバック推奨）

---

### Brotli 未対応時の対応

サーバー側で `Accept-Encoding` ヘッダーを確認:

```javascript
// Node.js 例
if (req.headers['accept-encoding']?.includes('br')) {
  res.setHeader('Content-Encoding', 'br');
  res.send(brotliCompressedData);
} else if (req.headers['accept-encoding']?.includes('gzip')) {
  res.setHeader('Content-Encoding', 'gzip');
  res.send(gzipCompressedData);
}
```

---

### キャッシュ戦略の適用範囲

**アプリ固有のチューニング**:
- ユーザー認証状態によるキャッシュ制御
- パーソナライズされたコンテンツの扱い
- リアルタイム性が必要なデータの除外

---

## チェックリスト

実装前に確認:

- [ ] 画像を WEBP または AVIF に変換したか
- [ ] 画像を適切なサイズにリサイズしたか
- [ ] srcset / sizes 属性を設定したか
- [ ] テキストを Brotli 圧縮したか
- [ ] JavaScript を Minify + Mangling したか
- [ ] 遅延ロードを実装したか
- [ ] 静的リソースに `max-age=31536000` を設定したか
- [ ] 動的リソースに stale-while-revalidate を設定したか
- [ ] Lighthouse で測定したか

---

## 参考資料

- [sharp-cli](https://github.com/vseventer/sharp-cli)
- [Brotli 圧縮](https://github.com/google/brotli)
- [bundlephobia](https://bundlephobia.com/)
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [MDN: Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- [Web.dev: Optimize Images](https://web.dev/fast/#optimize-your-images)

---

## 関連ナレッジ

- [Core Web Vitals 最適化](./core-web-vitals.md)
- [画像最適化](./image-optimization.md)
- [キャッシュ戦略](./caching-strategies.md)
- [JavaScript バンドル最適化](../../javascript/bundling-optimization.md)
