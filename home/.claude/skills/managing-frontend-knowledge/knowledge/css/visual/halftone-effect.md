---
title: CSS ハーフトーン効果
category: css/visual
tags: [CSS, visual-effects, radial-gradient, blend-mode, filter]
browser_support: モダンブラウザ対応
created: 2026-01-31
updated: 2026-01-31
---

# CSS ハーフトーン効果

> 出典: https://www.webcreatorbox.com/tech/css-halftone
> 執筆日: 2024-10-26
> 追加日: 2026-01-31

`radial-gradient`、`mix-blend-mode`、`filter`を組み合わせて、画像にハーフトーン（網点）効果を適用する。

---

## 基本実装（4ステップ）

### Step 1: HTML構造

画像を`halftone`クラスのdiv要素でラップ。

```html
<div class="halftone">
  <img src="image.jpg" alt="ハーフトーン効果を適用する画像" />
</div>
```

### Step 2: 疑似要素で水玉パターン作成

`::after`疑似要素を使用し、`radial-gradient`で円形パターンを生成。

```css
.halftone {
  position: relative;
  display: inline-block;
}

.halftone::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(#000 10%, transparent 90%);
  background-size: 10px 10px;
  pointer-events: none; /* クリックイベントを画像に透過 */
}
```

**パラメータ調整**:
- `#000 10%`: 円の色と半径（10%まで黒、90%まで透明にグラデーション）
- `background-size: 10px 10px`: 水玉の密度（小さいほど密度が高い）

### Step 3: ブレンドモードの適用

`mix-blend-mode`で水玉パターンと画像を合成。

```css
.halftone::after {
  /* 既存のスタイル */
  mix-blend-mode: screen; /* または multiply */
}
```

**ブレンドモード**:
- `screen`: 明るい部分が強調される（明るいハーフトーン）
- `multiply`: 暗い部分が強調される（暗いハーフトーン）

### Step 4: コントラスト調整

`filter: contrast()`でコントラストを強化し、円のサイズが色の濃淡に応じて変化するように。

```css
.halftone img {
  display: block;
  width: 100%;
  filter: contrast(3); /* 値を調整して強度を変更 */
}
```

---

## 完全なコード例

```html
<div class="halftone">
  <img src="portrait.jpg" alt="ポートレート" />
</div>
```

```css
.halftone {
  position: relative;
  display: inline-block;
}

.halftone img {
  display: block;
  width: 100%;
  height: auto;
  filter: contrast(3);
}

.halftone::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(#000 10%, transparent 90%);
  background-size: 10px 10px;
  mix-blend-mode: screen;
  pointer-events: none;
}
```

---

## バリエーション: グレースケール版

白い円を黒背景に配置し、`mix-blend-mode: multiply`を適用。

```css
.halftone-grayscale img {
  filter: grayscale(100%) contrast(2.5);
}

.halftone-grayscale::after {
  background-image: radial-gradient(#fff 15%, transparent 85%);
  background-color: #000; /* 黒背景を追加 */
  background-size: 12px 12px;
  mix-blend-mode: multiply;
}
```

---

## カスタマイズ例

### 水玉サイズの調整

```css
/* 細かいハーフトーン */
.halftone::after {
  background-size: 5px 5px;
}

/* 粗いハーフトーン */
.halftone::after {
  background-size: 20px 20px;
}
```

### 色の変更

```css
/* 青いハーフトーン */
.halftone::after {
  background-image: radial-gradient(#0066cc 10%, transparent 90%);
}

/* カラフルなハーフトーン（複数色） */
.halftone::after {
  background-image:
    radial-gradient(circle at 0% 0%, #ff0000 10%, transparent 90%),
    radial-gradient(circle at 50% 50%, #00ff00 10%, transparent 90%),
    radial-gradient(circle at 100% 100%, #0000ff 10%, transparent 90%);
  background-size: 15px 15px;
}
```

### コントラストの強度調整

```css
/* 弱いハーフトーン効果 */
.halftone img {
  filter: contrast(1.5);
}

/* 強いハーフトーン効果 */
.halftone img {
  filter: contrast(5);
}
```

---

## ユースケース

- **レトロなポスター風デザイン**: 1960年代のポップアート風
- **アート作品**: モダンアート、グラフィックデザイン
- **ブランディング**: ユニークな視覚効果
- **印刷物風のWeb表現**: 新聞、雑誌風のレイアウト

---

## 注意点

### パフォーマンス

- `radial-gradient`と`mix-blend-mode`の組み合わせは比較的重い処理
- 多数の画像に適用する場合はパフォーマンスに注意
- モバイルデバイスでは特に配慮が必要

### アクセシビリティ

- ハーフトーン効果により画像の認識性が低下する可能性
- 重要なコンテンツ画像には適用を避けるか、代替テキストを充実させる
- `aria-label`や詳細な`alt`属性で補完

```html
<div class="halftone" aria-label="ハーフトーン効果を適用したポートレート画像">
  <img src="portrait.jpg" alt="笑顔の女性のポートレート、ハーフトーン効果で表現" />
</div>
```

### ブラウザサポート

- `radial-gradient`: 全モダンブラウザ対応
- `mix-blend-mode`: Chrome 41+, Firefox 32+, Safari 8+
- `filter`: 全モダンブラウザ対応

**注意**: IE11では`mix-blend-mode`が非サポート（効果が適用されない）

---

## 応用: アニメーション

ハーフトーン効果にアニメーションを追加。

```css
@keyframes halftone-pulse {
  0%, 100% {
    background-size: 10px 10px;
  }
  50% {
    background-size: 15px 15px;
  }
}

.halftone::after {
  animation: halftone-pulse 3s ease-in-out infinite;
}
```

---

## 参考リンク

- [MDN: radial-gradient()](https://developer.mozilla.org/ja/docs/Web/CSS/gradient/radial-gradient)
- [MDN: mix-blend-mode](https://developer.mozilla.org/ja/docs/Web/CSS/mix-blend-mode)
- [MDN: filter](https://developer.mozilla.org/ja/docs/Web/CSS/filter)
