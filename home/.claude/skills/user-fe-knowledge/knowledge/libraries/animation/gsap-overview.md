---
title: GSAP (GreenSock Animation Platform) アニメーションライブラリ
category: libraries/animation
tags: [animation, gsap, greensock, performance, javascript]
created: 2026-02-01
updated: 2026-02-01
---

# GSAP (GreenSock Animation Platform) アニメーションライブラリ

> 出典:
> - https://github.com/greensock/GSAP
> - https://gsap.com
> 追加日: 2026-02-01

## 基本情報

- **公式サイト**: https://gsap.com
- **GitHub**: https://github.com/greensock/GSAP
- **Stars**: ⭐ 23,700+ (2024年1月時点)
- **ライセンス**: GreenSock標準ライセンス（商用利用含め無料）
- **最新バージョン**: v3.x系
- **導入サイト数**: 1,200万以上

## 概要

GSAPは「開発者をアニメーションのスーパーヒーローに変える」をコンセプトにした、フレームワーク非依存のJavaScriptアニメーションライブラリです。

**キャッチフレーズ:**
> "JavaScript can touch anything you can animate"
> （JavaScriptが触れるあらゆるものをアニメーション化できる）

**特徴:**
- 滑らかなパフォーマンス（jQuery比で20倍高速）
- フレームワーク非依存（React、Vue、WebGLなど対応）
- 豊富なプラグインエコシステム
- ブラウザ間の不整合に対応
- 充実したドキュメントとコミュニティサポート

## 主要機能

### 1. コアアニメーション

基本的なアニメーション機能を提供。

```javascript
// 基本的な to アニメーション
gsap.to(".box", {
  x: 100,
  duration: 1,
  ease: "power2.out"
});

// from アニメーション（開始状態を指定）
gsap.from(".box", {
  opacity: 0,
  y: 50,
  duration: 1
});

// fromTo アニメーション（開始と終了を両方指定）
gsap.fromTo(".box",
  { opacity: 0, scale: 0.5 },
  { opacity: 1, scale: 1, duration: 1 }
);
```

### 2. タイムライン

複数のアニメーションを順序制御。

```javascript
// タイムラインの作成
const tl = gsap.timeline({
  defaults: { duration: 1, ease: "power2.out" }
});

// アニメーションを連結
tl.to(".box1", { x: 100 })
  .to(".box2", { x: 100 }, "-=0.5") // 0.5秒前倒しで開始
  .to(".box3", { x: 100 }, "<"); // 前のアニメーションと同時
```

### 3. ScrollTrigger プラグイン

スクロールベースのアニメーション。

```javascript
gsap.registerPlugin(ScrollTrigger);

gsap.to(".parallax", {
  scrollTrigger: {
    trigger: ".parallax",
    start: "top center",
    end: "bottom center",
    scrub: true, // スクロールに追従
    markers: true // デバッグマーカー表示
  },
  y: 100,
  opacity: 0.5
});
```

### 4. 対応オブジェクト

GSAPは以下の対象をアニメーション化できます:

- **DOM要素**: CSS プロパティ
- **SVG**: path、circle、polygon など
- **Canvas**: カスタムオブジェクト
- **WebGL**: Three.js オブジェクト
- **その他**: 任意のJavaScriptオブジェクトのプロパティ

```javascript
// カスタムオブジェクトのアニメーション
const myObject = { value: 0 };

gsap.to(myObject, {
  value: 100,
  duration: 2,
  onUpdate: () => {
    console.log(myObject.value);
  }
});
```

## 主要プラグイン

### スクロール系

- **ScrollTrigger**: スクロール連動アニメーション
- **ScrollSmoother**: スムーズスクロール
- **ScrollTo**: スクロール位置への移動

### SVG系

- **DrawSVG**: SVGパスの描画アニメーション
- **MorphSVG**: SVGシェイプのモーフィング
- **MotionPath**: パスに沿った移動

### UI系

- **Flip**: レイアウト変更の滑らかな遷移
- **Draggable**: ドラッグ&ドロップ
- **Observer**: スクロール、タッチ、ホイールイベント検知
- **Inertia**: 慣性スクロール

### テキスト系

- **SplitText**: テキストを文字・単語・行に分割
- **ScrambleText**: テキストのスクランブル効果
- **TextPlugin**: テキストの書き換えアニメーション

### その他

- **Physics2D**: 2D物理シミュレーション
- **PhysicsProps**: 物理ベースのアニメーション
- **GSDevTools**: アニメーションのデバッグツール

## インストール

### CDN経由

```html
<!-- Core -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14/dist/gsap.min.js"></script>

<!-- ScrollTrigger プラグイン -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14/dist/ScrollTrigger.min.js"></script>
```

