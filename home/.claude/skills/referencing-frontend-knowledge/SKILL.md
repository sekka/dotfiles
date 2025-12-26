---
name: referencing-frontend-knowledge
description: フロントエンド技術のナレッジベースを参照します。CSS、JavaScript、パフォーマンス、アクセシビリティなどの質問に回答する際に使用してください。
---

# フロントエンドテクニック集

## 概要

蓄積されたフロントエンド技術のナレッジベースから、質問に関連する情報を参照して回答する。

## 使い方

1. ユーザーの質問からキーワードを抽出
2. 下記カテゴリ一覧から該当するファイルを特定
3. `~/.claude/skills/frontend-knowledge/` 内の該当ファイルを Read
4. 蓄積された知識を基に回答

## カテゴリ一覧

| ファイル | 内容 | キーワード |
|---------|------|-----------|
| `css-layout.md` | Grid, Flexbox, Container Queries, Subgrid, 配置 | レイアウト, 幅, 高さ, 中央寄せ, 配置 |
| `css-animation.md` | Transitions, Keyframes, View Transitions, Scroll-driven | 動き, アニメーション, 遷移, スクロール |
| `css-selectors.md` | :has(), :is(), :where(), :not(), 属性セレクタ | セレクタ, 選択, 条件, 親要素 |
| `css-typography.md` | フォント, 行間, text-wrap, clamp() | 文字, テキスト, 読みやすさ, フォント |
| `css-colors.md` | カスタムプロパティ, color-mix(), ダークモード | 色, テーマ, 変数, ダーク |
| `css-modern.md` | 最新CSS機能, @layer, @scope, ネスティング | 新機能, モダン, 2024, 2025 |
| `javascript-patterns.md` | DOM操作, イベント, 非同期, ユーティリティ | JS, DOM, イベント, async |
| `performance.md` | content-visibility, 遅延読み込み, Core Web Vitals | 速度, 最適化, 軽量, LCP, CLS |
| `accessibility.md` | フォーカス, ARIA, コントラスト, スクリーンリーダー | a11y, アクセシビリティ, 支援技術 |
| `tailwind.md` | Tailwind CSS のパターン, カスタマイズ, プラグイン | Tailwind, ユーティリティ |

## 回答フォーマット

```markdown
## [質問に対する回答]

[説明]

### コード例

\```css
/* または js/html */
\```

### ユースケース
- [具体的な使用場面]

### 参考
- [出典URL（あれば）]
```

## 該当カテゴリがない場合

1. 一般的な知識で回答
2. 「ナレッジベースに該当情報がありません」と伝える
3. 必要に応じて `collect-frontend-knowledge` スキルでの追加を提案

## 複数カテゴリにまたがる場合

関連する複数のファイルを Read して総合的に回答する。
例: 「スクロールアニメーション」→ `css-animation.md` + `performance.md`

## 注意事項

- カテゴリファイルが存在しない場合はエラーにせず、ある情報で回答
- 出典URLがある場合は必ず記載
- コード例は実用的なものを優先
