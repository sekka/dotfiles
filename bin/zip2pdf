#!/bin/bash

# zipファイルのある場所へ移動
dir=$(dirname "$1")
cd "${dir}"

# zip ファイルのファイル名を摘出
# ${変数%.*} は拡張子を消す変数展開
zipName=$(basename "${1}")
folder=$(echo ${zipName%.*})

# unzip でファイルを解凍。-d オプションで展開先
# のディレクトリを指定している。
# cd でそのディレクトリへ移動
unzip -d "${folder}" "${zipName}"
cd "${folder}"

# フォルダの中身すべてを PDF にコンバートする。
# 中身は全部、画像ファイルである、という前提である。
convert * ../"${folder}".pdf

# 必要なら展開先のフォルダを削除
# cd ../
# rm -r "${folder}"
