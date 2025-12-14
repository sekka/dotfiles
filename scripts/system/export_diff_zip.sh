#!/bin/bash
if [[ -z "$2" ]]; then
  git archive --format=zip --prefix=archive/ HEAD "$(git diff --name-only HEAD "$1")" -o archive.zip
else
  git archive --format=zip --prefix=archive/ "$1" "$(git diff --name-only "$1" "$2")" -o archive.zip
fi
