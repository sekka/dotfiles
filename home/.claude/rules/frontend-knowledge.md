# フロントエンドナレッジベースの自動参照

## 概要

Web開発に関する質問があった場合、`managing-frontend-knowledge` スキルのナレッジベースを自発的に参照すること。
モダンなCSS、JavaScript、HTML、デザインガイドラインの最新情報を活用し、正確で実用的な回答を提供する。

---

## トリガーキーワード（自動参照の対象）

以下のトピックに関する質問では、必ずナレッジベースを確認する。

### CSS関連

#### レイアウト

- Grid、Flexbox、Container Queries
- 中央寄せ、全幅、レスポンシブ
- サイドバー、カード、グリッド

**ナレッジファイル:** `css/layout/*.md`

**例:**

```
質問: "CSS Gridで3カラムレイアウトを作りたい"
→ css/layout/grid-basics.md を参照
```

#### アニメーション

- transition、animation
- View Transitions API
- Scroll-driven Animations
- キーフレーム、イージング

**ナレッジファイル:** `css/animation/*.md`

**例:**

```
質問: "ページ遷移時にフェードアニメーションを追加したい"
→ css/animation/view-transitions.md を参照
```

#### ビジュアル

- filter、clip-path、mask、shape
- backdrop-filter
- グラデーション、シャドウ

**ナレッジファイル:** `css/visual/*.md`

#### タイポグラフィ

- font、text、フォント読み込み
- テキスト装飾、行間、字間

**ナレッジファイル:** `css/typography/*.md`

#### セレクタ

- @scope、:has、:is、:where
- 擬似クラス、擬似要素

**ナレッジファイル:** `css/selectors/*.md`

**例:**

```
質問: ":has()で親要素をスタイリングしたい"
→ css/selectors/has-selector.md を参照
```

#### CSS値

- clamp、min、max
- ビューポート単位（vw、vh、dvh）
- currentColor、カスタムプロパティ

**ナレッジファイル:** `css/values/*.md`

#### UIコンポーネント

- Popover API
- Anchor Positioning
- dialog、details

**ナレッジファイル:** `css/components/*.md`

**例:**

```
質問: "ネイティブのPopover APIを使いたい"
→ css/components/popover.md を参照
```

#### テーマ

- light-dark関数
- color-scheme
- ダークモード

**ナレッジファイル:** `css/theming/*.md`

#### モダンCSS

- CSS Nesting
- @layer
- CSS新機能

**ナレッジファイル:** `css/modern/*.md`

---

### JavaScript関連

#### DOM操作

- 要素の取得、作成、削除
- イベントハンドリング
- クラス操作、属性操作

**ナレッジファイル:** `javascript/dom/*.md`

#### 非同期処理

- async/await、Promise
- fetch API
- エラーハンドリング

**ナレッジファイル:** `javascript/async/*.md`

**例:**

```
質問: "fetchでエラーハンドリングを実装したい"
→ javascript/async/fetch-error-handling.md を参照
```

#### アニメーション

- requestAnimationFrame
- 補間、イージング
- 数学的アニメーション

**ナレッジファイル:** `javascript/animation/*.md`

#### デザインパターン

- モジュールパターン
- Observer、Singleton
- ベストプラクティス

**ナレッジファイル:** `javascript/patterns/*.md`

#### Web API

- IntersectionObserver
- matchMedia
- CSSStyleSheet
- その他のブラウザAPI

**ナレッジファイル:** `javascript/web-apis/*.md`

**例:**

```
質問: "要素が画面に入ったら遅延読み込みしたい"
→ javascript/web-apis/intersection-observer.md を参照
```

---

### HTML関連

#### セマンティックHTML

- article、section、nav、aside
- header、footer、main
- SEO、アクセシビリティ

**ナレッジファイル:** `html/semantic/*.md`

#### モダンHTML要素

- dialog、details、summary
- search、picture
- meter、progress

**ナレッジファイル:** `html/modern/*.md`

**例:**

```
質問: "ネイティブのdialog要素でモーダルを作りたい"
→ html/modern/dialog.md を参照
```

#### フォーム

- input types
- validation
- カスタムフォーム

**ナレッジファイル:** `html/forms/*.md`

#### アクセシビリティ

- ARIA属性
- role
- セマンティクス

**ナレッジファイル:** `html/accessibility/*.md`

---

### 横断的トピック

#### パフォーマンス最適化

- lazy-load（遅延読み込み）
- Core Web Vitals（LCP、CLS、INP）
- 画像最適化
- バンドルサイズ削減

