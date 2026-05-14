---
title: animation-trigger — CSS のみのスクロールトリガーアニメーション
category: css/animation
tags: [animation-trigger, timeline-trigger, scroll, view, intersection-observer, trigger-scope, 2026]
browser_support: Chrome 146+ (2026), 他ブラウザ未対応
created: 2026-05-13
updated: 2026-05-13
---

# animation-trigger — CSS のみのスクロールトリガーアニメーション

> 出典: https://azukiazusa.dev/blog/scroll-triggered-animations-css/ — azukiazusa1 (公開 2026-03-12)
> 追加日: 2026-05-13

これまで JavaScript の Intersection Observer API が必要だったスクロールトリガーアニメーションを、**CSS だけで宣言的に**実装できる新プロパティ。Chrome v146 以降で利用可能。

## Scroll-Driven Animations との違い

| 機能 | 動作 |
|------|------|
| **Scroll-Driven Animations** (`animation-timeline: scroll() / view()`) | スクロール進捗に**連動**してアニメーションが進行（スクラブ） |
| **Animation Triggers** (`animation-trigger`) | スクロール位置で**トリガー**して再生（離散的、play/pause/reset） |

両者は別仕様で、組み合わせ可能。トリガーは「画面に入ったら 1 度だけ再生」のような従来の IntersectionObserver パターンの代替。

## 主要プロパティ

| プロパティ | 役割 |
|------------|------|
| `timeline-trigger-name` | トリガーの名前を定義 |
| `timeline-trigger-source` | トリガーのソース（`view()` / `scroll()`） |
| `timeline-trigger-activation-range` | 発火範囲 |
| `animation-trigger` | アニメーションとトリガーを紐づけ |
| `trigger-scope` | トリガー名のスコープ限定（anchor-scope と同じ理念） |

## 基本構文

### トリガー定義

```css
.card {
  timeline-trigger-name: --t;
  timeline-trigger-source: view();
  timeline-trigger-activation-range: contain 15% contain 85% / entry 100% exit 0%;
}
```

### 短縮形

```css
.card {
  timeline-trigger: --t view() contain 15% contain 85% / entry 100% exit 0%;
}
```

### アニメーション実装

```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.card {
  animation-name: fade-in;
  animation-duration: 1s;
  animation-trigger: --t play-forwards play-backwards;
  trigger-scope: --t;
}
```

`animation-trigger` の値で「進入時の動作」「退出時の動作」を順に指定。

## animation-trigger の値

| 値 | 説明 |
|----|------|
| `none` | 何も実行しない |
| `play` | 再生 |
| `play-once` | 1 回だけ再生（終了後停止） |
| `play-forwards` | 正の再生速度で再生 |
| `play-backwards` | 負の再生速度で再生 |
| `pause` | 一時停止 |
| `reset` | 進行状況を 0 にリセット |
| `replay` | リセットして再生 |

### 値の組み合わせ例

```css
/* 進入で再生、退出でリセット */
animation-trigger: --t play reset;

/* 進入で 1 回再生、再進入時は何もしない */
animation-trigger: --t play-once none;

/* 進入で再生、退出で逆再生 */
animation-trigger: --t play-forwards play-backwards;
```

## JavaScript 比較

### 従来（IntersectionObserver）

```javascript
const cards = document.querySelectorAll(".card");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("animate");
    } else {
      entry.target.classList.remove("animate");
    }
  });
});
cards.forEach((card) => observer.observe(card));
```

```css
.card { opacity: 0; transition: opacity 0.5s; }
.card.animate { opacity: 1; }
```

### CSS のみ（animation-trigger）

```css
.card {
  timeline-trigger: --t view() contain 0% contain 100%;
  animation: fade-in 1s;
  animation-trigger: --t play-forwards play-backwards;
}
```

→ JavaScript 完全不要。宣言的でメンテナンスが容易。

## ユースケース

### 1. カード要素のフェードイン

```css
.card {
  opacity: 0;
  timeline-trigger: --enter view();
  animation: fade-up 0.6s ease-out forwards;
  animation-trigger: --enter play-once none;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 2. スタッガーアニメーション（sibling-index 併用）

```css
.gallery-item {
  opacity: 0;
  timeline-trigger: --enter view();
  animation: fade-in 0.5s ease-out forwards;
  animation-trigger: --enter play-once none;
  animation-delay: calc((sibling-index() - 1) * 0.05s);
}
```

### 3. 再進入時に逆再生

```css
.section {
  timeline-trigger: --t view() contain 0% contain 100%;
  animation: slide-in 0.8s;
  animation-trigger: --t play-forwards play-backwards;
}
```

スクロールアップで戻ったときに自然に逆再生される。

## trigger-scope

`trigger-scope` プロパティでトリガー名のスコープを限定し、グローバル名前競合を回避できる。

```css
.parent {
  trigger-scope: --my-trigger;
}

.child {
  timeline-trigger: --my-trigger view();
  animation-trigger: --my-trigger play;
}
```

→ `.child` の `--my-trigger` は `.parent` のスコープ内のみで参照される。`anchor-scope` と同じ理念。

## アクセシビリティ

`prefers-reduced-motion` 対応は必須:

```css
.card {
  timeline-trigger: --t view();
  animation: fade-up 0.6s;
  animation-trigger: --t play-once none;
}

@media (prefers-reduced-motion: reduce) {
  .card {
    animation: none;
    opacity: 1; /* 即座に表示状態へ */
  }
}
```

## ブラウザサポート

| ブラウザ | バージョン | 対応時期 |
|----------|-----------|----------|
| Chrome | 146+ | 2026年 |
| Edge | 未対応 | 検討中 |
| Firefox | 未対応 | 検討中 |
| Safari | 未対応 | 検討中 |

## フォールバック戦略

非対応ブラウザでは要素が「最終状態」で常時表示されるよう設計する:

```css
.card {
  /* デフォルト: 最終状態（フェード後の見た目） */
  opacity: 1;
}

@supports (animation-trigger: --t play) {
  .card {
    opacity: 0;
    timeline-trigger: --t view();
    animation: fade-up 0.6s forwards;
    animation-trigger: --t play-once none;
  }
}
```

## なぜ優れているか

1. **JavaScript 完全不要** — IntersectionObserver の代替
2. **宣言的** — トリガー条件とアニメーションが CSS 内で完結
3. **離散的な制御** — play/pause/reset を細かく指定可能（スクラブとは別軸）
4. **trigger-scope による名前衝突回避** — 大規模プロジェクトでも安全

## アンチパターン

```css
/* ❌ trigger-scope を使わずグローバルに名前を生やす */
.card-a { timeline-trigger: --t view(); animation-trigger: --t play; }
.card-b { timeline-trigger: --t view(); animation-trigger: --t play; }
/* → --t がグローバル衝突する可能性 */

/* ✅ trigger-scope でスコープ限定 */
.section-a {
  trigger-scope: --t;
}
.section-a .card { timeline-trigger: --t view(); }
```

## 関連ナレッジ

- [Scroll-Driven Animations](./scroll-driven-animations.md) — スクラブアニメーション
- [@starting-style](./starting-style.md)
- [prefers-reduced-motion](../../cross-cutting/accessibility/prefers-reduced-motion.md)

## 参考リソース

- [azukiazusa: CSS によるスクロールトリガーアニメーション](https://azukiazusa.dev/blog/scroll-triggered-animations-css/)
- [W3C: Animation Triggers仕様](https://drafts.csswg.org/css-animations-2/#animation-trigger)
