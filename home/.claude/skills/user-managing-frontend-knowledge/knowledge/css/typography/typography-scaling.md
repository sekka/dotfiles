---
title: タイポグラフィとスペーシングのスケーリング設計
category: css/typography
tags: [typography, modular-scale, fibonacci, spacing, harmonic, 2025]
browser_support: 全モダンブラウザ対応
created: 2026-01-19
updated: 2026-01-19
---

# タイポグラフィとスペーシングのスケーリング設計

> 出典: https://css-notes.com/layout/typography-scaling
> 執筆日: 2025年12月頃
> 追加日: 2026-01-19

数学的に調和のとれた比率を使用してフォントサイズとスペーシングを設計する手法。モジュラースケール、ハーモニックモジュラースケール、フィボナッチ数列を活用して、視覚的に美しく情報階層を明確にします。

## 基本概念

**モジュラースケーリング**: 完全五度（1.5）のような数学的に調和のとれた比率を使用して、バランスの取れたサイズバリエーションを作成します。

> "Typography has the obvious duty to convey information through letters."
> — Emil Rudolph

スケーリングの決定は、情報階層と可読性に直接影響します。

## 1. ハーモニックモジュラースケール

### コンセプト

**調和級数の分数**（8/8, 8/7, 8/6, 8/5...）を使用することで、以下を実現：

- 基準サイズの周辺での細かいバリエーション
- 音楽的音程に対応する数学的調和
- 日本語/CJK テキストに標準的な幾何学的スケーリングより適している

### 実装例

```css
:root {
  --fz--base: 1rem;      /* 8/8 */
  --fz--l: calc(1rem * 8/7);     /* 約 1.14rem */
  --fz--xl: calc(1rem * 8/6);    /* 約 1.33rem */
  --fz--2xl: calc(1rem * 8/5);   /* 1.6rem */
  --fz--3xl: calc(1rem * 8/4);   /* 2rem */
  --fz--4xl: calc(1rem * 8/3);   /* 約 2.67rem */
}

h1 { font-size: var(--fz--4xl); }
h2 { font-size: var(--fz--3xl); }
h3 { font-size: var(--fz--2xl); }
h4 { font-size: var(--fz--xl); }
p  { font-size: var(--fz--base); }
small { font-size: calc(1rem * 7/8); } /* 小サイズ */
```

### 比較：幾何学的スケール vs ハーモニックスケール

| スケール | 比率 | 適用 |
|---------|------|------|
| 幾何学的（例: 1.25） | 1, 1.25, 1.56, 1.95, 2.44 | 欧文、見出し重視 |
| ハーモニック（8基準） | 1, 1.14, 1.33, 1.6, 2.0 | 日本語、本文重視 |

## 2. フィボナッチ数列によるスペーシング

### コンセプト

フィボナッチ数列（1, 1, 2, 3, 5, 8, 13...）をスペーシング単位に適用することで：

- 縦のリズムを維持
- 黄金比（約1.618）に近似する美しい間隔
- 数学的一貫性

### 実装例：4px リズム単位

```css
:root {
  /* 基準単位: 4px */
  --space-1: 5px;   /* Fibonacci: 1 × 5 */
  --space-2: 10px;  /* Fibonacci: 2 × 5 */
  --space-3: 15px;  /* Fibonacci: 3 × 5 */
  --space-5: 20px;  /* Fibonacci: 5 × 4 */
  --space-8: 30px;  /* Fibonacci: 8 × 4 (近似) */
  --space-13: 50px; /* Fibonacci: 13 × 4 (近似) */
  --space-21: 80px; /* Fibonacci: 21 × 4 (近似) */
}
```

### 4px と 8px の組み合わせ

```css
/* 4px と 8px のフィボナッチ進行の組み合わせ */
--spacing-tokens: 5, 10, 15, 20, 30, 40, 50, 60, 70, 80px;
```

- 縦横両方の配置ニーズに対応
- より柔軟なスペーシング選択肢

### 使用例

```css
.card {
  padding: var(--space-5);        /* 20px */
  margin-bottom: var(--space-8);  /* 30px */
}

section {
  padding-block: var(--space-13); /* 50px */
}

.hero {
  padding-block: var(--space-21); /* 80px */
}
```

## 3. ハーフレディングによる line-height 管理

### コンセプト

**イノベーション**: line-height を直接指定するのではなく、**ハーフレディング変数**を通じて管理します。

```css
* {
  line-height: calc(1em + var(--hl) * 2);
}
```

### 利点

- さまざまなフォントサイズ間で縦のリズムを維持
- 大きなテキストでの過度な line-height を防止
- ハーフレディングトリミング計算を簡素化

### 実装例

