#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 [-a sha256|md5] <dir1> <dir2>"
  echo "  -a  ハッシュアルゴリズム（既定: sha256）"
  exit 1
}

# --- parse args ---
algo="sha256"
while getopts ":a:" opt; do
  case "$opt" in
  a)
    case "$OPTARG" in
    sha256 | md5) algo="$OPTARG" ;;
    *)
      echo "Unsupported algo: $OPTARG"
      usage
      ;;
    esac
    ;;
  *) usage ;;
  esac
done
shift $((OPTIND - 1))

[ $# -eq 2 ] || usage
dir1="$1"
dir2="$2"

[ -d "$dir1" ] || {
  echo "Not a directory: $dir1"
  exit 2
}
[ -d "$dir2" ] || {
  echo "Not a directory: $dir2"
  exit 2
}

# --- helpers ---
hash_file() {
  local f="$1"
  if [ "$algo" = "sha256" ]; then
    shasum -a 256 "$f" | awk '{print $1}'
  else
    md5 -q "$f"
  fi
}

size_of() {
  stat -f "%z" "$1"
}

# --- output file ---
timestamp=$(date +"%Y%m%d_%H%M%S")
outfile="./compare_result_${timestamp}.txt"

# 出力を tee でファイルにも保存
exec > >(tee "$outfile") 2>&1

echo "===== Directory Compare Result ====="
echo "Dir1 : $dir1"
echo "Dir2 : $dir2"
echo "Algo : $algo"
echo "Time : $(date)"
echo "===================================="

# --- build file lists ---
tmp1="$(mktemp)"
tmp2="$(mktemp)"
common="$(mktemp)"
trap 'rm -f "$tmp1" "$tmp2" "$common"' EXIT

(
  cd "$dir1"
  find . -type f -print | sed 's#^\./##' | sort
) >"$tmp1"

(
  cd "$dir2"
  find . -type f -print | sed 's#^\./##' | sort
) >"$tmp2"

only1=$(comm -23 "$tmp1" "$tmp2")
only2=$(comm -13 "$tmp1" "$tmp2")
comm -12 "$tmp1" "$tmp2" >"$common"

diff_found=0

# --- only in dir1 ---
if [ -n "$only1" ]; then
  diff_found=1
  echo ""
  echo "➖ ONLY in dir1"
  echo "----------------------"
  echo "$only1"
fi

# --- only in dir2 ---
if [ -n "$only2" ]; then
  diff_found=1
  echo ""
  echo "➕ ONLY in dir2"
  echo "----------------------"
  echo "$only2"
fi

# --- compare common files ---
echo ""
echo "🔍 Checking common files..."
while IFS= read -r rel; do
  [ -z "$rel" ] && continue
  f1="$dir1/$rel"
  f2="$dir2/$rel"

  s1=$(size_of "$f1") || {
    echo "⚠️  Cannot stat: $f1"
    diff_found=1
    continue
  }
  s2=$(size_of "$f2") || {
    echo "⚠️  Cannot stat: $f2"
    diff_found=1
    continue
  }

  if [ "$s1" -ne "$s2" ]; then
    echo "🟡 DIFF(size) : $rel  ($s1 vs $s2 bytes)"
    diff_found=1
    continue
  fi

  h1=$(hash_file "$f1")
  h2=$(hash_file "$f2")

  if [ "$h1" = "$h2" ]; then
    echo "✅ SAME        : $rel"
  else
    echo "🟡 DIFF(hash) : $rel"
    echo "    $h1"
    echo "    $h2"
    diff_found=1
  fi
done <"$common"

echo ""
if [ "$diff_found" -eq 0 ]; then
  echo "🎉 完全一致：ファイル構成と内容が同一です。"
else
  echo "⚠️  差分あり：詳細は上記を確認してください。"
fi

echo ""
echo "結果を保存しました: $outfile"
