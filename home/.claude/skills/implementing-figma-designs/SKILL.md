---
name: implementing-figma-designs
description: Figma スタイルリサーチで得た情報を基に、既存コードベースへ正確に落とし込みます。Figmaデザインの実装が必要なときに使用してください。
---

# Figma 実装

## Quick Start

1. fetch-figma で取得したデザイン情報を確認
2. 既存コードベースの設計体系を把握
3. コンポーネント設計 → 実装 → 検証

## 前提条件

- fetch-figma スキルで実測データを取得済み
- 不足がある場合は Figma MCP を追加で呼び出す

## ワークフロー

### Step 1: 前提確認

- [ ] 対象コンポーネント/画面を特定
- [ ] 優先デバイス・テーマの有無
- [ ] 動作環境（フレームワーク、ライブラリ）

### Step 2: 設計

- [ ] 既存のレイアウト/コンポーネント構造を確認
- [ ] props・state・variant を整理
- [ ] 必要に応じて小さい単位に分割

### Step 3: 実装

- [ ] リポジトリのスタイルシステムに沿って適用
  - design tokens
  - CSS Modules / Tailwind / styled-components 等
- [ ] 数値とトークンを正確に反映
- [ ] アクセシビリティを確保
  - セマンティックな HTML
  - ARIA 属性
  - キーボード操作（tab 移動）

### Step 4: 検証

- [ ] 主要状態を確認: default / hover / focus / active / disabled
- [ ] ブレークポイントごとの表示確認
- [ ] ビルド・テスト・リントを実行

## 実装ガイドライン

### スタイル適用の優先順位

1. 既存のデザイントークンを使用
2. 既存コンポーネントを再利用/拡張
3. 新規作成は最小限に

### 状態の実装

```css
/* 状態ごとのスタイル例 */
.button {
  background: var(--color-primary-500);
}
.button:hover {
  background: var(--color-primary-600);
}
.button:focus {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### バリアント実装

```tsx
// props による variant 切り替え例
interface ButtonProps {
  variant: "primary" | "secondary" | "ghost";
  size: "sm" | "md" | "lg";
}
```

## 出力フォーマット

```markdown
## 実装結果

### 変更ファイル

- `src/components/Button.tsx`: variant追加
- `src/styles/button.css`: hover状態追加

### 適用したトークン

- color: `--color-primary-500`
- spacing: `--space-4`

### テスト結果

- ビルド: OK
- リント: OK
- 状態確認: default/hover/focus OK

### 残課題

- dark テーマの対応が必要
```

## 注意事項

- 変更範囲を最小化する
- 影響範囲が広い場合は理由とリスクを明示
- 追加で必要な Figma 情報があれば明示
