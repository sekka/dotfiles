---
title: background-imageを使ったアニメーション
category: css/animation
tags: [background-image, background-position, background-clip, gradient, sprite, animation, transition]
browser_support: All modern browsers (vendor prefix needed for background-clip: text)
created: 2026-01-19
updated: 2026-01-19
---

# background-imageを使ったアニメーション

> 出典: https://ics.media/entry/220602/
> 執筆日: 2022年6月2日
> 執筆者: 西原 翼
> 追加日: 2026-01-19

## 概要

`background-image`プロパティ自体は直接アニメーションできませんが、`background-position`や`background-size`などの関連プロパティと組み合わせることで、魅力的な視覚効果を実現できます。

## 基本原理

`background-image`の変化を直接アニメーションすることはできませんが、以下のプロパティでアニメーション効果を作成できます。

- `background-position` - 背景画像の位置
- `background-size` - 背景画像のサイズ
- `background-clip` - 背景の適用範囲
- グラデーション - 色のアニメーション

## 実装例

### 1. トグルボタン

`background-position`と`transition`で、インジケーターをスライドさせます。

```html
<label class="toggle">
  <input type="checkbox" class="toggle-input">
  <span class="toggle-slider"></span>
</label>

<style>
  .toggle {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
  }

  .toggle-input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    border-radius: 34px;
    cursor: pointer;
    transition: background-color 0.3s;

    /* 円形のインジケーター画像 */
    background-image: radial-gradient(circle, white 40%, transparent 40%);
    background-size: 26px 26px;
    background-position: 4px center;
    background-repeat: no-repeat;
    transition: background-position 0.3s ease;
  }

  .toggle-input:checked + .toggle-slider {
    background-color: #2196F3;
    background-position: calc(100% - 4px) center;
  }
</style>
```

### 2. 色が変わるテキスト

`background-clip: text`とグラデーションアニメーションを組み合わせます。

```html
<h1 class="gradient-text">カラフルなテキスト</h1>

<style>
  .gradient-text {
    font-size: 4rem;
    font-weight: bold;
    background-image: linear-gradient(
      90deg,
      #ff6b6b,
      #4ecdc4,
      #45b7d1,
      #f7b731,
      #ff6b6b
    );
    background-size: 200% 100%;
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    animation: gradient-shift 3s linear infinite;
  }

  @keyframes gradient-shift {
    0% {
      background-position: 0% center;
    }
    100% {
      background-position: 200% center;
    }
  }
</style>
```

**注意:** `-webkit-background-clip: text`のベンダープレフィックスが必要です（Chrome、Safari）。

### 3. スクロールインジケーター

グラデーションを下方向にアニメーションさせます。

```html
<div class="scroll-indicator">
  <p>スクロールしてください</p>
</div>

<style>
  .scroll-indicator {
    position: relative;
    width: 40px;
    height: 60px;
    border: 2px solid #333;
    border-radius: 20px;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    overflow: hidden;
  }

  .scroll-indicator::before {
    content: '';
    width: 6px;
    height: 60px;
    background-image: linear-gradient(
      to bottom,
      transparent 0%,
      transparent 40%,
      #333 40%,
      #333 60%,
      transparent 60%,
      transparent 100%
    );
    animation: scroll-down 2s ease-in-out infinite;
  }

  @keyframes scroll-down {
    0% {
      transform: translateY(-100%);
    }
    100% {
      transform: translateY(100%);
    }
  }
</style>
```

### 4. ローディングバー

グラデーションを横方向に移動させるローディングアニメーションです。

```html
<div class="loading-bar"></div>

<style>
  .loading-bar {
    width: 100%;
    height: 4px;
    background-color: #e0e0e0;
    border-radius: 2px;
    overflow: hidden;
    position: relative;
  }

  .loading-bar::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: linear-gradient(
      90deg,
      transparent 0%,
      #2196F3 50%,
      transparent 100%
    );
    background-size: 50% 100%;
    animation: loading 1.5s ease-in-out infinite;
  }

  @keyframes loading {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(200%);
    }
  }
</style>
```

### 5. スプライトアニメーション

`steps()`関数を使用したフレームベースのアニメーションです。

