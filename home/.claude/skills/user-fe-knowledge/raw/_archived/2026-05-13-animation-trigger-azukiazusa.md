---
source_url: https://azukiazusa.dev/blog/scroll-triggered-animations-css/
title: CSS によるスクロールトリガーアニメーション
author: azukiazusa1
published: 2026-03-12
captured: 2026-05-13
status: inbox
---

# CSS animation-trigger プロパティ

## 出典
- URL: https://azukiazusa.dev/blog/scroll-triggered-animations-css/
- 著者: azukiazusa1
- 公開: 2026-03-12

## 概要

`animation-trigger` は、これまで JavaScript の Intersection Observer API が必要だったスクロールトリガーアニメーションを、CSS だけで宣言的に実装できるようにする新プロパティ。Chrome v146 以降で利用可能。

## 主要プロパティ

| プロパティ | 役割 |
|------------|------|
| `timeline-trigger-name` | トリガーの名前を定義 |
| `timeline-trigger-source` | トリガーの条件（view() / scroll()） |
| `timeline-trigger-activation-range` | 発火範囲 |
| `animation-trigger` | アニメーションとトリガーを紐づけ |
| `trigger-scope` | トリガーのスコープ限定 |

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

## animation-trigger の値

| 値 | 説明 |
|----|------|
| `none` | 何も実行しない |
| `play` | 再生 |
| `play-once` | 1回だけ再生（終了後停止） |
| `play-forwards` | 正の再生速度で再生 |
| `play-backwards` | 負の再生速度で再生 |
| `pause` | 一時停止 |
| `reset` | 進行状況を 0 にリセット |
| `replay` | リセットして再生 |

## JS との比較

従来:
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

CSS のみで完結。

## scroll-driven-animations との違い

- **Scroll-Driven Animations** (`animation-timeline: scroll() / view()`) — スクロール進捗に**連動**してアニメーションが進行（スクラブ動作）
- **Animation Triggers** (`animation-trigger`) — スクロール位置で**トリガー**してアニメーション再生（離散的、再生/停止/リセット）

両者は別の仕様で、組み合わせ可能。

## ブラウザサポート
- Chrome v146+ で利用可能
- 他ブラウザは未対応

## trigger-scope

`trigger-scope` プロパティでトリガー名のスコープを明示的に限定できる。グローバルスコープでの名前競合によるバグを回避。
anchor-scope と同じ理念。
