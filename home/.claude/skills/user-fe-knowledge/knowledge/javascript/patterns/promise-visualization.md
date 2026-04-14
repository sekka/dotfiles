---
title: JavaScript Promise の視覚的理解（Lydia Hallie 解説動画）
category: javascript/patterns
tags: [promise, async, javascript, learning, visualization]
browser_support: N/A（学習リソース）
created: 2026-04-13
updated: 2026-04-13
---

# JavaScript Promise の視覚的理解

> 出典: https://x.com/koder_dev/status/1824777044410200435
> 追加日: 2026-04-13

元 Vercel エンジニアの Lydia Hallie（@lydiahallie）が図解とアニメーションで
JavaScript の Promise を徹底解説した動画の紹介。

## 動画概要

- **制作者**: Lydia Hallie（@lydiahallie）— 元 Vercel エンジニア
- **内容**: Promise の使い方だけでなく、**内部で何が起こっているか**まで図解とアニメーションで解説
- **時間**: 約 8 分
- コメント欄でも "Probably the best explanation of Promise I've ever seen" と絶賛

## なぜ有用か

- Promise は JS 学習の最初の難関であり、処理の流れがイメージしづらい
- この動画はコールスタック・マイクロタスクキューの動作を視覚的に示す
- 概念の解像度が上がる、と多くの開発者から評価されている

## 関連概念（Promise の基礎）

```javascript
// Promise の基本パターン
const promise = new Promise((resolve, reject) => {
  // 非同期処理
  setTimeout(() => resolve('done'), 1000);
});

// then/catch チェーン
promise
  .then(result => console.log(result))
  .catch(err => console.error(err));

// async/await（Promise のシンタックスシュガー）
async function fetchData() {
  try {
    const result = await promise;
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}
```

## 動画を探す方法

- YouTube で "Lydia Hallie JavaScript Promises" または "@lydiahallie promise" で検索

---
