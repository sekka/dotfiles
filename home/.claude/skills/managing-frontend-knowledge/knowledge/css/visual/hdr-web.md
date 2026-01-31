# HDR on the Web

## 概要

HDR（High Dynamic Range）ディスプレイに対応し、より鮮やかで広い輝度範囲を持つ画像・映像をWebで表現するための技術。CSS `dynamic-range-limit` プロパティにより、要素ごとに輝度範囲を制御できる。

---

## 基本実装（3ステップ）

### 1. HDR画像アセットの準備

- RAW形式で撮影した写真をAdobe Lightroom ClassicでHDR編集を有効化してエクスポート
- AVIFフォーマット推奨（全ブラウザでHDR対応）

### 2. 標準HTMLでの配置

通常の `<img>` タグで配置（特別な属性不要）：

```html
<img src="photo-hdr.avif" alt="HDR対応画像">
```

### 3. CSS `dynamic-range-limit` で輝度制御

要素ごとに輝度範囲を制御：

```css
/* サムネイル一覧: SDRに制限（省電力・一貫性） */
.thumb img {
  dynamic-range-limit: standard;
}

/* 詳細ビュー: HDRフル表示 */
.detail img {
  dynamic-range-limit: no-limit;
}
```

---

## `dynamic-range-limit` プロパティ

### 構文

```css
dynamic-range-limit: standard | constrained | no-limit;
```

### キーワード

| 値 | 説明 | ブラウザサポート |
|---|---|---|
| `standard` | SDR相当（輝度範囲を標準に制限） | 全対応ブラウザ |
| `no-limit` | HDRフル表示（制限なし） | 全対応ブラウザ |
| `constrained` | 中程度のHDR | Chrome のみ |

### 使用例

```css
/* デフォルトはSDR */
img {
  dynamic-range-limit: standard;
}

/* ヒーロー画像はHDRフル表示 */
.hero img {
  dynamic-range-limit: no-limit;
}

/* ギャラリーは中程度のHDR（Chrome） */
.gallery img {
  dynamic-range-limit: constrained;
}
```

---

## 画像フォーマット選択

### 推奨: AVIF

**理由:**
- 全ブラウザでHDR対応
- ゲインマップ（gain maps）によるSDR/HDR両対応
- ファイルサイズが小さい

### フォーマット比較

| フォーマット | HDR対応 | ブラウザ互換性 | 推奨度 |
|------------|---------|---------------|-------|
| **AVIF** | ✅ | 全ブラウザ | ⭐⭐⭐ |
| HEIF | ✅ | Safari のみ | ⭐ |
| JPEG XL | ✅ | Safari のみ | ⭐ |
| WebP | ❌ | 全ブラウザ | ❌（HDR非対応） |

### ゲインマップ（Gain Maps）

AVIF/HEIFは**ゲインマップ**を含むことができる：

- **SDRディスプレイ**: ベース画像を表示
- **HDRディスプレイ**: ゲインマップを適用してHDR表現

**メリット:**
- 単一ファイルでSDR/HDR両対応
- フォールバック不要

---

## ブラウザサポート

### CSS `dynamic-range-limit`

- **Chrome 136+**（2025年4月）
- **Edge 136+**（2025年5月）
- **Safari 26.0+**（2025年9月）

### 画像・映像のHDR対応

- CSS対応以前から、画像・映像のHDR表示自体は対応済み
- `dynamic-range-limit` は制御手段として新たに追加

---

## 実装上の注意点

### 1. ユーザー投稿コンテンツ

**現代のスマートフォンはデフォルトでHDR撮影**

- ユーザーがアップロードした画像がHDRである可能性
- SDR/HDR両方のディスプレイで検証必須

**画像最適化サーバーの影響:**
- CDNやサーバー側で画像を最適化する際、メタデータが削除される可能性
- HDR情報が失われる場合がある

### 2. Canvas/WebGPUとの連携

