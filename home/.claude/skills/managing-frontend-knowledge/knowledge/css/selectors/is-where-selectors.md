---
title: :is() / :where() セレクタ
category: css/selectors
tags: [is, where, selector, specificity]
browser_support: 全モダンブラウザ対応
created: 2025-01-16
updated: 2025-01-16
---

# :is() / :where() セレクタ

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5
> 執筆日: 2024年
> 追加日: 2025-12-17

複数セレクタをまとめて記述。

## 基本的な使い方

```css
/* :is() - 詳細度は最も高いセレクタに合わせる */
.post :is(h2, h3, h4, h5, h6) {
  font-weight: bold;
  line-height: 1.4;
}

/* :where() - 詳細度は常に 0 */
:where(.post, .article) p {
  line-height: 1.8;
}
```

## 使い分け

- **:is()** - 通常のセレクタ
- **:where()** - リセットCSS、上書きしやすくしたい場合

## 詳細度の違い

```css
/* :is() の詳細度 = 最も高いセレクタの詳細度 */
:is(#id, .class) {
  /* 詳細度: 1,0,0 (id の詳細度) */
}

/* :where() の詳細度 = 常に 0 */
:where(#id, .class) {
  /* 詳細度: 0,0,0 */
}
```

## ユースケース

### 見出しの一括スタイル

```css
/* 従来 */
.post h2, .post h3, .post h4 {
  color: #333;
}

/* :is() 使用 */
.post :is(h2, h3, h4) {
  color: #333;
}
```

### リセットCSS

```css
/* 詳細度0なので簡単に上書き可能 */
:where(h1, h2, h3, h4, h5, h6) {
  margin: 0;
  font-weight: inherit;
}
```

---

## 歴史的背景と追加情報

> 出典: https://zenn.dev/tonkotsuboy_com/articles/2021-css-new-features
> 執筆日: 2021年12月
> 全モダンブラウザ対応: Chrome 88（2021年1月）で完了

### ブラウザ対応の歴史

- **Chrome 88** (2021年1月): `:is()` と `:where()` の完全サポート
- **Firefox 78** (2020年6月): 先行してサポート
- **Safari 14** (2020年9月): サポート開始

**現在**: すべてのモダンブラウザで安定して使用可能

### :not() セレクタの拡張

`:is()` と同時期に、`:not()` セレクタもセレクタリストを受け入れるようになった。

#### 従来（セレクタリスト不可）

```css
/* 従来: 複数の :not() が必要 */
p:not(.intro):not(.summary):not(.note) {
  color: gray;
}
```

#### 現在（セレクタリスト可能）

```css
/* 現在: 1つの :not() でリスト指定可能 */
p:not(.intro, .summary, .note) {
  color: gray;
}
```

### セレクタの組み合わせ例

#### 複雑なネスト構造

```css
/* ナビゲーション内のリンクで、ホームリンク以外にアイコンを追加 */
nav :is(a, button):not(.home-link)::before {
  content: '→ ';
}
```

#### 複数のコンテキスト

```css
/* 記事とサイドバー内の段落に共通スタイル */
:is(.article, .sidebar) :is(p, li) {
  line-height: 1.8;
}

/* 従来の書き方と比較 */
.article p,
.article li,
.sidebar p,
.sidebar li {
  line-height: 1.8;
}
```

#### フォーム要素の状態

```css
/* 無効でないフォーム要素 */
:is(input, select, textarea):not(:disabled) {
  background-color: white;
}

/* ホバーとフォーカス */
:is(input, select, textarea):is(:hover, :focus) {
  outline: 2px solid blue;
}
```

### 実践的なパターン

#### リストのスタイル統一

```css
/* すべてのリストタイプから list-style を削除 */
:where(ul, ol, dl) {
  list-style: none;
  padding: 0;
}

/* 特定のクラスで list-style を復活（詳細度0なので簡単） */
.styled-list {
  list-style: disc;
  padding-left: 1.5em;
}
```

#### 見出しのリセット

```css
/* すべての見出しをリセット */
:where(h1, h2, h3, h4, h5, h6) {
  margin: 0;
  font-size: inherit;
  font-weight: inherit;
}

/* 個別のスタイルを簡単に適用可能 */
h1 {
  font-size: 2rem;
  font-weight: bold;
}
```

#### メディア要素のレスポンシブ対応

```css
/* すべてのメディア要素をレスポンシブに */
:where(img, video, iframe, embed) {
  max-width: 100%;
  height: auto;
}
```

### :is() と :where() の選択基準

| 状況 | 推奨セレクタ | 理由 |
|------|-------------|------|
| 通常のスタイリング | `:is()` | 通常の詳細度が維持される |
| リセットCSS | `:where()` | 詳細度0で簡単に上書き可能 |
| ユーティリティクラス | `:where()` | 他のスタイルより優先度を低く |
| コンポーネントスタイル | `:is()` | 適切な詳細度を保つ |

### パフォーマンス

`:is()` と `:where()` は、従来の複数セレクタ記述と比較して：
- **可読性**: 大幅に向上
- **パフォーマンス**: ブラウザ側で最適化されるため、ほぼ同等
- **保守性**: コードが短くなり、変更が容易

---

## 関連ナレッジ

- [:has()](./has-selector.md)
- [:not()](./not-selector.md)
- [CSS Specificity](./specificity.md)
- [モダンCSS記法](./modern-conventions.md)
