# Sub Agentパターン - Figmaトークン効率化

## なぜSub Agentが必要か

Figma APIのフルレスポンスは1ノードで数万〜数十万トークンになる。
メインセッションに直接流すとコンテキストウィンドウを圧迫し、後続の実装作業が困難になる。

Sub Agentに委譲することで:
- メインセッション: ~500トークン（要約のみ）
- Sub Agent内部: 数万トークン消費（隔離）

## 2段階取得戦略（トークン節約）

大規模デザインでは `get_metadata` → `get_design_context` の2段階戦略を使う:

```
Stage 1: get_metadata（軽量）
  → XMLでレイヤーID・名前・種別・位置・サイズを取得
  → 必要なノードIDを特定

Stage 2: get_design_context（対象ノードのみ）
  → 特定したノードIDだけ詳細取得
  → トークン消費を最小化
```

`get_design_context` の全体取得と比較して、不要なノードへのトークン消費を80〜90%削減できる。

## Conservative Recursive Approach

### 取得戦略

```
depth=1: ルートノードの直下構造のみ取得
  └─ ノード種別を判定
       ├─ COMPONENT/INSTANCE → depth=3で再取得
       ├─ FRAME (画面全体)  → depth=4で再取得
       └─ TEXT/VECTOR       → depth=2で再取得

トークンエラー発生時:
  → depth を -1 して自動リトライ
  → それでも失敗する場合、ノードを分割取得
```

### Sub Agentへの指示（コピー用テンプレート）

```
Figmaノード [NODE_ID] の実装情報を取得して要約してください。

【取得手順】
1. まず get_metadata で全体のレイヤー構造を把握（軽量）
2. 実装に必要なノードIDを特定
3. 対象ノードのみ get_design_context で詳細取得:
   - コンポーネント/インスタンス: depth=3
   - 画面フレーム: depth=4
   - テキスト/ベクター: depth=2
4. get_variable_defs でデザイントークン（変数）を取得
5. トークンエラーが発生したらdepthを1減らしてリトライ

【返却形式（必ずこの形式で返すこと）】

## レイアウト
- コンテナ: [flex-row | flex-col | grid | absolute]
- gap: [値]px
- padding: [top] [right] [bottom] [left]px
- width/height: [固定値px | fill | hug]

## タイポグラフィ
| 要素 | font-family | size | weight | line-height | letter-spacing |
|------|-------------|------|--------|-------------|----------------|
| [名前] | [値] | [値]px | [値] | [値]px | [値]px |

## カラー（変数名優先）
| 用途 | 変数名 | HEX値 |
|------|--------|-------|
| 背景 | [変数名 or N/A] | [値] |
| テキスト | [変数名 or N/A] | [値] |
| ボーダー | [変数名 or N/A] | [値] |

## コンポーネント階層
[コンポーネント名]
  ├─ [子要素]
  └─ [子要素]

## アセット
- SVG: [ノードID一覧]
- 画像: [ノードID一覧]
- MCPが返したローカルホストURL: [URL一覧]

【重要】生データ(JSON/XML)は絶対に返さないこと。
```

## メインセッションでの受け取り方

Sub Agentから受け取った要約を元に実装を開始する。
追加情報が必要な場合のみ、再度Sub Agentを起動して特定ノードを深掘りする。

## トラブルシューティング

| エラー | 対処 |
|--------|------|
| トークン上限 | `get_metadata` で構造把握後、必要ノードのみ `get_design_context` |
| ノードが見つからない | ノードIDの確認。URLからの変換ミスを疑う |
| 参照名のみ返ってくる | `get_variable_defs` でDesign Token取得（typography-extraction.md参照） |
| レート制限（月6回） | `get_metadata` 優先、`get_design_context` は必要最小限に |
