---
title: p5.jsでヒーローエリア演出
category: javascript/animation
tags: [p5js, canvas, creative-coding, hero-area, animation]
browser_support: モダンブラウザ（WebGL対応、iOS 8+）
created: 2026-02-01
updated: 2026-02-01
---

# p5.jsでヒーローエリア演出

## p5.jsを使ったヒーローエリアのビジュアル演出

> 出典: https://ics.media/entry/250909/
> 執筆日: 2025-09-09
> 追加日: 2026-02-01

p5.jsは、クリエイティブコーディング用のJavaScriptライブラリ。Canvas APIを抽象化し、視覚効果を簡単に実装できる。Webサイトのヒーローエリア（トップビジュアル）に動的なアニメーションを追加する実装パターンを紹介。

### コード例

**Instance Modeの基本構造:**

```javascript
import p5 from 'p5';

const sketch = (p) => {
  let canvas;

  p.setup = () => {
    canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.parent('hero-container'); // HTML要素にアタッチ
  };

  p.draw = () => {
    p.background(220);
    // アニメーション描画
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};

new p5(sketch);
```

**三角関数を使った波アニメーション:**

```javascript
p.draw = () => {
  p.background(220);
  p.stroke(0);
  p.noFill();

  p.beginShape();
  for (let x = 0; x <= p.width; x += 10) {
    const y = p.height / 2 + p.sin((x + p.frameCount) * 0.01) * 100;
    p.vertex(x, y);
  }
  p.endShape();
};
```

**マウス追従アニメーション:**

```javascript
let particles = [];

p.setup = () => {
  canvas = p.createCanvas(p.windowWidth, p.windowHeight);
  canvas.parent('hero-container');

  for (let i = 0; i < 100; i++) {
    particles.push({
      x: p.random(p.width),
      y: p.random(p.height),
      vx: p.random(-1, 1),
      vy: p.random(-1, 1)
    });
  }
};

p.draw = () => {
  p.background(220, 50); // 透明度で軌跡効果

  particles.forEach(particle => {
    // マウスとの距離で影響
    const d = p.dist(p.mouseX, p.mouseY, particle.x, particle.y);
    if (d < 100) {
      particle.vx += (particle.x - p.mouseX) * 0.0001;
      particle.vy += (particle.y - p.mouseY) * 0.0001;
    }

    particle.x += particle.vx;
    particle.y += particle.vy;

    // 画面端で反転
    if (particle.x < 0 || particle.x > p.width) particle.vx *= -1;
    if (particle.y < 0 || particle.y > p.height) particle.vy *= -1;

    p.circle(particle.x, particle.y, 5);
  });
};
```

**スプライン曲線（curveVertex）:**

```javascript
p.draw = () => {
  p.background(255);
  p.stroke(0);
  p.noFill();

  p.beginShape();
  p.curveVertex(100, 100); // 制御点（描画されない）
  p.curveVertex(100, 100);
  p.curveVertex(200, 50);
  p.curveVertex(300, 150);
  p.curveVertex(400, 100);
  p.curveVertex(400, 100); // 制御点（描画されない）
  p.endShape();
};
```

**近接効果（距離計算）:**

```javascript
p.draw = () => {
  p.background(255);

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const d = p.dist(
        particles[i].x, particles[i].y,
        particles[j].x, particles[j].y
      );

      if (d < 100) {
        p.stroke(0, p.map(d, 0, 100, 255, 0)); // 距離で透明度変化
        p.line(
          particles[i].x, particles[i].y,
          particles[j].x, particles[j].y
        );
      }
    }
  }
};
```

### 重要な実装パターン

**Instance Modeの使用（推奨）:**

```javascript
// NG: Global Mode（名前空間汚染）
function setup() {
  createCanvas(400, 400);
}

// OK: Instance Mode（安全）
const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(400, 400);
  };
};
new p5(sketch);
```

**理由**: Viteなどのバンドラーや他のJSライブラリとの衝突を防ぐ。

**Canvas配置の制御:**

```html
<div id="hero-container" style="position: relative; width: 100%; height: 100vh;"></div>
```

```javascript
p.setup = () => {
  canvas = p.createCanvas(p.windowWidth, p.windowHeight);
  canvas.parent('hero-container'); // HTMLラッパー要素にアタッチ
};
```

