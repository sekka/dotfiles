#!/bin/bash

CHECKPOINT_FILE="$HOME/.claude/progress-checkpoint.md"
TIMESTAMP=$(TZ=Asia/Tokyo date +"%Y-%m-%dT%H:%M:%S%z" | sed 's/+0900/+09:00/')
PROJECT=$(basename "$PWD")
DIRECTORY="$PWD"

cat >> "$CHECKPOINT_FILE" <<EOF
---
## Checkpoint: $TIMESTAMP
- Project: $PROJECT
- Directory: $DIRECTORY
---
EOF
