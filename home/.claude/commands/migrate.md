---
description: ライブラリやフレームワークのバージョンアップ対応
argument-hint: [パッケージ名@バージョン]
---

# マイグレーション

対象: $ARGUMENTS

## 実行内容

### Step 1: 現状確認

```bash
# 現在のバージョンを確認
npm list <package-name>
# または
cat package.json | grep <package-name>
```

- 現在のバージョン
- 目標のバージョン
- 依存関係の確認

### Step 2: 変更内容の調査

Context7 MCP または公式ドキュメントで以下を確認：

- リリースノート / Changelog
- マイグレーションガイド
- 破壊的変更（Breaking Changes）
- 非推奨（Deprecated）になった機能
- 新機能

```markdown
## 変更内容サマリー

### 破壊的変更

| 変更内容 | 影響範囲 | 対応方法 |
| -------- | -------- | -------- |
| ...      | ...      | ...      |

### 非推奨化

| 非推奨機能 | 代替機能 | 期限 |
| ---------- | -------- | ---- |
| ...        | ...      | ...  |

### 新機能

| 機能 | 説明 | 活用可否 |
| ---- | ---- | -------- |
| ...  | ...  | ...      |
```

### Step 3: 影響範囲の特定

プロジェクト内で影響を受けるコードを検索：

```bash
# 非推奨 API の使用箇所を検索
rg "deprecatedFunction" --type ts

# import 文を検索
rg "from ['\"]<package-name>" --type ts
```

### Step 4: マイグレーション計画

```markdown
## マイグレーション計画

### 事前準備

- [ ] 現在の状態でテストがパスすることを確認
- [ ] ブランチを作成

### 実施手順

1. [ ] 依存パッケージの更新
2. [ ] 破壊的変更への対応
3. [ ] 非推奨機能の置き換え
4. [ ] 型定義の更新
5. [ ] テストの修正
6. [ ] ビルド確認

### リスクと対策

| リスク | 可能性   | 対策 |
| ------ | -------- | ---- |
| ...    | 高/中/低 | ...  |
```

### Step 5: 実装（承認後）

#### 5.1 パッケージ更新

```bash
npm install <package-name>@<version>
# または
npm update <package-name>
```

#### 5.2 コードの修正

- 破壊的変更への対応
- 非推奨機能の置き換え
- 型エラーの修正

#### 5.3 テスト

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

### Step 6: 検証

- [ ] 全てのテストがパス
- [ ] 型エラーがない
- [ ] lint エラーがない
- [ ] ビルドが成功
- [ ] 主要機能の動作確認

## よくあるマイグレーションパターン

### React

```typescript
// React 18: createRoot API
// Before
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, document.getElementById('root'));

// After
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
```

### Next.js

```typescript
// Pages Router → App Router
// Before: pages/index.tsx
export default function Home() { ... }

// After: app/page.tsx
export default function Page() { ... }
```

### TypeScript

```typescript
// 型の厳格化への対応
// Before
const value: any = getData();

// After
const value: unknown = getData();
if (typeof value === "string") {
  // 型安全に使用
}
```

## ロールバック手順

問題が発生した場合：

```bash
# パッケージを元のバージョンに戻す
npm install <package-name>@<previous-version>

# または git で戻す
git checkout -- package.json package-lock.json
npm install
```

## 注意事項

- 大きなバージョンアップは段階的に行う（v1→v2→v3 と順番に）
- 本番環境への適用前にステージング環境でテスト
- ロールバック手順を事前に確認
- 依存パッケージの互換性も確認
- CHANGELOG を必ず読む