**理由**: CSSだけでは配置が不安定。HTMLラッパーを使用して確実に制御。

**レスポンシブ対応:**

```javascript
p.windowResized = () => {
  p.resizeCanvas(p.windowWidth, p.windowHeight);
};
```

**理由**: ブラウザリサイズ時にcanvasを再調整しないと視覚的に壊れる。

**変数の範囲制約:**

```javascript
particle.vx = p.constrain(particle.vx, -5, 5);
particle.vy = p.constrain(particle.vy, -5, 5);
```

**理由**: 速度が無限に増加するのを防ぐ。

### ユースケース

- **ヒーローエリア**: Webサイトのトップビジュアル
- **インタラクティブ背景**: マウス追従効果
- **データビジュアライゼーション**: 動的なグラフ表示
- **ジェネラティブアート**: アルゴリズミックなビジュアル生成
- **アニメーション背景**: 周期的な動きでブランド表現

### 注意点

**パフォーマンス:**

- パーティクル数は1000以下に抑える
- `draw()` 関数内で重い計算を避ける
- 必要に応じて `frameRate()` で制限

```javascript
p.setup = () => {
  p.createCanvas(400, 400);
  p.frameRate(30); // 60fpsから30fpsに制限
};
```

**アクセシビリティ:**

- アニメーションは装飾的要素として扱う
- `prefers-reduced-motion` メディアクエリに対応

```javascript
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  // アニメーションを無効化またはシンプルに
  p.noLoop();
}
```

**TypeScript対応:**

```typescript
import p5 from 'p5';

const sketch = (p: p5) => {
  let canvas: p5.Renderer;

  p.setup = () => {
    canvas = p.createCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = () => {
    p.background(220);
  };
};

new p5(sketch);
```

**ブラウザサポート:**

- モダンブラウザ（Chrome, Firefox, Safari, Edge）
- WebGL対応ブラウザ（3Dグラフィックス使用時）
- iOS 8+（モバイル対応）

**代替ライブラリ:**

- **Three.js**: 3Dグラフィックス（より高度）
- **Away3D**: WebGLフレームワーク
- **Canvas API**: ネイティブAPI（低レベル）

### 実践例

**波形背景:**

```javascript
const sketch = (p) => {
  p.setup = () => {
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.parent('hero');
  };

  p.draw = () => {
    p.background(220);
    p.stroke(100, 150, 255);
    p.strokeWeight(3);
    p.noFill();

    for (let i = 0; i < 5; i++) {
      p.beginShape();
      for (let x = 0; x <= p.width; x += 10) {
        const y = p.height / 2 +
          p.sin((x + p.frameCount * 2 + i * 50) * 0.01) * (50 + i * 20);
        p.vertex(x, y);
      }
      p.endShape();
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};

new p5(sketch);
```

**パーティクルネットワーク:**

```javascript
const sketch = (p) => {
  let particles = [];

  p.setup = () => {
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.parent('hero');

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: p.random(p.width),
        y: p.random(p.height),
        vx: p.random(-1, 1),
        vy: p.random(-1, 1)
      });
    }
  };

  p.draw = () => {
    p.background(255, 255, 255, 50);

    // パーティクル間の接続線
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const d = p.dist(
          particles[i].x, particles[i].y,
          particles[j].x, particles[j].y
        );

        if (d < 100) {
          p.stroke(0, p.map(d, 0, 100, 100, 0));
          p.line(
            particles[i].x, particles[i].y,
            particles[j].x, particles[j].y
          );
        }
      }
    }

    // パーティクル移動
    particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > p.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > p.height) particle.vy *= -1;

      p.fill(0);
      p.noStroke();
      p.circle(particle.x, particle.y, 8);
    });
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};

new p5(sketch);
```

### 関連技術

- **Canvas API**: 低レベルな描画API
- **requestAnimationFrame**: ネイティブアニメーションAPI
- **Three.js**: 3Dグラフィックスライブラリ
- **WebGL**: GPU加速グラフィックス
- **Perlin Noise**: 自然なランダム性の生成

### 参考リンク

- [ICS MEDIA - p5.jsヒーローエリア演出](https://ics.media/entry/250909/)
- [p5.js公式サイト](https://p5js.org/)
- [p5.js Reference](https://p5js.org/reference/)

---
