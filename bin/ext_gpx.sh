#!/bin/sh
 
for INPUT_FILE in `\find . -name '*.mp4'`
do
    echo "start converting "$INPUT_FILE
    gopro2gpx -s -vvv ${INPUT_FILE} ${INPUT_FILE}
    echo "complete"
done
