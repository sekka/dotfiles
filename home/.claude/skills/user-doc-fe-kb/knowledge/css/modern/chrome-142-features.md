---
title: Chrome 142 の新しい CSS 機能
category: css/modern
tags: [chrome, target-before, target-after, container-queries, interestfor, view-transitions]
browser_support: Chrome 142+
created: 2026-01-31
updated: 2026-01-31
source: https://coliss.com/articles/build-websites/operation/css/chrome-142-adds-9-new-css-feature.html
---

# Chrome 142 の新しい CSS 機能

## 概要

Chrome 142 では、`:target-before`/`:target-after` 疑似クラス、コンテナクエリ範囲構文、`interestfor` 属性、`document.activeViewTransition` など、9つの新機能が追加されました。

---

## :target-before / :target-after 疑似クラス

### 概要

`:target-before` 疑似クラスと `:target-after` 疑似クラスは、フラットツリーの順序に基づいて、**同一スクロールマーカーグループ内でアクティブなマーカー（`:target-current` に一致）の前または後に位置するスクロールマーカー**に一致します。

### 基本構文

```css
要素::scroll-marker:target-before {
  /* アクティブマーカーより前のスタイル */
}

要素::scroll-marker:target-after {
  /* アクティブマーカーより後のスタイル */
}
```

### 実装例

#### カルーセルのインジケーター

```html
<ul class="carousel">
  <li>スライド1</li>
  <li>スライド2</li>
  <li>スライド3</li>
  <li>スライド4</li>
</ul>

<style>
  .carousel {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
  }

  .carousel > li {
    flex: 0 0 100%;
    scroll-snap-align: center;
  }

  /* インジケーターのデフォルト */
  .carousel > li::scroll-marker {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #ccc;
  }

  /* アクティブマーカー */
  .carousel > li::scroll-marker:target-current {
    background: #333;
  }

  /* アクティブマーカーより前 */
  .carousel > li::scroll-marker:target-before {
    background: #999;
  }

  /* アクティブマーカーより後 */
  .carousel > li::scroll-marker:target-after {
    background: #ddd;
  }
</style>
```

### 視覚的な効果

```
スライド:     [1] [2] [3] [4]
インジケーター: ● ● ○ ○
               ↑ ↑ ↑ ↑
              前 前 現在 後
```

---

## コンテナクエリ範囲構文

### 概要

コンテナクエリで比較演算子（`>`、`<`、`>=`、`<=`）を使用できるようになりました。

### 基本構文

```css
@container style(カスタムプロパティ 演算子 値) {
  /* スタイル */
}
```

### 実装例

#### 1. カスタムプロパティの範囲指定

```css
.card {
  --inner-padding: 2rem;
}

@container style(--inner-padding > 1em) {
  .card {
    border: 2px solid black;
  }
}
```

#### 2. if() 関数での活用

```css
.card {
  background-color: if(
    style(attr(data-columns) > 2): lightblue;
    else: white
  );
}
```

#### 3. 複数条件の組み合わせ

```css
@container style((--width >= 300px) and (--width < 600px)) {
  .card {
    columns: 2;
  }
}
```

### 数値型のサポート

**サポートされる型:**
- 長さ（`px`、`rem`、`em`）
- パーセンテージ（`%`）
- 角度（`deg`、`rad`）
- 時間（`s`、`ms`）
- 数値（`number`）

---

## interestfor 属性

### 概要

`interestfor` 属性は、要素に「興味」を示す動作を追加する属性です。ユーザーがホバーやキーボード操作で「興味を示す」と、ターゲット要素で `InterestEvent` が発生します。

### 基本構文

```html
<button interestfor="ターゲットID">ボタン</button>
<div id="ターゲットID" popover="hint">内容</div>
```

### 実装例

#### 1. ツールチップ

```html
<button interestfor="tooltip-1">ヘルプ</button>
<div id="tooltip-1" popover="hint">
  ここにヘルプテキストが表示されます
</div>

<style>
  [popover="hint"] {
    background: black;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
  }
</style>
```

#### 2. 遅延設定

```html
<button interestfor="delayed-hint" interest-delay="1000">
  1秒ホバーで表示
</button>
<div id="delayed-hint" popover="hint">
  1秒後に表示されます
</div>
```

**デフォルト:** 0.5秒（500ms）

