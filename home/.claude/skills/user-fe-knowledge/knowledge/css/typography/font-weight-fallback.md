---
title: font-weightのフォールバック挙動
category: css/typography
tags: [font-weight, fallback, antialiasing, typography, cross-platform]
browser_support: 全ブラウザ対応
created: 2026-02-01
updated: 2026-02-01
---

# font-weightのフォールバック挙動

> 出典: https://ics.media/entry/230830/
> 執筆日: 2023-08-30
> 追加日: 2026-02-01

CSSの `font-weight` プロパティには、一見予想外のフォールバック挙動があります。デザインツールとブラウザでのレンダリング差異も理解する必要があります。

## 問題1: アンチエイリアスの差異

### デザインツールとブラウザの違い

**現象**:
```
「PhotoshopやFigmaで見た文字が、ブラウザでは太く見える」
```

**原因**:

| 環境 | アンチエイリアス方式 |
|------|-------------------|
| Photoshop | サブピクセルレンダリング（macOS/Windows） |
| Figma | グレースケールアンチエイリアス |
| macOS Safari | サブピクセル（Retina）/ グレースケール |
| Windows Chrome | DirectWrite（サブピクセル） |

「アンチエイリアスをかけることで、文字が滑らかになり、読みやすくなります」が、方式の違いで見た目が変わります。

### 解決策: CSSでアンチエイリアス制御

```css
body {
  /* Webkitブラウザ（Safari、Chrome） */
  -webkit-font-smoothing: antialiased;

  /* Firefox（macOS） */
  -moz-osx-font-smoothing: grayscale;
}
```

**効果**:
- サブピクセルレンダリングを無効化
- グレースケールアンチエイリアスに統一
- デザインツールとの見た目を近づける

**注意点**:
- 文字が若干細く見える場合がある
- Retinaディスプレイでは効果が大きい

## 問題2: font-weight: normalの挙動

### 予想外のフォールバック

**シナリオ**:

Webフォントで以下のウェイトを読み込んでいる場合:
- `font-weight: 100` (Thin)
- `font-weight: 600` (SemiBold)
- `font-weight: 900` (Black)

```css
p {
  font-family: 'CustomFont';
  font-weight: normal; /* 400に相当 */
}
```

**期待される動作**:
「400に近い600が使われる」

**実際の動作**:
「100（Thin）が使われる」

### なぜこうなるのか？

CSS仕様のフォールバックアルゴリズム:

1. **400（normal）が指定された場合**:
   - まず500を探す
   - 見つからなければ「400より小さい値」を降順で探す（400, 300, 200, 100）
   - それでも見つからなければ「400より大きい値」を昇順で探す

2. **結果**:
   - 400なし → 500なし → 300なし → 200なし → **100が選ばれる**

### 解決策1: 数値指定

```css
/* NG: normalは予想外の動作 */
p {
  font-weight: normal;
}

/* OK: 具体的な数値を指定 */
p {
  font-weight: 600;
}
```

### 解決策2: CSSカスタムプロパティで管理

```css
:root {
  --font-weight-regular: 600;
  --font-weight-bold: 900;
  --font-weight-light: 100;
}

p {
  font-weight: var(--font-weight-regular);
}

strong {
  font-weight: var(--font-weight-bold);
}
```

**メリット**:
- 一箇所で管理
- ウェイトの変更が容易
- デザインシステムとの統合

## 問題3: ブラウザごとのデフォルトスタイル差異

### strong要素の扱い

**Firefox**:
```css
strong {
  font-weight: bolder; /* 相対値 */
}
```

**Chrome/Safari**:
```css
strong {
  font-weight: bold; /* 絶対値（700） */
}
```

**影響**:

親要素が `font-weight: 900` の場合:

```html
<p style="font-weight: 900;">
  テキスト<strong>強調</strong>
</p>
```

- Firefox: `bolder` → 900より重いウェイトを探す（なければ900のまま）
- Chrome/Safari: `bold` → 700に固定（逆に細くなる）

### 解決策: Normalize/Reset CSS

```css
/* normalize.css */
strong,
b {
  font-weight: bold; /* 全ブラウザで統一 */
}
```

または、具体的な数値:

```css
strong,
b {
  font-weight: 700;
}
```

## フォールバックアルゴリズムの全体像

### ウェイト別の探索順序

| 指定値 | 探索順序 |
|-------|---------|
| 100-300 | 指定値 → より小さい値（降順） → より大きい値（昇順） |
| 400-500 | 指定値 → より小さい値（降順） → より大きい値（昇順） |
| 600-900 | 指定値 → より大きい値（昇順） → より小さい値（降順） |

**例**: `font-weight: 600` を指定、利用可能: 100, 400, 900

1. 600を探す → なし
2. より大きい値を昇順で探す → **900が選ばれる**

**例**: `font-weight: 400` を指定、利用可能: 100, 600, 900

1. 400を探す → なし
2. 500を探す → なし
3. より小さい値を降順で探す → **100が選ばれる**

## ベストプラクティス

### 1. 明示的な数値指定

```css
/* 避ける */
font-weight: normal;
font-weight: bold;

/* 推奨 */
font-weight: 400;
font-weight: 700;
```

### 2. Webフォント読み込み時の確認

```css
@font-face {
  font-family: 'CustomFont';
  src: url('font-regular.woff2') format('woff2');
  font-weight: 400; /* 明示的に指定 */
}

@font-face {
  font-family: 'CustomFont';
  src: url('font-bold.woff2') format('woff2');
  font-weight: 700;
}
```

### 3. Variable Fontsの活用

可変フォントなら、任意のウェイトを補間で生成できます。

```css
@font-face {
  font-family: 'InterVariable';
  src: url('Inter-Variable.woff2') format('woff2');
  font-weight: 100 900; /* 範囲指定 */
}

p {
  font-weight: 450; /* 任意の値が使える */
}
```

### 4. デバッグ方法

ブラウザDevToolsで実際に使用されているフォントを確認:

1. 要素を検査
2. Computed タブ
3. Rendered Fonts セクション

## クロスプラットフォーム対応

### macOSとWindowsの差異

```css
/* macOS向けに微調整 */
@media (min-resolution: 2dppx) {
  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

/* Windows向けに微調整 */
@media (-ms-high-contrast: none), (-ms-high-contrast: active) {
  body {
    /* font-weightを若干重くする */
    font-weight: 500;
  }
}
```

## まとめ

| 課題 | 解決策 |
|------|--------|
| アンチエイリアス差異 | `-webkit-font-smoothing: antialiased` |
| normalの予想外動作 | 数値で明示的に指定 |
| ブラウザデフォルト差異 | Normalize CSSで統一 |
| フォールバック制御 | CSSカスタムプロパティで管理 |

## 関連ナレッジ

- [Webフォント最適化](./webfont-optimization-google-fonts.md)
- [Variable Fonts](./variable-fonts.md)
- [タイポグラフィスケール](./typography-scaling.md)
- [クロスプラットフォーム対応](../../cross-cutting/browser-compat/workarounds.md)
