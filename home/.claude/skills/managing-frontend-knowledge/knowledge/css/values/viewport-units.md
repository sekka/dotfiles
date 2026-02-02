---
title: ビューポート単位（svh, dvh, lvh）
category: css/values
tags: [viewport, svh, dvh, lvh, mobile, 2024]
browser_support: Chrome 108+, Firefox 101+, Safari 15.4+
created: 2025-01-16
updated: 2025-01-16
---

# ビューポート単位（svh, dvh, lvh）

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5
> 執筆日: 2024年
> 追加日: 2025-12-17

モバイルのアドレスバーを考慮した単位。

## 単位の種類

| 単位 | 説明 |
|------|------|
| `svh` | Small - アドレスバー表示時の高さ |
| `dvh` | Dynamic - アドレスバーの表示/非表示に追従 |
| `lvh` | Large - アドレスバー非表示時の高さ |

## 使用例

```css
/* メインビジュアル */
.hero {
  height: 100svh; /* 安全な高さ */
}

/* フルスクリーン要素 */
.fullscreen {
  height: 100dvh; /* 動的に変化 */
}
```

## 推奨

通常は `svh` が安全。`dvh` はリサイズ時に要素がジャンプする可能性あり。

## 従来の問題

```css
/* 従来の vh は問題あり */
.hero {
  height: 100vh; /* モバイルでアドレスバーを考慮しない */
}
```

モバイルブラウザのアドレスバーが表示されると、コンテンツが画面外に隠れる問題が発生。

## ブラウザ対応

| ブラウザ | バージョン |
|----------|-----------|
| Chrome/Edge | 108+ |
| Safari | 15.4+ |
| Firefox | 101+ |

## 関連ナレッジ

- [100vw スクロールバー問題の解決](./viewport-units-scrollbar-aware.md) - Chrome 145+ での自動認識
- [clamp()](./clamp.md)
- [Responsive Design](../../cross-cutting/browser-compat/responsive.md)