#### 3. JavaScript でのイベントハンドリング

```javascript
document.getElementById('target').addEventListener('interest', (event) => {
  console.log('Interest event triggered');
  console.log('Event type:', event.type);
});
```

### 対応デバイス

- **マウス**: ホバー
- **キーボード**: フォーカス
- **タッチ**: 長押し

---

## document.activeViewTransition

### 概要

デベロッパーは `document.activeViewTransition` プロパティで、現在実行中のビュー遷移オブジェクトを参照できます。遷移が終了すると `null` を返します。

### 従来の問題

```javascript
// 従来: オブジェクトを手動で保存する必要があった
let transition;
document.startViewTransition(() => {
  // DOM 操作
}).then((t) => {
  transition = t;
});

// 後で使用
if (transition) {
  transition.finished.then(() => {
    console.log('遷移完了');
  });
}
```

### 新しい実装

```javascript
// 遷移を開始
document.startViewTransition(() => {
  // DOM 操作
});

// 後で参照
if (document.activeViewTransition) {
  document.activeViewTransition.finished.then(() => {
    console.log('遷移完了');
  });
}
```

### 実装例

#### 遷移のキャンセル

```javascript
function cancelTransition() {
  if (document.activeViewTransition) {
    document.activeViewTransition.skipTransition();
  }
}
```

#### 遷移状態の確認

```javascript
function isTransitioning() {
  return document.activeViewTransition !== null;
}
```

---

## その他の機能

### CSS Nesting の改善

ネスト構文のパフォーマンスが改善されました。

```css
.card {
  background: white;

  &:hover {
    background: #f0f0f0;
  }

  h2 {
    color: #333;

    &:hover {
      color: #0070f3;
    }
  }
}
```

### Scroll-driven Animations の強化

スクロール駆動アニメーションのタイムライン制御が改善されました。

```css
@keyframes slide {
  from { translate: -100% 0; }
  to { translate: 0 0; }
}

.animated {
  animation: slide linear;
  animation-timeline: scroll(root);
}
```

---

## 統合例

すべての機能を組み合わせた実装例：

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* カルーセル */
    .carousel {
      display: flex;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scroll-behavior: smooth;
    }

    .carousel > li {
      flex: 0 0 100%;
      scroll-snap-align: center;
      list-style: none;
      padding: 2rem;
    }

    /* インジケーター */
    .carousel > li::scroll-marker {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #ccc;
      transition: background 0.3s;
    }

    .carousel > li::scroll-marker:target-current {
      background: #0070f3;
      transform: scale(1.2);
    }

    .carousel > li::scroll-marker:target-before {
      background: #666;
    }

    .carousel > li::scroll-marker:target-after {
      background: #ddd;
    }

    /* コンテナクエリ */
    .card {
      --padding: 2rem;
    }

    @container style(--padding > 1rem) {
      .card {
        border: 2px solid #0070f3;
      }
    }

    /* ツールチップ */
    [popover="hint"] {
      background: black;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      border: none;
    }
  </style>
</head>
<body>
  <!-- カルーセル -->
  <ul class="carousel">
    <li>スライド1</li>
    <li>スライド2</li>
    <li>スライド3</li>
  </ul>

  <!-- コンテナクエリ -->
  <div class="card">
    <p>カード</p>
  </div>

  <!-- ツールチップ -->
  <button interestfor="tooltip">ヘルプ</button>
  <div id="tooltip" popover="hint">ヘルプテキスト</div>

  <script>
    // activeViewTransition
    document.startViewTransition(() => {
      // DOM 操作
    });

    setTimeout(() => {
      if (document.activeViewTransition) {
        console.log('遷移中');
      }
    }, 100);
  </script>
</body>
</html>
```

---

## 参考資料

- [Chrome 142 Release Notes](https://developer.chrome.com/blog/new-in-chrome-142)
- [CSS Pseudo-elements - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements)
- [Container Queries - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_container_queries)
- [View Transitions API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)

---

## 関連ナレッジ

- [Chrome 143 の新機能](./chrome-143-features.md)
- [Chrome 144 の新機能](./chrome-144-features.md)
- [CSS カルーセル](../components/css-2025-components.md#css-カルーセル)
- [Container Queries](../selectors/container-queries.md)
- [View Transitions](../animation/view-transitions.md)
