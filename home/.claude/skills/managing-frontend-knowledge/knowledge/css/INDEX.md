# CSS Knowledge Base

CSS に関するナレッジ一覧です。

## 📂 カテゴリ

### [Modern CSS (2025)](modern-css-2025.md)
2025年の最新CSS機能まとめ - text-autospace, sibling-count(), scroll-state(), @function など
- [Chrome 144 の新しい CSS 機能](modern/chrome-144-features.md) - ::search-text、@scroll-state、アンカーポジショニング強化
- [Chrome 143 の新しい CSS 機能](modern/chrome-143-features.md) - @container anchored(fallback)、background-position-x/y
- [Chrome 142 の新しい CSS 機能](modern/chrome-142-features.md) - :target-before/:target-after、コンテナクエリ範囲構文
- [CSS 2025 エルゴノミクス機能](modern/css-2025-ergonomics.md) - attr() 拡張、if()、@function

### [Layout](layout/)
Grid, Flexbox, Container Queries, Subgrid, overscroll-behavior など、レイアウトに関するテクニック

### [Animation](animation/)
Transitions, Keyframes, Scroll-Driven Animations, View Transitions, background-image アニメーション など
- [CSS 2025 インタラクション機能](animation/css-2025-interactions.md) - scroll-state、sibling-index()、moveBefore()
- [Scoped View Transitions](animation/scoped-view-transitions.md) - 部分的なビュー遷移
- [View Transitions API](animation/view-transitions-api.md) - ページ遷移アニメーション、MPA/SPAサポート
- [CSS offset プロパティ](animation/offset-path.md) - パスに沿ったアニメーション、SVGパス
- [独立した transform プロパティ](animation/independent-transforms.md) - translate、rotate、scale の個別指定

### [Visual](visual/)
Filter, Mask, Clip-path, Backdrop-filter, Mix-blend-mode など、視覚効果
- [CSS 3D Transforms](visual/css-3d-transforms.md) - WebGLを使わない3D表現、perspective、parallax

### [Typography](typography/)
Font, Text-box, Line-height, Font-feature-settings, 日本語テキスト折り返し など、タイポグラフィ
- [Google Fonts で Webフォント最適化](typography/webfont-optimization-google-fonts.md) - preconnect、font-display、Dynamic Subsetting
- [Fluid Type Scale](typography/fluid-type-scale.md) - clamp() によるレスポンシブタイポグラフィ
- [CSS下線表現テクニック](typography/underline-techniques.md) - text-decoration、グラデーション下線、アニメーション

### [Selectors](selectors/)
:has, :is, :where, :scope など、セレクタに関する情報
- [Scroll State Queries](selectors/scroll-state-queries.md) - スクロール状態の検出

### [Values](values/)
clamp, Viewport units (svh/dvh/lvh), currentColor, calc, 三角関数 (sin/cos) など
- [100vw スクロールバー問題の解決](values/viewport-units-scrollbar-aware.md) - Chrome 145+ での自動認識
- [CSS三角関数](values/trigonometry.md) - sin()、cos()、円形配置、波形アニメーション

### [Components](components/)
Popover API, Dialog, Anchor Positioning (anchor-size() 含む) など、UI コンポーネント関連
- [CSS 2025 コンポーネント機能](components/css-2025-components.md) - dialog + command、popover=hint、CSSカルーセル
- [スクロールチェイン回避](components/overscroll-behavior-dialog.md) - overscroll-behavior でモーダル最適化

### [Theming](theming/)
light-dark(), color-scheme, カラーテーマの実装
- [OKLCH カラー](theming/oklch-color.md) - 知覚的均一性を持つ色空間

## 🏷️ タグ一覧

`#layout` `#grid` `#flexbox` `#animation` `#transitions` `#filter` `#mask` `#typography` `#selectors` `#has` `#is` `#where` `#viewport` `#clamp` `#popover` `#dialog` `#theming`

## 🔙 [トップに戻る](../INDEX.md)
