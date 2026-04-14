---
title: レイアウトプリミティブ（Every Layout / CUBE CSS）
category: css/layout
tags: [every-layout, cube-css, primitives, composition, bottom-up, 2025]
browser_support: 全モダンブラウザ対応
created: 2026-01-19
updated: 2026-01-19
---

# レイアウトプリミティブ（Every Layout / CUBE CSS）

> 出典: https://yuheiy.com/blog/2025/flexible-layout-compositions
> 執筆日: 2025年1月
> 追加日: 2026-01-19

Every Layout フレームワークが提唱する、メディアクエリを使わずに自動調整可能なレイアウトパターン集。組み合わせて複合的なレイアウトを構築できる「プリミティブ（原始的な構成要素）」として設計されています。

## Every Layout の哲学

### コアコンセプト

> "ウェブはデフォルトでレスポンシブである"

従来の 960px 固定幅レイアウトではなく、ウェブの本来の性質を活かした柔軟なアプローチを推奨します。

### 設計原則

**重要**: 「特定の画面サイズに当てはめる」のではなく、「コンテンツをどのように見せたいか」を基準に値を設定します。

```css
/* ❌ 画面サイズ基準 */
.container {
  max-width: 1200px; /* なぜ1200px？ */
}

/* ✅ コンテンツ基準 */
.container {
  max-width: 65ch; /* 読みやすい1行の文字数 */
}
```

## レイアウトプリミティブの特徴

Every Layout が定義するプリミティブには 2 つの特徴があります：

1. **メディアクエリなしで自動調整が可能**
2. **組み合わせて複合的なレイアウトを構築できる**

### メディアクエリの限界

従来のメディアクエリはビューポート幅のみに基づくため、要素が実際に配置される場所（サイドバー内、グリッドの中など）を考慮できません。

プリミティブは**要素自身の大きさに応じた柔軟な調整**を実現します。

## CUBE CSS との関係

**CUBE CSS** は Andy Bell による後続フレームワークで、Every Layout の「アップデート版」として位置づけられます。

- 不要なものを削除
- 不足していたものを追加
- より実用的なパターン集

## 主要なプリミティブパターン

### 1. Flow（垂直方向のスタック）

**目的**: 要素を垂直方向に一律したマージンで積み重ねます。

```css
.flow > * + * {
  margin-top: var(--flow-space, 1em);
}
```

**使用例**:

```html
<article class="flow">
  <h1>タイトル</h1>
  <p>段落1</p>
  <p>段落2</p>
  <blockquote>引用</blockquote>
</article>
```

**特徴**:
- 最初の要素には margin-top がない
- カスタムプロパティで間隔を調整可能
- 縦方向の余白を一元管理

### 2. Wrapper（中央配置と最大幅制限）

**目的**: コンテンツを中央配置し、最大幅を制限します。

```css
.wrapper {
  max-width: var(--wrapper-max-width, 65ch);
  margin-inline: auto;
  padding-inline: var(--wrapper-padding, 1rem);
}
```

**使用例**:

```html
<div class="wrapper">
  <p>この段落は最大65文字幅で中央配置されます。</p>
</div>
```

**カスタマイズ**:

```css
/* 読みやすい本文 */
.wrapper--text {
  --wrapper-max-width: 65ch;
}

/* 広めのコンテンツ */
.wrapper--wide {
  --wrapper-max-width: 90rem;
}
```

### 3. Cluster（水平配置で自動折り返し）

**目的**: 要素を水平に配置し、スペースがなくなれば自動的に折り返します。

```css
.cluster {
  display: flex;
  flex-wrap: wrap;
  gap: var(--cluster-space, 1rem);
  justify-content: var(--cluster-justify, flex-start);
  align-items: var(--cluster-align, center);
}
```

**使用例**:

```html
<div class="cluster">
  <button>ボタン1</button>
  <button>ボタン2</button>
  <button>ボタン3</button>
</div>
```

**ユースケース**:
- ボタングループ
- タグリスト
- ナビゲーションメニュー
- ツールバー

### 4. Sidebar（サイドバー付きレイアウト）

**目的**: サイドバーとメインコンテンツを横並びにし、狭い画面では自動的に縦積みします。

```css
.sidebar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sidebar-gap, 1rem);
}

.sidebar > :first-child {
  flex-basis: var(--sidebar-width, 20rem);
  flex-grow: 1;
}

.sidebar > :last-child {
  flex-basis: 0;
  flex-grow: 999;
  min-width: var(--sidebar-content-min, 50%);
}
```

