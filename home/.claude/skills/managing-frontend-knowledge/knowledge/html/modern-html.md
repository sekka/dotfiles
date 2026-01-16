---
title: モダン HTML 要素
category: html
tags: [dialog, details, search, picture, semantic-html]
browser_support: 全モダンブラウザ対応
created: 2025-01-16
updated: 2025-01-16
---

# モダン HTML 要素

セマンティックHTML、インタラクティブ要素、フォーム関連のナレッジ集。

---

## 令和の HTML 要素

> 出典: https://zenn.dev/necscat/articles/bc9bba54babaf5
> 執筆日: 2024年
> 追加日: 2025-12-17

モダンブラウザで使える便利な HTML 要素のまとめ。

### dialog 要素（モーダル）

JavaScript なしでモーダルの基本機能を実現。

```html
<dialog id="modal">
  <div>モーダルのコンテンツ</div>
  <form method="dialog">
    <button>閉じる</button>
  </form>
</dialog>

<button onclick="document.getElementById('modal').showModal()">
  モーダルを開く
</button>
```

```css
/* 背景のオーバーレイ */
dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

/* 開閉アニメーション */
dialog {
  opacity: 0;
  transition: opacity 0.3s;
}

dialog[open] {
  opacity: 1;
}
```

```javascript
const dialog = document.getElementById("modal");

// モーダルを開く
dialog.showModal();

// モーダルを閉じる
dialog.close();

// 閉じたときのイベント
dialog.addEventListener("close", () => {
  console.log("モーダルが閉じられました");
});
```

**ブラウザ対応:** Chrome 37+, Firefox 98+, Safari 15.4+

### details / summary 要素（アコーディオン）

JavaScript なしでアコーディオンを実装。

```html
<details>
  <summary>よくある質問</summary>
  <p>回答の内容がここに入ります。</p>
</details>

<!-- デフォルトで開いた状態 -->
<details open>
  <summary>開いた状態で表示</summary>
  <p>内容</p>
</details>
```

```css
/* マーカーのカスタマイズ */
summary {
  list-style: none;
  cursor: pointer;
}

summary::marker {
  display: none;
}

summary::before {
  content: "▶";
  margin-right: 0.5em;
  transition: transform 0.2s;
}

details[open] summary::before {
  transform: rotate(90deg);
}

/* アニメーション（grid trick） */
details > *:not(summary) {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s;
}

details[open] > *:not(summary) {
  grid-template-rows: 1fr;
}
```

**ブラウザ対応:** 全モダンブラウザ対応

### search 要素（検索ランドマーク）

検索フォームのセマンティックなラッパー。スクリーンリーダーが検索領域として認識する。

```html
<search>
  <form action="/search" method="get">
    <label for="query">サイト内を検索</label>
    <input type="search" name="q" id="query" placeholder="キーワードを入力" />
    <button type="submit">検索</button>
  </form>
</search>
```

`<div role="search">` の代替として使用可能。

**ブラウザ対応:** Chrome 118+, Firefox 118+, Safari 17+

### picture 要素（レスポンシブ画像）

画面幅やフォーマットに応じて最適な画像を配信。

```html
<picture>
  <!-- WebP対応ブラウザ用 -->
  <source srcset="image.webp" type="image/webp" />

  <!-- 大画面用 -->
  <source srcset="large.jpg" media="(min-width: 768px)" width="800" height="600" />

  <!-- フォールバック -->
  <img src="small.jpg" alt="説明" width="400" height="300" loading="lazy" />
</picture>
```

**ポイント:**
- `<source>` は上から順に評価される
- `type` でフォーマット、`media` で画面幅を指定
- `<img>` は必須（フォールバック兼アクセシビリティ）

### button 要素の type 属性

```html
<!-- フォーム送信（デフォルト） -->
<button type="submit">送信</button>

<!-- フォーム送信しない -->
<button type="button" id="js-trigger">クリック</button>

<!-- フォームリセット -->
<button type="reset">リセット</button>
```

**注意:** `type` を省略すると `submit` になる。JS でクリックイベントを処理する場合は `type="button"` を明示。

### input の新しい type

```html
<!-- 日付 -->
<input type="date" />
<input type="datetime-local" />
<input type="time" />

<!-- 数値 -->
<input type="number" min="0" max="100" step="1" />
<input type="range" min="0" max="100" />

<!-- その他 -->
<input type="color" />
<input type="search" />
<input type="tel" />
<input type="url" />
```

### loading 属性

```html
<!-- 画像の遅延読み込み -->
<img src="image.jpg" alt="" width="600" height="400" loading="lazy" />

<!-- iframe の遅延読み込み -->
<iframe src="https://example.com" loading="lazy" width="560" height="315"></iframe>
```

**重要:**
- `width` と `height` は CLS 対策のため必須
- ファーストビューの画像には使わない（LCP 悪化）
- 詳細は [パフォーマンス最適化](../cross-cutting/performance/performance-optimization.md) を参照

### decoding 属性

```html
<img src="image.jpg" alt="" decoding="async" />
```

画像デコードを非同期化。ただし、モダンブラウザではデフォルトで最適化されるため効果は限定的。

---
