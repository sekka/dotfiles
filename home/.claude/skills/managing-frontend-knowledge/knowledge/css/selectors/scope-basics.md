---
title: CSS @scope 入門
category: css/selectors
tags: [scope, selector, basics, specificity]
browser_support: Chrome 118+, Safari 17.4+
created: 2025-01-16
updated: 2025-01-16
---

# CSS @scope 入門

<!-- 出典: https://ics.media/entry/250520/ -->

## @scope とは

スタイルの適用範囲を DOM の特定セクションに限定できる CSS アットルール。

## メリット

- クラス名を複雑にしなくてすむ
- スタイルの衝突を防ぎやすくなる
- 保守性が高まる（影響範囲が明確）

## 基本構文

```css
@scope (スコープルート) to (スコープリミット) {
  /* ルールセット */
}
```

- **スコープルート**: スコープの開始点
- **スコープリミット**: スコープの終了点（省略可能）

## 使い方 1: 開始点と終了点を明示

### 基本例

```css
@scope (.section) {
  p {
    color: green;
  }
}
```

`.section` 内のすべての `<p>` 要素に緑色を適用。

### 範囲を細かく制御

```html
<div class="section">
  <p>適用されません</p>

  <div class="section_footer">
    <p>適用されます</p>

    <div class="section_footer_textarea">
      <p>適用されます</p>

      <div class="section_footer_textarea_inner">
        <p>適用されません</p>
      </div>
    </div>
  </div>
</div>
```

```css
@scope (.section_footer) to (.section_footer_textarea_inner) {
  p {
    color: green;
  }
}
```

### 重要なポイント

スコープは「記述の位置」ではなく「DOM ツリー上での構造」で判定される。

```css
@scope (.section) to (.section_footer) {
  p {
    color: green;
  }
}
```

このスコープは `.section` から始まり `.section_footer` に入る**直前まで**が対象。
`.section_footer` 内の要素はスコープ外となる。

## 使い方 2: インライン style での使用

```html
<div class="section">
  <style>
    @scope {
      p {
        color: green;
      }
    }
  </style>
  <p>適用されます</p>
  <div>適用されません</div>

  <div>
    <p>適用されます</p>
  </div>
</div>

<!-- 別スコープのため非適用 -->
<div class="section">
  <p>適用されません</p>
</div>
```

`<style>` 要素の親要素が自動的にスコープルートになる。カッコ内にルートを指定する必要がない。

## :scope 疑似クラスとの違い

| 機能      | 説明                                                      |
| --------- | --------------------------------------------------------- |
| `@scope`  | スタイルの適用範囲を定義するアットルール                  |
| `:scope`  | スコープのルート要素自体を指す疑似クラス                  |

### 組み合わせ例

```html
<div class="section">
  <p>文字色は『オレンジ』です</p>
  <div>文字色は『青』です</div>

  <div>
    <p>文字色は『緑』です</p>
    <div>文字色は『青』です</div>
  </div>
</div>
```

```css
@scope (.section) {
  /* スコープルート自体にスタイル適用 */
  :scope {
    color: blue;
  }

  /* スコープルート直下の <p> のみ */
  :scope > p {
    color: orange;
  }

  /* スコープ内すべての <p> */
  p {
    color: green;
  }
}
```

`:scope > p` の方が詳細度が高いため、スコープルート直下の `<p>` はオレンジになる。

## 詳細度の特徴

`@scope ()` 内で定義されたセレクタはスコープルートの詳細度に影響しない:

```css
@scope (.section) {
  p {
    color: green; /* 詳細度: 0.0.1 */
  }
}

/* 通常のネストの場合 */
.section {
  p {
    color: green; /* 詳細度: 0.1.1 (.section p) */
  }
}
```

## ブラウザ対応状況

| ブラウザ      | バージョン   |
| ------------- | ------------ |
| Chrome/Edge   | 118+         |
| Safari        | 17.4+        |
| Firefox       | 未対応       |

Interop 2025 の対象機能として、対応ブラウザは拡大予定。

## 関連ナレッジ

- [CSS @scope 設計ガイド](./scope.md) - スコープリミットの設計パターンと注意点
