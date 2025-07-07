#!/bin/bash

find . -name '*.mp4' -print0 | while IFS= read -r -d '' INPUT_FILE; do
  echo "start converting $INPUT_FILE"
  gopro2gpx -s -vvv "$INPUT_FILE" "$INPUT_FILE"
  echo "complete"
done
