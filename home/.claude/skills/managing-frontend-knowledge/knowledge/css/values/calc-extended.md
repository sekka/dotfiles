---
title: calc()の拡張（異なる単位での演算）
category: css/values
tags: [calc, 単位変換, Chrome 140]
browser_support: Chrome 140+, Edge 140+
created: 2026-01-31
updated: 2026-01-31
---

## calc()の異なる単位での乗算・除算

> 出典: https://coliss.com/articles/build-websites/operation/work/chrome-140-adds-10-new-css-feature.html
> 執筆日: 2025-09-08
> 追加日: 2026-01-31

Chrome 140以降、calc()関数で異なる単位間の乗算・除算が可能になりました。これにより単位変換が容易になります。

### コード例

```css
/* 異なる単位での除算 */
width: calc(10em / 1px);

/* 複雑な計算 */
width: calc(20% / 0.5em * 1px);

/* 単位変換の実用例 */
--base-size: 16px;
font-size: calc(1em / var(--base-size) * 14px);
```

### ユースケース
- 単位変換を計算式で行う
- 異なる単位のカスタムプロパティを組み合わせる
- レスポンシブな値の計算を簡潔に記述

### 注意点
- **ブラウザサポート**: Chrome 140+、Edge 140+（2025年9月3日リリース）
- Safari、Firefoxは未対応（2026年1月時点）
- 従来の calc() では異なる単位の乗算・除算はエラーになっていた

---
