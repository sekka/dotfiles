---
url: https://ics.media/entry/260410/
fetched_at: 2026-05-13
title: ESLintを「入れただけ」で終わらせない — 適切なルールの選び方と実行タイミング
---

# ESLint 適切な導入

**著者:** 株式会社 ICS 野原 のぞみ

## ESLintの役割
JavaScript/TypeScript の問題を自動検出。"フォーマットの統一だけでなく、バグの兆候や実行時エラーにつながる記述も検知できる"。

## バグ検知ルール
- `no-unused-vars` — 未使用変数の検知
- `no-undef` — 未定義変数の参照
- `no-unreachable` — 到達不能コード
- `eqeqeq` — `==` の使用を禁止（型変換による比較エラー防止）

**TypeScript対応:** TypeScript ファイルでは `typescript-eslint` の `@typescript-eslint/no-unused-vars` を使用推奨

## 可読性向上ルール
- `complexity` — 関数の複雑さに上限
- `max-depth` — ネストの深さを制限
- `sort-imports` — import 文のメンバーをアルファベット順
- `max-lines-per-function` — 関数の行数を制限

## コード例

### インストール
```bash
npm init @eslint/config@latest
```

### eslint.config.mjs 基本設定
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

### package.json
```json
{
  "scripts": {
    "lint": "eslint ."
  }
}
```

### pre-commit (husky + lint-staged)
```bash
npm install -D husky lint-staged
npx husky init
```

`.husky/pre-commit`:
```
npx lint-staged
```

`package.json`:
```json
{
  "lint-staged": {
    "*.{js,ts}": "eslint"
  }
}
```

### VS Code 自動修正設定
```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

### CI (GitHub Actions)
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
      - run: npm ci
      - run: npm run lint
```

## Lint 実行タイミング戦略

3段階アプローチ:
1. **エディター上** — リアルタイムフィードバック（個人依存）
2. **コミット時** — pre-commit フックで強制（チーム保証）
3. **CI** — 最終検証（環境依存を排除）

"個人の判断に任せると実行漏れが起こる可能性があるため、コミット時や CI 時の自動実行と組み合わせるのが安全"

## 代替ツール
- **Oxlint** — ESLint より最大 50〜100 倍高速。ESLint 互換
- **eslint-plugin-oxlint** — Oxlint と ESLint の重複ルールを自動無効化
- **フレームワーク対応プラグイン**:
  - React: `eslint-plugin-react`, `eslint-plugin-react-hooks`
  - Vue.js: `eslint-plugin-vue`
  - Next.js: 公式 ESLint プラグイン
  - TypeScript: `typescript-eslint`

## なぜ優れているか
1. **段階的チェック** — エディター → pre-commit → CI で手戻りが少ない
2. **チーム開発の効率化** — 統一されたコードスタイル
3. **自動修正の活用** — `--fix` で手作業を削減
4. **スケーラビリティ** — フレームワーク成長に合わせてルール追加可能
