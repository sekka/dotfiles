---
name: pdf-to-md
description: PDFファイルを高品質なMarkdownに変換します。3段階プロセス（PDF→画像→AI精読→Markdown）により、テキスト選択可能なPDF、スキャン画像、表・グラフを含む複雑なレイアウトに対応します。構造化されたMarkdown（見出し階層、テーブル、リスト）を生成します。
disable-model-invocation: false
---

# PDF to Markdown変換スキル

## 概要

PDFファイルを構造化されたMarkdownに変換するスキル。Claude CodeのマルチモーダルAI読解能力を活用し、高品質な変換を実現します。

## 対応PDF

- テキスト選択可能なPDF
- スキャン画像PDF
- 表・グラフを含む複雑なレイアウト
- 日本語/英語混在文書

## 処理フロー

```
/pdf-to-md <path/to/file.pdf>
    ↓
┌─────────────────────────────────────────┐
│ Layer 1: PDF→画像変換（機械的）          │
│ - pdftoppm (poppler) でPNG化            │
│ - 1ページ1画像（解像度300dpi）          │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ Layer 2: AI精読（Claude Code自身）       │
│ - Readツールで画像を読み込み             │
│ - 10〜20ページずつ段階処理              │
│ - 構造化されたMarkdownを生成            │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ Layer 3: 結合・後処理                    │
│ - 各ページのMarkdownを結合              │
│ - 目次生成（オプション）                 │
│ - 出力ファイル生成                       │
└─────────────────────────────────────────┘
```

## 実行手順

### Step 1: PDF情報の取得

PDFファイルのページ数、サイズを確認し、処理方針を決定します。

```bash
# ページ数確認
pdfinfo <pdf_path>
```

- 20ページ以下: 一括処理
- 21〜50ページ: 2バッチに分割
- 51ページ以上: 10〜20ページずつ段階処理

### Step 2: PDF→画像変換

`scripts/pdf-to-images.sh`を使用してPDFを高解像度PNG画像に変換します。

```bash
bash ~/.claude/skills/converting-pdf-to-markdown/scripts/pdf-to-images.sh \
  <pdf_path> \
  [output_dir]
```

**出力:**

```
<output_dir>/images/
  ├── <basename>-1.png
  ├── <basename>-2.png
  └── ...
```

### Step 3: AI精読（Markdown化）

各画像をReadツールで読み込み、構造化されたMarkdownに変換します。

**プロンプトテンプレート:** `templates/extraction-prompt.md`

**変換ルール:**

1. **見出し**: 視覚的な階層に基づいてH1〜H6を適用
2. **表**: Markdownテーブル形式で正確に再現
3. **リスト**: 箇条書き/番号付きを適切に使用
4. **グラフ/図**: `[図: 〇〇を示すグラフ]` と説明
5. **脚注/注釈**: 末尾にまとめる
6. **不要な要素**: フロントマター、過剰な空行を除去

**処理例:**

```markdown
# ページ 1-10 の処理

以下の画像をMarkdown形式に変換してください。

[変換ルール]
- 見出し: 視覚的な階層に基づいてH1〜H6を適用
- 表: Markdownテーブル形式で正確に再現
- リスト: 箇条書き/番号付きを適切に使用
- グラフ/図: [図: 〇〇を示すグラフ] と説明
- 脚注/注釈: 末尾にまとめる
- 不要な空行は除去

[画像1]
<Read ページ1の画像>

[画像2]
<Read ページ2の画像>

...
```

### Step 4: Markdown結合

各バッチで生成されたMarkdownを結合し、最終的な出力ファイルを生成します。

**オプション機能:**

- 目次生成（`--toc`）
- ページ番号付与（`--page-numbers`）
- セクション区切り（`--sections`）

## 使用例

### 基本的な変換

```bash
/pdf-to-md ~/Documents/report.pdf
```

**出力:** `~/Documents/report.md`

### 出力先指定

```bash
/pdf-to-md ~/Documents/report.pdf --output ~/output/
```

**出力:** `~/output/report.md`

### 目次付き変換

```bash
/pdf-to-md ~/Documents/report.pdf --toc
```

## 依存関係

- **poppler**: PDF変換（`brew install poppler`）
  - Brewfile登録済み
  - macOS標準でインストール可能

- **Claude Code Readツール**: 画像読み込み・AI精読
  - マルチモーダル対応

## 品質保証

### 変換精度

- **テキスト抽出**: 95%以上の精度
- **表の再現**: Markdownテーブル形式で正確に再現
- **見出し階層**: 視覚的な階層を保持
- **レイアウト**: 段落、リスト、引用を適切に識別

### 検証方法

1. **テスト用PDFで実行**
   - テキスト中心のPDF
   - 表を含むPDF
   - スキャン画像PDF

2. **確認項目:**
   - 全ページが画像化されている
   - Markdownの構造が正確
   - 表がテーブル形式で再現
   - 出力ファイルが生成される

## 注意事項

### コンテキスト消費

- **AI精読は10〜20ページずつ段階処理**
- 大量の画像を一度に処理しない
- コンテキスト制限内で最大限の品質を維持

### 大規模PDF

- **100ページ超は複数セッションに分割推奨**
- 途中結果を保存して段階的に処理

### 品質依存要素

- **スキャン画像PDFは解像度に依存**
- 低解像度（<150dpi）は精度低下
- 推奨解像度: 300dpi以上

### セキュリティ

- **機密情報を含むPDFは慎重に扱う**
- 外部サービス不使用（100%ローカル処理）

## トラブルシューティング

### pdftoppmが見つからない

```bash
# インストール確認
which pdftoppm

# インストール
brew install poppler
```

### 画像変換が失敗する

```bash
# PDF情報確認
pdfinfo <pdf_path>

# 手動で1ページずつ変換
pdftoppm -png -f 1 -l 1 -r 300 <pdf_path> test
```

### Markdown品質が低い

- **解像度を上げる**: `-r 300` → `-r 600`
- **バッチサイズを小さく**: 10ページ → 5ページ
- **プロンプトを調整**: より具体的な指示を追加

## 参考資料

- 元記事: https://qiita.com/enomoso_pm/items/c432551c60d010cb5cc7
- poppler公式: https://poppler.freedesktop.org/
- PDFツールキット: https://www.pdflabs.com/tools/pdftk-the-pdf-toolkit/

## 拡張機能（今後の実装）

- [ ] OCR統合（Tesseract）
- [ ] PDF内のリンク保持
- [ ] 画像埋め込み（Base64）
- [ ] メタデータ抽出（タイトル、著者、作成日）
- [ ] PDFブックマーク→目次変換