```css
:root {
  --hl--tight: 0.125em;  /* line-height: 1.25 相当 */
  --hl--base: 0.25em;    /* line-height: 1.5 相当 */
  --hl--loose: 0.5em;    /* line-height: 2.0 相当 */
}

body {
  line-height: calc(1em + var(--hl--base) * 2); /* 1.5 */
}

h1 {
  line-height: calc(1em + var(--hl--tight) * 2); /* 1.25 */
}

blockquote {
  line-height: calc(1em + var(--hl--loose) * 2); /* 2.0 */
}
```

### ハーフレディングトリミングとの統合

```css
.heading {
  line-height: calc(1em + var(--hl--tight) * 2);

  /* 上下のハーフレディングを除去 */
  margin-block: calc(-1 * var(--hl--tight));
}
```

## 実践的なシステム例

### デザイントークン定義

```css
:root {
  /* タイポグラフィスケール（ハーモニック 8基準） */
  --fz--xs: calc(1rem * 7/8);
  --fz--sm: calc(1rem * 8/8);
  --fz--base: 1rem;
  --fz--md: calc(1rem * 8/7);
  --fz--lg: calc(1rem * 8/6);
  --fz--xl: calc(1rem * 8/5);
  --fz--2xl: calc(1rem * 8/4);
  --fz--3xl: calc(1rem * 8/3);
  --fz--4xl: calc(1rem * 8/2);

  /* スペーシング（フィボナッチ + 4px リズム） */
  --space-1: 5px;
  --space-2: 10px;
  --space-3: 15px;
  --space-5: 20px;
  --space-8: 30px;
  --space-13: 50px;
  --space-21: 80px;

  /* ハーフレディング */
  --hl--tight: 0.125em;
  --hl--base: 0.25em;
  --hl--loose: 0.5em;
}
```

### 適用例

```css
h1 {
  font-size: var(--fz--4xl);
  line-height: calc(1em + var(--hl--tight) * 2);
  margin-block: calc(-1 * var(--hl--tight)) var(--space-8);
}

h2 {
  font-size: var(--fz--3xl);
  line-height: calc(1em + var(--hl--tight) * 2);
  margin-block: calc(-1 * var(--hl--tight)) var(--space-5);
}

p {
  font-size: var(--fz--base);
  line-height: calc(1em + var(--hl--base) * 2);
  margin-bottom: var(--space-5);
}

.card {
  padding: var(--space-8);
  gap: var(--space-5);
}
```

## スケール比較表

### 一般的なモジュラースケール比率

| 名称 | 比率 | 用途 |
|------|------|------|
| 短二度 | 1.067 | 控えめな階層 |
| 長二度 | 1.125 | 微妙な変化 |
| 短三度 | 1.2 | バランス型 |
| 長三度 | 1.25 | 明確な階層 |
| 完全四度 | 1.333 | 強い階層 |
| 完全五度 | 1.5 | 劇的な階層 |
| 黄金比 | 1.618 | 自然な調和 |

### ハーモニックスケール（8基準）

| 比率 | 値 | 音楽的等価 |
|------|----|---------|
| 8/8 | 1.0 | ユニゾン |
| 8/7 | 1.143 | 長二度 |
| 8/6 | 1.333 | 完全四度 |
| 8/5 | 1.6 | 長六度 |
| 8/4 | 2.0 | オクターブ |

## ブラウザサポート

| 機能 | サポート状況 |
|------|-------------|
| CSS `calc()` | 全モダンブラウザ ✅ |
| CSS カスタムプロパティ | 全モダンブラウザ ✅ |
| `1em` 単位 | 全ブラウザ ✅ |

## ユースケース

- デザインシステムの基盤
- タイポグラフィスケールの定義
- コンポーネントライブラリのスペーシングシステム
- 縦のリズムの維持
- 情報階層の可視化

## 注意点

### 1. フォントによる調整

```css
/* 欧文フォント */
.latin-font {
  --fz--scale-ratio: 1.5; /* 完全五度 */
}

/* 日本語フォント */
.japanese-font {
  --fz--scale-ratio: 8/6; /* ハーモニック */
}
```

### 2. アクセシビリティ

```css
/* ユーザーのフォントサイズ設定を尊重 */
:root {
  font-size: 100%; /* ブラウザデフォルトを使用 */
}

/* rem 単位で相対的にスケーリング */
h1 {
  font-size: calc(1rem * var(--fz--4xl));
}
```

### 3. レスポンシブ対応

```css
/* clamp() と組み合わせてフルイド化 */
h1 {
  font-size: clamp(
    var(--fz--2xl),
    4vw,
    var(--fz--4xl)
  );
}
```

## 参考リソース

- [Modular Scale Calculator](https://www.modularscale.com/)
- [Type Scale Generator](https://typescale.com/)
- [Every Layout - Modular Scale](https://every-layout.dev/rudiments/modular-scale/)

---
