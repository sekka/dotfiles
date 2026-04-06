---
title: conic-gradient()でボーダーを装飾
category: css/visual
tags: [conic-gradient, border-image, gradient, visual-effects, animation]
browser_support: All modern browsers (IE not supported)
created: 2026-01-31
updated: 2026-01-31
---

# conic-gradient()でボーダーを装飾

> 出典: https://coliss.com/articles/build-websites/operation/css/css-conic-gradient-border.html
> 執筆日: 2022年6月8日
> 追加日: 2026-01-31

## 概要

`conic-gradient()`関数は、円の中心点から回転しながら色を変化させる扇形グラデーション（円錐曲線グラデーション）を作成します。`border-image-source`プロパティと組み合わせることで、要素のボーダーにグラデーション効果を適用できます。

## 基本実装

### シンプルな conic-gradient ボーダー

```css
.gradient-border {
  border: 10px solid transparent;
  border-image-source: conic-gradient(
    from 0deg,
    hsl(100 100% 60%),
    hsl(200 100% 60%),
    hsl(100 100% 60%)
  );
  border-image-slice: 1;
}
```

**プロパティの説明:**
- `from 0deg` - グラデーションの開始角度（省略可能、デフォルトは0deg）
- `hsl()` - 色相環に沿った色指定（回転グラデーションに最適）
- `border-image-slice: 1` - ボーダー画像の分割方法（1 = 全体を使用）

### 動的な角度変更（ホバーエフェクト）

CSS変数とJavaScriptを組み合わせて、ホバー時に角度を変更します。

```html
<div class="dynamic-border">ホバーしてください</div>

<style>
  .dynamic-border {
    --startDeg: 0deg;

    width: 200px;
    height: 100px;
    border: 8px solid transparent;
    border-image-source: conic-gradient(
      from var(--startDeg),
      hsl(100 100% 60%),
      hsl(200 100% 60%),
      hsl(100 100% 60%)
    );
    border-image-slice: 1;
    transition: --startDeg 0.5s ease;
  }
</style>

<script>
  const element = document.querySelector('.dynamic-border');
  let angle = 0;

  element.addEventListener('mouseenter', () => {
    angle = (angle + 45) % 360;
    element.style.setProperty('--startDeg', `${angle}deg`);
  });
</script>
```

**動作の仕組み:**
1. CSS変数 `--startDeg` で開始角度を管理
2. ホバー時にJavaScriptで角度を45度ずつ回転
3. `transition`でスムーズなアニメーション

### 連続回転アニメーション

```css
.rotating-border {
  --rotation: 0deg;

  border: 10px solid transparent;
  border-image-source: conic-gradient(
    from var(--rotation),
    #ff6b6b,
    #4ecdc4,
    #45b7d1,
    #f7b731,
    #ff6b6b
  );
  border-image-slice: 1;
  animation: rotate-gradient 3s linear infinite;
}

@keyframes rotate-gradient {
  0% {
    --rotation: 0deg;
  }
  100% {
    --rotation: 360deg;
  }
}
```

**注意:** CSS変数のアニメーションは`@property`による登録が必要です（後述）。

## 高度なテクニック

### 複数色の円形グラデーション

```css
.rainbow-border {
  border: 12px solid transparent;
  border-image-source: conic-gradient(
    from 0deg,
    hsl(0 100% 50%),    /* 赤 */
    hsl(60 100% 50%),   /* 黄 */
    hsl(120 100% 50%),  /* 緑 */
    hsl(180 100% 50%),  /* シアン */
    hsl(240 100% 50%),  /* 青 */
    hsl(300 100% 50%),  /* マゼンタ */
    hsl(360 100% 50%)   /* 赤（ループ） */
  );
  border-image-slice: 1;
}
```

### ハードストップ（明確な境界）

```css
.hard-stop-border {
  border: 8px solid transparent;
  border-image-source: conic-gradient(
    from 0deg,
    #ff6b6b 0deg 90deg,
    #4ecdc4 90deg 180deg,
    #45b7d1 180deg 270deg,
    #f7b731 270deg 360deg
  );
  border-image-slice: 1;
}
```

