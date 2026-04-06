---
title: レスポンシブデザインにおける「間」の設計
category: css/layout
tags: [responsive, fluid-design, utopia, content-out, design-philosophy, 2025]
browser_support: 全モダンブラウザ対応
created: 2026-01-19
updated: 2026-01-19
---

# レスポンシブデザインにおける「間」の設計

> 出典: https://yuheiy.com/blog/2025/designing-the-in-between
> 執筆日: 2025年1月
> 追加日: 2026-01-19

デザインカンプの固定値と実際のユーザー環境の「間」をどう設計するか。Utopia システムやフルイドタイポグラフィを活用して、コンテンツ主導の柔軟なレスポンシブデザインを実現する哲学と実践。

## 中心的な課題

### ユーザー環境の多様性

**問題**: デザインカンプは通常、375px（モバイル）や1440px（デスクトップ）などの標準ビューポートで作成されますが、実際のユーザー環境は極めて多様です。

- iPhone 13 mini: 375px
- iPhone 13 Pro Max: 428px
- iPad: 768px / 1024px
- MacBook Air 13": 1440px
- 27" iMac: 2560px

**課題**: これらの「間」をどう実装するか？

### 従来のアプローチの限界

```css
/* ❌ 段階的な固定値 */
h1 {
  font-size: 32px;
}

@media (min-width: 768px) {
  h1 {
    font-size: 48px;
  }
}

@media (min-width: 1440px) {
  h1 {
    font-size: 64px;
  }
}
```

**問題点**:
- 768px〜1439px の間は固定サイズ
- ブレークポイントでの急激な変化
- デザインカンプの「間」が未定義

## フルイドタイポグラフィ

### 基本コンセプト

ブレークポイントごとの段階的なサイズ変更ではなく、**ビューポート幅に応じて滑らかに文字サイズを変化**させます。

```css
/* ✅ 滑らかな変化 */
h1 {
  font-size: clamp(2rem, 4vw + 1rem, 4rem);
}
```

**結果**: 320px〜1440px の全ての範囲で、文字サイズが連続的にスケーリングします。

### 利点

- 機械的な計算で保守性が高い
- 全てのビューポートで適切なサイズ
- デザインカンプの「間」が自動的に補完される

### 詳細

フルイドタイポグラフィの詳細な実装は、関連ナレッジ [`css/values/fluid-typography-clamp.md`] を参照してください。

## Utopia システム

### コンセプト

> "タイプスケールと余白のバリエーションを生成するための体系的な方法論"

**Utopia** は、モジュラースケールに基づいてフルイドなタイポグラフィとスペーシングを生成するシステムです。

### 特徴

1. **デザイナーと開発者の共通言語**: 同じ意図に基づいて制作できる
2. **数学的一貫性**: モジュラースケールによる調和のとれたサイズバリエーション
3. **自動生成**: オンライン計算ツールで簡単に設定

### Utopia の構造

```
最小ビューポート（例: 320px）
  ↓
最小タイプスケール（例: 1rem 基準、比率 1.2）
  ↓
最大ビューポート（例: 1440px）
  ↓
最大タイプスケール（例: 1.125rem 基準、比率 1.333）
  ↓
フルイドな中間値を clamp() で自動生成
```

### 実装例

Utopia 計算ツール（https://utopia.fyi/）で生成した CSS:

```css
:root {
  /* フルイドタイポグラフィ */
  --step--2: clamp(0.7813rem, 0.7747rem + 0.0326vw, 0.8rem);
  --step--1: clamp(0.9375rem, 0.9158rem + 0.1087vw, 1rem);
  --step-0: clamp(1.125rem, 1.0815rem + 0.2174vw, 1.25rem);
  --step-1: clamp(1.35rem, 1.2761rem + 0.3696vw, 1.5625rem);
  --step-2: clamp(1.62rem, 1.5041rem + 0.5793vw, 1.9531rem);
  --step-3: clamp(1.944rem, 1.771rem + 0.8651vw, 2.4414rem);
  --step-4: clamp(2.3328rem, 2.0827rem + 1.2504vw, 3.0518rem);
  --step-5: clamp(2.7994rem, 2.4462rem + 1.7658vw, 3.8147rem);

  /* フルイドスペーシング */
  --space-3xs: clamp(0.3125rem, 0.3125rem + 0vw, 0.3125rem);
  --space-2xs: clamp(0.5625rem, 0.5408rem + 0.1087vw, 0.625rem);
  --space-xs: clamp(0.875rem, 0.8533rem + 0.1087vw, 0.9375rem);
  --space-s: clamp(1.125rem, 1.0815rem + 0.2174vw, 1.25rem);
  --space-m: clamp(1.6875rem, 1.6223rem + 0.3261vw, 1.875rem);
  --space-l: clamp(2.25rem, 2.163rem + 0.4348vw, 2.5rem);
  --space-xl: clamp(3.375rem, 3.2446rem + 0.6522vw, 3.75rem);
  --space-2xl: clamp(4.5rem, 4.3261rem + 0.8696vw, 5rem);
  --space-3xl: clamp(6.75rem, 6.4891rem + 1.3043vw, 7.5rem);
}
```

### 使用例

```css
h1 {
  font-size: var(--step-5);
  margin-bottom: var(--space-l);
}

h2 {
  font-size: var(--step-3);
  margin-bottom: var(--space-m);
}

p {
  font-size: var(--step-0);
  margin-bottom: var(--space-s);
}

section {
  padding-block: var(--space-2xl);
}
```

## コンテンツアウト設計

### キャンバスイン vs コンテンツアウト

