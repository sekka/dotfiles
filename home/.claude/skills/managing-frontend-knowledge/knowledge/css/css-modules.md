---
title: CSS Modules の現状と将来展望
category: css
tags: [CSS, CSS Modules, webpack, PostCSS, scoping]
browser_support: ツール依存（webpack, Vite等）
created: 2026-01-31
updated: 2026-01-31
---

# CSS Modules の現状と将来展望

> 出典: https://developer.hatenastaff.com/entry/2022/09/01/093000
> 執筆日: 2022-09-01
> 追加日: 2026-01-31

CSS Modulesの起源、現在のメンテナンス状況、将来の標準化の動向を解説。はてなのフロントエンドエンジニアによる包括的な技術記事。

---

## CSS Modules とは

### 解決する課題

**グローバルスコープ汚染**: CSSのクラスセレクタはグローバルスコープで、名前の衝突が発生しやすい。

**CSS Modules の仕組み**:
- クラス名を一意な識別子に変換
- `*.module.css` という命名規則のファイルに適用
- webpack や Vite が自動的にローカルスコープ化

### 実装例

**ソース (`Button.module.css`)**:

```css
.count {
  color: #333;
  font-size: 16px;
}

.button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
}
```

**ビルド後**:

```css
.DkhXIKFSVtrX837kPko3 {
  color: #333;
  font-size: 16px;
}

.A8jFkP2LmQr4ZvN9Wx1Y {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
}
```

**React での使用**:

```jsx
import styles from './Button.module.css';

function Button() {
  return (
    <button className={styles.button}>
      <span className={styles.count}>0</span>
    </button>
  );
}
```

**出力されるHTML**:

```html
<button class="A8jFkP2LmQr4ZvN9Wx1Y">
  <span class="DkhXIKFSVtrX837kPko3">0</span>
</button>
```

---

## 歴史的経緯（2015年）

### タイムライン

| 時期 | 出来事 |
|------|--------|
| **2015年4月** | webpack の css-loader で "Placeholders" 機能リリース |
| **2015年5〜6月** | `:local()` 記法の導入、構文の洗練 |
| **2015年6月** | 仕様を独立したリポジトリに分離、PostCSS統合 |
| **2015年10月** | Values 機能のサポート完了 |

### 初期構文の進化

**Placeholders（初期）**:

```css
%button {
  padding: 10px;
}
```

**:local() 記法**:

```css
:local(.button) {
  padding: 10px;
}
```

**現在のデフォルト構文**:

```css
.button {
  /* デフォルトでローカルスコープ */
  padding: 10px;
}

:global(.global-class) {
  /* グローバルスコープを明示 */
  color: red;
}
```

---

## アーキテクチャと関連ツール

### コアライブラリ

**処理フロー**:

```
CSS → ICSS (中間表現) → 最終CSS
```

**主要ライブラリ**:
- **postcss-modules-values**: CSS変数（values）の処理
- **css-modules-loader-core**: コアのローディング処理
- **postcss-modules**: PostCSS プラグイン
- **ICSS ユーティリティ**: 内部表現の処理

### ICSS (Interoperable CSS)

**定義**: CSS Modules の内部表現フォーマット。

**特徴**:
- エンドユーザーには見えない
- ツール間の相互運用性を提供
- `:import` / `:export` 構文

**例**:

```css
/* ICSS（内部表現） */
:import("./colors.css") {
  i__primary: primary;
}

:export {
  button: _button_A8jFkP2L;
}

._button_A8jFkP2L {
  background-color: i__primary;
}
```

---

## メンテナンス状況（2022年時点）

### 仕様リポジトリ

**状態**: 2016年以降、実質的に非アクティブ

- メンテナー不在
- 新機能追加なし
- 既存仕様は安定

### 実装ツール

#### webpack css-loader

**状態**: アクティブにメンテナンス中、ただし **メンテナンスモード**

- バグ修正は継続
- 新しいCSS Module機能は受け入れない方針
- 既存機能は安定して動作

**GitHub**: https://github.com/webpack-contrib/css-loader

#### postcss-modules

**状態**: アクティブにメンテナンス中

- 定期的な更新
- コミュニティによるサポート

**GitHub**: https://github.com/madyankin/postcss-modules

#### typed-css-modules 系

**状態**: アクティブにメンテナンス中

- TypeScript型定義の自動生成
- 開発体験の向上

---

## 将来の標準化: ネイティブCSS機能

### 参照セレクタ (`$<name>`)

**提案**: クラス名を変数的に参照する構文。

```css
/* 提案仕様（実装はまだ） */
.button {
  background-color: blue;
}

.primary {
  composes: $button; /* .button を参照 */
  color: white;
}
```

**現状**: 仕様策定中、ブラウザ実装なし

### @scope ルール

