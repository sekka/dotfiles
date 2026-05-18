---
title: position sticky の軸ごと制御 - 上端固定と左端固定を同時に
category: css/layout
tags: [sticky, position, table, overflow, scroll]
browser_support: Chrome 148+, Firefox 未対応, Safari 未対応
source: https://coliss.com/articles/build-websites/operation/css/css-sticky-per-axis-basis.html
created: 2026-05-18
---

# position: sticky の軸ごと制御

## 背景

テーブルで「ヘッダを上端に固定」しつつ「最初の列を左端に固定」したいケース。従来は `top: 0` と `left: 0` を同時に指定しても、ラッパー要素が両軸のスクロール参照点を兼ねるため片方しか効かなかった。

## 新仕様

各軸ごとに独立したスクロール祖先を参照できるようになった。最初の列はラッパー（水平スクロール）に対して左端固定、ヘッダはドキュメント全体に対して上端固定、という分離が成立する。

## 実装例

```css
.table-wrapper {
  /* y軸を clip にすることで「ラッパーが垂直スクロール祖先」になるのを防ぐ */
  overflow: auto clip;
}

.table-wrapper thead {
  position: sticky;
  top: 0; /* ドキュメント全体に対して上端固定 */
}

.table-wrapper td:first-child {
  position: sticky;
  left: 0; /* ラッパー内の水平スクロールに対して左端固定 */
}
```

### 重要ポイント

- `overflow-x: auto` だけだと自動的に `overflow-y: auto` も発生し、ラッパーが垂直スクロール祖先になってしまう
- 明示的に `overflow: auto clip`（x=auto, y=clip）として垂直スクロールを切り離す

## ブラウザサポート

| ブラウザ | 状況 |
|---|---|
| Chrome / Chromium | 148+ で対応 |
| Firefox | 未対応（Bug #2023702） |
| Safari | 未対応 |

## レガシー対応

未対応ブラウザでは従来通りどちらか片方しか固定できないため、JS で `CSS.supports()` などを使って機能検出し、フォールバック UI を出すのが安全。

## ユースケース

- データテーブル（業務系ダッシュボード、価格表、比較表）
- カレンダーやガントチャートの軸ヘッダ
- 横スクロール可能な統計表

## 関連知識

- [[container-scroll-state-queries]]: スクロール状態に応じた sticky の見た目切り替え
- 通常の `position: sticky` パターン

## 参考

- [Coliss 記事（2026-04-07）](https://coliss.com/articles/build-websites/operation/css/css-sticky-per-axis-basis.html)
