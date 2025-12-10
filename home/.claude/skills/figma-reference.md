# Figma デザイン参照

目的: コーディング時に参照するため、渡された Figma URL から Figma MCP で正確なデザイン情報を取得・共有する。

## 基本方針
- 推測せず、必ず Figma MCP の結果を根拠にする。
- 主要ツールは `mcp__figma-desktop__get_design_context` と `mcp__figma-desktop__get_screenshot`。必要に応じて他の Figma MCP ツールも併用する。
- 取得できない場合は「どのノード/権限が不足しているか」を具体的に伝えて再依頼する。
- このスキルでは情報収集と整理のみを行い、実装は別スキルで対応する。

## 進め方
1. URL 確認: 対象ページ/ノード、意図（画面全体かコンポーネント単体か）、優先デバイスやテーマ（light/dark）を確認する。
2. データ取得: `mcp__figma-desktop__get_design_context` で構造やプロパティを取得し、必要なら対象ノードを絞って追加で呼び出す。
3. ビジュアル確認: `mcp__figma-desktop__get_screenshot` でスクリーンショットを取得し、状態ごと（default/hover/focus/active/disabled など）に分けて確認する。
4. 抽出する情報: 色・タイポ・スペーシング・レイアウト制約（constraints/autolayout/responsive ルール）、角丸・影、アイコン/画像の種別、インタラクションやバリアント（variant/prop 名と値）を数値付きで整理する。
5. 共有: 実測値とキー名を併記した簡潔な箇条書きでまとめ、参照した MCP 呼び出し（スクリーンショット有無）を示す。推測や汎用テンプレは避ける。

## 共有フォーマット例
- 対象: `<URL>` （ページ/ノード、デバイス、テーマ）
- 取得: `get_design_context`（対象ノード名）、`get_screenshot`（状態: default/hover/...）
- 配色: `primary/500 #0A84FF`、`text/default #0B1220`、背景 `#F8FAFF`
- タイポ: `Heading/LG` 28px/34px, weight 700; `Body/MD` 16px/24px, weight 400
- スペーシング: セクション余白 `24px top/bottom`, カード内 `16px all`
- レイアウト: コンテナ幅 1200px center, Auto Layout row gap 12px, column gap 16px, padding 20px
- 角丸/影: `border-radius 12px`; `shadow: 0 8px 24px rgba(0,0,0,0.08)`
- 状態/バリアント: ボタン variant `kind=primary`, state `hover` -> bg `#0C7AE5`, text `#FFFFFF`
- 参照: スクショID `<screenshot-id>`（必要に応じて共有）
