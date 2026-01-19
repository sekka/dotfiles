---
title: GSAP - 高機能JavaScriptアニメーションライブラリ
category: javascript/animation
tags: [gsap, animation, tween, timeline, scroll-trigger, motion-path]
browser_support: モダンブラウザ全般
created: 2026-01-19
updated: 2026-01-19
---

# GSAP - 高機能JavaScriptアニメーションライブラリ

> 出典: https://ics.media/entry/220822/ (前編)
> 出典: https://ics.media/entry/220825/ (後編)
> 執筆日: 2022年8月22日、2022年8月25日 (2025年8月27日、2025年4月14日メンテナンス済み)
> 追加日: 2026-01-19

## 概要

GSAP (GreenSock Animation Platform) は、18年以上の歴史を持つ高機能なJavaScriptアニメーションライブラリです。始点と終点を補間するトゥイーン機能を提供し、CSS Transitionsより制御の自由度が大きく、連続したモーション管理やWebGL/Canvas実装、こだわりの演出制作に適しています。

## インストール

### CDN経由

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
```

### NPM

```bash
npm install gsap
```

## 基本的な使い方

### 最小限の実装

```javascript
// 要素を右に200px移動させる (2秒間)
gsap.to(".rect", { x: 200, duration: 2 });
```

### 主要な設定値

```javascript
gsap.to(".element", {
  x: 200,              // 水平移動
  y: 100,              // 垂直移動
  rotate: 45,          // 回転
  scale: 1.5,          // スケール
  opacity: 0.5,        // 透明度
  duration: 2,         // アニメーション時間 (秒)
  ease: "power4.out",  // イージング関数
  delay: 0.5,          // 遅延秒数
  repeat: 2,           // リピート回数 (-1で無限)
  yoyo: true,          // 往復アニメーション
  onComplete: () => {} // 完了時のコールバック
});
```

### transform操作

直感的なプロパティ名で要素を操作できます。

```javascript
gsap.to(".box", {
  x: 200,        // translateX
  y: 100,        // translateY
  rotation: 45,  // rotate
  scaleX: 2,     // scaleX
  scaleY: 1.5    // scaleY
});
```

## イージング

著者推奨の`power4.out`を使用すると統一感のあるアニメーションになります。

```javascript
gsap.to(".element", {
  x: 200,
  ease: "power4.out" // 推奨イージング
});
```

その他の主なイージング:
- `power1` ~ `power4`: 速度の段階
- `back`: バックスイング
- `elastic`: 弾性
- `bounce`: バウンス

## stagger機能

複数要素にズレを持たせた演出を簡単に実現できます。

```javascript
gsap.to(".item", {
  y: -50,
  stagger: 0.1, // 各要素を0.1秒ずつずらす
  duration: 1
});

// より詳細な制御
gsap.to(".item", {
  y: -50,
  stagger: {
    amount: 1,      // 全体のずれ時間
    from: "center", // 開始位置 (start/center/end)
    ease: "power2.inOut"
  }
});
```

## タイムライン機能

複雑なモーション制御にはタイムラインを使用します。

### 基本的なタイムライン

```javascript
const tl = gsap.timeline();

tl.to(".box1", { x: 200, duration: 1 })
  .to(".box2", { y: 100, duration: 1 })
  .to(".box3", { rotation: 360, duration: 1 });
```

### 時間指定メソッド

```javascript
const tl = gsap.timeline();

// 前のトゥイーン終了後、0.5秒待つ
tl.to(".box1", { x: 200 }, "+=0.5");

// 前のトゥイーンと0.3秒重ねる
tl.to(".box2", { y: 100 }, "-=0.3");

// 絶対時間で指定 (2秒時点)
tl.to(".box3", { rotation: 360 }, 2);
```

### タイムラインのネスト

```javascript
const mainTimeline = gsap.timeline();
const subTimeline = gsap.timeline();

subTimeline
  .to(".inner1", { x: 100 })
  .to(".inner2", { x: 100 });

mainTimeline
  .to(".outer", { y: 200 })
  .add(subTimeline); // サブタイムラインを追加
```

### タイムライン制御

```javascript
const tl = gsap.timeline({ paused: true });

