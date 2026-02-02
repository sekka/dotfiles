---
title: CSS Cascade Layers (@layer)
category: css/modern
tags: [cascade, @layer, specificity, architecture, priority, css-reset]
browser_support: Chrome 99+, Firefox 97+, Safari 15.4+, Edge 99+
created: 2026-01-31
updated: 2026-01-31
---

# CSS Cascade Layers (@layer)

> 出典: https://css-tricks.com/css-cascade-layers/
> 執筆日: 2022年2月21日
> 最終更新日: 2025年12月9日
> 執筆者: Miriam Suzanne（OddBirdファウンダー、CSSWG招待専門家）
> 追加日: 2026-01-31

## 概要

CSS Cascade Layers（`@layer`）は、CSSのカスケード順序を明示的に制御するための機能です。従来は詳細度（specificity）と記述順に依存していた優先度を、開発者が意図的にレイヤー化できるようになります。

**なぜ重要か:**
- リセットCSSやフレームワークを低優先度に配置できる
- ユーティリティクラスを最高優先度に設定できる
- 詳細度の戦争（specificity wars）を回避
- 大規模CSSアーキテクチャ（ITCSS、SMACSS等）の実装が容易に

## 基本的な使い方

### レイヤー順序の確立

最初にレイヤーの順序を宣言します。**先に宣言したレイヤーほど優先度が低い**です。

```css
@layer reset, defaults, patterns, components, utilities, overrides;
```

**優先度（低→高）:**
1. `reset` - ブラウザデフォルトスタイルのリセット
2. `defaults` - プロジェクトのデフォルトスタイル
3. `patterns` - 共通パターン
4. `components` - コンポーネント
5. `utilities` - ユーティリティクラス
6. `overrides` - 最優先のオーバーライド

### ブロック形式でレイヤーにスタイルを追加

```css
@layer reset {
  * {
    box-sizing: border-box;
    margin: 0;
  }
}

@layer utilities {
  [data-color='brand'] {
    color: var(--brand, rebeccapurple);
  }

  .text-center {
    text-align: center;
  }
}
```

### スタイルシートのインポート

外部ファイルを特定のレイヤーにインポートできます。

```css
/* framework.css を components.framework レイヤーに */
@import url('framework.css') layer(components.framework);

/* reset.css を reset レイヤーに */
@import url('reset.css') layer(reset);
```

**ネストされたレイヤー:**
- `components.framework` - `components` レイヤー内の `framework` サブレイヤー
- ドット記法でレイヤーを階層化

## レイヤーの優先度ルール

### 基本原則

1. **レイヤー順序が最優先** - 詳細度よりもレイヤー順序が優先される
2. **レイヤー外は最高優先度** - レイヤーに属さないスタイルが最も強い
3. **後から宣言したレイヤーが強い** - 順序宣言での位置が重要

### 実例: 詳細度よりもレイヤーが優先

```css
@layer reset, utilities;

@layer reset {
  button#fancy-button.primary {
    background: gray; /* 詳細度: 0-1-2-1 */
  }
}

@layer utilities {
  .bg-blue {
    background: blue; /* 詳細度: 0-0-1-0 */
  }
}
```

```html
<button id="fancy-button" class="primary bg-blue">ボタン</button>
```

**結果:** 背景色は `blue`
- `utilities` レイヤーが後なので、詳細度が低くても勝つ
- 従来の CSS なら `gray` が勝っていた

### レイヤー外スタイルの優先

```css
@layer components;

@layer components {
  .button {
    background: blue;
  }
}

/* レイヤー外 */
.button {
  background: red;
}
```

**結果:** 背景色は `red`
- レイヤー外のスタイルは常にレイヤー内より強い

## 実践的なパターン

### パターン1: ITCSS アーキテクチャの実装

ITCSS（Inverted Triangle CSS）は、詳細度を徐々に高める設計手法です。

```css
@layer settings, tools, generic, elements, objects, components, utilities;

@layer generic {
  * {
    box-sizing: border-box;
  }
}

@layer elements {
  body {
    font-family: system-ui, sans-serif;
    line-height: 1.5;
  }
}

@layer components {
  .card {
    padding: 1rem;
    border: 1px solid #ccc;
  }
}

@layer utilities {
  .mt-0 { margin-top: 0; }
  .text-center { text-align: center; }
}
```

### パターン2: サードパーティフレームワークの統合

```css
@layer reset, framework, custom, utilities;

/* Bootstrap を framework レイヤーに */
@import url('bootstrap.min.css') layer(framework);

/* カスタムスタイル */
@layer custom {
  .my-component {
    /* framework より優先度が高い */
    color: navy;
  }
}

/* ユーティリティは最優先 */
@layer utilities {
  .text-red {
    color: red !important; /* ここでの !important はレイヤー内でのみ有効 */
  }
}
```

**利点:**
- フレームワークのスタイルを上書きする際、詳細度を無理に上げなくて良い
- ユーティリティクラスが常に最優先

