#!/bin/bash

# Lighthouse自動分析スクリプト
# 使用法: ./lighthouse-analyzer.sh <URL> <実行回数> <間隔(秒)> [出力ディレクトリ] [--auth]

set -e

# 引数チェック
if [[ $# -lt 3 ]]; then
  echo "使用法: $0 <URL> <実行回数> <間隔(秒)> [出力ディレクトリ] [--auth] [--profile=ProfileName]"
  echo "例: $0 https://example.com 5 60 ./results"
  echo "例（認証必要）: $0 https://example.com 5 60 ./results --auth"
  echo "例（特定プロファイル）: $0 https://example.com 5 60 ./results --auth --profile=\"Profile 1\""
  echo ""
  echo "利用可能なプロファイル:"
  CHROME_DIR="$HOME/Library/Application Support/Google/Chrome"
  if [[ -d "$CHROME_DIR" ]]; then
    # プロファイルディレクトリを安全に列挙
    for profile_dir in "$CHROME_DIR"/Default "$CHROME_DIR"/Profile*; do
      if [[ -d "$profile_dir" ]]; then
        basename="$(basename "$profile_dir")"
        echo "  - $basename"
      fi
    done
  fi
  exit 1
fi

URL="$1"
COUNT="$2"
INTERVAL="$3"
OUTPUT_DIR="${4:-./lighthouse-results}"
USE_AUTH=false
CHROME_PROFILE="Default"

# 引数解析（オプション処理を改善）
shift 3 # 最初の3つの必須引数をスキップ

while [[ $# -gt 0 ]]; do
  case $1 in
  --auth)
    USE_AUTH=true
    shift
    ;;
  --profile=*)
    CHROME_PROFILE="${1#*=}"
    shift
    ;;
  *)
    # 出力ディレクトリとして扱う（まだ設定されていない場合）
    if [[ $OUTPUT_DIR == "./lighthouse-results" ]]; then
      OUTPUT_DIR="$1"
    fi
    shift
    ;;
  esac
done

# 出力ディレクトリ作成
mkdir -p "$OUTPUT_DIR"

echo "Lighthouse分析を開始します"
echo "URL: $URL"
echo "実行回数: $COUNT"
echo "間隔: ${INTERVAL}秒"
echo "出力先: $OUTPUT_DIR"
if [[ "$USE_AUTH" == true ]]; then
  echo "認証: 有効（Chromeプロファイル使用）"
  echo "プロファイル: $CHROME_PROFILE"

  # プロファイルの存在チェック
  CHROME_DIR="$HOME/Library/Application Support/Google/Chrome"
  PROFILE_PATH="$CHROME_DIR/$CHROME_PROFILE"
  if [[ ! -d "$PROFILE_PATH" ]]; then
    echo "❌ エラー: プロファイル '$CHROME_PROFILE' が見つかりません"
    echo "利用可能なプロファイル:"
    # プロファイルディレクトリを安全に列挙
    for profile_dir in "$CHROME_DIR"/Default "$CHROME_DIR"/Profile*; do
      if [[ -d "$profile_dir" ]]; then
        basename="$(basename "$profile_dir")"
        echo "  - $basename"
      fi
    done
    exit 1
  fi

  echo "⚠️  注意: 分析中はChromeブラウザを閉じることをお勧めします"
fi
echo ""

# URLからファイル名用の文字列を生成
URL_SANITIZED=$(echo "$URL" | sed -E 's|^https?://||' | sed 's|[^a-zA-Z0-9._-]|_|g' | sed 's|_+|_|g' | sed 's|^_||' | sed 's|_$||')

# 実行開始
for i in $(seq 1 "$COUNT"); do
  echo "[$i/$COUNT] 分析実行中..."

  # タイムスタンプ付きファイル名（URL情報を含む）
  TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
  OUTPUT_FILE="$OUTPUT_DIR/lighthouse_${URL_SANITIZED}_${TIMESTAMP}.json"

  # Chrome設定を認証オプションに応じて変更
  if [[ "$USE_AUTH" == true ]]; then
    CHROME_USER_DATA_DIR="$HOME/Library/Application Support/Google/Chrome"
    CHROME_FLAGS="--user-data-dir=$CHROME_USER_DATA_DIR --profile-directory=$CHROME_PROFILE"
    echo "  🔐 認証付きモード（$CHROME_PROFILE）で分析中..."
  else
    CHROME_FLAGS="--headless"
    echo "  🔍 通常モードで分析中..."
  fi

  # Lighthouse実行（エラーハンドリング付き）
  if lighthouse "$URL" \
    --chrome-flags="$CHROME_FLAGS" \
    --output=json \
    --output-path="$OUTPUT_FILE" \
    --form-factor=desktop \
    --screenEmulation.mobile=false \
    --screenEmulation.width=1350 \
    --screenEmulation.height=940 \
    --screenEmulation.deviceScaleFactor=1 \
    --throttling-method=provided \
    --only-categories=performance,accessibility,best-practices,seo,pwa \
    --enable-error-reporting=false \
    --quiet 2>/dev/null; then
    echo "  ✅ 分析完了"
  else
    echo "  ⚠️  警告: 分析中にエラーが発生しましたが、結果は保存されています"
  fi

  echo "  結果保存: $OUTPUT_FILE"

  # 最後の実行でない場合は待機
  if [[ "$i" -lt "$COUNT" ]]; then
    echo "  ${INTERVAL}秒待機中..."
    sleep "$INTERVAL"
  fi
done

echo ""
echo "すべての分析が完了しました"
echo "結果は $OUTPUT_DIR に保存されています"

# 結果サマリー生成
SUMMARY_FILE="$OUTPUT_DIR/summary_${URL_SANITIZED}_$(date +"%Y%m%d_%H%M%S").txt"
echo "=== Lighthouse分析サマリー ===" >"$SUMMARY_FILE"
{
  echo "URL: $URL"
  echo "実行回数: $COUNT"
  echo "実行日時: $(date)"
  echo ""
} >>"$SUMMARY_FILE"

# JSONファイルから主要スコアを抽出
echo "各実行のスコア:" >>"$SUMMARY_FILE"
for json_file in "$OUTPUT_DIR"/lighthouse_"${URL_SANITIZED}"_*.json; do
  if [[ -f "$json_file" ]]; then
    filename=$(basename "$json_file")
    echo "ファイル: $filename" >>"$SUMMARY_FILE"

    # jqがインストールされている場合はスコアを抽出
    if command -v jq >/dev/null 2>&1; then
      {
        echo "  Performance: $(jq -r '.categories.performance.score * 100 | floor' "$json_file")%"
        echo "  Accessibility: $(jq -r '.categories.accessibility.score * 100 | floor' "$json_file")%"
        echo "  Best Practices: $(jq -r '.categories["best-practices"].score * 100 | floor' "$json_file")%"
        echo "  SEO: $(jq -r '.categories.seo.score * 100 | floor' "$json_file")%"
        if jq -e '.categories.pwa' "$json_file" >/dev/null 2>&1; then
          echo "  PWA: $(jq -r '.categories.pwa.score * 100 | floor' "$json_file")%"
        fi
      } >>"$SUMMARY_FILE"
    fi
    echo "" >>"$SUMMARY_FILE"
  fi
done

echo "サマリー保存: $SUMMARY_FILE"