// 再生制御
tl.play();
tl.pause();
tl.reverse();
tl.restart();

// 進捗管理
tl.progress(0.5); // 50%の位置にジャンプ
console.log(tl.duration()); // 全体の長さを取得
```

## プラグイン機能

### ScrollTriggerプラグイン

スクロール連動アニメーションを実装できます。

```javascript
gsap.registerPlugin(ScrollTrigger);

gsap.to(".box", {
  x: 500,
  scrollTrigger: {
    trigger: ".box",
    start: "top center",    // アニメーション開始位置
    end: "bottom center",   // アニメーション終了位置
    scrub: true,            // スクロールと同期
    markers: true,          // デバッグマーカー表示
    pin: true               // 要素を固定
  }
});
```

### MotionPathPlugin

SVGパスに沿った移動や、ベジェ曲線を使った動きを実現できます。

```javascript
gsap.registerPlugin(MotionPathPlugin);

gsap.to(".circle", {
  motionPath: {
    path: "#path",        // SVGパスのセレクター
    align: "#path",       // パスに沿って回転
    autoRotate: true,     // 進行方向に自動回転
    alignOrigin: [0.5, 0.5]
  },
  duration: 5
});
```

## ユーティリティー関数

GSAPは便利な数値計算関数を提供しています。

```javascript
// 値をクランプ (範囲制限)
const value = gsap.utils.clamp(0, 100, 150); // 100

// 値を補間
const interpolated = gsap.utils.interpolate(0, 100, 0.5); // 50

// 範囲を変換
const mapped = gsap.utils.mapRange(0, 100, 0, 1, 50); // 0.5

// 配列に変換
const array = gsap.utils.toArray(".item"); // NodeList → Array

// 色を分解
const color = gsap.utils.splitColor("#ff0000"); // {r: 255, g: 0, b: 0}
```

## quickSetter

頻繁に更新が必要な処理 (マウスストーカーなど) に最適な軽量メソッドです。

```javascript
const setX = gsap.quickSetter(".cursor", "x", "px");
const setY = gsap.quickSetter(".cursor", "y", "px");

document.addEventListener("mousemove", (e) => {
  setX(e.clientX);
  setY(e.clientY);
});
```

## overwrite制御

競合するトゥイーンの処理を制御できます。

```javascript
gsap.to(".box", {
  x: 200,
  overwrite: "auto" // デフォルト。競合するプロパティのみ上書き
});

// 他のオプション
// overwrite: true    // 全てのトゥイーンを上書き
// overwrite: false   // 上書きしない
```

## React での使用

`useRef()`と`selector()`を組み合わせて使用します。

```javascript
import { useRef, useEffect } from 'react';
import gsap from 'gsap';

function Component() {
  const containerRef = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".box", { x: 200 });
    }, containerRef); // スコープを限定

    return () => ctx.revert(); // クリーンアップ
  }, []);

  return (
    <div ref={containerRef}>
      <div className="box">Box</div>
    </div>
  );
}
```

## Canvas・WebGLとの連携

Canvas や WebGL ライブラリとも柔軟に連携できます。

```javascript
import * as THREE from 'three';

const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

gsap.to(material.color, {
  r: 0,
  g: 1,
  b: 0,
  duration: 2
});
```

## ライセンス

2025年4月30日より、GSAPは100%無料で商用利用可能になりました。

## 歴史

GSAPはFlash時代のTweenMaxが源流で、15年以上の歴史を持つ信頼性の高いライブラリです。

## まとめ

GSAPは、CSS Transitionsでは難しい複雑なアニメーション制御を実現できる強力なライブラリです。タイムライン機能、ScrollTrigger、MotionPathなどの豊富な機能により、Webサイトに高度なアニメーション演出を加えることができます。React、Canvas、WebGLなど、様々な環境で活用可能です。

## 関連リンク

- [GSAP公式サイト](https://greensock.com/gsap/)
- [ScrollTriggerデモ](https://greensock.com/docs/v3/Plugins/ScrollTrigger)
- [MotionPathプラグイン](https://greensock.com/docs/v3/Plugins/MotionPathPlugin)
