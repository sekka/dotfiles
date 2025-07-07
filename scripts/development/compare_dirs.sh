#!/bin/bash

# ディレクトリのパスを引数から取得
dir1=$1
dir2=$2

# 引数のチェック
if [ -z "$dir1" ] || [ -z "$dir2" ]; then
  echo "Usage: $0 <directory1> <directory2>"
  exit 1
fi

# 第一ディレクトリのファイルリストを取得
files1=$(ls "$dir1")

# ファイル名が同じファイルのチェックサムを比較
for file in $files1; do
  if [ -e "$dir2/$file" ]; then # 第二ディレクトリに同じファイル名が存在するか確認
    checksum1=$(md5 -q "$dir1/$file")
    checksum2=$(md5 -q "$dir2/$file")

    # チェックサムを比較して結果を表示
    if [ "$checksum1" == "$checksum2" ]; then
      echo "✅ '$checksum1' : '$checksum2' | File '$file' is the same in both directories."
    else
      echo "☑️  '$checksum1' : '$checksum2' | File '$file' is different in both directories."
    fi
  fi
done
