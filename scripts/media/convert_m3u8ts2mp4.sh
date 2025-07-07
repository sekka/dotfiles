#!/bin/bash
# https://shotaste.com/blog/convert-hls/
# https://deginzabi163.wordpress.com/2010/05/10/%E8%A6%9A%E6%9B%B8%E3%82%B9%E3%83%9A%E3%83%BC%E3%82%B9%E3%82%84%E7%A9%BA%E7%99%BD%E3%82%92%E5%90%AB%E3%82%80%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E5%90%8D%E3%81%AB%E5%AF%BE%E5%BF%9C%E3%81%A7%E3%81%8D/

IFS=$'\n'

# find出力をwhile read loopで安全に処理
find . -name '*.m3u8' -print0 | while IFS= read -r -d '' tsFile; do
  echo "start converting $tsFile"

  base=$(basename "$tsFile" ".m3u8")
  dir=$(dirname "$tsFile")
  ffmpeg -nostdin -i "$tsFile" -movflags faststart -c copy -bsf:a aac_adtstoasc "$dir/$base.mp4" >/dev/null 2>&1

  echo "complete"
done