**Canvas HDRはWebGPU必須:**

```javascript
// WebGPU経由でCanvas HDR
const canvas = document.querySelector('canvas');
const context = canvas.getContext('webgpu');
// HDR rendering...
```

**WebGLでは非対応:**
- WebGL CanvasはHDR非対応
- WebGPUの優位性の1つ

### 3. パフォーマンス考慮

**省電力のためSDRに制限:**

```css
/* サムネイル一覧はSDRで省電力 */
.thumbnail-grid img {
  dynamic-range-limit: standard;
}

/* フルスクリーン表示時のみHDR */
.fullscreen img {
  dynamic-range-limit: no-limit;
}
```

---

## 実用例

### ギャラリーアプリケーション

```html
<!-- サムネイル一覧 -->
<div class="gallery">
  <img src="photo1.avif" alt="写真1" class="thumb">
  <img src="photo2.avif" alt="写真2" class="thumb">
</div>

<!-- 詳細ビュー -->
<div class="detail">
  <img src="photo1.avif" alt="写真1 拡大">
</div>
```

```css
/* サムネイル: SDR（省電力・高速） */
.gallery .thumb {
  dynamic-range-limit: standard;
  width: 200px;
  height: 200px;
  object-fit: cover;
}

/* 詳細ビュー: HDRフル表示 */
.detail img {
  dynamic-range-limit: no-limit;
  max-width: 100%;
  height: auto;
}
```

### レスポンシブ対応

```css
/* モバイル: 省電力のためSDR */
@media (max-width: 768px) {
  img {
    dynamic-range-limit: standard;
  }
}

/* デスクトップ: HDR許可 */
@media (min-width: 769px) {
  .hero img {
    dynamic-range-limit: no-limit;
  }
}
```

---

## ベストプラクティス

### 1. デフォルトはSDR、必要な箇所だけHDR

```css
/* 全体デフォルト */
img {
  dynamic-range-limit: standard;
}

/* 重要な画像のみHDR */
.featured img,
.hero img {
  dynamic-range-limit: no-limit;
}
```

### 2. ユーザー設定を尊重

```css
/* ユーザーが低電力モードを設定している場合 */
@media (prefers-reduced-motion: reduce) {
  img {
    dynamic-range-limit: standard;
  }
}
```

### 3. フォーマット選択

```html
<!-- AVIF優先、フォールバックあり -->
<picture>
  <source srcset="photo.avif" type="image/avif">
  <source srcset="photo.webp" type="image/webp">
  <img src="photo.jpg" alt="写真">
</picture>
```

---

## トラブルシューティング

### HDRが表示されない

**原因1: ディスプレイが非対応**
- HDR対応ディスプレイで確認

**原因2: ブラウザバージョンが古い**
- Chrome 136+、Safari 26.0+ を使用

**原因3: 画像フォーマットが非対応**
- AVIFを使用（WebPはHDR非対応）

### 色が不自然

**原因: SDRディスプレイでHDR画像を表示**
- ゲインマップ付きAVIFを使用（自動フォールバック）

---

## 参考資料

- **出典**: [HDR on the Web（ICS MEDIA）](https://ics.media/entry/251024/)
- **仕様**: [CSS Color HDR Module](https://drafts.csswg.org/css-color-hdr/)
- **AVIF**: [AV1 Image File Format](https://aomediacodec.github.io/av1-avif/)
- **WebGPU**: [WebGPU Specification](https://gpuweb.github.io/gpuweb/)

---

## まとめ

- **CSS `dynamic-range-limit`** で要素ごとにHDR/SDRを制御
- **AVIFフォーマット推奨**（全ブラウザでHDR対応）
- **デフォルトはSDR、重要な箇所だけHDR**（省電力・パフォーマンス）
- **ユーザー投稿コンテンツに注意**（自動HDR撮影）
- **WebGPU必須**（Canvas HDR）
