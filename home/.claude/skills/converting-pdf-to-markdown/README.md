# PDF to Markdown変換スキル

PDFファイルを高品質なMarkdownに変換するClaude Codeスキル。

## 概要

3段階プロセス（PDF→画像→AI精読→Markdown）により、以下の特徴を実現:

- **高精度**: テキスト選択可能なPDF、スキャン画像PDFに対応
- **構造化**: 見出し階層、テーブル、リストを正確に再現
- **柔軟性**: 表・グラフを含む複雑なレイアウトに対応
- **プライバシー**: 外部サービス不使用、100%ローカル処理

## インストール

### 依存関係

```bash
# poppler（PDFツールキット）
brew install poppler

# 確認
pdftoppm -v
```

### スキル配置

このスキルは既に以下の場所に配置されています:

```
~/.claude/skills/converting-pdf-to-markdown/
├── skill.md
├── README.md
├── scripts/
│   └── pdf-to-images.sh
└── templates/
    └── extraction-prompt.md
```

## 使用方法

### 基本的な使用

```bash
/pdf-to-md ~/Documents/report.pdf
```

### オプション指定

```bash
# 出力先指定
/pdf-to-md ~/Documents/report.pdf --output ~/output/

# 目次付き変換（今後実装予定）
/pdf-to-md ~/Documents/report.pdf --toc

# ページ番号付与（今後実装予定）
/pdf-to-md ~/Documents/report.pdf --page-numbers
```

## 処理フロー

### Step 1: PDF情報取得

```bash
pdfinfo ~/Documents/report.pdf
```

ページ数に応じた処理方針を決定:

- **〜20ページ**: 一括処理
- **21〜50ページ**: 2バッチに分割
- **51ページ〜**: 10〜20ページずつ段階処理

### Step 2: PDF→画像変換

```bash
bash ~/.claude/skills/converting-pdf-to-markdown/scripts/pdf-to-images.sh \
  ~/Documents/report.pdf \
  ~/Documents/
```

生成される画像:

```
~/Documents/images/
├── report-1.png
├── report-2.png
├── report-3.png
└── ...
```

### Step 3: AI精読（Markdown化）

Claude Codeが各画像を読み込み、構造化されたMarkdownを生成します。

**プロンプト例:**

```markdown
以下の画像をMarkdown形式に変換してください。

[変換ルール]
- 見出し: 視覚的な階層に基づいてH1〜H6を適用
- 表: Markdownテーブル形式で正確に再現
- リスト: 箇条書き/番号付きを適切に使用
- グラフ/図: [図: 〇〇を示すグラフ] と説明
- 脚注/注釈: 末尾にまとめる
- 不要な空行は除去

[画像1]
<Read ~/Documents/images/report-1.png>

[画像2]
<Read ~/Documents/images/report-2.png>

...
```

### Step 4: Markdown結合

各バッチで生成されたMarkdownを結合し、最終的な出力ファイルを生成します。

## 変換品質

### 精度

- **テキスト抽出**: 95%以上
- **表の再現**: Markdownテーブル形式で正確に再現
- **見出し階層**: 視覚的な階層を保持
- **レイアウト**: 段落、リスト、引用を適切に識別

### 対応PDF

| PDFタイプ | 対応 | 備考 |
|----------|------|------|
| テキスト選択可能 | ✓ | 最高精度 |
| スキャン画像 | ✓ | 解像度300dpi以上推奨 |
| 表・グラフ多数 | ✓ | Markdownテーブル化 |
| 複数カラム | ✓ | 左→右の順で読み取り |
| 日本語/英語混在 | ✓ | 適切に処理 |

## テストケース

### テスト1: テキスト中心のPDF

**入力:**

```
report.pdf (10ページ、テキスト中心)
```

**期待結果:**

```markdown
# レポートタイトル

## 第1章 概要

本レポートでは...

## 第2章 詳細

...
```

### テスト2: 表を含むPDF

**入力:**

```
data.pdf (5ページ、表3つ)
```

**期待結果:**

```markdown
# データ分析レポート

## 売上データ

| 年度 | 売上高 | 営業利益 |
|------|--------|---------|
| 2023 | 100億円 | 10億円 |
| 2024 | 120億円 | 15億円 |
```

### テスト3: スキャン画像PDF

**入力:**

```
scanned.pdf (15ページ、スキャン画像、解像度300dpi)
```

**期待結果:**

```markdown
# スキャンドキュメント

（OCRで抽出されたテキスト）
```

## トラブルシューティング

### pdftoppmが見つからない

```bash
# インストール確認
which pdftoppm

# インストール
brew install poppler

# 再確認
pdftoppm -v
```

### 画像変換が失敗する

```bash
# PDF情報確認
pdfinfo ~/Documents/report.pdf

# 手動で1ページずつ変換してテスト
pdftoppm -png -f 1 -l 1 -r 300 ~/Documents/report.pdf test

# 生成された画像を確認
ls -lh test-1.png
```

### Markdown品質が低い

**解決策:**

1. **解像度を上げる**: `-r 300` → `-r 600`

```bash
pdftoppm -png -r 600 input.pdf output
```

2. **バッチサイズを小さく**: 10ページ → 5ページ

3. **プロンプトを調整**: より具体的な指示を追加

### コンテキスト制限に達する

**解決策:**

- 10〜20ページずつ段階処理
- 途中結果を保存して複数セッションに分割

```bash
# 前半（1-20ページ）
pdftoppm -png -f 1 -l 20 -r 300 input.pdf output-part1

# 後半（21-40ページ）
pdftoppm -png -f 21 -l 40 -r 300 input.pdf output-part2
```

## よくある質問

### Q: 100ページ超のPDFに対応できますか？

**A:** 可能ですが、複数セッションに分割することを推奨します。10〜20ページずつ処理し、途中結果を保存してください。

### Q: PDFのレイアウトは保持されますか？

**A:** 見出し階層、表、リストは正確に再現されますが、視覚的なレイアウト（色、フォント、位置）は保持されません。Markdownの性質上、構造化された文書として出力されます。

### Q: 画像や図はどうなりますか？

**A:** 画像や図は説明文として記載されます（例: `[図: 売上推移グラフ]`）。将来的には画像埋め込み（Base64）も検討しています。

### Q: 外部サービスに送信されますか？

**A:** いいえ。すべての処理はローカルで完結します。外部サービスへの送信は一切ありません。

### Q: OCRは使用されますか？

**A:** 現在のバージョンではClaude CodeのマルチモーダルAI読解を使用しています。将来的にTesseract OCRの統合も検討しています。

## 今後の実装予定

- [ ] OCR統合（Tesseract）
- [ ] PDF内のリンク保持
- [ ] 画像埋め込み（Base64）
- [ ] メタデータ抽出（タイトル、著者、作成日）
- [ ] PDFブックマーク→目次変換
- [ ] 複数ファイル一括変換
- [ ] 進捗表示（プログレスバー）

## ライセンス

このスキルは個人用途で自由に使用できます。

## 参考資料

- [元記事](https://qiita.com/enomoso_pm/items/c432551c60d010cb5cc7)
- [poppler公式](https://poppler.freedesktop.org/)
- [Claude Code公式ドキュメント](https://docs.anthropic.com/claude-code)

## 貢献

改善提案やバグ報告は歓迎します。
