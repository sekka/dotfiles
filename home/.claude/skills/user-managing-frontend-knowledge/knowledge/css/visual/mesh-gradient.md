---
title: メッシュグラデーション生成
category: css/visual
tags: [gradient, radial-gradient, visual-effects, generative]
browser_support: 全モダンブラウザ対応（radial-gradient使用）
created: 2026-01-31
updated: 2026-01-31
---

# メッシュグラデーション生成

複数のCSS `radial-gradient()` を重ねることで、複雑で幻想的な色彩パターンを生成する技術。

---

## メッシュグラデーション生成ツール

> 出典: https://webdesign.tutsplus.com/how-to-create-a-mesh-gradient-generator-with-html-css-and-javascript--cms-109183t
> 執筆日: 2025-06-17
> 追加日: 2026-01-31

複数の色が滑らかにキャンバス全体で融合し、幻想的で色彩豊かなパターンを生成するメッシュグラデーション技術。Stripeのホームページなどで使用されている視覚効果。

### 実装の仕組み

メッシュグラデーションは、複数の `radial-gradient()` をランダムな位置に配置し、重ね合わせることで実現される。

### コード例

```javascript
/**
 * メッシュグラデーション生成
 */
function generateMeshGradient() {
  // グラデーション数（5〜8個）
  const gradientCount = Math.floor(Math.random() * 4) + 5;
  const gradients = [];

  for (let i = 0; i < gradientCount; i++) {
    // ランダムな色（RGB値: 0〜255）
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const color = `rgb(${r}, ${g}, ${b})`;

    // ランダムな位置（0〜100%）
    const x = Math.floor(Math.random() * 101);
    const y = Math.floor(Math.random() * 101);

    // radial-gradient の生成
    gradients.push(
      `radial-gradient(circle at ${x}% ${y}%, ${color} 0%, transparent 50%)`
    );
  }

  // 複数のグラデーションを重ねる
  return gradients.join(', ');
}

// 適用
const element = document.querySelector('.hero');
element.style.background = generateMeshGradient();
```

### 制御可能なパラメータ

```javascript
/**
 * カスタマイズ可能なメッシュグラデーション
 */
function createMeshGradient(options = {}) {
  const {
    count = 6,           // グラデーション数
    minSize = 30,        // 最小サイズ（%）
    maxSize = 70,        // 最大サイズ（%）
    colors = null,       // 固定カラーパレット（null = ランダム）
    opacity = 0.8        // 透明度
  } = options;

  const gradients = [];

  for (let i = 0; i < count; i++) {
    let color;
    if (colors && colors.length > 0) {
      // パレットからランダム選択
      color = colors[Math.floor(Math.random() * colors.length)];
    } else {
      // ランダム生成
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      color = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    const x = Math.floor(Math.random() * 101);
    const y = Math.floor(Math.random() * 101);
    const size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;

    gradients.push(
      `radial-gradient(circle at ${x}% ${y}%, ${color} 0%, transparent ${size}%)`
    );
  }

  return gradients.join(', ');
}

// 使用例: ブランドカラーを使用
const brandMesh = createMeshGradient({
  count: 8,
  colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
  opacity: 0.6
});

document.querySelector('.hero').style.background = brandMesh;
```

### アニメーション対応

```css
.hero {
  background: /* 初期グラデーション */;
  background-size: 200% 200%;
  animation: meshMove 20s ease infinite;
}

@keyframes meshMove {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
```

```javascript
// JavaScript でのアニメーション（定期的に再生成）
let animationId;

function animateMeshGradient(element, interval = 5000) {
  function update() {
    const newGradient = generateMeshGradient();
    element.style.background = newGradient;
    element.style.transition = 'background 2s ease';
  }

  update();
  animationId = setInterval(update, interval);
}

// 開始
const hero = document.querySelector('.hero');
animateMeshGradient(hero, 5000);

// 停止
// clearInterval(animationId);
```

### ユースケース

- **ヒーローセクション背景**: ウェブサイトのメインビジュアル（Stripeの例）
- **スプラッシュスクリーン**: アプリケーションの起動画面
- **カード背景**: 製品カードやプロフィールカードのアクセント
- **セクション区切り**: コンテンツセクション間のビジュアル区切り
- **デザインツール**: ランダム背景生成ツール

### 注意点

- **パフォーマンス**: 過度に多いグラデーション（10個以上）は描画負荷が高い
- **アクセシビリティ**: テキストとのコントラスト比を確保（WCAG 2.1 AA: 4.5:1以上）
- **ブランドカラー**: ランダム生成ではなく、ブランドカラーパレットを使用推奨
- **モーション配慮**: `prefers-reduced-motion` でアニメーションを無効化

```css
@media (prefers-reduced-motion: reduce) {
  .hero {
    animation: none;
  }
}
```

### ブラウザサポート

`radial-gradient()` は全モダンブラウザで対応:
- Chrome 26+
- Firefox 16+
- Safari 6.1+
- Edge 12+

### 関連ナレッジ

- [filter](./filter.md) - グラデーションにフィルター効果を追加
- [mix-blend-mode](./mix-blend-mode.md) - グラデーションの合成モード
- [backdrop-filter](./backdrop-filter.md) - グラデーション上のぼかし効果

---
