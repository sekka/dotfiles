# Frontend Knowledge Base

フロントエンド開発に関するナレッジベースです。実装パターン、最新機能、パフォーマンス最適化、アクセシビリティなどの情報を体系的に整理しています。

## 📁 ディレクトリ構造

### CSS
[CSS ナレッジ一覧](css/INDEX.md)
- [Modern CSS](css/modern-css-2025.md) - 2025年の最新CSS機能（UIデザイン向け）
- [Layout](css/layout/) - Grid, Flexbox, Container Queries, overscroll-behavior など
- [Animation](css/animation/) - Transitions, Keyframes, Scroll-Driven Animations, background-image アニメーション
- [Visual](css/visual/) - Filter, Mask, Clip-path, Backdrop
- [Typography](css/typography/) - Font, Text-box, Line-height, 日本語テキスト折り返し
- [Selectors](css/selectors/) - :has, :is, :where, :scope
- [Values](css/values/) - clamp, Viewport units, currentColor, 三角関数
- [Components](css/components/) - Popover, Dialog, Anchor Positioning (anchor-size() 関数含む)
- [Theming](css/theming/) - light-dark, color-scheme

### JavaScript
[JavaScript ナレッジ一覧](javascript/INDEX.md)
- [DOM](javascript/dom/) - DOM 操作、イベント、Lenis スムーススクロール
- [Animation](javascript/animation/) - WAAPI, requestAnimationFrame, GSAP, パーティクルエフェクト
- [Patterns](javascript/patterns/) - デザインパターン、実装パターン、命名規則、ヘッドレスUI
- [Web APIs](javascript/web-apis/) - IntersectionObserver など

### HTML
[HTML ナレッジ一覧](html/INDEX.md)
- モダン HTML、セマンティクス

### 技術横断的トピック
[技術横断ナレッジ一覧](cross-cutting/INDEX.md)
- [Performance](cross-cutting/performance/) - パフォーマンス最適化、画像読込高速化
- [Accessibility](cross-cutting/accessibility/) - アクセシビリティ
- [Browser Compatibility](cross-cutting/browser-compat/) - ブラウザ互換性、Workarounds
- [Security](cross-cutting/security/) - セキュリティ
- [Tooling](cross-cutting/tooling/) - 開発ツール
- [UX](cross-cutting/ux/) - ユーザーエクスペリエンス
  - [UIユーザビリティ チェックリスト50](cross-cutting/ux/ui-usability-heuristics-checklist.md) - Nielsenの10原則ベース、実案件由来50ルール

### デザインリソース
[デザインリソース一覧](design-resources/INDEX.md)
- [Color Palettes](design-resources/color-palettes/) - CSS変数形式のカラーパレット（アースカラー、高級感、癒しグラデーション）
- [Gradients](design-resources/gradients/) - モダンなグラデーション技法（メッシュグラデーション）
- [UI Trends](design-resources/ui-trends/) - 最新UIトレンド（Liquid Glass UI）

### ライブラリ・ツール
[ライブラリ一覧](libraries/INDEX.md)
- [Animation](libraries/animation/) - アニメーションライブラリ（GSAP）
- [Snippets](libraries/snippets/) - 実用的なコードスニペット集（CSS/JS 2025）

### デザインシステム・ガイドライン

#### Apple Style Guide
[Apple Style Guide ナレッジ一覧](apple-style-guide/README.md)
- [About](apple-style-guide/about/) - ガイドの目的と変更履歴
- [Style and Usage A-Z](apple-style-guide/style-usage/) - 用語集（Numbers + A-Z）
- [Writing Inclusively](apple-style-guide/writing-inclusively/) - 包括的なライティング
- [Units of Measure](apple-style-guide/units-of-measure/) - 測定単位の表記
- [Technical Notation](apple-style-guide/technical-notation/) - 技術表記法
- [International Style](apple-style-guide/international-style/) - 国際化スタイル

#### Human Interface Guidelines (HIG)
[Apple HIG ナレッジ一覧](human-interface-guidelines/README.md)
- [Getting Started](human-interface-guidelines/getting-started.md) - HIGの基本と使い方
- [Foundations](human-interface-guidelines/foundations/) - Color, Typography, Layout, Accessibility
- [Patterns](human-interface-guidelines/patterns/) - Navigation, Feedback, Data Entry
- [Components](human-interface-guidelines/components/) - Buttons, Lists, Navigation Bars

#### Material Design 3
[Material Design 3 ナレッジ一覧](material-design-3/README.md)
- [Philosophy](material-design-3/philosophy/) - Material You、コア原則
- [Foundations](material-design-3/foundations/) - Color System, Typography, Elevation
- [Design Tokens](material-design-3/design-tokens/) - デザイントークンの概念
- [Customization](material-design-3/customization/) - Material Theme Builder、Dynamic Color
- [Accessible Design](material-design-3/accessible-design/) - アクセシビリティ原則
- [Components](material-design-3/components/) - ボタン、カード、ダイアログ等

### メタ情報
- [Workflow](meta/workflow.md) - ナレッジ追加・更新の手順

## 🏷️ タグで検索

### レイアウト
#grid #flexbox #container-queries #layout #positioning

### アニメーション
#animation #transitions #keyframes #scroll-driven #waapi #3d-transforms #offset-path #view-transitions

### 視覚効果
#filter #mask #clip-path #backdrop-filter #visual-effects #glassmorphism #liquid-glass

### 新機能（2024-2025）
#2024 #2025 #modern-css #modern-javascript #css-nesting #independent-transforms #trigonometry

### パフォーマンス
#performance #optimization #loading #rendering #image-optimization #fetchpriority

### アクセシビリティ
#a11y #accessibility #wcag #aria #inert #dialog #headless-ui

### デザイン
#color-palettes #gradients #ui-trends #earth-colors #luxury-colors

### UX・ユーザビリティ
#ux #usability #nielsen #heuristics #form-design #error-prevention #accessibility #checklist

### ライブラリ
#gsap #animation-library #snippets #code-examples

### 命名規則
#naming #javascript-patterns #best-practices

## 📝 ナレッジの追加方法

新しいナレッジを追加する場合は、[meta/workflow.md](meta/workflow.md) を参照してください。

## ⚙️ 管理ツール

このナレッジベースは `/user-fe-knowledge` スキルで管理されています。

- ナレッジ追加: スキル実行時に URL または記事内容を提供
- ナレッジ参照: AI が自動的に関連トピックを検索・参照
