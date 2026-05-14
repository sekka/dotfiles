---
title: CSS Custom Highlight API — DOM 操作なしでテキストハイライト
category: javascript/web-apis
tags: [highlight, css-highlight, range, search, text, dom, 2024]
browser_support: Chrome/Edge 105+ (2022-08), Safari 17.2+ (2023-12), Firefox 149+ (2026-03)
created: 2026-05-13
updated: 2026-05-13
---

# CSS Custom Highlight API

> 出典: https://ics.media/entry/260427/ — ICS 北川 杏子
> 追加日: 2026-05-13

DOM を変更せずに、テキストの任意の範囲に CSS でスタイルを適用できる API。検索ハイライト、コードハイライト、コメント機能などに最適。

## 従来手法の課題

従来は「テキストを `<span>` で囲んで CSS を適用」する方法が一般的。
- HTML の階層が深くなる
- 動的なハイライトには DOM の動的操作が必要
- 「構造と見た目の分離」を破る

## Custom Highlight API の利点

- **DOM 操作が不要** — 既存の HTML 構造を変更しない
- **複数ハイライト対応** — 名前を使い分けて異なるスタイルを同時適用
- **動的処理に最適** — Range を更新するだけで再描画

## 基本の3ステップ

### Step 1: Range オブジェクト作成

```javascript
const description = document.querySelector(".description");
const range = new Range();
range.setStart(description.firstChild, 0);
range.setEnd(description.firstChild, 24);
```

**重要**: `setStart` / `setEnd` の第1引数は必ず **テキストノード**を渡す。要素ノードを渡すとインデックスが子要素として解釈されエラーになる。

### Step 2: Highlight オブジェクトを登録

```javascript
const basicHighlight = new Highlight(range);
CSS.highlights.set("basic-highlight", basicHighlight);
```

### Step 3: CSS 疑似要素で装飾

```css
::highlight(basic-highlight) {
  background: yellow;
}
```

## 複数ハイライトの同時適用

異なる名前で登録すれば、同じテキストに複数のハイライトを重ねられる。

```css
::highlight(highlight) {
  background: yellow;
}
::highlight(underline) {
  text-decoration: underline;
  color: red;
}
```

```javascript
CSS.highlights.set("highlight", new Highlight(range1));
CSS.highlights.set("underline", new Highlight(range2));
```

## 実装パターン：動的検索ハイライト

検索入力に応じてリアルタイムでハイライトする実装。

```javascript
// 事前に記事内の全テキストノードを収集
const textNodes = [];
const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
let currentNode = walker.nextNode();
while (currentNode !== null) {
  textNodes.push(currentNode);
  currentNode = walker.nextNode();
}

const updateHighlight = () => {
  const keyword = searchInput.value;
  if (!keyword) {
    CSS.highlights.delete("search");
    return;
  }

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

```css
::highlight(search) {
  background: yellow;
  color: black;
}
```

## サポートされる CSS プロパティ

`::highlight()` 疑似要素には以下のプロパティのみ適用可能（描画パイプラインの都合）:

- `background-color`
- `color`
- `text-decoration`（色・太さ・スタイル含む）
- `text-shadow`
- `-webkit-text-stroke-*`

→ レイアウトを変えるプロパティ（`font-size`, `padding` 等）は **適用されない**。

## ブラウザサポート

| ブラウザ | バージョン | 対応時期 |
|----------|-----------|----------|
| Chrome / Edge | 105+ | 2022年8月 |
| Safari | 17.2+ | 2023年12月 |
| Firefox | 149+ | 2026年3月 |

**Baseline Widely available** に近い状況。

## 注意点

- **テキストノードのみ対象**: 要素ノードを Range に渡すと予期しない動作
- **ミニファイの影響**: HTML の改行・スペースが削除されるとハイライト位置がずれる場合あり
- **レイアウト系プロパティは不可**: 上記サポート外プロパティは無視される
- **アクセシビリティ**: スクリーンリーダーへの伝達はされないため、検索結果は `aria-live` などで別途通知すべき

## なぜ優れているか

1. **DOM を汚さない** — マークアップが完全に保たれる
2. **パフォーマンスが高い** — `<span>` 大量挿入と異なりレイアウト再計算が軽い
3. **動的更新が容易** — Range の差し替えだけで済む
4. **複数レイヤー対応** — 検索結果 + コメント + 編集中など多重ハイライト

## 関連ナレッジ

- [text-decoration-highlighter](../../css/typography/text-decoration-highlighter.md)
- [virtual-keyboard-api](./virtual-keyboard-api.md)

## 参考リソース

- [ICS: CSS カスタムハイライト API](https://ics.media/entry/260427/)
- [MDN: CSS Custom Highlight API](https://developer.mozilla.org/docs/Web/API/CSS_Custom_Highlight_API)
- [CSS Highlight API Module Level 1](https://drafts.csswg.org/css-highlight-api-1/)
