---
title: ブロックリンク（カードUI）のアクセシビリティ
category: cross-cutting/accessibility
tags: [accessibility, links, card-ui, a11y, javascript, stretched-link]
browser_support: 全ブラウザ対応
created: 2025-01-16
updated: 2025-01-16
---

# ブロックリンク（カードUI）のアクセシビリティ

> 出典: https://yuheiy.com/2025-04-17-building-better-block-links
> 執筆日: 2025年4月17日
> 追加日: 2025-01-16

複数要素をグループ化して全体をリンクにするブロックリンク（カードUI）の問題と解決策。

## ブロックリンクとは

複数の要素（見出し、説明文、画像など）がグループ化され、全体がクリッカブルなUI。

```html
<!-- 典型的なカードUI -->
<article class="card">
  <img src="thumbnail.jpg" alt="" />
  <h2>記事タイトル</h2>
  <p>記事の説明文...</p>
  <a href="/article/123">続きを読む</a>
</article>
```

**課題:** カード全体をクリッカブルにしたいが、リンクの入れ子は不可。

## 従来の問題のある実装

### 1. リンクでカード全体を囲む（非推奨）

```html
<!-- ❌ 問題あり: スクリーンリーダーで冗長 -->
<a href="/article/123" class="card-link">
  <article class="card">
    <img src="thumbnail.jpg" alt="記事のサムネイル" />
    <h2>記事タイトル</h2>
    <p>記事の説明文が長々と続きます...</p>
  </article>
</a>
```

**問題点:**
- スクリーンリーダーが全テキストを読み上げる
- 「記事タイトル、記事の説明文が長々と続きます...、リンク」と冗長
- ユーザーが内容を把握しづらい

### 2. Stretched Link手法（問題あり）

擬似要素で広いクリック領域を作成。

```html
<article class="card">
  <h2><a href="/article/123" class="stretched-link">記事タイトル</a></h2>
  <p>記事の説明文...</p>
</article>
```

```css
.card {
  position: relative;
}

.stretched-link::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
}
```

**問題点:**
- **テキスト選択が不可能**になる
- 擬似要素がすべてのクリックを奪う
- ユーザー体験を大きく損なう

## 推奨実装：JavaScript活用アプローチ

カード外側のクリックを検知して、内部のリンクに転送する。

### 基本実装

```html
<article class="card js-block-link">
  <img src="thumbnail.jpg" alt="" />
  <h2><a href="/article/123" class="card-link">記事タイトル</a></h2>
  <p>記事の説明文...</p>
</article>
```

```javascript
const card = document.querySelector('.js-block-link');
const link = card.querySelector('.card-link');

card.addEventListener('pointerup', (event) => {
  // リンク自体のクリックは無視
  if (event.target.closest('a:any-link')) return;

  // テキスト選択中は無視
  if (!document.getSelection().isCollapsed) return;

  // リンクをクリック
  link.click();
});
```

**メリット:**
- テキスト選択が可能
- スクリーンリーダーで冗長な読み上げなし
- 修飾キー（Ctrl、Cmd）が機能する

### 段階的機能向上（Progressive Enhancement）

JavaScriptが有効な場合のみ`cursor: pointer`を適用。

```css
/* デフォルト: 通常のカーソル */
.js-block-link {
  cursor: default;
}

/* JavaScriptが有効な場合のみ */
@media (scripting: enabled) {
  .js-block-link {
    cursor: pointer;
  }
}
```

### 修飾キー対応

ブラウザ間の差異を吸収して、新しいタブで開くなどの機能を保持。

```javascript
import { openLink } from '@react-aria/utils';

card.addEventListener('pointerup', (event) => {
  if (event.target.closest('a:any-link')) return;
  if (!document.getSelection().isCollapsed) return;

  // 修飾キーを考慮してリンクを開く
  openLink(link, event);
});
```

**対応する修飾キー:**
- `Ctrl + クリック`（Windows/Linux）/ `Cmd + クリック`（Mac）: 新しいタブ
- `Shift + クリック`: 新しいウィンドウ
- `Alt + クリック`: ダウンロード

### 完全な実装例

```html
<article class="card js-block-link" data-link-target=".card-link">
  <img src="thumbnail.jpg" alt="" class="card-image" />
  <div class="card-content">
    <h2 class="card-title">
      <a href="/article/123" class="card-link">記事タイトル</a>
    </h2>
    <p class="card-description">記事の説明文...</p>
    <div class="card-meta">
      <time datetime="2025-01-16">2025年1月16日</time>
      <span class="card-author">著者名</span>
    </div>
  </div>
</article>
```

```css
.card {
  position: relative;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  transition: box-shadow 0.2s;
}

/* デフォルト: 通常のカーソル */
.js-block-link {
  cursor: default;
}

/* JavaScriptが有効な場合 */
@media (scripting: enabled) {
  .js-block-link {
    cursor: pointer;
  }

  .js-block-link:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.card-link {
  color: #0066cc;
  text-decoration: none;
}

.card-link:hover {
  text-decoration: underline;
}

/* 実際のリンクにフォーカス表示 */
.card-link:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
```

