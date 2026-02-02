---
title: CSS Tree View Indentation（ツリービューのインデント実装）
category: css/layout
tags: [tree-view, indentation, grid, custom-properties, nested-ui]
browser_support: Chrome 57+, Safari 10.1+, Firefox 52+
created: 2026-01-31
updated: 2026-01-31
---

# CSS Tree View Indentation（ツリービューのインデント実装）

> 出典: https://ishadeed.com/article/tree-view-css-indent/
> 追加日: 2026-01-31

## 概要

**Tree View Indentation** は、ネストされた階層構造のUIで各レベルに応じて段階的にインデントを適用するレイアウトパターン。ファイルエクスプローラー、ドキュメント構造、デザインツールのレイヤーパネルなど、多くのアプリケーションで使用される。

**一般的な使用例:**
- ファイルシステムエクスプローラー（VS Code、GitHub）
- ドキュメントアウトライン
- レイヤーパネル（Figma、Adobe製品）
- 階層データ構造の表示

## 実装アプローチの比較

### 1. CSS Grid + カスタムプロパティ（GitHubの手法）

**推奨アプローチ**: グリッドでスペーサー、トグル、コンテンツのエリアを定義し、カスタムプロパティで動的にインデントを計算。

```css
.TreeView-item {
  --toggle-width: 1rem;
  --level: 1;
  --indent-size: 8px;
  --spacer-col: max(
    var(--indent-size),
    calc((var(--level) - 1) * var(--indent-size))
  );

  display: grid;
  grid-template-columns: var(--spacer-col) var(--toggle-width) 1fr;
  grid-template-areas: "spacer toggle content";
}

.spacer { grid-area: spacer; }
.toggle { grid-area: toggle; }
.content { grid-area: content; }
```

**利点:**
- アイテムごとに個別にインデントを管理
- トグルボタンがない場合でもスペースを維持
- LTR/RTL両対応
- ハードコードされた値に依存しない

**実装例:**

```html
<div class="TreeView-item" style="--level: 1">
  <div class="spacer"></div>
  <button class="toggle" aria-expanded="false">
    <svg><!-- chevron icon --></svg>
  </button>
  <span class="content">Root Item</span>
</div>

<div class="TreeView-item" style="--level: 2">
  <div class="spacer"></div>
  <button class="toggle" aria-expanded="false">
    <svg><!-- chevron icon --></svg>
  </button>
  <span class="content">Child Item</span>
</div>

<div class="TreeView-item" style="--level: 3">
  <div class="spacer"></div>
  <div class="toggle"></div> <!-- トグルなし -->
  <span class="content">Nested Item</span>
</div>
```

### 2. Flexbox + Padding（Adobe / Photoshop Webの手法）

```css
.tree-item {
  display: flex;
  gap: 8px;
}

.tree-item[data-indent="2"] .first-column {
  padding-inline-end: calc(2 * 12px);
}

.tree-item[data-indent="3"] .first-column {
  padding-inline-end: calc(3 * 12px);
}
```

**考慮事項:**
- シンプルな構造で理解しやすい
- 深いネストに対して複数のルールが必要
- コンテンツサイズが可変の場合に予測しにくい

### 3. 複数のスペーサー要素（Figmaの手法）

```html
<div class="object_row">
  <span class="object_row--indents">
    <span class="object_row--indent"></span>
    <span class="object_row--indent"></span>
    <!-- ネストレベルごとに繰り返し -->
    <span class="svg-container object_row--expandCaret"></span>
  </span>
  <span class="object_row--layerIcon"></span>
  <span class="object_row--rowText">Item Name</span>
</div>
```

**欠点:**
- JavaScriptでスペーサー要素を管理する必要がある
- DOMが複雑になる
- 動的な構造では保守が困難

### 4. Padding + 疑似要素（Adobe Spectrumの手法）

```css
.tree-item {
  position: relative;
  padding-left: calc(var(--depth) * 24px);
}

.tree-item::before {
  content: "";
  position: absolute;
  inset: 0;
  /* アイテム全体をクリック可能にする */
}
```

**利点:**
- シンプルな実装
- 全体がクリック可能

**欠点:**
- トグルボタンとの位置調整が必要
- 複雑なレイアウトには不向き

## 推奨実装パターン

### CSS Grid + カスタムプロパティ（ベストプラクティス）

```css
.TreeView {
  --indent-size: 8px;
}

.TreeView-item {
  --level: 1;
  --toggle-width: 1rem;
  --spacer-width: max(
    var(--indent-size),
    calc((var(--level) - 1) * var(--indent-size))
  );

  display: grid;
  grid-template-columns: var(--spacer-width) var(--toggle-width) 1fr;
  grid-template-areas: "spacer toggle content";

  /* パフォーマンス最適化 */
  content-visibility: auto;
  contain-intrinsic-size: auto 2rem;
}

/* ネストされたアイテムのレベルを継承 */
.TreeView-item .TreeView-item {
  --level: calc(var(--level) + 1);
}
```

### カスタムプロパティ戦略

親レベルで変数を定義し、子孫で継承:

```css
.TreeView {
  --indent-size: 8px;
}

.TreeView-item {
  --level: 1;
}

/* ネストごとにレベルを増やす */
.TreeView-item .TreeView-item {
  --level: calc(var(--level) + 1);
}
```

**JavaScript で動的にレベルを設定:**

