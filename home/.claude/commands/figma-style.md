---
description: Figma デザインに基づいてコンポーネントをスタイリング
argument-hint: [Figma ノード URL]
allowed-tools: mcp__figma-desktop__get_design_context, mcp__figma-desktop__get_screenshot, mcp__figma-desktop__get_variable_defs, Read, Write, Edit, Glob, Grep, Bash
---

# Figma デザインに基づくコンポーネントスタイリング

指定された Figma デザインを分析し、該当する既存コンポーネントをスタイリングしてください。

## 対象 Figma ノード URL

$ARGUMENTS

## 実行内容

### 1. Figma デザインの分析

- `mcp__figma-desktop__get_design_context` でデザインコンテキストを取得
- `mcp__figma-desktop__get_screenshot` でスクリーンショットを取得して視覚的に確認

### 2. 既存コンポーネントの特定

- プロジェクト内で該当するコンポーネントを検索
- 現在の実装を確認

### 3. デザイントークンの更新

- `mcp__figma-desktop__get_variable_defs` ツールを使用して Figma 変数を取得
- Tailwind クラスまたはプロジェクトのデザイントークンに変換

### 4. マークアップの実装

以下を考慮してマークアップを修正：

- レスポンシブ対応
- セマンティックな HTML 要素の使用（header, nav, main, section, article, aside, footer 等）
- アクセシビリティ対応（aria-label, aria-labelledby, role 等）
- 見出しの階層構造（h1〜h6）の整合性
- リンクやボタンのアクセシブルな名前
- 画像の alt 属性
- 各セクションを独立したコンポーネントに分割
- props インターフェースを適切に定義
- 再利用可能な設計

### 5. スタイリングの実装

- プロジェクトのスタイリングシステム（Tailwind CSS）を使用
- Figma デザインの値を正確に反映

#### 値の変換ガイドライン

| Figma の値 | 実装での扱い                                               |
| ---------- | ---------------------------------------------------------- |
| px 値      | Tailwind の標準クラスに変換（例: 16px → `p-4`）            |
| 色         | デザイントークンまたは `global.css` の `@theme` 定義を優先 |
| フォント   | プロジェクトのフォント設定に従う                           |
| 角丸       | `rounded-*` クラスに変換                                   |
| シャドウ   | `shadow-*` クラスに変換                                    |

#### 許容される差異

- 8px グリッドへの丸め（例: 14px → 16px）
- Tailwind 標準値への変換（例: 18px → 1.125rem → `text-lg`）
- デバイス間の微調整

### 6. レスポンシブ対応

Tailwind のブレークポイントを使用：

| ブレークポイント | 幅     |
| ---------------- | ------ |
| `sm`             | 640px  |
| `md`             | 768px  |
| `lg`             | 1024px |
| `xl`             | 1280px |
| `2xl`            | 1536px |

モバイルファーストで実装し、必要に応じて大画面向けのスタイルを追加。

### 7. インタラクション状態

以下の状態も Figma デザインに基づいて実装：

- ホバー状態（`hover:`）
- フォーカス状態（`focus:`, `focus-visible:`）
- アクティブ状態（`active:`）
- 無効状態（`disabled:`）

### 8. アニメーション/トランジション

- Figma でアニメーションが定義されている場合は `transition-*` クラスで実装
- duration は通常 150ms〜300ms
- イージングは `ease-in-out` をデフォルトに

### 9. ビルドと検証

- `npm run build` でビルドを実行
- prettier エラーがあれば修正
- markuplint エラーがあれば修正

## 注意事項

- 既存のコンポーネント構造を大きく変更する場合は確認を取る
- セマンティクスとアクセシビリティを優先する
- Figma のピクセルパーフェクトより、使いやすさと保守性を優先