```javascript
// 汎用的な実装
document.querySelectorAll('.js-block-link').forEach((card) => {
  const linkSelector = card.dataset.linkTarget || '.card-link';
  const link = card.querySelector(linkSelector);

  if (!link) return;

  card.addEventListener('pointerup', (event) => {
    // リンク自体のクリックは無視
    if (event.target.closest('a:any-link, button')) return;

    // テキスト選択中は無視
    if (!document.getSelection().isCollapsed) return;

    // 修飾キー対応
    if (event.ctrlKey || event.metaKey) {
      window.open(link.href, '_blank');
    } else if (event.shiftKey) {
      window.open(link.href, '_blank');
    } else {
      link.click();
    }
  });

  // エンターキーでもリンクを開く
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.target === card) {
      link.click();
    }
  });
});
```

## カード内に複数のリンクがある場合

```html
<article class="card js-block-link" data-link-target=".card-primary-link">
  <img src="thumbnail.jpg" alt="" />
  <h2>
    <a href="/article/123" class="card-primary-link">記事タイトル</a>
  </h2>
  <p>記事の説明文...</p>
  <div class="card-actions">
    <a href="/article/123/edit">編集</a>
    <a href="/article/123/share">共有</a>
  </div>
</article>
```

```javascript
card.addEventListener('pointerup', (event) => {
  // すべてのリンクとボタンのクリックは無視
  if (event.target.closest('a:any-link, button')) return;

  // それ以外のクリックは主要リンクに転送
  if (!document.getSelection().isCollapsed) return;
  primaryLink.click();
});
```

## アクセシビリティの考慮事項

### スクリーンリーダー対応

```html
<article class="card js-block-link" aria-labelledby="card-title-123">
  <h2 id="card-title-123">
    <a href="/article/123" class="card-link">記事タイトル</a>
  </h2>
  <p>記事の説明文...</p>
</article>
```

### フォーカス管理

```css
/* カード自体はフォーカス不可 */
.js-block-link {
  /* tabindex は設定しない */
}

/* 内部のリンクにフォーカス */
.card-link:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
  border-radius: 4px;
}
```

### キーボード操作

```javascript
card.addEventListener('keydown', (event) => {
  // Enterキー: リンクを開く
  if (event.key === 'Enter') {
    event.preventDefault();
    link.click();
  }

  // Spaceキー: スクロール（デフォルト動作を維持）
  // 特別な処理なし
});
```

## 実装の比較

| 実装方法 | テキスト選択 | 修飾キー | スクリーンリーダー | 複雑さ |
|---------|------------|---------|------------------|-------|
| リンクで囲む | ✅ | ✅ | ❌ 冗長 | 低 |
| Stretched Link | ❌ | ✅ | ✅ | 低 |
| JavaScript | ✅ | ✅ | ✅ | 中 |

**推奨:** JavaScript実装が最もバランスが良い

## よくある質問

**Q: JavaScriptが無効の場合は？**

A: 通常のリンクとして機能する。段階的機能向上の原則に沿っている。

```html
<!-- JSなしでも動作 -->
<article class="card">
  <h2><a href="/article/123">記事タイトル</a></h2>
  <p>記事の説明文...</p>
</article>
```

**Q: パフォーマンスは？**

A: イベント委譲を使用すれば、多数のカードでも問題なし。

```javascript
// イベント委譲版
document.addEventListener('pointerup', (event) => {
  const card = event.target.closest('.js-block-link');
  if (!card) return;

  const link = card.querySelector(card.dataset.linkTarget || '.card-link');
  // 処理...
});
```

## ベストプラクティス

### チェックリスト

- [ ] カード全体がクリッカブルであることを視覚的に示す
- [ ] テキスト選択を妨げない
- [ ] 修飾キー（Ctrl/Cmd + クリック）が機能する
- [ ] スクリーンリーダーで冗長な読み上げがない
- [ ] JavaScriptなしでも基本機能が動作
- [ ] 複数リンクがある場合の優先順位が明確
- [ ] フォーカス表示が適切

### 推奨パターン

```javascript
// 再利用可能なクラス
class BlockLink {
  constructor(element, options = {}) {
    this.element = element;
    this.linkSelector = options.linkSelector || '.card-link';
    this.link = element.querySelector(this.linkSelector);

    if (!this.link) return;

    this.init();
  }

  init() {
    this.element.addEventListener('pointerup', this.handleClick.bind(this));
  }

  handleClick(event) {
    if (event.target.closest('a:any-link, button')) return;
    if (!document.getSelection().isCollapsed) return;

    this.openLink(event);
  }

  openLink(event) {
    if (event.ctrlKey || event.metaKey || event.shiftKey) {
      window.open(this.link.href, '_blank');
    } else {
      this.link.click();
    }
  }
}

// 使用例
document.querySelectorAll('.js-block-link').forEach((card) => {
  new BlockLink(card);
});
```

## 関連ナレッジ

- [クリックターゲット拡張](./click-target-areas.md)
- [アクセシブルなリンク](./accessible-links.md)
- [段階的機能向上](../progressive-enhancement.md)