| アプローチ | 特徴 | 適用 |
|----------|------|------|
| **キャンバスイン** | 固定グリッドに内容を当てはめる | 印刷物、固定レイアウト |
| **コンテンツアウト** | 内容の性質に応じてレイアウトを決定 | ウェブ、レスポンシブ |

### 哲学

> "紙媒体由来の固定グリッドを厳密に適用するのではなく、コンテンツの性質に応じてレイアウトを決定する"

### 実践的なバランス

```
マクロレベル（ページ全体）
  ↓
グリッドシステムを目安に（例: 12カラム）
  ↓
レイアウト領域の内側
  ↓
コンテンツ優先で柔軟に調整
```

## 実践的なアプローチ

### 1. 絶対値ベースの余白パターン

```css
:root {
  /* Utopia で生成したスペーシングトークン */
  --space-xs: clamp(0.875rem, 0.8533rem + 0.1087vw, 0.9375rem);
  --space-s: clamp(1.125rem, 1.0815rem + 0.2174vw, 1.25rem);
  --space-m: clamp(1.6875rem, 1.6223rem + 0.3261vw, 1.875rem);
  --space-l: clamp(2.25rem, 2.163rem + 0.4348vw, 2.5rem);
}
```

**利点**: デザイナーと開発者の共通言語として機能

### 2. コンポーネント単位の柔軟性

```css
/* カードコンポーネント */
.card {
  /* 基本スペーシング */
  padding: var(--space-m);
  gap: var(--space-s);

  /* コンテンツに応じた調整 */
  & .card__image {
    margin-inline: calc(-1 * var(--space-m)); /* フルブリード */
  }

  & .card__title {
    font-size: var(--step-2);
    margin-bottom: var(--space-xs);
  }
}
```

### 3. レイアウトコンテキストでの適応

```css
/* グリッドレイアウト */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: var(--space-l);
}

/* 個別アイテムはコンテンツに応じて調整 */
.grid__item {
  padding: var(--space-m);

  /* 内容が多い場合は広めに */
  &.is-featured {
    padding: var(--space-l);
  }
}
```

## 設計の一貫性と柔軟性の両立

### 原則

1. **システマティックな基盤**: Utopia や clamp() で体系的な基準を作る
2. **局所的な調整**: コンテンツの性質に応じて柔軟に変更
3. **共通言語の確立**: デザイナーと開発者が同じトークンを使用

### 実装パターン

```css
/* 基盤: システマティックな定義 */
:root {
  --fluid-type-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --fluid-space-base: clamp(1rem, 0.8rem + 1vw, 1.5rem);
}

/* 局所: コンテンツに応じた調整 */
.hero {
  /* システムの値を基準に */
  padding-block: calc(var(--fluid-space-base) * 3);

  /* コンテンツ特性で微調整 */
  & .hero__title {
    font-size: calc(var(--fluid-type-base) * 2.5);
    line-height: 1.1; /* 見出しは詰める */
  }
}
```

## ツールとリソース

### Utopia Calculator

- **URL**: https://utopia.fyi/
- **機能**: タイポグラフィとスペーシングのフルイドスケールを生成
- **使い方**:
  1. 最小・最大ビューポート幅を設定（例: 320px, 1440px）
  2. 最小・最大ベースサイズを設定（例: 16px, 18px）
  3. タイプスケール比率を設定（例: 1.2, 1.333）
  4. CSS 変数をコピー

### その他のツール

- [Modern Fluid Typography Editor](https://modern-fluid-typography.vercel.app/)
- [Fluid Type Scale Calculator](https://www.fluid-type-scale.com/)
- [Min-Max-Value Interpolation](https://min-max-calculator.9elements.com/)

## ベストプラクティス

### 1. システムを先に、調整は後

```css
/* ✅ まずシステムの値を使用 */
.component {
  padding: var(--space-m);
  font-size: var(--step-0);
}

/* 必要に応じて調整 */
.component--compact {
  padding: var(--space-s);
}
```

### 2. アクセシビリティを考慮

```css
/* ✅ ユーザーのフォントサイズ設定を尊重 */
:root {
  font-size: 100%; /* ブラウザデフォルト */
}

/* rem 単位で相対的に */
h1 {
  font-size: clamp(2rem, 4vw + 1rem, 4rem);
}
```

### 3. パフォーマンスへの配慮

```css
/* ✅ カスタムプロパティで一元管理 */
:root {
  --fluid-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
}

/* 派生値は calc() で */
.large {
  font-size: calc(var(--fluid-base) * 1.5);
}
```

## まとめ

### デザインカンプの「間」を埋める戦略

1. **フルイドタイポグラフィ**: clamp() で連続的なスケーリング
2. **Utopia システム**: 体系的なスケール生成
3. **コンテンツアウト**: 内容に応じた柔軟な調整
4. **共通言語**: デザイナーと開発者の協働

### 実装の流れ

```
1. Utopia で基盤となるスケールを生成
   ↓
2. CSS 変数として定義
   ↓
3. コンポーネントで使用
   ↓
4. 必要に応じて局所的に調整
   ↓
5. 継続的に改善
```

## 関連ナレッジ

- [clamp() によるフルイドタイポグラフィ](css/values/fluid-typography-clamp.md)
- [タイポグラフィスケーリング設計](css/typography/typography-scaling.md)
- [メディアクエリ不要のレスポンシブレイアウト](css/layout/responsive-without-mediaquery.md)

## 参考リソース

- [Utopia](https://utopia.fyi/)
- [Every Layout](https://every-layout.dev/)
- [Modern Fluid Typography](https://modern-fluid-typography.vercel.app/)

---
