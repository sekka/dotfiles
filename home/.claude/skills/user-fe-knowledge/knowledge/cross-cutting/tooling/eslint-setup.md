---
title: ESLint を「入れただけ」で終わらせない導入と実行戦略
category: cross-cutting/tooling
tags: [eslint, lint, tooling, pre-commit, husky, lint-staged, oxlint, typescript, vscode, ci, 2024]
browser_support: N/A (開発ツール)
created: 2026-05-13
updated: 2026-05-13
---

# ESLint 適切な導入と実行タイミング戦略

> 出典: https://ics.media/entry/260410/ — ICS 野原 のぞみ
> 追加日: 2026-05-13

ESLint は JavaScript / TypeScript の問題を自動検出するツール。**フォーマットの統一だけでなく、バグの兆候や実行時エラーにつながる記述も検知できる**ことが本質的価値。

## 推奨ルール

### バグ検知系（最優先）

| ルール | 効果 |
|--------|------|
| `no-unused-vars` | 未使用変数の検知 |
| `no-undef` | 未定義変数の参照 |
| `no-unreachable` | 到達不能コード |
| `eqeqeq` | `==` 禁止（型変換による比較エラー防止） |

**TypeScript の場合**: `@typescript-eslint/no-unused-vars` を使用（`typescript-eslint` プラグイン）。

### 可読性向上系

| ルール | 効果 |
|--------|------|
| `complexity` | 関数の循環的複雑度に上限 |
| `max-depth` | ネストの深さを制限 |
| `sort-imports` | import 文をアルファベット順に整列 |
| `max-lines-per-function` | 関数の行数を制限 |

## セットアップ

### インストール

```bash
npm init @eslint/config@latest
```

### `eslint.config.mjs`（Flat Config）基本形

```javascript
import globals from "globals";
import js from "@eslint/js";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/.next/**",
      "**/*.generated.*",
    ],
  },
  {
    files: [
      "apps/web/**/*.{js,jsx,ts,tsx}",
      "packages/ui/**/*.{js,jsx,ts,tsx}",
    ],
    languageOptions: {
      globals: globals.browser,
    },
    ...js.configs.recommended,
  },
];
```

### `package.json` スクリプト

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

## 実行タイミング 3段階戦略

「個人の判断に任せると実行漏れが起こる」ため、複数段階で強制する。

### 1. エディター上（リアルタイム）

VS Code の自動修正設定:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

→ 保存時に `--fix` が走る。個人レベルでの即時フィードバック。

### 2. コミット時（pre-commit フック）

husky + lint-staged で差分ファイルのみ lint。

```bash
npm install -D husky lint-staged
npx husky init
```

`.husky/pre-commit`:
```sh
npx lint-staged
```

`package.json`:
```json
{
  "lint-staged": {
    "*.{js,ts,jsx,tsx}": "eslint --fix"
  }
}
```

→ チームに lint 通過を強制できる。コミットを物理的にブロック。

### 3. CI 上（最終ゲート）

GitHub Actions:

```yaml
name: Lint
on:
  push:
    branches: [main]
  pull_request:
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 'lts/*'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
```

→ ローカルフックを skip された場合の最終防衛線。環境依存の差も排除。

## 代替・補完ツール

### Oxlint — 高速化

- ESLint 比 **最大 50〜100 倍高速**（Rust 製）
- ESLint 互換ルール
- 大規模プロジェクトでの開発体験を改善

```bash
npm install -D oxlint
```

### eslint-plugin-oxlint — 重複ルール無効化

ESLint と Oxlint を併用する場合、Oxlint がカバーするルールを ESLint 側で自動的に無効化。

```javascript
// eslint.config.mjs
import oxlint from "eslint-plugin-oxlint";

export default [
  // ...
  ...oxlint.configs["flat/recommended"], // 配列の末尾に置く
];
```

### フレームワーク対応プラグイン

| フレームワーク | プラグイン |
|--------------|-----------|
| React | `eslint-plugin-react`, `eslint-plugin-react-hooks` |
| Vue.js | `eslint-plugin-vue` |
| Next.js | 公式 ESLint プラグイン |
| TypeScript | `typescript-eslint` |
| アクセシビリティ | `eslint-plugin-jsx-a11y` |

## なぜこの戦略が優れているか

1. **段階的チェック** — エディター → pre-commit → CI で手戻りが少ない
2. **チーム開発の効率化** — 統一スタイルでマージコンフリクト削減
3. **自動修正の活用** — `--fix` で手作業を削減
4. **スケーラビリティ** — フレームワーク成長に応じてルール追加可能
5. **多層防御** — どこか 1 段階を skip しても他で捕捉できる

## アンチパターン

- ❌ **CI だけ lint を有効化** — PR で初めて指摘され、手戻りが大きい
- ❌ **pre-commit でフォーマットだけ** — バグ検知ルールを動かさない
- ❌ **未使用変数を warn にする** — `error` にしないと無視される
- ❌ **`--max-warnings` 未設定の CI** — warn が貯まり続ける

## 関連ナレッジ

- [stylelint-css-linting.md](./stylelint-css-linting.md) — CSS の lint
- 当 dotfiles では `oxlint` + `dprint` の組み合わせを採用（`scripts/development/lint-format.ts`）

## 参考リソース

- [ICS: ESLint を「入れただけ」で終わらせない](https://ics.media/entry/260410/)
- [ESLint 公式](https://eslint.org/)
- [Oxlint](https://oxc.rs/docs/guide/usage/linter)
- [typescript-eslint](https://typescript-eslint.io/)
