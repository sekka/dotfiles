#!/bin/sh

#for pngFile in `\find . -name '*.png'`
for imageFile in `\find . -type f \( -name '*.png' -o -name '*.jpg' \)`
do
    echo "start converting "$imageFile

    if [ `echo $imageFile|grep .png` ]; then
        ext=".png"
    else
        ext=".jpg"
    fi

    base=`basename $imageFile $ext`
    dir=`dirname $imageFile`
    cwebp $imageFile -q 100 -o $dir"/"$base".webp" >/dev/null 2>&1

    echo "complete"
done
