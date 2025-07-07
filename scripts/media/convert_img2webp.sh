#!/bin/bash

#for pngFile in `\find . -name '*.png'`
# find出力をwhile read loopで安全に処理
find . -type f \( -name '*.png' -o -name '*.jpg' \) -print0 | while IFS= read -r -d '' imageFile; do
  echo "start converting $imageFile"

  if echo "$imageFile" | grep -q .png; then
    ext=".png"
    opt="-lossless -metadata icc"
  else
    ext=".jpg"
    # opt="-q 75 -metadata icc -sharp_yuv"
    opt="-q 90 -metadata icc -sharp_yuv"
  fi

  base=$(basename "$imageFile" $ext)
  dir=$(dirname "$imageFile")
  cwebp "$imageFile" "$opt" -o "$dir/$base.webp" >/dev/null 2>&1

  echo "complete"
done
