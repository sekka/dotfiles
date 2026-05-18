---
title: テキストサイズ拡大の問題と解決策 - WCAG 1.4.4 / 1.4.10 対応
category: cross-cutting/accessibility
tags: [accessibility, wcag, font-size, rem, text-scaling, responsive]
browser_support: Chrome / Safari / Firefox
source: https://azukiazusa.dev/blog/text-scaling-issues/
created: 2026-05-18
---

# テキストサイズ拡大の問題と解決策

## 背景

WCAG 2.2 では、ユーザーが画像拡大ソフトや支援技術を使わずに**テキストを 200% まで拡大しても**コンテンツが正しく表示されることが求められる（WCAG 1.4.4 / 1.4.10）。

しかし以下のパターンでブラウザのテキスト拡大設定が無視される問題が頻発する。

## 主な問題

1. **絶対単位 `px` を `font-size` に使うと拡大されない**
   - Chrome のテキストサイズ設定は「ルート要素のデフォルトフォントサイズ (16px) を拡大する」仕組みのため、`px` 指定は反映されない
2. **OS のテキストサイズ設定が反映されない環境がある**
   - macOS + Chrome、iOS + Safari など

## 解決策

### 1. 相対単位を使う（基本）

```css
.text { font-size: 1rem; }      /* または */
.text { font-size: 100%; }
```

`rem` / `em` / `%` ならルートフォントサイズの拡大に追従する。`px` は避ける。

### 2. `:root` のフォントサイズを上書きしない

```css
/* ❌ ブラウザ設定を無効化してしまう */
:root { font-size: 16px; }

/* ⭕ 初期値のまま */
:root { /* font-size 未指定 */ }
```

`62.5%` トリックを使う場合も、ユーザー設定への影響を理解してから採用する。

### 3. `env(preferred-text-scale)` を活用

```css
:root {
  font-size: calc(100% * env(preferred-text-scale, 1));
  text-size-adjust: none;
}
```

OS の希望テキストスケールを取得して反映できる新しい環境変数（Chrome 系で実装が進行中）。

### 4. `text-scale` メタタグ（推奨される追加対策）

```html
<meta name="text-scale" content="scale">
```

CSS 変更なしで OS / ブラウザのテキストサイズ設定を尊重する宣言。

### 5. iOS Safari 向け非標準アプローチ

```css
:root { font: -apple-system-body; }
```

`-apple-system-body` は iOS の Dynamic Type に追従する非標準値。Safari 限定の補助策。

### 6. `text-size-adjust` で二重拡大を防ぐ

```css
html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}
```

モバイルでの自動テキスト膨張による二重拡大を抑制する。

## ベストプラクティス

- `font-size` / `margin` / `padding` には `rem` または `em` を使う
- レイアウト要素の幅・高さも可能な限り相対単位で
- `:root` のデフォルトフォントサイズを書き換えない
- メディアクエリの閾値も `em` で書くと拡大時に追従する: `@media (min-width: 48em)`
- 200% 拡大で横スクロールが発生しないか実機確認する
- 固定高さのコンテナに大きなテキストが詰め込まれてオーバーフローしないか確認

## アンチパターン

```css
/* ❌ 拡大設定が無視される */
body { font-size: 16px; }
.heading { font-size: 24px; }

/* ❌ 固定高さで拡大時にテキストが切れる */
.button { height: 32px; font-size: 14px; }
```

## 関連知識

- [[font-weight-fallback]]: フォント関連のフォールバック
- WCAG 1.4.4 Resize Text / 1.4.10 Reflow

## 参考

- [azukiazusa1: テキストサイズの拡大設定の問題と解決策（2026-02-24）](https://azukiazusa.dev/blog/text-scaling-issues/)
- [WCAG 2.2 - 1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)
