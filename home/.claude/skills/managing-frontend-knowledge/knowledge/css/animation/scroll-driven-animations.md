---
title: Scroll-Driven Animations
category: css/animation
tags: [scroll, animation, animation-timeline, view, scroll-driven, header, 2023]
browser_support: Chrome 115+, Edge 115+, Safari 26.0+
created: 2025-01-16
updated: 2026-01-19
---

# Scroll-Driven Animations

> 出典:
> - https://ics.media/entry/230718/ (2023年7月)
> - https://coliss.com/articles/build-websites/operation/css/css-hide-header-when-scrolling-down.html
> 追加日: 2025-12-17
> 更新日: 2026-01-19

**CSSのみを使用してスクロール連動アニメーションを実装する技術**。JavaScriptなしで、ページスクロール進捗に同期したアニメーション表現が可能です。

## 主な技術プロパティ

- `animation-timeline` - アニメーションのタイムライン制御
- `animation-range` - アニメーション実行範囲の指定
- `scroll()` 関数 - ページスクロールに同期
- `view()` 関数 - 要素の画面内位置に同期

## 基本的な使い方

### ページスクロール連動（スクラブアニメーション）

```css
@keyframes grow-progress {
  from { scale: 1 0; }
  to { scale: 1 1; }
}

.progress-bar {
  animation: grow-progress linear;
  animation-timeline: scroll();
}
```

**ポイント**:
- `animation-timeline: scroll()` でページのスクロール進捗と同期
- イージングは通常`linear`を推奨（スクロール進捗との直線的連動のため）

### 画面内入場時のアニメーション（ビュータイムライン）

```css
@keyframes reveal-image {
  from { clip-path: inset(30% round 20%); }
  to { clip-path: inset(0); }
}

.image {
  animation: reveal-image linear both;
  animation-timeline: view();
  animation-range: contain 0% contain 50%;
}
```

**ポイント**:
- `animation-timeline: view()` で要素が画面内に入る際にアニメーション
- `animation-range` で実行範囲を指定（`contain 0%`〜`contain 50%`）
- `animation-fill-mode: both` で開始・終了状態を保持

## scroll() 関数

```css
.element {
  animation-timeline: scroll();
  /* または特定のスクローラーを指定 */
  animation-timeline: scroll(nearest); /* 最も近い親スクロール */
  animation-timeline: scroll(root); /* ルートスクロール */
  animation-timeline: scroll(self); /* 自身のスクロール */
}
```

## view() 関数

```css
.element {
  animation-timeline: view();
  /* 軸を指定 */
  animation-timeline: view(block); /* 縦方向（デフォルト） */
  animation-timeline: view(inline); /* 横方向 */
}
```

## animation-range プロパティ

アニメーションの実行範囲を制御します。

```css
.element {
  /* 要素が画面に入ってから50%進んだ時点まで */
  animation-range: contain 0% contain 50%;

  /* 要素が完全に画面内にある間のみ */
  animation-range: contain;

  /* 要素が画面内に少しでも入っている間 */
  animation-range: entry;
}
```

### animation-range の値

| 値 | 説明 |
|----|------|
| `entry` | 要素が画面に入り始めてから完全に入るまで |
| `exit` | 要素が画面から出始めてから完全に出るまで |
| `contain` | 要素が完全に画面内にある間 |
| `cover` | 要素が画面内に少しでも存在する間 |

## ユースケース

### スクロール進捗バー

```css
@keyframes progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  transform-origin: left;
  animation: progress linear;
  animation-timeline: scroll(root);
}
```

### パララックス効果

```css
@keyframes parallax {
  from { transform: translateY(0); }
  to { transform: translateY(-100px); }
}

.parallax-element {
  animation: parallax linear;
  animation-timeline: scroll();
}
```

### 画像のマスク形状変化

```css
@keyframes reveal {
  from { clip-path: inset(30% round 20%); }
  to { clip-path: inset(0); }
}

.image {
  animation: reveal linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}
```

### スクロール方向でヘッダー表示切替

> 出典: https://coliss.com/articles/build-websites/operation/css/css-hide-header-when-scrolling-down.html

スクロール方向に応じてヘッダーを表示/非表示にする高度な実装例です。

#### 基本的な仕組み

1. `--scroll-direction` カスタムプロパティでスクロール方向を検出（-1, 0, 1）
2. Style Queries（`@container style()`）で条件付きスタイル適用
3. `transition-delay: calc(infinity * 1s)` で値を固定化

#### コード例

```html
<body>
  <header>Header</header>
  <main>コンテンツ...</main>
</body>
```

