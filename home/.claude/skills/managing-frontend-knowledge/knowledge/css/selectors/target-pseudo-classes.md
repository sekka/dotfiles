---
title: :target-current/before/after 疑似クラス（スクロール連動UI）
category: css/selectors
tags: [pseudo-class, scroll, navigation, table-of-contents]
browser_support: Chrome 142+, Edge 142+
created: 2026-01-31
updated: 2026-01-31
---

## :target-current/before/after 疑似クラス

> 出典: https://ics.media/entry/260130/
> 執筆日: 2026-01-30
> 追加日: 2026-01-31

スクロール位置に応じて目次のリンクスタイルを動的に変更できる疑似クラス。JavaScriptなしでスクロール連動UIを実装可能。

### 概要

- **:target-before** - スクロールで通過済みのリンク
- **:target-current** - 現在表示中のセクションのリンク
- **:target-after** - まだ到達していないリンク

### 実装方法

#### Step 1: コンテナに scroll-target-group を設定

```css
.list {
  scroll-target-group: auto;
}
```

#### Step 2: リンクを配置

```html
<nav class="list">
  <a href="#section1">セクション1</a>
  <a href="#section2">セクション2</a>
  <a href="#section3">セクション3</a>
</nav>

<main>
  <section id="section1">...</section>
  <section id="section2">...</section>
  <section id="section3">...</section>
</main>
```

#### Step 3: 疑似クラスでスタイル指定

```css
/* 通過済み（グレーアウト） */
a:target-before {
  color: #999;
}

/* 現在表示中（強調） */
a:target-current {
  color: #0066cc;
  font-weight: bold;
  border-left: 3px solid #0066cc;
}

/* 未到達 */
a:target-after {
  color: #333;
}
```

### ユースケース

1. **目次のスクロール連動**
   - 記事の目次で現在位置を表示
   - 読んだ箇所と未読箇所を区別

2. **プログレス表示**
   - 完了した項目をグレーアウト
   - 現在の項目を強調表示

3. **横スクロールナビゲーション**
   - スクロールに応じて横メニューのアイテムを強調

4. **ヘッダーメニュー**
   - ページ内リンクの現在位置を自動ハイライト

5. **マルチステップフォーム**
   - 進行状況をステップ表示

### 実践例1: サイドバー目次

```html
<div class="container">
  <aside class="sidebar">
    <nav class="toc">
      <a href="#intro">はじめに</a>
      <a href="#content">本文</a>
      <a href="#conclusion">まとめ</a>
    </nav>
  </aside>
  <main>
    <section id="intro">...</section>
    <section id="content">...</section>
    <section id="conclusion">...</section>
  </main>
</div>
```

```css
.toc {
  scroll-target-group: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toc a {
  padding: 8px 12px;
  text-decoration: none;
  border-left: 3px solid transparent;
  transition: all 0.2s;
}

.toc a:target-before {
  color: #666;
  opacity: 0.6;
}

.toc a:target-current {
  color: #0066cc;
  font-weight: 600;
  border-left-color: #0066cc;
  background: rgba(0, 102, 204, 0.05);
}

.toc a:target-after {
  color: #333;
}
```

### 実践例2: 横スクロール進行状況

```html
<nav class="progress-nav">
  <a href="#step1">ステップ1</a>
  <a href="#step2">ステップ2</a>
  <a href="#step3">ステップ3</a>
</nav>

<div class="steps">
  <section id="step1">...</section>
  <section id="step2">...</section>
  <section id="step3">...</section>
</div>
```

```css
.progress-nav {
  scroll-target-group: auto;
  display: flex;
  gap: 16px;
  border-bottom: 2px solid #e0e0e0;
}

.progress-nav a {
  padding: 12px 16px;
  text-decoration: none;
  position: relative;
}

/* 完了済み（チェックマーク付き） */
.progress-nav a:target-before::before {
  content: '✓ ';
  color: #22c55e;
}

.progress-nav a:target-before {
  color: #666;
}

/* 現在のステップ */
.progress-nav a:target-current {
  color: #0066cc;
  font-weight: 600;
}

.progress-nav a:target-current::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #0066cc;
}

/* 未完了 */
.progress-nav a:target-after {
  color: #999;
}
```

### :has() との組み合わせ

より複雑なスタイル制御も可能。

```css
/* 現在のリンクの親要素をハイライト */
.toc:has(a:target-current) {
  border-left: 2px solid #0066cc;
}

/* 通過済みのセクション内の要素を変更 */
section:has(~ section:target-current) .content {
  opacity: 0.5;
}
```

### CSS Anchor Positioning との組み合わせ

スクロール位置に応じたインジケーター表示。

```css
.toc {
  scroll-target-group: auto;
}

.indicator {
  position: absolute;
  width: 4px;
  height: anchor-size(height);
  background: #0066cc;
  left: 0;

  /* 現在のリンクにアンカー */
  top: anchor(a:target-current top);
  transition: top 0.3s ease;
}
```

### 注意点

- **ブラウザサポート**: Chrome 142+、Edge 142+（2026年1月時点）
- Safari、Firefoxは未対応
- `scroll-target-group: auto` の指定が必須
- リンク先のIDが存在する必要がある
- スクロールコンテナとの関係に注意

### パフォーマンス

- JavaScriptのスクロールイベントリスナー不要
- ブラウザネイティブの最適化
- 大量のリンクでもパフォーマンス良好

### フォールバック

非対応ブラウザ向けのフォールバック。

```css
/* デフォルトスタイル */
.toc a {
  color: #333;
}

/* 対応ブラウザのみ適用 */
@supports selector(:target-current) {
  .toc a:target-current {
    color: #0066cc;
    font-weight: bold;
  }
}
```

### 関連技術

- [scroll-target-group](./scroll-target-group.md)
- [:has() セレクタ](./has-selector.md)
- [CSS Anchor Positioning](../components/anchor-positioning.md)
- [スムーズスクロール](../animation/smooth-scroll.md)

---