**ナレッジファイル:** `cross-cutting/performance/*.md`

**例:**

```
質問: "LCPを改善したい"
→ cross-cutting/performance/lcp-optimization.md を参照
```

#### アクセシビリティ

- WCAG 2.1/2.2
- a11y、ARIA
- スクリーンリーダー
- キーボードナビゲーション

**ナレッジファイル:** `cross-cutting/accessibility/*.md`

**例:**

```
質問: "キーボードだけで操作できるようにしたい"
→ cross-cutting/accessibility/keyboard-navigation.md を参照
```

#### ブラウザ互換性

- Safari対応
- iOS対応
- 回避策（workarounds）
- ポリフィル

**ナレッジファイル:** `cross-cutting/browser-compatibility/*.md`

**例:**

```
質問: "iOSでvhが意図通り動かない"
→ cross-cutting/browser-compatibility/ios-vh-fix.md を参照
```

#### レスポンシブデザイン

- メディアクエリ
- モバイルファースト
- ブレークポイント

**ナレッジファイル:** `cross-cutting/responsive/*.md`

#### UX

- インタラクションパターン
- マイクロインタラクション
- ユーザビリティ

**ナレッジファイル:** `cross-cutting/ux/*.md`

#### デザインシステム

- トークン、変数
- コンポーネント設計
- 一貫性

**ナレッジファイル:** `cross-cutting/design-system/*.md`

---

### デザインガイドライン

#### Apple Style Guide

- Apple製品名（iPhone、macOS、App Store）
- UI用語（タップ、スワイプ、長押し）
- ライティング規約（簡潔、明確、丁寧）
- 表記ルール（数字、記号、大文字小文字）
- 包括的言語（性別中立、多様性）

**ナレッジファイル:** `design-guidelines/apple-style-guide/*.md`

**例:**

```
質問: "iPhoneの正しい表記は？"
→ design-guidelines/apple-style-guide/product-names.md を参照
```

#### Human Interface Guidelines（HIG）

- Apple design
- iOS、macOS、watchOS、tvOS
- SwiftUI、UIKit
- アプリデザイン原則
- VoiceOver、アクセシビリティ

**ナレッジファイル:** `design-guidelines/hig/*.md`

**例:**

```
質問: "iOSアプリのナビゲーションバーの高さは？"
→ design-guidelines/hig/ios-navigation.md を参照
```

#### Material Design 3

- Material You
- Google design
- Dynamic Color
- デザインシステム
- アクセシビリティ
- デザイントークン

**ナレッジファイル:** `design-guidelines/material-design-3/*.md`

**例:**

```
質問: "Material Design 3のカラーシステムは？"
→ design-guidelines/material-design-3/color-system.md を参照
```

---

## 参照方法

### Step 1: 質問内容からキーワードを抽出

```
質問: "CSS Gridで3カラムレイアウトを作り、モバイルでは1カラムにしたい"

キーワード:
- CSS Grid → CSS関連 > レイアウト
- レスポンシブ → 横断的トピック > レスポンシブデザイン
```

### Step 2: 該当するカテゴリを特定

```
カテゴリ:
- css/layout
- cross-cutting/responsive
```

### Step 3: ナレッジファイルをRead

```typescript
// ナレッジファイルのパス
Read({
  file_path: "~/.claude/skills/managing-frontend-knowledge/knowledge/css/layout/grid-basics.md"
});

Read({
  file_path: "~/.claude/skills/managing-frontend-knowledge/knowledge/cross-cutting/responsive/mobile-first.md"
});
```

### Step 4: ナレッジに基づいて回答

- コード例を引用
- 出典URLを記載
- ブラウザサポート情報を明記
- 実用的なコードを提供

**回答例:**

```markdown
CSS Gridで3カラムレイアウトを作り、モバイルでは1カラムにする方法：

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}
\`\`\`

**解説:**
- `auto-fit`: 利用可能なスペースに合わせてカラム数を自動調整
- `minmax(300px, 1fr)`: 最小300px、最大1fr（均等分割）
- モバイルでは自動的に1カラムになる

**ブラウザサポート:**
- Chrome 57+
- Firefox 52+
- Safari 10.1+

**出典:**
- [MDN: CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout)
\`\`\`
```

---

## 注意事項

### ナレッジベースに該当情報がない場合

- 一般的な知識で回答
- 「ナレッジベースには該当情報がありませんが...」と明記
- Context7やWebFetchで補足調査