```css
@property --scroll-direction {
  syntax: "<integer>";
  inherits: true;
  initial-value: 0;
}

html {
  /* スクロール方向を -1, 0, 1 で表現 */
  animation: detect-scroll linear;
  animation-timeline: scroll();
}

@keyframes detect-scroll {
  from {
    --scroll-direction: -1; /* 上方向 */
  }
  to {
    --scroll-direction: 1; /* 下方向 */
  }
}

body {
  container-type: normal;
}

header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  translate: 0 var(--translate, 0);
  transition: translate 0.3s;
}

/* スクロールしていない時: 値を固定 */
@container style(--scroll-direction: 0) {
  header {
    transition-delay: calc(infinity * 1s);
  }
}

/* 上スクロール時: ヘッダー表示 */
@container style(--scroll-direction: -1) {
  header {
    --translate: 0;
  }
}

/* 下スクロール時: ヘッダー非表示 */
@container style(--scroll-direction: 1) {
  header {
    --translate: -100%;
  }
}
```

#### 仕組みの解説

1. **スクロール方向の検出**
   - `animation-timeline: scroll()` でスクロール位置をアニメーションにバインド
   - スクロール開始位置で `--scroll-direction: -1`、終了位置で `1`
   - スクロールしていない時は `0`（初期値）

2. **Style Queries による条件分岐**
   - `@container style(--scroll-direction: X)` で値に応じたスタイルを適用
   - `container-type: normal` でサイズクエリなしのスタイルクエリのみ有効化

3. **transition-delay: infinity の活用**
   - スクロールしていない時（`--scroll-direction: 0`）に `infinity * 1s` の遅延
   - 事実上トランジションが発生せず、現在の位置を維持

## 実装時の注意点

### 1. Reduced Motion 対応

アニメーション苦手なユーザーへの配慮が重要です。

```css
@media (prefers-reduced-motion: reduce) {
  .animated-element {
    animation: none;
  }
}
```

### 2. 古い構文を避ける

MDNで紹介される`@scroll-timeline`は**廃止構文**です。使用しないでください。

```css
/* ❌ 古い構文（廃止） */
@scroll-timeline my-timeline {
  source: auto;
}

/* ✅ 新しい構文 */
.element {
  animation-timeline: scroll();
}
```

### 3. イージング設定

スクロール進捗との直線的連動のため、通常は`linear`を使用します。

```css
.element {
  animation: my-animation linear;
  /* ease や ease-in-out は通常使わない */
}
```

### 4. animation-fill-mode

開始・終了状態を保持するには`both`を指定します。

```css
.element {
  animation-fill-mode: both;
  /* または */
  animation: my-animation linear both;
}
```

## ブラウザ対応

| ブラウザ | Scroll-Driven Animations | リリース日 |
|---------|--------------------------|----------|
| Chrome | 115以降 | 2023年7月 |
| Edge | 115以降 | 2023年7月 |
| Safari | 26.0以降 | 2025年9月 |
| Firefox | 未対応 | - |

| 機能 | Chrome | Firefox | Safari |
|------|--------|---------|--------|
| `scroll()`, `view()` | 115+ | ❌ | 26.0+ |
| Style Queries | 111+ | ❌ | 18+ |

**注意**: 非対応ブラウザでも表示は機能しますが、アニメーションは再生されません。

## プログレッシブエンハンスメント

```css
/* フォールバック: 常にヘッダー表示 */
header {
  position: fixed;
  top: 0;
}

/* Scroll-Driven Animations 対応ブラウザのみ */
@supports (animation-timeline: scroll()) {
  html {
    animation: detect-scroll linear;
    animation-timeline: scroll();
  }
  /* ... 以降のスタイル */
}
```

## 利点

- **没入感向上**: ユーザーのスクロール操作に応じた動的な表現
- **視線誘導**: スムーズなアニメーションでコンテンツへの注目を促す
- **JavaScript 不要**: 純粋な CSS 実装でパフォーマンス向上
- **実装ハードル低下**: デザイナー主導での実装が容易
- **パフォーマンス**: スクロールイベントのリスナー不要
- **スムーズ**: ブラウザのネイティブアニメーション

## 制約事項

- ブラウザ対応がまだ限定的（Firefox未対応）
- 複雑な条件分岐には向かない場合がある
- デバッグが難しい場合がある
- 非対応環境では代替実装が必要

## Polyfill

公式のPolyfillは提供されていませんが、プログレッシブエンハンスメントとして実装することを推奨します。

```css
@supports (animation-timeline: scroll()) {
  /* Scroll-driven Animationsが使える場合のみ適用 */
  .element {
    animation-timeline: scroll();
  }
}
```

## 関連ナレッジ

- [CSSアニメーション基礎](./animation-basics.md)
- [View Transitions API](./view-transitions.md)
- [@starting-style](./starting-style.md)
- [@property カスタムプロパティ](../values/custom-properties.md)

## 参考リンク

- [MDN: CSS Scroll-driven Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations)
- [W3C: Scroll-driven Animations Specification](https://drafts.csswg.org/scroll-animations-1/)
- [ICS MEDIA: Scroll-driven Animationsの解説](https://ics.media/entry/230718/)
