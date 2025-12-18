#!/usr/bin/env bash
#
# Commits with a custom author date, committer date, and message.
#
# Usage:
#   custom-commit "DATE" "COMMIT_MESSAGE"
#   custom-commit "AUTHOR_DATE" "COMMITTER_DATE" "COMMIT_MESSAGE"
#
# Example:
#   custom-commit "2024-01-01 10:00:00" "feat: Add feature"
#   custom-commit "2024-01-01 10:00:00" "2024-01-01 10:05:00" "feat: Add feature"
#
# Note:
# - If one date is provided, it's used for both Author and Committer dates.
# - If timezone is omitted, +0900 (Tokyo) is used by default.
# - Files should be staged using `git add` before running this script.

set -euo pipefail

# Function to append Tokyo timezone if not already present
append_tokyo_timezone() {
  local date_str="$1"
  if ! [[ "${date_str}" =~ [+-][0-9]{4}$ ]]; then
    echo "${date_str} +0900"
  else
    echo "${date_str}"
  fi
}

if [[ "$#" -eq 2 ]]; then
  AUTHOR_DATE=$(append_tokyo_timezone "$1")
  COMMITTER_DATE=$(append_tokyo_timezone "$1")
  COMMIT_MESSAGE="$2"
elif [[ "$#" -eq 3 ]]; then
  AUTHOR_DATE=$(append_tokyo_timezone "$1")
  COMMITTER_DATE=$(append_tokyo_timezone "$2")
  COMMIT_MESSAGE="$3"
else
  echo "Usage: $(basename "$0") \"DATE\" \"COMMIT_MESSAGE\"" >&2
  echo "   or: $(basename "$0") \"AUTHOR_DATE\" \"COMMITTER_DATE\" \"COMMIT_MESSAGE\"" >&2
  exit 1
fi

export GIT_AUTHOR_DATE="${AUTHOR_DATE}"
export GIT_COMMITTER_DATE="${COMMITTER_DATE}"

git commit -m "${COMMIT_MESSAGE}"