**使用例**:

```html
<div class="sidebar">
  <aside>サイドバー</aside>
  <main>メインコンテンツ</main>
</div>
```

**動作**:
- サイドバーの幅が確保できる → 横並び
- スペースが不足 → 縦積み（サイドバーが上）

### 5. Switcher（条件付き切り替え）

**目的**: 2つの要素を、コンテナ幅に応じて横並びまたは縦積みに切り替えます。

```css
.switcher {
  display: flex;
  flex-wrap: wrap;
  gap: var(--switcher-gap, 1rem);
}

.switcher > * {
  flex-grow: 1;
  flex-basis: calc((var(--switcher-threshold, 30rem) - 100%) * 999);
}
```

**使用例**:

```html
<div class="switcher">
  <div>左側のコンテンツ</div>
  <div>右側のコンテンツ</div>
</div>
```

**動作原理**:
- `flex-basis` が負の値 → 縦積み
- `flex-basis` が正の値 → 横並び

関連: [メディアクエリ不要のレスポンシブレイアウト](css/layout/responsive-without-mediaquery.md)

### 6. Grid（自動調整グリッド）

**目的**: カラム数を自動的に調整するグリッドレイアウト。

```css
.grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(var(--grid-min, 15rem), 100%), 1fr)
  );
  gap: var(--grid-gap, 1rem);
}
```

**使用例**:

```html
<div class="grid">
  <div class="card">カード1</div>
  <div class="card">カード2</div>
  <div class="card">カード3</div>
  <div class="card">カード4</div>
</div>
```

**動作**:
- コンテナが広い → 複数カラム
- コンテナが狭い → カラム数を自動削減
- 各カラムの最小幅は `--grid-min` で指定

### 7. Repel（両端配置または積み重ね）

**目的**: 2つの要素を両端に配置し、スペースがなければ縦積みします。

```css
.repel {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: var(--repel-align, center);
  gap: var(--repel-gap, 1rem);
}

.repel > * {
  flex-basis: auto;
  flex-grow: 1;
}
```

**使用例**:

```html
<div class="repel">
  <div class="logo">ロゴ</div>
  <nav>ナビゲーション</nav>
</div>
```

**ユースケース**:
- ヘッダー（ロゴとナビゲーション）
- カードフッター（日付とボタン）
- 商品情報（名前と価格）

## ボトムアップな設計哲学

### 内からの構成

> "スクリーンサイズごとに規定するのではなく、局所的ルールから全体が自己組織化して立ち上がる"

**従来のトップダウン**:
```
画面サイズ → レイアウト → コンポーネント → コンテンツ
```

**Every Layout のボトムアップ**:
```
コンテンツ → プリミティブ → 組み合わせ → 全体レイアウト
```

### 自己組織化の例

```html
<!-- プリミティブの組み合わせ -->
<div class="wrapper">
  <article class="flow">
    <h1>記事タイトル</h1>

    <div class="sidebar">
      <aside class="flow">
        <h2>関連情報</h2>
        <p>...</p>
      </aside>

      <div class="flow">
        <p>本文...</p>

        <div class="grid">
          <div class="card">...</div>
          <div class="card">...</div>
        </div>

        <div class="cluster">
          <button>共有</button>
          <button>保存</button>
        </div>
      </div>
    </div>
  </article>
</div>
```

**結果**: 各プリミティブが独立して動作し、全体として調和のとれたレイアウトが自動的に形成されます。

## 実装例：完全なデザインシステム

### CSS 変数定義

```css
:root {
  /* Flow */
  --flow-space: 1.5rem;

  /* Wrapper */
  --wrapper-max-width: 70ch;
  --wrapper-padding: 1rem;

  /* Cluster */
  --cluster-space: 1rem;

  /* Sidebar */
  --sidebar-width: 20rem;
  --sidebar-gap: 2rem;
  --sidebar-content-min: 50%;

  /* Switcher */
  --switcher-threshold: 30rem;
  --switcher-gap: 1rem;

  /* Grid */
  --grid-min: 15rem;
  --grid-gap: 2rem;

  /* Repel */
  --repel-gap: 1rem;
}
```

### プリミティブの定義

