# タイポグラフィ抽出とDesign Token解決

## Figma APIの制約

Figma APIはタイポグラフィの「参照名」のみを返す場合がある。
例: `fontFamily: "Inter"` ではなく `fontFamily: "typography/body/regular"` のように返ってくる。

これはDesign Variable（旧: Design Token）が設定されている場合の挙動。

## 解決手順

### 1. 参照かリテラルかを判別する

```
リテラル値: "Inter", "#3b82f6", 16
参照名:     "color/primary/500", "typography/heading/large", "spacing/4"
```

参照名は `/` 区切りの階層構造になっていることが多い。

### 2. Design Token定義ファイルを探す

プロジェクト内の以下を確認:
- `tokens.json` / `design-tokens.json`
- `theme.ts` / `theme.js`
- `tailwind.config.ts` の `theme.extend`
- CSS Variables定義（`:root { --color-primary-500: ... }`）
- Panda CSS: `panda.config.ts` の `theme`
- Style Dictionary: `tokens/` ディレクトリ

### 3. 対応表の作成

| Figma参照名 | 実際の値 |
|------------|---------|
| `color/primary/500` | `#3b82f6` |
| `typography/body/regular` | `Inter, 16px, weight 400` |
| `spacing/4` | `1rem (16px)` |

### 4. 対応表が存在しない場合

ユーザーに確認:
```
Figmaのデザイントークン「[参照名]」の実際の値が不明です。
プロジェクトのDesign Token定義ファイルはどこにありますか？
または、この値を直接教えてください。
```

## よくある変換パターン

### フォントウェイト

| Figma表記 | CSS値 |
|-----------|-------|
| Thin | 100 |
| ExtraLight | 200 |
| Light | 300 |
| Regular | 400 |
| Medium | 500 |
| SemiBold | 600 |
| Bold | 700 |
| ExtraBold | 800 |
| Black | 900 |

### line-height

Figmaはpx値で保持。CSSではem換算が推奨:

```
Figma: font-size=16px, line-height=24px
CSS:   font-size: 1rem; line-height: 1.5;  (24/16=1.5)
```

### letter-spacing

Figmaはpx値。CSSでもpxかem換算:

```
Figma: letter-spacing=-0.4px
CSS:   letter-spacing: -0.025em;  (または -0.4px のまま)
```
