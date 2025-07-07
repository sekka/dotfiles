#!/bin/sh

#for pngFile in `\find . -name '*.png'`
for imageFile in $(\find . -type f \( -name '*.png' -o -name '*.jpg' \)); do
  echo "start converting "$imageFile

  if [ $(echo $imageFile | grep .png) ]; then
    ext=".png"
    opt="-lossless -metadata icc"
  else
    ext=".jpg"
    # opt="-q 75 -metadata icc -sharp_yuv"
    opt="-q 90 -metadata icc -sharp_yuv"
  fi

  base=$(basename $imageFile $ext)
  dir=$(dirname $imageFile)
  cwebp $imageFile $opt -o $dir"/"$base".webp" >/dev/null 2>&1

  echo "complete"
done
