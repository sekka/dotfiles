---
name: working-with-figma
description: FigmaデザインをコードへHigh-fidelityに実装します。Figmaファイル・フレーム・コンポーネントの実装依頼、「Figmaのデザイン通りに」「このFigmaを実装して」「デザインカンプ通りに」などのキーワードで起動します。Figma MCPツールが利用可能な場合は積極的に活用します。
disable-model-invocation: false
---

# Figmaデザイン実装スキル

## 概要

FigmaデザインをHigh-fidelityでコード実装するスキル。
公式Figma MCPサーバーのツール群を活用してトークン効率を最大化しながら、デザインの意図を正確に再現します。

## 利用可能なMCPツール

| ツール | 用途 |
|--------|------|
| `mcp__figma__get_design_context` | React+Tailwind形式の構造化デザイン情報を取得 |
| `mcp__figma__get_screenshot` | レイアウト視覚確認用スクリーンショット |
| `mcp__figma__get_variable_defs` | 色・間隔・タイポグラフィ変数の一括取得 |
| `mcp__figma__get_code_connect_map` | Figmaノード↔コードコンポーネントのマッピング取得 |
| `mcp__figma__get_metadata` | XMLでレイヤー情報取得（大規模デザイン向け軽量版） |
| `mcp__figma__create_design_system_rules` | プロジェクト用デザインシステムルール自動生成 |

## レート制限の注意

- **Starter/View/Collab席**: 月6回制限（慎重に使用する）
- **Dev/Full席（Professional以上）**: 分当たり制限（Tier 1 REST API準拠）

月6回制限の場合は `get_metadata` → `get_design_context` の2段階戦略でトークンを節約する。

## 実行フロー

### Step 1: 事前準備（初回のみ）

プロジェクトで初めてFigmaを使う場合:

```
1. mcp__figma__create_design_system_rules でプロジェクト用ルールを生成
2. mcp__figma__get_code_connect_map で既存コンポーネントマッピングを取得
```

Code Connectマッピングがあれば既存コンポーネントを最優先で再利用する。

### Step 2: デザイン情報取得

**重要: Figma APIレスポンスは膨大なトークンを消費する。必ずSub Agentに委譲し、メインセッションには要約のみ返させる。**

推奨取得順序:
1. `mcp__figma__get_design_context` — 構造とプロパティを取得
2. `mcp__figma__get_screenshot` — 視覚的に確認（全状態: default/hover/focus/active/disabled）
3. `mcp__figma__get_variable_defs` — デザイントークン（変数）を取得

詳細: `FETCHING.md` / `references/sub-agent-pattern.md`

### Step 3: 大規模デザイン向けトークン節約

デザインが大きく `get_design_context` のレスポンスが肥大化する場合:

```
1. mcp__figma__get_metadata で軽量なXMLレイヤー情報を先に取得
2. 必要なノードIDを特定
3. 対象ノードだけ mcp__figma__get_design_context で詳細取得
```

### Step 4: アセット取得

- MCPが返すローカルホストURLはそのまま使用する
- 新規アイコンパッケージの追加は禁止（既存の方法でアセットを処理する）

詳細: `references/asset-handling.md`

### Step 5: System UI除外

iOSホームインジケーター・Androidナビゲーションバー等のOS描画要素は実装しない。
詳細: `references/system-ui-exclusion.md`

### Step 6: コード実装

取得した情報をもとにコンポーネントを実装:

```
実装優先度:
1. Code Connectマッピング済みコンポーネントを最優先で再利用
2. デザイントークン（変数）をハードコード値より優先
3. レイアウト構造（flex/grid配置）
4. スペーシング（padding/margin/gap）
5. タイポグラフィ（font-size, line-height, font-weight）
6. カラー（背景色、テキスト色、ボーダー）
7. インタラクション（hover, focus, active状態）
8. アニメーション（transition, animation）
```

### Step 7: 視覚差分確認（オプション）

Chrome DevTools MCPまたはPlaywright MCPで実装結果をスクリーンショット取得し、Figmaデザインと比較する。

## 実装ガイドライン

### レイアウト実装

```css
/* Figma Auto Layout → CSS Flexbox */
direction: horizontal → flex-direction: row
direction: vertical   → flex-direction: column
spacing: 16           → gap: 1rem
padding: [8, 16, 8, 16] → padding: 0.5rem 1rem

/* Figma Constraints */
Fill container → flex: 1 または width: 100%
Fixed width    → width: [px]
Hug contents   → width: fit-content
```

### タイポグラフィ実装

```css
/* Figmaの値をそのままCSSへ */
font-size: [Figma値]px
line-height: [Figma値]px → calc([値]px / [font-size]px)でem換算推奨
font-weight: [Figmaウェイト]
letter-spacing: [Figma値]px
```

### カラー実装

`get_variable_defs` で取得した変数を優先し、ハードコードは最終手段:
```css
/* 良い例: 変数参照 */
color: var(--color-primary-500);
background: var(--color-gray-100);

/* Design Tokenがない場合はHEX直書き */
color: #3b82f6;
```

## 品質チェックリスト

- [ ] スペーシング: Figma値とpx単位が一致しているか
- [ ] タイポグラフィ: フォントファミリー、サイズ、ウェイトが正確か
- [ ] カラー: HEX値またはトークンが正しいか
- [ ] レイアウト: flex/gridの方向・配置が一致しているか
- [ ] レスポンシブ: 固定サイズとフレキシブルサイズの判断が正しいか
- [ ] アセット: SVG/画像が実ファイルから取得されているか
- [ ] System UI: OS描画要素を実装していないか
- [ ] Code Connect: 既存コンポーネントを再利用できたか

## 依頼者向けガイド

精度の高い実装依頼に必要な情報（URL・スタック・Design Token・スコープ等）:
`references/request-guide.md`

## 関連スキル

- **designing-ui**: コンポーネント仕様定義、デザイン意図の補完
- **developing-frontend**: 実装技術の詳細（React/Vue/CSS）
- **managing-frontend-knowledge**: モダンCSS技術の参照
