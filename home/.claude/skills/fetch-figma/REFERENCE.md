# Figma MCP ツールリファレンス

このファイルは、Figma MCP で利用可能なツールとその使い方を説明します。

---

## 利用可能なツール

### 1. `mcp__figma-desktop__get_design_context`

デザインの構造とプロパティを取得します。

**用途**:

- コンポーネントの構造把握
- スタイル情報（色、フォント、スペーシング）の取得
- Auto Layout 設定の確認

**パラメータ**:

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| file_key | string | Yes | Figma ファイルのキー |
| node_id | string | No | 特定ノードのID |

**使用例**:

```
URL: https://www.figma.com/file/ABC123/Design?node-id=123-456

file_key: ABC123
node_id: 123-456
```

---

### 2. `mcp__figma-desktop__get_screenshot`

デザインのスクリーンショットを取得します。

**用途**:

- ビジュアル確認
- 状態ごとの見た目確認（hover, focus, etc.）
- 実装との比較

**パラメータ**:

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| file_key | string | Yes | Figma ファイルのキー |
| node_id | string | No | 特定ノードのID |
| scale | number | No | スケール（デフォルト: 1） |

---

### 3. `mcp__figma-desktop__get_variable_defs`

デザイントークン（変数）の定義を取得します。

**用途**:

- カラートークンの取得
- スペーシングトークンの取得
- タイポグラフィトークンの取得

**パラメータ**:

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| file_key | string | Yes | Figma ファイルのキー |
| collection_name | string | No | 変数コレクション名 |

---

## URL からパラメータを抽出する方法

### Figma URL の構造

```
https://www.figma.com/file/{file_key}/{file_name}?node-id={node_id}
https://www.figma.com/design/{file_key}/{file_name}?node-id={node_id}
```

### 抽出例

**URL**:

```
https://www.figma.com/file/ABC123XYZ/MyDesign?node-id=1234-5678
```

**抽出結果**:

- `file_key`: `ABC123XYZ`
- `node_id`: `1234-5678`

---

## 取得できる情報の詳細

### 色情報

```json
{
  "fills": [
    {
      "type": "SOLID",
      "color": {
        "r": 0.039,
        "g": 0.518,
        "b": 1,
        "a": 1
      }
    }
  ]
}
```

**RGB → HEX 変換**:

```
r: 0.039 → 10 (0x0A)
g: 0.518 → 132 (0x84)
b: 1.0 → 255 (0xFF)

HEX: #0A84FF
```

### タイポグラフィ

```json
{
  "style": {
    "fontFamily": "Inter",
    "fontWeight": 600,
    "fontSize": 16,
    "lineHeightPx": 24,
    "letterSpacing": 0
  }
}
```

**CSS への変換**:

```css
font-family: 'Inter', sans-serif;
font-weight: 600;
font-size: 16px;
line-height: 24px;
letter-spacing: 0;
```

### Auto Layout

```json
{
  "layoutMode": "HORIZONTAL",
  "primaryAxisAlignItems": "CENTER",
  "counterAxisAlignItems": "CENTER",
  "paddingTop": 16,
  "paddingRight": 24,
  "paddingBottom": 16,
  "paddingLeft": 24,
  "itemSpacing": 8
}
```

**CSS への変換**:

```css
display: flex;
flex-direction: row;
justify-content: center;
align-items: center;
padding: 16px 24px;
gap: 8px;
```

### 角丸・影

```json
{
  "cornerRadius": 12,
  "effects": [
    {
      "type": "DROP_SHADOW",
      "offset": { "x": 0, "y": 8 },
      "radius": 24,
      "color": { "r": 0, "g": 0, "b": 0, "a": 0.08 }
    }
  ]
}
```

**CSS への変換**:

```css
border-radius: 12px;
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
```

---

## トラブルシューティング

### 「Access denied」エラー

**原因**: ファイルへのアクセス権がない

**解決策**:

1. Figma デスクトップアプリでファイルを開いているか確認
2. ファイルの共有設定を確認
3. 正しいアカウントでログインしているか確認

### 「Node not found」エラー

**原因**: 指定した node_id が存在しない

**解決策**:

1. URL の node-id パラメータを再確認
2. ノードが削除されていないか確認
3. ファイルの最新バージョンを開いているか確認

### データが取得できない場合

**チェックリスト**:

- [ ] Figma デスクトップアプリが起動しているか
- [ ] 対象ファイルがアプリで開いているか
- [ ] MCP サーバーが正常に起動しているか
- [ ] ネットワーク接続は正常か

---

## ベストプラクティス

### 1. 段階的に情報を取得

```
1. get_design_context でページ全体の構造を把握
2. 必要なノードを特定
3. 特定ノードに対して詳細な情報を取得
4. get_screenshot でビジュアル確認
```

### 2. 変数を活用

デザイントークンが定義されている場合は、ハードコードされた値ではなく変数を参照:

```
✅ 良い: var(--color-primary-500)
❌ 悪い: #0A84FF
```

### 3. 状態ごとに確認

インタラクティブなコンポーネントは、すべての状態を確認:

- Default
- Hover
- Focus
- Active
- Disabled
