---
title: Lenisライブラリによる慣性スクロール実装
category: javascript/dom
tags: [lenis, smooth-scroll, inertia-scroll, gsap, animation]
browser_support: モダンブラウザ全般
created: 2026-01-19
updated: 2026-01-19
---

# Lenisライブラリによる慣性スクロール実装

> 出典: https://ics.media/entry/230804/ (前編)
> 出典: https://ics.media/entry/230817/ (後編)
> 執筆日: 2023年8月4日、2023年8月18日 (2024年3月5日メンテナンス済み)
> 追加日: 2026-01-19

## 概要

Lenisは、macOSのようなスムーズな慣性スクロール体験をWebで実現するJavaScriptライブラリです。スクロール停止後も余韻が残る滑らかなスクロール挙動を提供し、Three.jsやGSAPなどのアニメーションライブラリと連携できます。

## 基本導入

### インストール

```bash
npm i @studio-freight/lenis
```

### 最小構成コード

```javascript
const lenis = new Lenis();

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);
```

## 主な機能と使い方

### 1. アンカーリンク実装

`scrollTo()`メソッドでCSSセレクターや座標を指定して滑らかにスクロール位置を移動できます。

```javascript
// CSSセレクターで指定
lenis.scrollTo('#target-section');

// 座標で指定
lenis.scrollTo(500);
```

### 2. 慣性・イージングのカスタマイズ

```javascript
const lenis = new Lenis({
  lerp: 0.2,           // 慣性の強さ (0-1、小さいほど余韻が長い)
  duration: 1,         // アニメーション時間 (秒)
  easing: easeOutQuart // イージング関数
});
```

### 3. スクロール制御

モーダル表示時などにスクロールを停止/再開できます。

```javascript
// スクロール停止
lenis.stop();

// スクロール再開
lenis.start();
```

### 4. タッチイベント対応

スマートフォンでも慣性スクロール挙動を有効化できます。

```javascript
const lenis = new Lenis({
  smoothTouch: true  // タッチスクロールでも慣性を有効化
});
```

### 5. スクロール速度の取得

スクロール速度を取得して、アニメーションと連動させることができます。

```javascript
lenis.on('scroll', () => {
  const velocity = lenis.velocity; // スクロール速度
  // 速度に応じたアニメーション処理
});
```

## CSS対応

Lenisは以下のCSS機能と共存可能です。

- `position: sticky` - スティッキーヘッダー
- `position: fixed` - 固定要素

## GSAP連携

GSAPアニメーションライブラリとの連携がサポートされています。

```javascript
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis();

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
```

## 実装時の注意点

### 適切な使用場面

- スクロール連動アニメーションのあるサイト
- ブランディングサイトやポートフォリオサイト
- 視覚的な演出を重視するプロモーションサイト

### 避けるべき場面

- 大量のテキストを読ませるサイト (読みづらくなる可能性)
- 高速スクロールが頻繁に行われるサイト (視覚的混乱を招く)
- アクセシビリティを最優先する必要があるサイト

### パフォーマンス考慮

- 移動量が過度だと読みづらくなる
- 高速スクロール時に視覚的混乱を招く可能性がある
- モバイルデバイスでのパフォーマンスに注意

## ライセンス

- オープンソース (MITライセンス)
- 商用利用可能

## 関連リンク

- [Lenis GitHub Repository](https://github.com/studio-freight/lenis)
- 活用事例: Midsize Premium｜野村不動産、DeSoなど

## まとめ

Lenisは、Webサイトに滑らかな慣性スクロールを簡単に実装できるライブラリです。基本的な導入は非常にシンプルで、カスタマイズ性も高く、GSAPなどの他のアニメーションライブラリとの連携もスムーズです。視覚的な演出を重視するサイトで効果的に活用できます。