**角度指定の形式:**
- `色 開始角度 終了角度` - その範囲でベタ塗り
- 滑らかなグラデーションではなく、セクション分けされた表現

### @property によるアニメーション対応（推奨）

CSS変数を登録してアニメーション可能にします。

```css
@property --angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

.animated-border {
  border: 10px solid transparent;
  border-image-source: conic-gradient(
    from var(--angle),
    hsl(100 100% 60%),
    hsl(200 100% 60%),
    hsl(100 100% 60%)
  );
  border-image-slice: 1;
  animation: spin 3s linear infinite;
}

@keyframes spin {
  0% {
    --angle: 0deg;
  }
  100% {
    --angle: 360deg;
  }
}
```

**@property の利点:**
- CSS変数に型情報を付与
- アニメーション・トランジションが正常に動作
- 初期値の明確化

## ユースケース

1. **カード UI** - プレミアムコンテンツやプロフィールカードの装飾
2. **ホバーエフェクト** - インタラクティブな視覚フィードバック
3. **ローディング表示** - 回転するボーダーでロード状態を表現
4. **強調表示** - 重要な要素の境界線を目立たせる
5. **デザインアクセント** - モダンなビジュアルデザインの一部として

## ブラウザサポート

| 機能 | サポート状況 |
|------|------------|
| `conic-gradient()` | Chrome 69+, Firefox 83+, Safari 12.1+, Edge 79+ |
| `border-image-source` | すべてのモダンブラウザ |
| `@property` | Chrome 85+, Edge 85+, Safari 16.4+ (Firefox未対応) |

**重要:** Internet Explorer は非サポート

## パフォーマンス最適化

### will-change プロパティ

アニメーションのパフォーマンスを向上させます。

```css
.optimized-border {
  will-change: border-image-source;
  /* または */
  will-change: auto; /* アニメーション終了後 */
}
```

### transform との併用を避ける

`border-image`は再描画が必要なため、`transform`と同時に使うとパフォーマンスが低下します。

```css
/* 避けるべき */
.heavy-animation {
  animation: border-rotate 2s, element-rotate 2s;
}

/* 推奨 */
.light-animation {
  animation: border-rotate 2s;
}
```

## 注意点

- `border-image-slice: 1` を設定しないとグラデーションが正しく表示されない
- `border-radius` と併用する場合、`border-image` は角丸に対応しないため、代替手段（疑似要素など）が必要
- アニメーションが滑らかでない場合は`@property`による変数登録を検討
- 複雑なグラデーションはレンダリング負荷が高くなる可能性がある

## 代替手段: 疑似要素 + border-radius 対応

`border-image`は`border-radius`と併用できないため、角丸が必要な場合は疑似要素を使用します。

```css
.rounded-gradient-border {
  position: relative;
  padding: 20px;
  border-radius: 12px;
  background: white;
  z-index: 1;
}

.rounded-gradient-border::before {
  content: '';
  position: absolute;
  inset: -4px; /* ボーダーの太さ */
  border-radius: 12px;
  background: conic-gradient(
    from 0deg,
    hsl(100 100% 60%),
    hsl(200 100% 60%),
    hsl(100 100% 60%)
  );
  z-index: -1;
}
```

## 関連ナレッジ

- `linear-gradient()`, `radial-gradient()` - 他のグラデーション関数
- `background-clip: text` - グラデーションをテキストに適用
- `@property` - CSS変数の型定義とアニメーション対応

## 参考リンク

- [conic-gradient() - MDN](https://developer.mozilla.org/ja/docs/Web/CSS/gradient/conic-gradient)
- [border-image - MDN](https://developer.mozilla.org/ja/docs/Web/CSS/border-image)
- [Use conic gradients to create a cool border - Web.dev](https://web.dev/conic-gradient-border/)
- [@property - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@property)
