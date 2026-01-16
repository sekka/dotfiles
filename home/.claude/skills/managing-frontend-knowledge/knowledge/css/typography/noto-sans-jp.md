---
title: Noto Sans JP 実装ガイド
category: css/typography
tags: [font, noto-sans-jp, webfont, 2025]
browser_support: 全ブラウザ対応
created: 2025-01-16
updated: 2025-01-16
---

# Noto Sans JP 実装ガイド

> 出典: https://ics.media/entry/250718/
> 執筆日: 2025-07-18
> 追加日: 2025-12-17

2025年現在の Noto Sans JP の OS 搭載状況と最適な実装方法。

## OS 搭載状況（2025年）

| OS | 搭載状況 |
|----|----------|
| Windows 11 | ✅ Noto Sans JP + Noto Serif JP（バリアブル） |
| Windows 10 | ✅ 2025年4月アップデートで追加 |
| Android 15+ | ✅ Noto Sans CJK JP（バリアブル） |
| Android 14以前 | △ 固定ウェイトのみ |
| iOS/macOS | ❌ 未搭載（ウェブフォント必須） |

## Apple 環境の制約

- iOS/macOS には Noto Sans JP 未搭載
- Safari は `local()` 参照をブロックするため、ウェブフォント導入が必須

## Google Fonts での導入

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap" rel="stylesheet">
```

```css
body {
  font-family: "Noto Sans JP", sans-serif;
}
```

## ローカルフォント優先（パフォーマンス重視）

Windows/Android ではローカルフォントを優先し、Apple 環境のみウェブフォントを配信。

```css
/* ローカルフォントを先に参照 */
@font-face {
  font-family: "Local Noto Sans JP";
  src: local("Noto Sans JP");
}

body {
  font-family: "Local Noto Sans JP", "Noto Sans JP", sans-serif;
}
```

## font-feature-settings 対応状況

| 機能 | Google Fonts | Windows/Android 搭載版 |
|------|--------------|------------------------|
| `palt`（プロポーショナル詰め） | ✅ | ✅ |
| `pwid`（プロポーショナル幅） | ❌ | ✅ |

```css
/* プロポーショナル詰め */
.tight {
  font-feature-settings: "palt" 1;
}
```

## 実装方針の選択

| 方針 | メリット | デメリット |
|------|----------|------------|
| Google Fonts 統一 | 全環境で一貫した表示 | 配信容量増加 |
| ローカル優先 | 高速表示（Windows/Android） | Apple 環境で追加読み込み |
| sans-serif のみ | 最速、フォント読み込みなし | OS によってフォントが異なる |

## 推奨設定（バランス型）

```css
@font-face {
  font-family: "Noto Sans JP";
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: local("Noto Sans JP"),
       url(https://fonts.gstatic.com/...) format("woff2");
}

body {
  font-family: "Noto Sans JP", "Hiragino Kaku Gothic ProN",
               "Hiragino Sans", Meiryo, sans-serif;
}
```

## 注意点

- Adobe Fonts では「源ノ角ゴシック」として提供
- バリアブルフォントは `wght@100..900` で全ウェイト指定可能
- `font-display: swap` で FOIT（Flash of Invisible Text）を回避

## 関連ナレッジ

- [Web フォント最適化](../../cross-cutting/performance/webfont-optimization.md)
- [Typography ベストプラクティス](./typography-best-practices.md)
