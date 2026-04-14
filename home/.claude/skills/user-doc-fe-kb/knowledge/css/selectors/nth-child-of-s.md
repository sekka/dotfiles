---
title: :nth-child() の of S 構文
category: css/selectors
tags: [nth-child, selector, modern-css, 2024]
browser_support: Chrome 111+, Firefox 113+, Safari 9+
created: 2026-01-31
updated: 2026-01-31
---

# :nth-child() の of S 構文

> 出典: https://speakerdeck.com/tonkotsuboy_com/lu-ye-sanniwen-ku-2024nian-zui-xin-csstorendotoshi-jian-tekunituku
> 執筆日: 2024-06
> 追加日: 2026-01-31

特定クラスの要素のみを数えて順番を指定する新しい構文。従来の複雑なセレクタを大幅に簡潔にできる。

## なぜこの方法が良いのか

**従来の問題点:**
```css
/* ❌ 複雑で読みにくい */
.item:nth-child(2):not(:nth-child(n+3)) {
  /* .item の2番目を選択したいが... */
}

/* ❌ JavaScript が必要だった */
document.querySelectorAll('.item')[1].classList.add('second');
```

**of S 構文のメリット:**
- **直感的**: 「.itemのうち2番目」が自然に書ける
- **パフォーマンス**: JavaScriptより高速
- **保守性**: 意図が明確

## 基本的な使い方

```css
/* .item クラスの要素のうち2番目 */
:nth-child(2 of .item) {
  background-color: #3b82f6;
}

/* .card クラスの要素のうち偶数番目 */
:nth-child(even of .card) {
  background-color: #f3f4f6;
}

/* .visible クラスの要素のうち最初の3つ */
:nth-child(-n+3 of .visible) {
  font-weight: bold;
}
```

## 実践例

### ストライプパターン（隠し要素を除外）

```html
<ul>
  <li class="item">Item 1</li>
  <li class="item hidden">Item 2 (Hidden)</li>
  <li class="item">Item 3</li>
  <li class="item">Item 4</li>
  <li class="item hidden">Item 5 (Hidden)</li>
</ul>
```

```css
/* ✅ 表示されているアイテムのみストライプ */
:nth-child(even of .item:not(.hidden)) {
  background-color: #f9fafb;
}

/* ❌ 従来: 複雑で意図が不明瞭 */
.item:not(.hidden):nth-child(even) {
  /* hiddenを除外できない */
}
```

### タブのアクティブ状態

```css
/* アクティブなタブのうち1番目 */
:nth-child(1 of .tab.active) {
  border-left: none;
}

/* アクティブなタブのうち最後 */
:nth-last-child(1 of .tab.active) {
  border-right: none;
}
```

### グリッドレイアウトの最終行

```css
/* 表示されているカードのうち最後の3つ（3カラムの最終行） */
:nth-last-child(-n+3 of .card:not([hidden])) {
  margin-bottom: 0;
}
```

### フォームバリデーション

```css
/* 入力済みフィールドのうち偶数番目 */
:nth-child(even of input:not(:placeholder-shown)) {
  background-color: #f0f9ff;
}

/* エラーのあるフィールドのうち最初 */
:nth-child(1 of input:invalid) {
  scroll-margin-top: 100px; /* スクロール位置調整 */
}
```

## 従来の構文との比較

```css
/* ❌ 従来: nth-child は全ての子要素を数える */
.item:nth-child(2) {
  /* .item が2番目の子要素の場合のみマッチ */
}

/* ✅ 新構文: .item のうち2番目を数える */
:nth-child(2 of .item) {
  /* .item クラスを持つ要素のうち2番目 */
}
```

### 具体例

```html
<div>
  <p>Paragraph</p>
  <div class="item">Item 1</div>
  <div class="item">Item 2</div>
  <div class="item">Item 3</div>
</div>
```

```css
/* ❌ マッチしない（.item は2番目の子要素ではない） */
.item:nth-child(2) {
  color: red;
}

/* ✅ マッチする（.item のうち2番目） */
:nth-child(2 of .item) {
  color: red; /* Item 2 が赤くなる */
}
```

## よくあるパターン

### 最初のN個

```css
/* 最初の3つ */
:nth-child(-n+3 of .item) {
  font-size: 1.25rem;
}
```

### 最後のN個

```css
/* 最後の2つ */
:nth-last-child(-n+2 of .item) {
  opacity: 0.5;
}
```

### N番目以降

```css
/* 4番目以降 */
:nth-child(n+4 of .item) {
  display: none;
}
```

### 範囲指定

```css
/* 3番目から5番目 */
:nth-child(n+3 of .item):nth-child(-n+5 of .item) {
  background-color: #fef3c7;
}
```

## ユースケース

- **動的リスト**: 隠し要素を除外したストライプ
- **ページネーション**: 表示中のアイテムのみスタイリング
- **タブ切り替え**: アクティブタブの最初/最後を判定
- **フォーム**: 入力済み/エラーフィールドのスタイリング
- **グリッドレイアウト**: 最終行のマージン調整
- **アコーディオン**: 開いている項目のみカウント

## ブラウザ対応

| ブラウザ | バージョン |
|----------|-----------|
| Chrome/Edge | 111+ |
| Firefox | 113+ |
| Safari | 9+ |

**注意:** Safari は最も早く実装（2015年）、ChromeとFirefoxは2023年に対応。

## フォールバック

```css
/* フォールバック: すべての .item */
.item:nth-child(even) {
  background-color: #f9fafb;
}

/* 対応ブラウザ: 表示中の .item のみ */
@supports selector(:nth-child(1 of .item)) {
  :nth-child(even of .item:not(.hidden)) {
    background-color: #f9fafb;
  }
}
```

## 関連セレクタ

- `:nth-last-child(n of S)` - 後ろから数える
- `:nth-of-type()` - 同じタグ名のうちN番目（of S 構文不要）

```css
/* タグ名で判定（of S 不要） */
p:nth-of-type(2) {
  /* 2番目の <p> 要素 */
}

/* クラスで判定（of S 必要） */
:nth-child(2 of .paragraph) {
  /* .paragraph クラスの2番目 */
}
```

## 注意点

- **パフォーマンス**: 複雑なセレクタはコスト高（適度に使う）
- **可読性**: 過度に複雑な式は避ける
- **テスト**: 古いブラウザ対応が必要な場合はポリフィルまたはフォールバック

## 関連ナレッジ

- [:has() セレクタ](./has-selector.md)
- [:is() / :where()](./is-where-selectors.md)
- [Modern CSS Selectors](./modern-conventions.md)
