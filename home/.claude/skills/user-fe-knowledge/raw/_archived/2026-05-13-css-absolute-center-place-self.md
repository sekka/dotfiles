---
url: https://coliss.com/articles/build-websites/operation/css/css-center-absolute-element.html
fetched_at: 2026-05-13
title: たった3行のCSSで、要素を中央に絶対配置する新しい記述方法
---

# CSS 絶対配置の中央揃え新手法（place-self + inset）

**公開日:** 2026年3月5日

## 古い手法（従来方式）
```css
.popnplop1 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

**仕組み**: 要素の左上隅を50%の中央に移動させ、その後50%分戻すことで中央配置。直感的でない記述が課題。

## 新しい手法（推奨方式）
```css
.popnplop2 {
  position: absolute;
  place-self: center;
  inset: 0;
}
```

## 優れている理由
1. **シンプルで直感的** — コードが「何をしているか」が明確
2. **負のパーセンテージ不要** — 複雑な計算が不要
3. **多機能性** — 中央以外の位置配置も容易に実装可能

## ブラウザサポート
「すべてのブラウザに対応」。Safari 最新版（26.3以降）でも完全にサポート。

## その他の位置配置例
- `place-self: center;` → 中央
- `place-self: start;` → 左上
- `place-self: end start;` → 右上
- `place-self: start end;` → 左下
- `place-self: end;` → 右下

## プロパティ説明
- `place-self` は `align-self` と `justify-self` の統合ショートハンド
- `inset` は `top/right/bottom/left` の統合ショートハンド