### 出典URLがある場合は必ず記載

**Good:**

```
出典: https://developer.mozilla.org/en-US/docs/Web/CSS/grid
```

**Bad:**

```
（出典の記載なし）
```

### コード例は実用的で実際に使えるものを優先

**Good:**

```css
/* 実際にコピペで使える */
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}
```

**Bad:**

```css
/* 抽象的すぎる */
.container {
  display: grid;
  /* ... 何かしらのプロパティ */
}
```

### ブラウザサポート情報を明記

**テンプレート:**

```
**ブラウザサポート:**
- Chrome: 57+
- Firefox: 52+
- Safari: 10.1+
- Edge: 16+

**注意:** IE11では非サポート
```

### 複数カテゴリにまたがる場合は、関連するファイルを複数参照

**例:**

```
質問: "レスポンシブでダークモード対応のグリッドレイアウトを作りたい"

参照するファイル:
1. css/layout/grid-basics.md
2. css/theming/dark-mode.md
3. cross-cutting/responsive/media-queries.md
```

---

## ナレッジファイルのパス構造

```
~/.claude/skills/managing-frontend-knowledge/knowledge/
├── css/
│   ├── layout/
│   │   ├── grid-basics.md
│   │   ├── flexbox-basics.md
│   │   └── container-queries.md
│   ├── animation/
│   │   ├── view-transitions.md
│   │   └── scroll-driven.md
│   ├── visual/
│   ├── typography/
│   ├── selectors/
│   ├── values/
│   ├── components/
│   ├── theming/
│   └── modern/
├── javascript/
│   ├── dom/
│   ├── async/
│   ├── animation/
│   ├── patterns/
│   └── web-apis/
│       └── intersection-observer.md
├── html/
│   ├── semantic/
│   ├── modern/
│   │   └── dialog.md
│   ├── forms/
│   └── accessibility/
├── cross-cutting/
│   ├── performance/
│   │   └── lcp-optimization.md
│   ├── accessibility/
│   │   └── keyboard-navigation.md
│   ├── browser-compatibility/
│   │   └── ios-vh-fix.md
│   ├── responsive/
│   ├── ux/
│   └── design-system/
└── design-guidelines/
    ├── apple-style-guide/
    │   └── product-names.md
    ├── hig/
    │   └── ios-navigation.md
    └── material-design-3/
        └── color-system.md
```

---

## 実践例

### シナリオ1: CSS Grid の質問

**質問:** "CSS Gridで3カラムレイアウトを作りたい"

**判断:**

- トリガーキーワード: "CSS Grid", "レイアウト"
- カテゴリ: css/layout

**実行:**

```typescript
Read({
  file_path: "~/.claude/skills/managing-frontend-knowledge/knowledge/css/layout/grid-basics.md"
});
```

**回答:**

- ナレッジファイルの内容を基に、実用的なコード例を提供
- ブラウザサポート情報を明記
- 出典URLを記載

---

### シナリオ2: パフォーマンス最適化の質問

**質問:** "LCPを改善する方法を教えて"

**判断:**

- トリガーキーワード: "LCP", "Core Web Vitals", "パフォーマンス"
- カテゴリ: cross-cutting/performance

**実行:**

```typescript
Read({
  file_path: "~/.claude/skills/managing-frontend-knowledge/knowledge/cross-cutting/performance/lcp-optimization.md"
});
```

**回答:**

- LCP改善の具体的な手法（画像最適化、プリロード、SSR等）
- 測定方法（Lighthouse、WebPageTest）
- 出典URLを記載

---

### シナリオ3: デザインガイドラインの質問

**質問:** "iOSアプリのナビゲーションバーの高さは？"

**判断:**

- トリガーキーワード: "iOS", "ナビゲーションバー", "HIG"
- カテゴリ: design-guidelines/hig

**実行:**

```typescript
Read({
  file_path: "~/.claude/skills/managing-frontend-knowledge/knowledge/design-guidelines/hig/ios-navigation.md"
});
```

**回答:**

- ナビゲーションバーの標準的な高さ（44pt）
- Safe Areaの考慮事項
- Apple公式ドキュメントへのリンク

---

## まとめ

- Web開発の質問では、**まずナレッジベースを確認**
- トリガーキーワードに該当したら、**自発的に参照**
- **実用的なコード例**と**出典URL**を提供
- **ブラウザサポート情報**を明記
- ナレッジベースにない場合は、Context7やWebFetchで補足