**定義**: セレクタの適用範囲を制限するネイティブCSS機能。

**構文**:

```css
@scope (.card) {
  /* .card 内でのみ適用 */
  .title {
    font-size: 1.5rem;
  }
}
```

**HTML**:

```html
<div class="card">
  <h2 class="title">カードタイトル</h2> <!-- スタイルが適用 -->
</div>

<h2 class="title">ページタイトル</h2> <!-- スタイルが適用されない -->
```

**ブラウザサポート**:
- Chrome 118+ (2023年10月)
- Safari 17.4+ (2024年3月)
- Firefox: 開発中

**CSS Modules との違い**:

| 機能 | CSS Modules | @scope |
|------|-------------|--------|
| **スコープ** | ファイル単位 | 任意のセレクタ範囲 |
| **ハッシュ化** | あり | なし（クラス名そのまま） |
| **ビルド依存** | 必要 | 不要（ネイティブ） |

---

## 実践的な使い方

### 基本的な使用

```css
/* Button.module.css */
.button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.primary {
  background-color: #007bff;
  color: white;
}

.secondary {
  background-color: #6c757d;
  color: white;
}
```

```jsx
import styles from './Button.module.css';

function Button({ variant = 'primary', children }) {
  return (
    <button className={`${styles.button} ${styles[variant]}`}>
      {children}
    </button>
  );
}
```

### composes（継承）

```css
/* Button.module.css */
.baseButton {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.primaryButton {
  composes: baseButton;
  background-color: #007bff;
  color: white;
}

.secondaryButton {
  composes: baseButton;
  background-color: #6c757d;
  color: white;
}
```

### グローバルスコープとの併用

```css
/* 特定のクラスだけグローバル */
:global(.legacy-class) {
  /* グローバルスコープ */
  color: red;
}

.moduleClass {
  /* ローカルスコープ */
  color: blue;
}
```

---

## はてなの採用理由

**背景**: 新規プロダクトでCSS Modulesを標準化。

**理由**:
1. **標準CSSに近い記法**: デザイナーのワークフローに対応
2. **スコープの安全性**: 大規模開発でも名前衝突を回避
3. **将来性**: より良い代替手段が出るまでの実用的な選択

**方針**: 「現時点で最善」の技術として採用し、将来の標準仕様への移行を見据える。

---

## CSS Modules vs 他のCSS-in-JS

| 技術 | スコープ | 記法 | ビルド | ランタイム |
|------|---------|------|--------|-----------|
| **CSS Modules** | ファイル | CSS | 必要 | なし |
| **Styled Components** | コンポーネント | JS | 不要 | あり |
| **Emotion** | コンポーネント | JS/CSS | 不要 | あり |
| **Tailwind CSS** | ユーティリティ | HTML | 必要 | なし |
| **@scope** | 任意範囲 | CSS | 不要 | なし |

---

## ベストプラクティス

### 1. 命名規則を統一

```css
/* BEM風の命名 */
.card {}
.card__title {}
.card__body {}
.card--featured {}
```

### 2. グローバルスタイルと分離

```
src/
├── styles/
│   └── global.css        # グローバルスタイル
└── components/
    └── Button/
        ├── Button.jsx
        └── Button.module.css  # モジュールスタイル
```

### 3. TypeScript型定義の活用

```bash
# typed-css-modules のインストール
npm install -D typed-css-modules

# 型定義生成
npx tcm src --watch
```

**生成される型定義** (`Button.module.css.d.ts`):

```typescript
export const button: string;
export const primary: string;
export const secondary: string;
```

**使用**:

```tsx
import styles from './Button.module.css'; // 型安全

<button className={styles.button} /> // ✅ OK
<button className={styles.invalidClass} /> // ❌ エラー
```

---

## 注意点

### 1. 動的クラス名は文字列連結

```jsx
// ❌ 動的プロパティアクセスは型推論が効かない
<div className={styles[dynamicName]} />

// ✅ 事前に型チェック
const className = styles[dynamicName as keyof typeof styles];
<div className={className} />
```

### 2. グローバルスタイルとの衝突

```css
/* グローバルCSSで定義された .button */
.button {
  font-size: 16px;
}

/* Button.module.css */
.button {
  font-size: 14px; /* 衝突しない（ハッシュ化されるため） */
}
```

### 3. ビルドツールの設定が必要

**webpack.config.js**:

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.module\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
        ],
      },
    ],
  },
};
```

---

## 参考リンク

- [CSS Modules 仕様](https://github.com/css-modules/css-modules)
- [webpack css-loader](https://github.com/webpack-contrib/css-loader)
- [postcss-modules](https://github.com/madyankin/postcss-modules)
- [CSS @scope - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@scope)
- [ICSS 仕様](https://github.com/css-modules/icss)
