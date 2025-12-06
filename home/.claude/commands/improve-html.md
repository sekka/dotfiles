---
description: "HTML/CSSをセマンティクス・アクセシビリティ・SEO観点で改善"
---

# HTML/CSS改善タスク

対象: $ARGUMENTS

## 実行内容

以下の3ステップで対応してください。

### Step 1: 調査

対象ファイルを読み込み、現状の問題点を洗い出してください。

### Step 2: 検討

問題点に対する改善案を提示してください。改善の優先度（高/中/低）も示してください。

### Step 3: 対応

ユーザーの承認を得てから、改善を実施してください。

## チェック観点

### 1. セマンティクス

- [ ] 適切なHTML5要素の使用（`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`）
- [ ] 見出しの階層構造（h1→h2→h3の順序）
- [ ] リストの適切な使用（`<ul>`, `<ol>`, `<dl>`）
- [ ] `<div>`/`<span>`の過剰使用がないか
- [ ] `<button>`と`<a>`の使い分け
- [ ] `<figure>`/`<figcaption>`の適切な使用
- [ ] `<time>`要素の使用
- [ ] `<address>`要素の使用

### 2. アクセシビリティ（WCAG 2.1準拠）

- [ ] 画像の`alt`属性（装飾画像は`alt=""`）
- [ ] フォームラベルの関連付け（`<label for="">`）
- [ ] キーボード操作可能か（tabindex、focus状態）
- [ ] WAI-ARIA属性の適切な使用（aria-label, aria-labelledby, aria-describedby）
- [ ] ランドマークロール（banner, navigation, main, contentinfo）
- [ ] コントラスト比（テキスト4.5:1以上、大きいテキスト3:1以上）
- [ ] フォーカスインジケーターの視認性
- [ ] スキップリンクの有無
- [ ] 言語属性（`lang="ja"`）

### 3. SEO

- [ ] メタタグ（title, description, keywords）
- [ ] OGPタグ（og:title, og:description, og:image, og:url）
- [ ] 構造化データ（JSON-LD）
- [ ] canonical URL
- [ ] 見出しタグの適切な使用（h1は1ページ1つ）
- [ ] 画像の最適化（width/height属性、loading="lazy"）
- [ ] 内部リンクの構造
- [ ] パンくずリストの実装

### 4. フレームワーク作法・ベストプラクティス

使用しているフレームワークの公式ドキュメント・推奨パターンに従っているか確認してください。
不明な場合はContext7 MCPで最新のベストプラクティスを調査してください。
下記に挙げているのは例です。プロジェクト内で実際にどのフレームワークを使用しているかはpackage.jsonなどを参照して具体化してから調査してください。

#### HTML/テンプレートフレームワーク

- **Astro**: コンポーネント分割、`client:*`ディレクティブの適切な使用、`Astro.props`の型定義
- **Next.js**: App Router/Pages Router の使い分け、`Image`コンポーネント、メタデータAPI
- **Nuxt.js**: `<NuxtLink>`の使用、`useFetch`/`useAsyncData`、SEOモジュール
- **SvelteKit**: `+page.svelte`/`+layout.svelte`構造、`load`関数

#### CSSフレームワーク

- **Tailwind CSS**: ユーティリティクラスの適切な使用、カスタム値`[xxx]`より標準クラス優先、`@apply`の最小化
- **Bootstrap**: グリッドシステム、コンポーネントクラスの正しい組み合わせ
- **Sass/SCSS**: ネストの深さ制限、変数・ミックスインの活用、BEM命名規則

#### JavaScriptフレームワーク

- **React**: コンポーネント分割、hooks のルール、key属性、memo/useCallback の適切な使用
- **Vue.js**: Composition API/Options API、`v-for`の`key`、`computed`/`watch`の使い分け
- **Svelte**: リアクティブ宣言`$:`、ストア、イベントディスパッチ
- **Alpine.js**: `x-data`/`x-bind`/`x-on`の適切な使用、`$refs`の活用

#### 共通チェック項目

- [ ] フレームワーク推奨のファイル・ディレクトリ構造に従っているか
- [ ] 非推奨（deprecated）な機能を使用していないか
- [ ] フレームワーク提供のコンポーネント/ユーティリティを活用しているか
- [ ] パフォーマンス最適化のベストプラクティスに従っているか
- [ ] TypeScript型定義が適切か（使用している場合）

## 出力形式

改善点は以下の形式で報告してください：

```markdown
## 発見した問題点

| #   | ファイル  | 行  | 観点           | 優先度 | 問題内容 | 改善案 |
| --- | --------- | --- | -------------- | ------ | -------- | ------ |
| 1   | xxx.astro | 10  | セマンティクス | 高     | ...      | ...    |
```

## 注意事項

- 既存のデザインやレイアウトを崩さないこと
- Tailwind CSSのクラス命名規則に従うこと
- Astroコンポーネントの構造を理解した上で修正すること
- 修正前後のdiffを明確に示すこと