```css
/* Flow */
.flow > * + * {
  margin-top: var(--flow-space, 1em);
}

/* Wrapper */
.wrapper {
  max-width: var(--wrapper-max-width, 65ch);
  margin-inline: auto;
  padding-inline: var(--wrapper-padding, 1rem);
}

/* Cluster */
.cluster {
  display: flex;
  flex-wrap: wrap;
  gap: var(--cluster-space, 1rem);
  justify-content: var(--cluster-justify, flex-start);
  align-items: var(--cluster-align, center);
}

/* Sidebar */
.sidebar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sidebar-gap, 1rem);
}

.sidebar > :first-child {
  flex-basis: var(--sidebar-width, 20rem);
  flex-grow: 1;
}

.sidebar > :last-child {
  flex-basis: 0;
  flex-grow: 999;
  min-width: var(--sidebar-content-min, 50%);
}

/* Switcher */
.switcher {
  display: flex;
  flex-wrap: wrap;
  gap: var(--switcher-gap, 1rem);
}

.switcher > * {
  flex-grow: 1;
  flex-basis: calc((var(--switcher-threshold, 30rem) - 100%) * 999);
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(var(--grid-min, 15rem), 100%), 1fr)
  );
  gap: var(--grid-gap, 1rem);
}

/* Repel */
.repel {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: var(--repel-align, center);
  gap: var(--repel-gap, 1rem);
}
```

### 実用例：ブログページ

```html
<div class="wrapper">
  <header class="repel">
    <a href="/" class="logo">My Blog</a>
    <nav class="cluster">
      <a href="/about">About</a>
      <a href="/posts">Posts</a>
      <a href="/contact">Contact</a>
    </nav>
  </header>

  <main class="sidebar">
    <aside class="flow">
      <h2>カテゴリ</h2>
      <ul class="flow" style="--flow-space: 0.5rem">
        <li><a href="/tech">Tech</a></li>
        <li><a href="/design">Design</a></li>
      </ul>
    </aside>

    <article class="flow">
      <h1>記事タイトル</h1>
      <p>本文...</p>

      <div class="grid">
        <div class="card">関連記事1</div>
        <div class="card">関連記事2</div>
      </div>

      <div class="cluster">
        <button>共有</button>
        <button>保存</button>
      </div>
    </article>
  </main>
</div>
```

## 応用パターン

### パターン1: カスタムプロパティでの局所調整

```html
<div class="flow" style="--flow-space: 3rem">
  <section class="flow" style="--flow-space: 1rem">
    <h2>セクション1</h2>
    <p>内容...</p>
  </section>

  <section class="flow" style="--flow-space: 1rem">
    <h2>セクション2</h2>
    <p>内容...</p>
  </section>
</div>
```

### パターン2: 複合的なレイアウト

```html
<div class="wrapper">
  <div class="switcher">
    <div class="flow">
      <h2>左側</h2>
      <div class="cluster">
        <button>A</button>
        <button>B</button>
      </div>
    </div>

    <div class="grid">
      <div>カード1</div>
      <div>カード2</div>
    </div>
  </div>
</div>
```

## 比較：プリミティブ vs メディアクエリ

| 特徴 | プリミティブ | メディアクエリ |
|------|-------------|---------------|
| 基準 | 要素のサイズ | ビューポート幅 |
| 再利用性 | 高い | 低い |
| コンテキスト考慮 | 可能 | 不可能 |
| 保守性 | 良好 | 複雑化しやすい |
| 学習コスト | 中程度 | 低い |

## ユースケース

- ブログレイアウト全体
- ダッシュボード UI
- マーケティングページ
- ドキュメントサイト
- EC サイトの商品グリッド

## 注意点

### 1. Container Query との統合

```css
/* プリミティブ + Container Query */
.card {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card .cluster {
    --cluster-space: 2rem;
  }
}
```

### 2. パフォーマンス

プリミティブは計算コストが若干高いですが、実用上は問題ありません。大量の要素がある場合は、仮想スクロールなど別の最適化を検討してください。

### 3. ブラウザサポート

| 機能 | サポート状況 |
|------|-------------|
| Flexbox | ✅ 全モダンブラウザ |
| CSS Grid | ✅ 全モダンブラウザ |
| CSS カスタムプロパティ | ✅ 全モダンブラウザ |
| `min()` 関数 | Chrome 79+, Safari 13.1+, Firefox 75+ |

## 関連ナレッジ

- [メディアクエリ不要のレスポンシブレイアウト](css/layout/responsive-without-mediaquery.md)
- [レスポンシブデザインにおける「間」の設計](css/layout/designing-in-between.md)

## 参考リソース

- [Every Layout](https://every-layout.dev/)
- [CUBE CSS](https://cube.fyi/)
- [Andy Bell's Blog](https://andy-bell.co.uk/)

---
