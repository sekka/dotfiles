# アセット処理 - SVG・画像の取得ルール

## 基本原則

**メタデータからSVGパスを推測・再現しない。必ずMCPのdownload機能で実ファイルを取得する。**

Figma APIのノードメタデータからベクターパスを推測しようとすると:
- パスデータが不完全になる
- 曲線・アンカーポイントが失われる
- 最終的に使えないSVGが生成される

## MCPが返すローカルホストURLの扱い

Figma MCPはアセットをダウンロードしてローカルホストURL（例: `http://127.0.0.1:XXXXX/...`）で返す場合がある。
**このURLはそのまま使用する**。追加のダウンロード処理は不要。

```
# MCPがURLを返した場合
<img src="http://127.0.0.1:XXXXX/asset.svg" />  → そのまま使用

# ファイルとして保存する場合
curl -s "http://127.0.0.1:XXXXX/asset.svg" -o src/assets/icons/icon-name.svg
```

## 新規アイコンパッケージの追加禁止

**既存のアイコン管理方法を優先する。** MCPから取得したアセットを処理するために新規パッケージを追加しない。
プロジェクトに既存のアイコン管理方法がある場合はそれに従う。

## 取得フロー

```
1. Sub AgentでノードIDを特定（type: VECTOR / IMAGE_VECTOR / COMPONENT）
2. MCPのdownload/exportを使ってSVGとして書き出し
   → MCPがローカルホストURLを返した場合はそのまま使用
3. ダウンロードしたSVGをプロジェクトに配置
```

## ノード種別と対応

| Figmaノード種別 | 対応 |
|----------------|------|
| VECTOR | SVGとしてexport |
| IMAGE | PNG/WebPとしてexport |
| COMPONENT (アイコン) | SVGとしてexport |
| FRAME (複合) | まずコンポーネントに分解してから個別export |

## SVG最適化

ダウンロード後にSVGOで最適化を推奨:

```bash
npx svgo input.svg -o output.svg
```

最適化オプション（推奨）:
- `removeViewBox: false` (viewBox は保持)
- `removeDimensions: true` (width/height属性を削除してCSSで制御)
- `cleanupIds: true`

## React/Vue でのSVG利用

### インラインSVG（アイコン等）

```tsx
// SVGをコンポーネントとしてインポート
import IconHome from '@/assets/icons/home.svg?component'

// または直接インライン
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Figmaからexportした内容 */}
  </svg>
)
```

### 画像ファイル

```tsx
import heroImage from '@/assets/images/hero.webp'

<img src={heroImage} alt="..." width={800} height={600} />
```

## 注意事項

- SVGのfill/strokeカラーはFigmaのカラーがハードコードされている場合がある
- `currentColor` に変換するとCSSから制御可能になる
- アイコンの場合は `fill="currentColor"` 推奨