### npm経由

```bash
npm install gsap
```

```javascript
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
```

## 実践例

### 例1: ヒーローセクションのアニメーション

```html
<div class="hero">
  <h1 class="hero-title">Welcome</h1>
  <p class="hero-text">Discover amazing content</p>
  <button class="hero-button">Get Started</button>
</div>
```

```javascript
// タイムラインで順次アニメーション
const heroTimeline = gsap.timeline({
  defaults: {
    duration: 1,
    ease: "power3.out"
  }
});

heroTimeline
  .from(".hero-title", {
    y: 50,
    opacity: 0
  })
  .from(".hero-text", {
    y: 30,
    opacity: 0
  }, "-=0.5")
  .from(".hero-button", {
    scale: 0,
    opacity: 0
  }, "-=0.3");
```

### 例2: スクロールパララックス

```html
<section class="parallax-section">
  <div class="parallax-bg"></div>
  <div class="parallax-content">
    <h2>Scroll down</h2>
  </div>
</section>
```

```javascript
gsap.registerPlugin(ScrollTrigger);

// 背景のパララックス
gsap.to(".parallax-bg", {
  scrollTrigger: {
    trigger: ".parallax-section",
    start: "top top",
    end: "bottom top",
    scrub: 1
  },
  y: 300,
  ease: "none"
});

// コンテンツのフェードイン
gsap.from(".parallax-content", {
  scrollTrigger: {
    trigger: ".parallax-content",
    start: "top 80%",
    end: "top 50%",
    scrub: 1
  },
  opacity: 0,
  y: 100
});
```

### 例3: カードの遅延表示

```html
<div class="card-grid">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
  <div class="card">Card 4</div>
</div>
```

```javascript
// 順次表示（stagger効果）
gsap.from(".card", {
  scrollTrigger: {
    trigger: ".card-grid",
    start: "top 80%"
  },
  opacity: 0,
  y: 50,
  duration: 0.8,
  stagger: 0.2, // 0.2秒ずつ遅延
  ease: "back.out(1.7)"
});
```

### 例4: SVGパス描画

```html
<svg width="200" height="200">
  <path
    class="svg-line"
    d="M10 10 L190 190"
    stroke="black"
    stroke-width="2"
    fill="none"
  />
</svg>
```

```javascript
gsap.registerPlugin(DrawSVGPlugin);

// パスを0%から100%まで描画
gsap.from(".svg-line", {
  drawSVG: "0%",
  duration: 2,
  ease: "power1.inOut"
});
```

## 採用判断の目安

### ✅ 推奨する場面

**1. 複雑なアニメーションシーケンス**
- タイムラインで複数のアニメーションを制御
- イージングやディレイの細かい調整が必要

**2. パフォーマンスが重要**
- 滑らかな60fpsアニメーション
- 大量の要素を同時にアニメーション

**3. スクロール連動アニメーション**
- パララックス効果
- スクロールトリガー
- プログレスバー

**4. SVGアニメーション**
- SVGパスの描画
- シェイプのモーフィング
- アイコンアニメーション

**5. WebGLとの統合**
- Three.jsのカメラやオブジェクト
- CanvasベースのWebGL

**6. プロダクションレベルの品質**
- 商用サイト、企業サイト
- クライアントワーク
- ブランドサイト

### ❌ 避けるべき場面

**1. シンプルなCSSアニメーションで十分**
- ホバーエフェクト
- シンプルなトランジション
- `transition` や `@keyframes` で実現可能

```css
/* これで十分ならGSAPは不要 */
.button {
  transition: transform 0.3s ease;
}

.button:hover {
  transform: scale(1.1);
}
```

**2. ファイルサイズを最小化したい**
- GSAP Core: 約50KB（minified + gzipped）
- プラグインを追加するとさらに増加
- 小規模なプロジェクトには過剰

**3. アニメーションがほとんどない**
- 静的なコンテンツ中心
- アニメーションが数個のみ

**4. ブラウザ標準APIで十分**
- Web Animations API が使える環境
- シンプルなアニメーションのみ

```javascript
// Web Animations API で十分な場合
element.animate([
  { opacity: 0 },
  { opacity: 1 }
], {
  duration: 1000,
  easing: 'ease-out'
});
```

**5. 学習コストを避けたい**
- チームがGSAPに不慣れ
- 短期プロジェクト
- プロトタイプ段階

## パフォーマンス上の利点

### 1. ハードウェアアクセラレーション

GSAPは自動的に `transform` と `opacity` を使用し、GPUアクセラレーションを活用します。

