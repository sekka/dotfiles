# Figma 実装詳細ガイド

## 前提条件

- デザイン情報を取得済み（FETCHING.md参照）
- 不足がある場合は Figma MCP を追加で呼び出す

## ワークフロー

### Step 1: 前提確認

- [ ] 対象コンポーネント/画面を特定
- [ ] 優先デバイス・テーマの有無
- [ ] 動作環境（フレームワーク、ライブラリ）

### Step 2: 設計

- [ ] `mcp__figma__get_code_connect_map` で既存コンポーネントマッピングを確認
- [ ] Code Connectマッピング済みのコンポーネントは再利用を最優先
- [ ] 既存のレイアウト/コンポーネント構造を確認
- [ ] props・state・variant を整理
- [ ] 必要に応じて小さい単位に分割

### Step 3: 実装

- [ ] リポジトリのスタイルシステムに沿って適用
  - design tokens（`get_variable_defs` で取得した変数を参照）
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

1. **Code Connectマッピング済みコンポーネント**を再利用（最優先）
2. 既存のデザイントークンを使用（`get_variable_defs` で取得した変数）
3. 既存コンポーネントを再利用/拡張
4. 新規作成は最小限に

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
- **サブエージェントから Figma MCP にアクセスできない** → Figma 情報の取得はメインスレッドで行い、結果をサブエージェントに渡す
