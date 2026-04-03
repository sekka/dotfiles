---
name: liteparse
description: PDF、PPTX、DOCX、XLSX ファイルを読む必要があるとき自動的に起動。liteparse CLI でドキュメントをテキスト変換してから処理する。「PDFを読んで」「このPPTXの内容を確認」「ドキュメントを要約」で起動。
disable-model-invocation: false
allowed-tools: Bash(lit:*), Bash(npx:*), Read, Write
---

# liteparse - ドキュメントパーサー

PDF、PPTX、DOCX、XLSX をテキストに変換して Claude Code で扱えるようにする。

## 使い方

ユーザーからドキュメントファイル（PDF/PPTX/DOCX/XLSX）を読むよう依頼されたら、以下の手順で処理する。

### 手順

1. **liteparse でテキスト変換**

`lit` コマンドが使えるか確認し、使えなければ `npx` で実行:

```bash
# lit が使える場合
lit parse <file_path>

# lit が使えない場合
npx -y @llamaindex/liteparse parse <file_path>
```

2. **特定ページのみ必要な場合**

```bash
lit parse <file_path> --target-pages "1-5,10"
```

3. **出力をファイルに保存したい場合**

```bash
lit parse <file_path> -o <output_path>.md
```

4. **変換結果を読み取り、ユーザーの依頼に応じて処理する**

## 対応フォーマット

- PDF（OCR 対応）
- PPTX
- DOCX
- XLSX
- 画像（JPG, PNG 等 — OCR で読み取り）

## 注意事項

- 大きなドキュメントは `--target-pages` で必要なページだけ変換する
- 変換結果が長い場合はファイルに保存してから Read で読む
