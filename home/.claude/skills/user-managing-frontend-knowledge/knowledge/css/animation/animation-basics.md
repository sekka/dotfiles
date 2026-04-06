---
title: CSS アニメーション基礎
category: css/animation
tags: [animation, transitions, view-transitions, border-radius]
browser_support: Chrome 111+, Edge 111+, Safari 18+
created: 2025-01-16
updated: 2025-01-16
---

# CSS アニメーション

Transitions, Keyframes, View Transitions, Scroll-driven アニメーションに関するナレッジ集。

---

## View Transitions で border-radius をスムーズにアニメーション

> 出典: https://coliss.com/articles/build-websites/operation/css/smoothly-animating-border-radius.html
> 執筆日: 2025-03-25（原記事: 2025-03-11）
> 追加日: 2025-12-17

View Transitions API を使用して、要素の `border-radius` を矩形状態から角丸状態へ滑らかに変形させるテクニック。従来のクロスフェードではなく、自然な形状変化を実現できる。

### なぜこの方法が良いのか

- 従来のフェード効果ではなく、**自然な形状変化**が可能
- `::view-transition-group` に背景やボーダーのアニメーションを複製することで、より正確で滑らかな変形を実現
- モーダルやカードUIの展開/収納で高品質なUXを提供

### コード例

```css
/* border-radius のアニメーションを定義 */
@keyframes adjust-group {
  from {
    background: #ccc;
    border-radius: 0.25rem;
  }
  to {
    background: lightblue;
    border-radius: 3rem;
  }
}

/* View Transition グループにアニメーションを適用 */
::view-transition-group(card) {
  /* デフォルトのアニメーションとカスタムアニメーションを両方適用 */
  animation-name: -ua-view-transition-group-anim-card, adjust-group;
  /* 重要: スナップショットは border-box で取得されるため必須 */
  box-sizing: border-box;
  border: 2px solid black;
}

/* イメージペアを非表示にして形状変化のみ見せる */
::view-transition-image-pair(card) {
  display: none;
}
```

### ユースケース

- モーダルダイアログの拡大・縮小トランジション
- カードUIの展開/収納アニメーション
- ページ遷移時の要素変形エフェクト

### 注意点

- **`box-sizing: border-box` が必須**: スナップショットが `border-box` で取得されるため、明示的に設定しないとズレが生じる
- 背景色やボーダーの変化にも個別対応が必要
- ネストされたビュー遷移グループは Chrome で実装中（2025年3月時点）
- View Transitions API のブラウザサポート: Chrome 111+, Edge 111+, Safari 18+

---
