---
title: Stylelint - CSSコード品質向上ツール
category: cross-cutting/tooling
tags: [stylelint, css, lint, code-quality, static-analysis, sass, scss]
browser_support: Node.js環境
created: 2026-02-01
updated: 2026-02-01
---

# Stylelint - CSSコード品質向上ツール

> 出典: https://ics.media/entry/230525/
> 執筆日: 2023-05-25
> 追加日: 2026-02-01

Stylelintは「スタイルシートの問題検出や自動修正を行えるLintと呼ばれる静的解析ツール」。CSS/SCSS/Sassの品質を向上させます。

## 概要

**Stylelintの役割**:

1. **構文エラー検出**: すべてのスタイルシート全体をチェック
2. **問題パターン防止**: 重複セレクタ、重複プロパティなど
3. **コーディング規約の強制**: チーム全体で一貫したスタイル

## インストール

```bash
npm install --save-dev stylelint stylelint-config-standard
```

**推奨プラグイン（SCSS対応）**:

```bash
npm install --save-dev stylelint-config-standard-scss
```

## 設定ファイル

### 基本設定（.stylelintrc.json）

```json
{
  "extends": ["stylelint-config-standard"]
}
```

**推奨アプローチ**:
「ルールを1つ1つ定義するのではなく、設定済みのconfig（ルールセット）を使用し、必要に応じてルールを上書きする」

### SCSS対応

```json
{
  "extends": ["stylelint-config-standard-scss"],
  "rules": {
    "selector-class-pattern": null
  }
}
```

### Vue.js対応

```bash
npm install --save-dev postcss-html stylelint-config-standard-vue
```

```json
{
  "extends": [
    "stylelint-config-standard-scss",
    "stylelint-config-standard-vue/scss"
  ],
  "overrides": [
    {
      "files": ["*.vue", "**/*.vue"],
      "customSyntax": "postcss-html"
    }
  ]
}
```

## 実行方法

### コマンドライン

```bash
# 全CSSファイルをチェック
npx stylelint "**/*.css"

# SCSS/Sassも含める
npx stylelint "**/*.{css,scss,sass}"

# 自動修正
npx stylelint "**/*.css" --fix
```

### npm scriptsに登録

```json
{
  "scripts": {
    "lint:css": "stylelint \"**/*.{css,scss}\"",
    "fix:css": "stylelint \"**/*.{css,scss}\" --fix"
  }
}
```

**実行**:

```bash
npm run lint:css
npm run fix:css
```

## 主要ルール

### 1. 重複セレクタの検出

**ルール**: `no-duplicate-selectors`

```css
/* ❌ NG: 同じセレクタが重複 */
.button {
  color: red;
}

.button {
  background: blue;
}

/* ✅ OK: 1つのセレクタにまとめる */
.button {
  color: red;
  background: blue;
}
```

**設定で無効化**:

```json
{
  "rules": {
    "no-duplicate-selectors": null
  }
}
```

### 2. 色指定の統一

**ルール**: `color-hex-length`

```css
/* ❌ NG: 長い形式と短い形式が混在 */
.box1 {
  color: #ffffff;
}
.box2 {
  color: #fff;
}

/* ✅ OK: 短い形式に統一 */
.box1 {
  color: #fff;
}
.box2 {
  color: #fff;
}
```

**設定**:

```json
{
  "rules": {
    "color-hex-length": "short"
  }
}
```

### 3. インデント

**ルール**: `indentation`

```json
{
  "rules": {
    "indentation": 2
  }
}
```

### 4. セレクタのネスト深度

**ルール**: `max-nesting-depth`

```css
/* ❌ NG: ネストが深すぎる */
.nav {
  ul {
    li {
      a {
        span {
          /* 深すぎ */
        }
      }
    }
  }
}

/* ✅ OK: ネストは3階層まで */
.nav ul li a {
  /* フラットに */
}
```

```json
{
  "rules": {
    "max-nesting-depth": 3
  }
}
```

### 5. !important の使用制限

**ルール**: `declaration-no-important`

```css
/* ❌ NG: !important は避ける */
.text {
  color: red !important;
}

/* ✅ OK: 詳細度で解決 */
.container .text {
  color: red;
}
```

```json
{
  "rules": {
    "declaration-no-important": true
  }
}
```

## エディタ統合

### VS Code

**拡張機能**: [Stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint)

**settings.json**:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.stylelint": true
  },
  "stylelint.validate": ["css", "scss", "sass", "vue"]
}
```

保存時に自動修正が実行されます。

## CI/CD統合

### GitHub Actions

```yaml
name: CSS Lint

on: [push, pull_request]

jobs:
  stylelint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint:css
```

## よくある問題と対処

### 1. Unknown rule エラー

**エラー**:
```
Unknown rule selector-class-pattern
```

**原因**: ルールが存在しない or プラグインが不足

**対処**:
```bash
npm install --save-dev stylelint-config-standard-scss
```

### 2. 特定のファイルを除外

**.stylelintignore**:

```
# ビルド成果物
dist/
build/

# ベンダーファイル
node_modules/
vendor/

# レガシーコード
legacy/
```

### 3. ルールの部分的な無効化

```css
/* stylelint-disable */
.legacy-code {
  color: red !important;
}
/* stylelint-enable */

/* 1行だけ無効化 */
.button {
  color: red !important; /* stylelint-disable-line declaration-no-important */
}
```

## カスタムルールの追加

### プロジェクト固有のルール

```json
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    "color-named": "never",
    "font-family-name-quotes": "always-where-recommended",
    "unit-allowed-list": ["px", "rem", "%", "vh", "vw", "s", "ms"],
    "selector-max-id": 0,
    "selector-no-qualifying-type": true
  }
}
```

**解説**:
- `color-named: "never"`: 色名（red, blue等）禁止
- `unit-allowed-list`: 許可する単位を限定
- `selector-max-id`: IDセレクタ禁止
- `selector-no-qualifying-type`: タイプセレクタとの組み合わせ禁止（例: `div.class`）

## Prettierとの併用

**問題**: StylelintとPrettierのフォーマットが競合する場合がある

**解決策**:

```bash
npm install --save-dev stylelint-config-prettier
```

```json
{
  "extends": [
    "stylelint-config-standard",
    "stylelint-config-prettier"
  ]
}
```

`stylelint-config-prettier` はPrettierと競合するStylelintルールを無効化します。

## パフォーマンス最適化

### キャッシュの有効化

```bash
npx stylelint "**/*.css" --cache
```

**効果**: 前回の実行結果をキャッシュし、変更されたファイルのみチェック。

### 並列実行

```json
{
  "scripts": {
    "lint:css": "stylelint \"**/*.css\" --cache --max-warnings 0"
  }
}
```

## まとめ

| 項目 | 推奨設定 |
|------|---------|
| **基本設定** | `stylelint-config-standard` |
| **SCSS使用** | `stylelint-config-standard-scss` |
| **Vue.js使用** | `stylelint-config-standard-vue` |
| **Prettier併用** | `stylelint-config-prettier` |
| **エディタ統合** | VS Code拡張機能 + 保存時自動修正 |
| **CI/CD** | GitHub Actions で自動チェック |

**導入効果**:
- コードレビューでスタイルの議論が不要に
- バグの早期発見（構文エラー、重複など）
- チーム全体でコーディング規約を自動的に統一

## 関連ナレッジ

- [ESLint（JavaScript）](./eslint-javascript-linting.md)
- [Prettier（フォーマッター）](./prettier-code-formatter.md)
- [CSSアーキテクチャ](../../css/architecture/css-architecture.md)
- [コーディング規約](./coding-standards.md)
