---
title: caret-animation（入力キャレットのアニメーション制御）
category: css/typography
tags: [caret, animation, Chrome 140, フォーム]
browser_support: Chrome 140+, Edge 140+
created: 2026-01-31
updated: 2026-01-31
---

## 入力キャレットのアニメーション制御

> 出典: https://coliss.com/articles/build-websites/operation/work/chrome-140-adds-10-new-css-feature.html
> 執筆日: 2025-09-08
> 追加日: 2026-01-31

`caret-animation` プロパティにより、テキスト入力フィールドのキャレット（カーソル）のアニメーションを制御できます。

### コード例

```css
/* キャレットのアニメーションを無効化 */
input {
  caret-animation: none;
}

/* キャレットのアニメーションを有効化（デフォルト） */
textarea {
  caret-animation: auto;
}
```

### ユースケース
- モーション軽減設定に対応したフォーム
- パフォーマンス最適化（アニメーションを無効化）
- ユーザーのアクセシビリティ設定に応じた制御

### 注意点
- **ブラウザサポート**: Chrome 140+、Edge 140+（2025年9月3日リリース）
- `prefers-reduced-motion` と組み合わせて使用することを推奨
- デフォルトでは auto（ブラウザのデフォルトアニメーション）

---
