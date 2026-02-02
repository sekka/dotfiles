#!/usr/bin/env bash
# PDF→画像変換スクリプト
# 依存: poppler (pdftoppm)

set -euo pipefail

# エラーハンドリング
error_exit() {
  echo "エラー: $1" >&2
  exit 1
}

# 使用方法
usage() {
  cat <<EOF
使用方法: $0 <pdf_path> [output_dir]

引数:
  pdf_path     PDFファイルのパス（必須）
  output_dir   出力ディレクトリ（オプション、デフォルト: PDFと同じ場所）

例:
  $0 ~/Documents/report.pdf
  $0 ~/Documents/report.pdf ~/output/

依存:
  - poppler (pdftoppm)
    インストール: brew install poppler
EOF
  exit 1
}

# 引数チェック
if [[ $# -lt 1 ]]; then
  usage
fi

PDF_PATH="$1"
OUTPUT_DIR="${2:-$(dirname "$PDF_PATH")}"
BASENAME=$(basename "$PDF_PATH" .pdf)

# PDFファイル存在確認
if [[ ! -f "$PDF_PATH" ]]; then
  error_exit "PDFファイルが見つかりません: $PDF_PATH"
fi

# pdftoppmの存在確認
if ! command -v pdftoppm &>/dev/null; then
  error_exit "pdftoppmが見つかりません。brew install popplerを実行してください。"
fi

# 出力ディレクトリ作成
mkdir -p "$OUTPUT_DIR/images"

# PDF情報表示
echo "PDF情報:"
pdfinfo "$PDF_PATH" | grep -E "(Pages|Page size)" || true
echo ""

# 変換実行
echo "PDFを画像に変換中..."
echo "  入力: $PDF_PATH"
echo "  出力: $OUTPUT_DIR/images/"
echo ""

# pdftoppmでPNG化（高解像度300dpi）
pdftoppm -png -r 300 "$PDF_PATH" "$OUTPUT_DIR/images/$BASENAME"

# 結果表示
echo ""
echo "✓ 変換完了"
echo ""
echo "生成された画像:"
ls -lh "$OUTPUT_DIR/images/" | grep "$BASENAME"
echo ""
echo "総ファイル数: $(ls -1 "$OUTPUT_DIR/images/" | grep "$BASENAME" | wc -l)"
