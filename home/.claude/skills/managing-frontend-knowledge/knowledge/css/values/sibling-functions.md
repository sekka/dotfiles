---
title: sibling-index() / sibling-count()（兄弟要素の位置・数）
category: css/values
tags: [sibling, index, count, animation, stagger, Chrome 138]
browser_support: Chrome 138+, Edge 138+, Safari 26.2+
created: 2026-01-31
updated: 2026-01-31
---

## sibling-index() / sibling-count()

> 出典: https://ics.media/entry/260116/
> 執筆日: 2026-01-19
> 追加日: 2026-01-31

兄弟要素内での位置や総数を取得できるCSS関数。HTMLに属性を追加せずにスタッガーアニメーションや段階的なスタイル変更が可能。

### 概要

- **sibling-index()** - 兄弟要素内での位置を整数で返す（1から始まる）
- **sibling-count()** - 兄弟要素の総数を整数で返す

### 基本的な使い方

#### スタッガーアニメーション

時間差で順番に動くアニメーション。

```css
li {
  /* 各要素に0.05秒ずつ遅延 */
  transition-delay: calc((sibling-index() - 1) * 0.05s);
}
```

#### 段階的な色変化

```css
li {
  /* 位置に応じて明度を変化 */
  background: hsl(
    200deg
    calc(100% - (sibling-index() - 1) * 15%)
    60%
  );
}
```

```css
/* oklch()での例 */
li {
  background: oklch(
    calc(0.7 - (sibling-index() - 1) * 0.05)
    0.15
    200
  );
}
```

### ユースケース

#### 1. スタッガーアニメーション

要素が順番に表示される効果。

```html
<ul class="stagger-list">
  <li>アイテム1</li>
  <li>アイテム2</li>
  <li>アイテム3</li>
  <li>アイテム4</li>
</ul>
```

```css
.stagger-list li {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.3s, transform 0.3s;
  transition-delay: calc((sibling-index() - 1) * 0.1s);
}

.stagger-list.visible li {
  opacity: 1;
  transform: translateY(0);
}
```

#### 2. 手札風UI（カード配置）

トランプの手札のような扇状レイアウト。

```html
<div class="card-hand">
  <div class="card">カード1</div>
  <div class="card">カード2</div>
  <div class="card">カード3</div>
  <div class="card">カード4</div>
  <div class="card">カード5</div>
</div>
```

```css
.card-hand {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 300px;
}

.card {
  width: 100px;
  height: 150px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  /* 中央を基準に扇状に配置 */
  --center: calc(sibling-count() / 2);
  --offset: calc(sibling-index() - var(--center));

  /* 回転角度 */
  transform: rotate(calc(var(--offset) * 5deg));

  /* Y軸方向のオフセット */
  transform-origin: center bottom;
  margin-bottom: calc(abs(var(--offset)) * -20px);
}
```

#### 3. グラデーション的な背景色

```css
.item {
  /* 段階的に色を変化 */
  background: hsl(
    calc(200 + sibling-index() * 20)
    70%
    60%
  );
}
```

#### 4. サイズの段階的変化

```css
.bubble {
  /* 位置に応じてサイズを変化 */
  width: calc(40px + sibling-index() * 10px);
  height: calc(40px + sibling-index() * 10px);
}
```

### @starting-style との組み合わせ

初期表示時のアニメーション。

```css
li {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.3s, transform 0.3s;
  transition-delay: calc((sibling-index() - 1) * 0.05s);
}

@starting-style {
  li {
    opacity: 0;
    transform: translateY(20px);
  }
}
```

### 実践例：ギャラリーグリッド

```html
<div class="gallery">
  <div class="gallery-item">
    <img src="photo1.jpg" alt="">
  </div>
  <div class="gallery-item">
    <img src="photo2.jpg" alt="">
  </div>
  <!-- ...more items -->
</div>
```

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.gallery-item {
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 8px;

  /* スタッガーアニメーション */
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.3s, transform 0.3s;
  transition-delay: calc((sibling-index() - 1) * 0.05s);
}

.gallery.loaded .gallery-item {
  opacity: 1;
  transform: scale(1);
}

/* ホバー時のエフェクト */
.gallery-item:hover {
  transform: scale(1.05);
  z-index: 10;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

### 実践例：プログレスステップ

```html
<ol class="steps">
  <li>アカウント作成</li>
  <li>プロフィール入力</li>
  <li>確認</li>
  <li>完了</li>
</ol>
```

```css
.steps {
  display: flex;
  gap: 32px;
  counter-reset: step;
}

.steps li {
  counter-increment: step;
  position: relative;
  flex: 1;

  /* 段階的な不透明度 */
  opacity: calc(1 - (sibling-index() - 1) * 0.2);
}

.steps li::before {
  content: counter(step);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;

  /* 位置に応じた色変化 */
  background: hsl(
    200deg
    calc(100% - (sibling-index() - 1) * 20%)
    60%
  );

  color: white;
  font-weight: bold;
  margin-bottom: 8px;
}
```

### sibling-count() の活用

総数を使った動的な調整。

```css
.item {
  /* アイテム数に応じてサイズを調整 */
  width: calc(100% / sibling-count());

  /* アイテム数が多い場合は小さく */
  font-size: calc(16px - (sibling-count() - 3) * 1px);
}
```

### 中央基準の配置

中央を基準にした配置計算。

```css
.item {
  --center: calc((sibling-count() + 1) / 2);
  --distance: calc(sibling-index() - var(--center));

  /* 中央からの距離に応じた配置 */
  transform: translateX(calc(var(--distance) * 60px));
}
```

### 注意点

- **ブラウザサポート**: Chrome 138+、Edge 138+、Safari 26.2+（2026年1月時点）
- Firefox は未対応
- インデックスは **1から始まる**（0ではない）
- 兄弟要素のみカウント（親要素は含まれない）
- 計算結果は整数値

### パフォーマンス

- CSS-only実装（JavaScriptなし）
- 動的な要素追加にも自動対応
- HTMLに属性を追加する必要がない

### フォールバック

非対応ブラウザ向けのフォールバック。

```css
/* デフォルト（固定値） */
li {
  transition-delay: 0.1s;
}

/* 対応ブラウザのみ適用 */
@supports (transition-delay: calc(sibling-index() * 0.05s)) {
  li {
    transition-delay: calc((sibling-index() - 1) * 0.05s);
  }
}
```

### 従来の方法との比較

#### 従来: nth-child を使った方法

```css
li:nth-child(1) { transition-delay: 0s; }
li:nth-child(2) { transition-delay: 0.05s; }
li:nth-child(3) { transition-delay: 0.1s; }
/* ...要素数分記述が必要 */
```

**デメリット:**
- 要素数分のルールが必要
- 動的な要素数に対応できない

#### 新しい方法: sibling-index()

```css
li {
  transition-delay: calc((sibling-index() - 1) * 0.05s);
}
```

**メリット:**
- 1行で完結
- 要素数に自動対応
- メンテナンスが容易

### 関連技術

- [@starting-style](../animation/starting-style.md)
- [CSS カウンター](./css-counters.md)
- [calc() 関数](./calc-extended.md)
- [hsl() / oklch() 色関数](../theming/color-functions.md)

---