```javascript
// これは内部的に transform: translateX() を使用（高速）
gsap.to(".box", { x: 100 });

// これは left プロパティを使用（遅い）
gsap.to(".box", { left: "100px" });
```

### 2. requestAnimationFrame

GSAPは内部的に `requestAnimationFrame` を使用し、ブラウザの描画サイクルに同期します。

### 3. バッチ処理

複数の要素を同時にアニメーションする際、GSAPは効率的にバッチ処理します。

```javascript
// 1000個の要素を効率的にアニメーション
gsap.to(".item", {
  x: 100,
  duration: 1,
  stagger: 0.01
});
```

## フレームワーク統合

### React

```javascript
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

function AnimatedComponent() {
  const boxRef = useRef(null);

  useEffect(() => {
    gsap.to(boxRef.current, {
      x: 100,
      duration: 1
    });
  }, []);

  return <div ref={boxRef} className="box">Animate me</div>;
}
```

### Vue

```vue
<template>
  <div ref="box" class="box">Animate me</div>
</template>

<script>
import { gsap } from 'gsap';

export default {
  mounted() {
    gsap.to(this.$refs.box, {
      x: 100,
      duration: 1
    });
  }
};
</script>
```

## ベストプラクティス

### 1. プラグインの登録

```javascript
// プラグインは使用前に登録
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
```

### 2. タイムラインの活用

```javascript
// ✅ 良い例: タイムラインで管理
const tl = gsap.timeline();
tl.to(".box1", { x: 100 })
  .to(".box2", { x: 100 });

// ❌ 悪い例: 個別に管理
gsap.to(".box1", { x: 100 });
gsap.to(".box2", { x: 100, delay: 1 });
```

### 3. killメソッドでクリーンアップ

```javascript
// Reactの useEffect でクリーンアップ
useEffect(() => {
  const animation = gsap.to(".box", { x: 100 });

  return () => {
    animation.kill(); // アンマウント時に停止
  };
}, []);
```

### 4. willChange の使用

```css
/* アニメーション対象要素に追加 */
.animated-element {
  will-change: transform, opacity;
}
```

## トラブルシューティング

### 問題1: アニメーションが動かない

```javascript
// 原因: 要素が見つからない
gsap.to(".box", { x: 100 }); // .box が存在しない

// 解決策: DOMContentLoaded 後に実行
window.addEventListener("DOMContentLoaded", () => {
  gsap.to(".box", { x: 100 });
});
```

### 問題2: ScrollTriggerが動かない

```javascript
// 原因: プラグイン未登録
gsap.to(".box", {
  scrollTrigger: ".box", // 動かない
  x: 100
});

// 解決策: プラグイン登録
gsap.registerPlugin(ScrollTrigger);
gsap.to(".box", {
  scrollTrigger: ".box", // 動く
  x: 100
});
```

## まとめ

GSAPは、以下の場合に最適なアニメーションライブラリです:

**採用すべき:**
- 複雑なアニメーションシーケンス
- スクロール連動アニメーション
- SVG/WebGLアニメーション
- パフォーマンスが重要
- 商用プロジェクト

**代替を検討すべき:**
- シンプルなCSSアニメーションで十分
- ファイルサイズを最小化したい
- アニメーションがほとんどない

**強み:**
- 滑らかなパフォーマンス
- 豊富なプラグイン
- 優れたドキュメント
- フレームワーク非依存

**弱み:**
- ファイルサイズ（約50KB）
- 学習コスト
- シンプルなケースには過剰

## ブラウザサポート

- **Chrome**: すべてのバージョン
- **Firefox**: すべてのバージョン
- **Safari**: すべてのバージョン
- **Edge**: すべてのバージョン
- **IE**: 11+ (v3系は非対応、v2系を使用)

**モバイル:**
- iOS Safari: すべてのバージョン
- Android Chrome: すべてのバージョン

## 関連リソース

### 公式リソース

- [GSAP公式サイト](https://gsap.com)
- [公式ドキュメント](https://gsap.com/docs/)
- [公式フォーラム](https://gsap.com/community/)
- [CodePenサンプル](https://codepen.io/GreenSock/)

### チュートリアル

- [GSAP 3 Getting Started](https://gsap.com/docs/v3/GSAP/gsap.to()/)
- [ScrollTrigger Docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)

### 類似ライブラリ

- **Anime.js**: よりシンプルで軽量（約9KB）
- **Framer Motion**: React専用、宣言的API
- **Motion One**: Web Animations API ベース、超軽量（約5KB）

## 出典

- [GSAP - GitHub](https://github.com/greensock/GSAP)
- [GSAP - 公式サイト](https://gsap.com)
