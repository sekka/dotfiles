# Figma デザイン情報取得ガイド

## 前提条件

- Figma ファイルで **Auto Layout が正しく設定されている**こと → 未設定だと gap / padding / flex 方向などの数値が取得できない

## ワークフロー

### Step 1: URL確認

- 対象ページ/ノードを特定
- 意図を確認（画面全体 or コンポーネント単体）
- 優先デバイス・テーマ（light/dark）を把握

### Step 2: データ取得

**通常フロー（推奨順序）:**

```text
1. mcp__figma__get_design_context   — 構造とプロパティを取得
2. mcp__figma__get_variable_defs    — デザイントークン（変数）を一括取得
3. mcp__figma__get_screenshot       — 状態ごとに視覚確認
```

`get_variable_defs` を使うことで、色・スペーシング・タイポグラフィ変数の手動照合が不要になる。

**大規模デザイン向け（トークン節約）:**

```text
1. mcp__figma__get_metadata         — 軽量XMLでレイヤー構造を把握
2. 必要なノードIDを特定
3. mcp__figma__get_design_context   — 対象ノードのみ詳細取得
```

`get_metadata` はレイヤーID・名前・種別・位置・サイズのみ返す。`get_design_context` より大幅にトークンを節約できる。

### Step 3: ビジュアル確認

```text
mcp__figma__get_screenshot
```

- 状態ごとに確認: default / hover / focus / active / disabled

### Step 4: 情報抽出

以下を数値付きで整理:

- 色: `get_variable_defs` から変数名とHEX値
- タイポグラフィ: サイズ、行高、ウェイト
- スペーシング: 余白、gap、padding
- レイアウト: constraints、autolayout、responsive
- 角丸・影: border-radius、box-shadow
- アイコン/画像: 種別、サイズ
- バリアント: prop名と値

## 出力フォーマット

```markdown
## デザイン情報

- **対象**: `<URL>`（ページ/ノード、デバイス、テーマ）
- **取得**: `get_design_context`（ノード名）、`get_variable_defs`、`get_screenshot`（状態）

### 配色（変数）

- --color-primary-500: `#0A84FF`
- --color-text-default: `#0B1220`
- --color-background: `#F8FAFF`

### タイポグラフィ

- Heading/LG: 28px/34px, weight 700
- Body/MD: 16px/24px, weight 400

### スペーシング

- セクション余白: 24px top/bottom
- カード内: 16px all

### レイアウト

- コンテナ幅: 1200px center
- Auto Layout: row gap 12px, column gap 16px, padding 20px

### 角丸・影

- border-radius: 12px
- shadow: 0 8px 24px rgba(0,0,0,0.08)

### 状態/バリアント

- ボタン variant `kind=primary`
- state `hover`: bg `#0C7AE5`, text `#FFFFFF`
```

## 注意事項

- 推測せず、必ず Figma MCP の結果を根拠にする
- 取得できない場合は「どのノード/権限が不足しているか」を具体的に伝える
- レート制限（Starter/View/Collab席: 月6回）を意識し、`get_metadata` で先に構造を把握してから `get_design_context` を使う
