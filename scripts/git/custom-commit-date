#!/bin/bash
#
# Commits with a custom author date and message.
#
# This script allows you to create a git commit with a specified author date.
# By default, the committer date is set to the same as the author date.
#
# Usage:
#   scripts/git/custom-commit-date [--committer-date-now] "YYYY-MM-DD HH:MM:SS" "Your commit message"
#
# Options:
#   --committer-date-now  Use the current time as the committer date.
#
# Arguments:
#   $1: The desired author date in "YYYY-MM-DD HH:MM:SS" format.
#   $2: The commit message.

set -eu

usage() {
  echo "Usage: $(basename "$0") [--committer-date-now] \"<date>\" \"<message>\""
  echo "Example (author and committer date are same): $(basename "$0") \"2023-01-01 12:30:00\" \"feat: Add feature\""
  echo "Example (committer date is now): $(basename "$0") --committer-date-now \"2023-01-01 12:30:00\" \"feat: Add feature\""
  exit 1
}

if [[ "$1" == "--committer-date-now" ]]; then
  if [ "$#" -ne 3 ]; then
    usage
  fi
  DATE="$2"
  MESSAGE="$3"

  echo "Setting author date to '$DATE' and committer date to now."
  export GIT_AUTHOR_DATE="$DATE"
  # Unset GIT_COMMITTER_DATE just in case it's in the environment
  unset GIT_COMMITTER_DATE
else
  if [ "$#" -ne 2 ]; then
    usage
  fi
  DATE="$1"
  MESSAGE="$2"

  echo "Setting both author and committer date to '$DATE'."
  export GIT_AUTHOR_DATE="$DATE"
  export GIT_COMMITTER_DATE="$DATE"
fi

git commit -m "$MESSAGE"