```html
<div class="sprite-animation"></div>

<style>
  .sprite-animation {
    width: 100px;
    height: 100px;

    /* 10フレームのスプライトシートを想定 */
    background-image: url('sprite-sheet.png');
    background-size: 1000px 100px; /* 10フレーム × 100px */
    background-repeat: no-repeat;
    animation: sprite-play 1s steps(10) infinite;
  }

  @keyframes sprite-play {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: -1000px 0; /* 10フレーム分移動 */
    }
  }
</style>
```

**steps()関数の説明:**
- `steps(10)` - 10段階の離散的なアニメーション
- 滑らかな遷移ではなく、コマ送りのようなアニメーションを実現

### 6. パターンアニメーション

繰り返し背景パターンを連続的にループさせます。

```html
<div class="pattern-animation"></div>

<style>
  .pattern-animation {
    width: 100%;
    height: 200px;
    background-image: repeating-linear-gradient(
      45deg,
      #3498db,
      #3498db 20px,
      #2980b9 20px,
      #2980b9 40px
    );
    background-size: 200% 200%;
    animation: pattern-move 4s linear infinite;
  }

  @keyframes pattern-move {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 40px 40px;
    }
  }
</style>
```

### 7. 画像ホバーエフェクト

背景サイズを変化させるズームエフェクトです。

```html
<div class="image-hover">
  <p>ホバーしてください</p>
</div>

<style>
  .image-hover {
    width: 300px;
    height: 200px;
    background-image: url('image.jpg');
    background-size: 100%;
    background-position: center;
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: background-size 0.3s ease;
    cursor: pointer;
  }

  .image-hover:hover {
    background-size: 110%;
  }

  .image-hover p {
    color: white;
    background: rgba(0, 0, 0, 0.5);
    padding: 10px 20px;
    border-radius: 4px;
  }
</style>
```

## 複数背景のアニメーション

複数の背景レイヤーを独立してアニメーションできます。

```css
.multi-layer {
  background-image:
    linear-gradient(90deg, rgba(255,255,255,0.3) 50%, transparent 50%),
    linear-gradient(180deg, #3498db, #2ecc71);
  background-size: 20px 100%, 100% 100%;
  background-position: 0 0, 0 0;
  animation: layer-animation 2s linear infinite;
}

@keyframes layer-animation {
  0% {
    background-position: 0 0, 0 0;
  }
  100% {
    background-position: 20px 0, 0 0;
  }
}
```

## ベンダープレフィックスの注意

`background-clip: text`は、ChromeとSafariでベンダープレフィックスが必要です。

```css
.text-gradient {
  background-clip: text;
  -webkit-background-clip: text; /* 必須 */
  color: transparent;
}
```

プレフィックスなしでは、テキストの色が正しく透明にならない可能性があります。

## パフォーマンス最適化

### will-change プロパティ

アニメーションのパフォーマンスを向上させます。

```css
.animated-background {
  will-change: background-position;
  animation: bg-scroll 5s linear infinite;
}
```

### transform との併用

`background-position`の代わりに`transform`を使用すると、GPUアクセラレーションが有効になります。

```css
/* 良い例 */
.optimized {
  background-image: url('pattern.png');
  animation: optimized-move 2s linear infinite;
}

@keyframes optimized-move {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(40px);
  }
}
```

## ユースケース

1. **UI コンポーネント** - トグルスイッチ、プログレスバー
2. **テキストエフェクト** - グラデーションテキスト、アニメーション見出し
3. **ローディングインジケーター** - スピナー、プログレスバー
4. **スプライトアニメーション** - キャラクター、アイコン
5. **背景エフェクト** - 動的パターン、視差効果
6. **ホバーエフェクト** - 画像ズーム、カラーシフト

## 制限事項

- `background-image`プロパティ自体（画像URLやグラデーション定義）は直接アニメーションできない
- 複雑なアニメーションではパフォーマンスに注意が必要
- `background-clip: text`はベンダープレフィックスが必要
- 古いブラウザでは一部のグラデーション機能が制限される

## 参考リンク

- [background-position - MDN](https://developer.mozilla.org/ja/docs/Web/CSS/background-position)
- [background-clip - MDN](https://developer.mozilla.org/ja/docs/Web/CSS/background-clip)
- [CSS Animations - MDN](https://developer.mozilla.org/ja/docs/Web/CSS/CSS_Animations)
- [Using CSS gradients - MDN](https://developer.mozilla.org/ja/docs/Web/CSS/CSS_Images/Using_CSS_gradients)