### パターン3: テーマとバリエーション

```css
@layer base, themes, overrides;

@layer base {
  :root {
    --color-primary: blue;
    --color-secondary: gray;
  }

  .button {
    background: var(--color-primary);
    color: white;
  }
}

@layer themes {
  [data-theme='dark'] {
    --color-primary: lightblue;
    --color-secondary: darkgray;
  }
}

@layer overrides {
  .button.special {
    background: gold;
  }
}
```

### パターン4: レスポンシブデザインとレイヤー

```css
@layer mobile, tablet, desktop;

@layer mobile {
  .container {
    width: 100%;
    padding: 1rem;
  }
}

@layer tablet {
  @media (min-width: 768px) {
    .container {
      width: 750px;
      margin: 0 auto;
    }
  }
}

@layer desktop {
  @media (min-width: 1024px) {
    .container {
      width: 1000px;
    }
  }
}
```

## ネストされたレイヤー

レイヤーは階層化できます。

```css
@layer framework {
  @layer reset {
    * {
      margin: 0;
    }
  }

  @layer components {
    .button {
      padding: 0.5rem 1rem;
    }
  }
}

/* または外部から指定 */
@layer framework.theme {
  .button {
    background: var(--theme-color);
  }
}
```

**優先度:**
- `framework.reset` < `framework.components` < `framework.theme`

## !important とレイヤー

`!important` はレイヤー内での優先度を反転させます。

```css
@layer reset, utilities;

@layer reset {
  button {
    background: gray !important;
  }
}

@layer utilities {
  .bg-blue {
    background: blue;
  }
}
```

**結果:** 背景色は `gray`
- `!important` があるため、`reset` レイヤーの方が強くなる
- `!important` は「レイヤーの順序を逆転」させる効果

**推奨:** `!important` の使用は最小限に。レイヤー順序で管理する方が保守性が高い。

## ユースケース

1. **リセットCSSの管理** - リセットを最低優先度に配置
2. **フレームワーク統合** - Bootstrap、Tailwind等を中間レイヤーに
3. **デザインシステム** - コンポーネントライブラリの優先度制御
4. **ユーティリティファースト** - ユーティリティクラスを最高優先度に
5. **レガシーコードの整理** - 既存コードを段階的にレイヤー化
6. **マルチテーマ対応** - テーマ切り替えの優先度管理

## ブラウザサポート

| ブラウザ | 対応バージョン |
|---------|-------------|
| Chrome | 99+ |
| Firefox | 97+ |
| Safari | 15.4+ |
| Edge | 99+ |
| Android Chrome | 144+ |
| iOS Safari | 15.4+ |

**2022年3月時点でメジャーブラウザに実装済み**

## パフォーマンスへの影響

- **レンダリング速度**: レイヤーによるパフォーマンス低下は無視できるレベル
- **開発効率**: 詳細度の計算が不要になり、保守性が向上
- **ファイルサイズ**: レイヤー宣言自体は数十バイト程度

## 注意点

- レイヤー外のスタイルは常に最優先（意図しないオーバーライドに注意）
- レイヤー順序を途中で変更すると混乱の元（最初に全体設計）
- `!important` はレイヤー順序を逆転させる（極力避ける）
- 古いブラウザ対応が必要な場合はポリフィルが必要

## 移行戦略

### 既存プロジェクトへの導入

1. **段階的導入** - まずユーティリティクラスをレイヤー化
2. **リセットから開始** - リセットCSSを `@layer reset` に
3. **フレームワーク分離** - サードパーティを独立レイヤーに
4. **徐々に拡大** - コンポーネントを順次レイヤー化

### 新規プロジェクトでの採用

```css
/* 最初にレイヤー設計 */
@layer reset, base, layout, components, utilities;

/* リセット */
@import url('normalize.css') layer(reset);

/* ベーススタイル */
@layer base {
  :root {
    --spacing-unit: 8px;
  }

  body {
    font-family: system-ui;
  }
}

/* レイアウト */
@layer layout {
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
}

/* コンポーネント */
@layer components {
  .button {
    /* ... */
  }
}

/* ユーティリティ */
@layer utilities {
  .mt-1 { margin-top: var(--spacing-unit); }
}
```

## 関連ナレッジ

- CSSアーキテクチャ（ITCSS、SMACSS、BEM）
- CSS詳細度（Specificity）
- CSS変数（Custom Properties）
- `@scope` - スコープ付きスタイル

## 参考リンク

- [CSS Cascade Layers - CSS-Tricks](https://css-tricks.com/css-cascade-layers/)
- [@layer - MDN](https://developer.mozilla.org/ja/docs/Web/CSS/@layer)
- [CSS Cascading and Inheritance Level 5 - W3C](https://www.w3.org/TR/css-cascade-5/)
- [A Complete Guide to CSS Cascade Layers - CSS-Tricks](https://css-tricks.com/css-cascade-layers/)
