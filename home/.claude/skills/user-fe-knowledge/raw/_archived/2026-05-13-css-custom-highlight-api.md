---
url: https://ics.media/entry/260427/
fetched_at: 2026-05-13
title: CSSカスタムハイライトAPI - DOM操作なしでテキストをハイライト
---

# CSS カスタムハイライトAPI

## 基本情報
- **公開日**: 2024年4月27日（推定 / 取得結果ベース）
- **著者**: 北川杏子（株式会社ICS）

## 技術ポイント

### 1. 従来手法の課題
従来は「テキストを `<span>` タグで囲み、CSSを適用」という方法が一般的。HTMLの階層が深くなり、動的なハイライトには DOM の動的操作が必要になるという「構造と見た目の分離」の問題。

### 2. CSS カスタムハイライトAPIの利点
- **DOM操作が不要**: 既存のHTML構造を変更しない
- **複数ハイライト対応**: キーワードを使い分けることで異なるスタイルを同時適用可能
- **動的処理に最適**: JavaScript で Range 設定を更新するだけで対応

## コード実装パターン

### 基本的な3ステップ

**Step 1: Rangeオブジェクト作成**
```javascript
const description = document.querySelector(".description");
const range = new Range();
range.setStart(description.firstChild, 0);
range.setEnd(description.firstChild, 24);
```

**重要**: 第1引数は必ず「テキストノード」を渡す。要素そのものを渡すとインデックスが子要素として解釈されエラー発生。

**Step 2: Highlight オブジェクト登録**
```javascript
const basicHighlight = new Highlight(range);
CSS.highlights.set("basic-highlight", basicHighlight);
```

**Step 3: CSS 疑似要素で装飾**
```css
::highlight(basic-highlight) {
  background: yellow;
}
```

### 複数ハイライト対応
```css
::highlight(highlight) {
  background: yellow;
}
::highlight(underline) {
  text-decoration: underline;
  color: red;
}
```

## 実装パターン：動的検索ハイライト

テキストノードを事前に取得し、入力イベントで検索結果の範囲を動的に更新：

```javascript
const textNodes = [];
const walker = document.createTreeWalker(
  article,
  NodeFilter.SHOW_TEXT
);
let currentNode = walker.nextNode();
while (currentNode !== null) {
  textNodes.push(currentNode);
  currentNode = walker.nextNode();
}

const updateHighlight = () => {
  const keyword = searchInput.value;
  const ranges = [];
  const regex = new RegExp(RegExp.escape(keyword), "gi");

  for (const textNode of textNodes) {
    for (const match of textNode.textContent.matchAll(regex)) {
      const range = new Range();
      range.setStart(textNode, match.index);
      range.setEnd(textNode, match.index + match[0].length);
      ranges.push(range);
    }
  }

  CSS.highlights.set("search", new Highlight(...ranges));
};

searchInput.addEventListener("input", updateHighlight);
```

## ブラウザサポート

| ブラウザ | バージョン | 対応時期 |
|---------|-----------|---------|
| Chrome/Edge | 105以上 | 2022年8月 |
| Safari | 17.2以上 | 2023年12月 |
| Firefox | 149以上 | 2026年3月 |

## 注意点
- テキストノード以外（要素ノード）を `Range` に渡すと、インデックスが予期しない結果になる
- HTML のミニファイで改行・スペースが削除されるとハイライト位置が変わる場合がある