```javascript
document.querySelectorAll('.TreeView-item').forEach((item, index) => {
  const depth = getDepthFromDOM(item); // カスタム関数
  item.style.setProperty('--level', depth);
});
```

## アクセシビリティの考慮事項

### キーボードナビゲーション

トグルボタンはフォーカス可能な要素にする:

```html
<button class="tree-toggle" aria-expanded="false" aria-label="展開する">
  <svg aria-hidden="true"><!-- chevron icon --></svg>
</button>
<span class="tree-label">アイテム名</span>
```

### スクリーンリーダー対応

```html
<div role="tree" aria-label="ファイルツリー">
  <div role="treeitem" aria-level="1" aria-expanded="true">
    <button class="tree-toggle">
      <svg aria-hidden="true"><!-- icon --></svg>
    </button>
    <span>ルートフォルダ</span>
  </div>

  <div role="treeitem" aria-level="2" aria-expanded="false">
    <button class="tree-toggle">
      <svg aria-hidden="true"><!-- icon --></svg>
    </button>
    <span>サブフォルダ</span>
  </div>
</div>
```

### クリック可能エリアの確保

最低44px×44pxのタッチターゲットを確保:

```css
.tree-toggle {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

## ブラウザサポート

| 機能 | サポート |
|------|---------|
| CSS Grid | Chrome 57+, Safari 10.1+, Firefox 52+ |
| CSS カスタムプロパティ | Chrome 49+, Safari 9.1+, Firefox 31+ |
| `content-visibility` | Chrome 85+, Edge 85+ (Firefox 実験的) |
| `calc()` + カスタムプロパティ | Chrome 49+, Safari 9.1+, Firefox 31+ |
| `max()` 関数 | Chrome 79+, Safari 15.4+, Firefox 75+ |

## よくある落とし穴

### ハードコードされた深さの値（避けるべき）

```css
/* ❌ 避けるべき */
.level-1 { margin-left: 8px; }
.level-2 { margin-left: 16px; }
.level-3 { margin-left: 24px; }
.level-4 { margin-left: 32px; }
/* ... 無限に続く */
```

**問題点:**
- スケーラブルでない
- 保守が困難
- ネストレベルが増えるたびに追加が必要

### JavaScriptへの過度な依存（避けるべき）

```javascript
// ❌ 避けるべき
function createIndent(level) {
  const container = document.createElement('div');
  for (let i = 0; i < level; i++) {
    const spacer = document.createElement('span');
    spacer.className = 'indent-spacer';
    container.appendChild(spacer);
  }
  return container;
}
```

**問題点:**
- メンテナンスの負担が増加
- DOMサイズが肥大化
- パフォーマンスに悪影響

### 固定幅の使用（避けるべき）

```css
/* ❌ 避けるべき */
.tree-item {
  padding-left: 16px; /* 固定値 */
}
```

**問題点:**
- ズーム時に崩れる
- アクセシビリティの問題（拡大表示のユーザー）
- レスポンシブに対応できない

## パフォーマンス最適化

大量のツリーアイテムがある場合、`content-visibility` でレンダリングを最適化:

```css
.TreeView-item {
  /* 画面外のアイテムのレイアウト計算をスキップ */
  content-visibility: auto;

  /* レイアウトシフト防止のためスペースを確保 */
  contain-intrinsic-size: auto 2rem;
}
```

**効果:**
- 初期レンダリング時間の短縮
- スクロールパフォーマンスの向上
- メモリ使用量の削減

## 実践例

### 完全な実装例

```html
<div class="TreeView">
  <div class="TreeView-item" style="--level: 1">
    <div class="spacer"></div>
    <button class="toggle" aria-expanded="true">▼</button>
    <span class="content">📁 src</span>
  </div>

  <div class="TreeView-item" style="--level: 2">
    <div class="spacer"></div>
    <button class="toggle" aria-expanded="true">▼</button>
    <span class="content">📁 components</span>
  </div>

  <div class="TreeView-item" style="--level: 3">
    <div class="spacer"></div>
    <div class="toggle"></div>
    <span class="content">📄 Button.tsx</span>
  </div>

  <div class="TreeView-item" style="--level: 3">
    <div class="spacer"></div>
    <div class="toggle"></div>
    <span class="content">📄 Card.tsx</span>
  </div>
</div>
```

```css
.TreeView {
  --indent-size: 16px;
  font-family: system-ui, sans-serif;
}

.TreeView-item {
  --level: 1;
  --toggle-width: 1.5rem;
  --spacer-width: max(
    var(--indent-size),
    calc((var(--level) - 1) * var(--indent-size))
  );

  display: grid;
  grid-template-columns: var(--spacer-width) var(--toggle-width) 1fr;
  grid-template-areas: "spacer toggle content";
  align-items: center;
  padding-block: 0.25rem;

  /* ホバー時のハイライト */
  transition: background-color 0.15s ease;
}

.TreeView-item:hover {
  background-color: #f0f0f0;
}

.spacer {
  grid-area: spacer;
}

.toggle {
  grid-area: toggle;
  border: none;
  background: transparent;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  grid-area: content;
}
```

## 関連ナレッジ

- [CSS Grid 基礎](./layout-basics.md) - グリッドレイアウトの基本
- [CSS カスタムプロパティ](../values/custom-properties.md) - CSS変数の活用
- [Container Query](./container-query.md) - コンテナクエリによるレスポンシブ対応

---
