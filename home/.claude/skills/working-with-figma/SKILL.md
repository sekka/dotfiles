---
name: working-with-figma
description: FigmaデザインをコードへHigh-fidelityに実装します。Figmaファイル・フレーム・コンポーネントの実装依頼、「Figmaのデザイン通りに」「このFigmaを実装して」「デザインカンプ通りに」などのキーワードで起動します。Figma MCPツールが利用可能な場合は積極的に活用します。
disable-model-invocation: false
---

# Figmaデザイン実装スキル

## 概要

FigmaデザインをHigh-fidelityでコード実装するスキル。
Sub Agentパターンでトークン効率を最大化しながら、デザインの意図を正確に再現します。

## 前提確認

実装前に以下を確認する:

1. **Figma MCP** が利用可能か確認（`figma` ツールが存在するか）
2. **対象フレーム/コンポーネント** のノードID または URL
3. **実装先のフレームワーク**（React/Vue/HTML+CSS等）
4. **Design System** の有無（Tailwind、Panda CSS、独自CSS等）

## 実行フロー

### Step 1: Sub Agentでデザインデータ取得

**重要: Figma APIレスポンスは膨大なトークンを消費する。必ずSub Agentに委譲し、メインセッションには要約のみ返させる。**

Sub Agentへの指示テンプレート:
```
以下のFigmaノードを段階的に取得し、実装に必要な情報のみ要約して返してください。

ノード: [NODE_ID]

取得手順:
1. depth=1で全体構造を把握
2. 主要コンポーネントをdepth=3で詳細取得
3. 画面全体の場合はdepth=4
4. トークンエラー時は自動リトライ（depth-1）

返却形式:
- レイアウト構造（フレックス/グリッド/絶対配置）
- タイポグラフィ（フォント名、サイズ、ウェイト、行間）
- カラー（HEX値またはデザイントークン参照名）
- スペーシング（padding/margin/gap）
- コンポーネント一覧と階層
- SVG/画像アセットのノードID一覧

生データは返さないこと。必ず要約形式で返すこと。
```

詳細: `references/sub-agent-pattern.md`

### Step 2: デザイントークンの解決

- Figma APIが返すのは参照名（例: `color/primary/500`）のみ
- プロジェクトのDesign Token定義と照合して実際の値に変換
- 対応表が不明な場合はユーザーに確認

詳細: `references/typography-extraction.md`

### Step 3: アセット取得

- SVGアイコン・画像はMCPのdownload機能で取得
- メタデータからSVGパスを推測しない（必ず実ファイルを取得）
- 詳細: `references/asset-handling.md`

### Step 4: System UI要素の除外判断

iOSホームインジケーター・Androidナビゲーションバー等のOS描画要素は実装しない。
詳細: `references/system-ui-exclusion.md`

### Step 5: コード実装

取得した情報をもとにコンポーネントを実装:

```
実装優先度:
1. レイアウト構造（flex/grid配置）
2. スペーシング（padding/margin/gap）
3. タイポグラフィ（font-size, line-height, font-weight）
4. カラー（背景色、テキスト色、ボーダー）
5. インタラクション（hover, focus, active状態）
6. アニメーション（transition, animation）
```

### Step 6: 視覚差分確認（オプション）

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

Design Systemがある場合はトークン変数を優先:
```css
/* 良い例 */
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

## 依頼者向けガイド

精度の高い実装依頼に必要な情報（URL・スタック・Design Token・スコープ等）:
`references/request-guide.md`

## 関連スキル

- **designing-ui**: コンポーネント仕様定義、デザイン意図の補完
- **developing-frontend**: 実装技術の詳細（React/Vue/CSS）
- **managing-frontend-knowledge**: モダンCSS技術の参照
