# Figma デザイン情報取得ガイド

## ワークフロー

### Step 1: URL確認

- 対象ページ/ノードを特定
- 意図を確認（画面全体 or コンポーネント単体）
- 優先デバイス・テーマ（light/dark）を把握

### Step 2: データ取得

```text
mcp__figma-desktop__get_design_context
```

- 構造とプロパティを取得
- 必要に応じて対象ノードを絞って追加呼び出し

### Step 3: ビジュアル確認

```text
mcp__figma-desktop__get_screenshot
```

- 状態ごとに確認: default / hover / focus / active / disabled

### Step 4: 情報抽出

以下を数値付きで整理:

- 色: カラートークン、HEX値
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
- **取得**: `get_design_context`（ノード名）、`get_screenshot`（状態）

### 配色

- primary/500: `#0A84FF`
- text/default: `#0B1220`
- background: `#F8FAFF`

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
