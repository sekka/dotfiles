---
title: CSS clip-path と shape() 関数による切り抜き表現
category: css/visual
tags: [clip-path, shape, clipping, visual-effects, responsive]
browser_support: Chrome 135+, Edge 135+, Safari 18.4+
created: 2025-02-01
updated: 2025-02-01
---

# CSS clip-path と shape() 関数による切り抜き表現

## レスポンシブ対応の新しいクリッピング手法

> 出典: https://ics.media/entry/250703/
> 執筆日: 2025-07-03
> 追加日: 2025-02-01

CSS `clip-path` プロパティで要素を任意の形状に切り抜くことができる。Chrome 135、Edge 135、Safari 18.4から導入された `shape()` 関数により、SVG `path()` より読みやすく、レスポンシブ対応が容易になった。

### shape() 関数の3つの利点

1. **読みやすい構文**: SVG文字列ではなく、明示的なコマンド名
2. **複数のCSS単位対応**: `px`, `%`, `em`, `rem` が使用可能
3. **CSS関数と変数対応**: `calc()`, `max()`, `abs()`, カスタムプロパティが使える

### 7つの基本コマンド

| コマンド | 用途 | 例 |
|---------|------|---|
| `from` | 開始点を設定 | `from 0% 0%` |
| `move` | 描画せずに移動 | `move to 50% 0%` |
| `line` | 直線を描画 | `line to 100% 100%` |
| `hline` | 水平線 | `hline to 100%` |
| `vline` | 垂直線 | `vline to 100%` |
| `curve` | ベジェ曲線 | `curve to 100% 0% via 50% -20%` |
| `smooth` | スムーズな曲線 | `smooth to 100% 100%` |
| `arc` | 円弧 | `arc to 100% 0% of 50%` |
| `close` | 図形を閉じる | `close` |

### 基本的な実装例

#### 1. 台形クリッピング

```css
.trapezoid {
  clip-path: shape(
    from 10% 0%,
    line to 90% 0%,
    line to 100% 100%,
    line to 0% 100%,
    close
  );
}
```

#### 2. 波形クリッピング（smooth曲線）

```css
.wave {
  clip-path: shape(
    from 0% 0%,
    hline to 100%,
    vline to 80%,
    smooth to 75% 100%,
    smooth to 50% 80%,
    smooth to 25% 100%,
    smooth to 0% 80%,
    close
  );
}
```

### 円弧（arc）の使い方

```css
.arc-decoration {
  clip-path: shape(
    from 0% 100%,
    hline to 40%,
    arc to 60% 100% of 10%, /* 半径10%の円弧 */
    hline to 100%,
    vline to 100%,
    close
  );
}
```

**arc構文**: `arc to [終点] of [半径] [方向]`
- 方向: `cw`（時計回り）、`ccw`（反時計回り）、`large`（大きい方の弧）、`small`（小さい方の弧）

### レスポンシブ対応

`%` 単位を使用することで、画面サイズに応じて自動調整：

```css
.responsive-clip {
  clip-path: shape(
    from 0% 0%,
    line to 100% 0%,
    curve to 100% 100% via 80% 50%, /* %なので比率を維持 */
    line to 0% 100%,
    close
  );
}
```

### アニメーション対応

`@property` でカスタムプロパティを定義し、動的変化を実現：

```css
@property --wave-height {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 80%;
}

.animated-wave {
  clip-path: shape(
    from 0% 0%,
    hline to 100%,
    vline to var(--wave-height),
    smooth to 0% var(--wave-height),
    close
  );
  transition: --wave-height 0.3s ease;
}

.animated-wave:hover {
  --wave-height: 60%;
}
```

### JavaScriptとの連携（マウス追従スポットライト）

```javascript
const spotlight = document.querySelector('.spotlight');

document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth) * 100;
  const y = (e.clientY / window.innerHeight) * 100;

  spotlight.style.clipPath = `shape(
    from ${x}% ${y}%,
    arc to ${x}% ${y}% of 20%,
    close
  )`;
});
```

### path() との比較

| 特徴 | shape() | path() |
|------|---------|--------|
| 構文 | コマンド名（`line`, `arc`） | SVG文字列（`M`, `L`, `A`） |
| 可読性 | 高い | 低い |
| CSS単位 | `px`, `%`, `em`, `rem` | SVG座標のみ |
| CSS関数 | `calc()`, `var()` 対応 | 未対応 |
| レスポンシブ | 容易 | 困難 |

### ユースケース

- **タイトル装飾**: 台形や波形の背景
- **ヒーロー画像**: 対角線や曲線でダイナミックに切り抜き
- **ボタンデザイン**: 角丸以外の独自形状
- **スポットライト効果**: マウス追従の円形マスク
- **セクション区切り**: 波形や斜めの境界線

### 注意点

- **ブラウザサポート**: Chrome 135+, Edge 135+, Safari 18.4+（2025年7月時点でFirefox未対応）
- **パフォーマンス**: 複雑な図形や大量のアニメーションは注意
- **アクセシビリティ**: 切り抜きでテキストが読みにくくならないよう配慮

### 参考資料

- [CSS Shapes - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shapes)
- [clip-path - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path)

---
